#!/usr/bin/env python3
import json
import re
from datetime import datetime
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
WORKSPACE = REPO.parent
STATE_PATH = WORKSPACE / "trading" / "agentic-state.json"
JOURNAL_PATH = WORKSPACE / "trading" / "journal.md"
OUT_PATH = REPO / "assets" / "trades.js"

PRIVATE_PATTERNS = [
    re.compile(r"\b\d{9,}\b"),
    re.compile(r"\b6a[0-9a-f-]{20,}\b", re.I),
    re.compile(r"\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b", re.I),
    re.compile(r"\b" + "Ste" + r"phen\b|\b" + "Ben" + r"jamin\b|\bst" + r"benjam\b"),
    re.compile("account" + r"_id|chat" + r"_id|order" + r"Id|ref" + r"Id"),
]

THESIS_FALLBACKS = {
    "SUNE": {
        "company": "SUNation Energy",
        "thesis": "Tiny Nasdaq-listed solar shell with a definitive Suniva reverse-merger catalyst, exceptional opening liquidity, and a tight regular-hours spread.",
        "invalidation": "Review or sell if the merger-news bid fails, liquidity deteriorates, dilution and ownership math dominate the tape, or price breaks below the merger-thesis range around $2.26.",
    },
    "AUUD": {
        "company": "Auddia",
        "thesis": "Tiny Nasdaq-listed AI-infra merger story with completed financing, S-4 process, and planned McCarthy Finney combination.",
        "invalidation": "Review or sell if merger terms imply excessive dilution, the financing/S-4 path breaks, regular-hours volume cannot support the setup, or the move turns into no-news promotion.",
    },
    "ZENA": {
        "company": "ZenaTech",
        "thesis": "Russell 3000 inclusion effective June 29, listed common-stock structure, tight quote, and possible drone/AI retail attention if index-inclusion flow builds.",
        "invalidation": "Review or sell if volume stays ordinary, the Russell addition fails to attract momentum, spread/liquidity deteriorate, or the move turns into low-quality promotion.",
    },
    "XOS": {
        "company": "Xos",
        "thesis": "Real operating catalyst: follow-on order worth about $3M for 12 Xos Hub mobile energy storage and charging units from a leading autonomous fleet operator.",
        "invalidation": "Review or sell if the order-news bid fades below the opening range, volume dries up, spread widens materially, or the market treats the catalyst as exhausted continuation.",
    },
    "VRA": {
        "company": "Vera Bradley",
        "thesis": "Earnings-surprise setup with Nasdaq common-stock structure, heavy relative volume, tight regular-hours quote, and a cooled opening range rather than a vertical chase.",
        "invalidation": "Review or sell if the earnings-gap bid fails, spread/liquidity deteriorate, volume dries up, or the setup proves to be only a modest turnaround bounce.",
    },
}


def load_json(path):
    with path.open() as f:
        return json.load(f)


def scrub(text):
    text = re.sub(r"\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b", "[private id]", text, flags=re.I)
    text = re.sub(r"Agentic cash account `?\d+`?", "Agentic cash account", text)
    text = re.sub(r"\b" + "Ste" + r"phen\b", "manual", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def iso_for(current_date, time_text):
    if not current_date:
        return None
    parts = [int(part) for part in time_text.split(":")]
    while len(parts) < 3:
        parts.append(0)
    return f"{current_date}T{parts[0]:02d}:{parts[1]:02d}:{parts[2]:02d}-04:00"


def parse_amount(text):
    return float(re.match(r"[0-9]+(?:\.[0-9]+)?", text).group(0))


def parse_journal():
    text = JOURNAL_PATH.read_text()
    current_date = None
    trades = []
    actions = []
    snapshots = []
    avg_cost = {}

    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line:
            continue

        heading = re.match(r"##\s+(\d{4}-\d{2}-\d{2})", line)
        if heading:
            current_date = heading.group(1)
            continue

        inline_date = re.match(r"-\s+(\d{4}-\d{2}-\d{2})\b", line)
        if inline_date:
            current_date = inline_date.group(1)

        if "Initial account readout" in line:
            amount = re.search(r"\$([0-9.]+)\s+total value", line)
            cash = re.search(r"\$([0-9.]+)\s+cash/buying power", line)
            if amount:
                snapshots.append({
                    "date": "2026-06-08T09:30:00-04:00",
                    "label": "Start",
                    "value": float(amount.group(1)),
                    "cash": float(cash.group(1)) if cash else float(amount.group(1)),
                    "equity": 0,
                    "exposure": 0,
                })

        eod = re.search(
            r"15:31 end-of-day check.*?total value (?:about )?\$([0-9]+(?:\.[0-9]+)?).*?"
            r"equity value (?:about )?\$([0-9]+(?:\.[0-9]+)?).*?"
            r"(?:cash/buying power|cash) (?:about )?\$([0-9]+(?:\.[0-9]+)?).*?"
            r"open cost exposure (?:about )?\$([0-9]+(?:\.[0-9]+)?)",
            line,
        )
        if eod and current_date:
            label_dt = datetime.fromisoformat(f"{current_date}T12:00:00-04:00")
            snapshots.append({
                "date": f"{current_date}T15:31:00-04:00",
                "label": label_dt.strftime("%b %-d"),
                "value": parse_amount(eod.group(1)),
                "equity": parse_amount(eod.group(2)),
                "cash": parse_amount(eod.group(3)),
                "exposure": parse_amount(eod.group(4)),
            })

        buy = re.search(
            r"buy\s+(\d+)\s+shares\s+([A-Z]+).*?filled\s+\d+\s+shares\s+at\s+(?:average\s+)?\$([0-9]+(?:\.[0-9]+)?)\s+at\s+([0-9:]+)\s+ET,\s+total\s+(?:about\s+)?\$([0-9]+(?:\.[0-9]+)?)",
            line,
        )
        if buy and current_date:
            qty = int(buy.group(1))
            symbol = buy.group(2)
            trade_price = float(buy.group(3))
            total = float(buy.group(5))
            avg_cost[symbol] = trade_price
            trades.append({
                "date": iso_for(current_date, buy.group(4)),
                "symbol": symbol,
                "side": "BUY",
                "quantity": qty,
                "price": trade_price,
                "amount": -round(total, 2),
                "fees": 0,
                "realizedProfit": 0,
                "note": buy_note(symbol),
            })

        sell = re.search(r"-?\s*([0-9:]+)\s+([A-Z]+).*?filled:\s+sold\s+(\d+)\s+shares\s+at\s+\$([0-9]+(?:\.[0-9]+)?),\s+proceeds\s+\$([0-9]+(?:\.[0-9]+)?)", line)
        if sell and current_date:
            symbol = sell.group(2)
            qty = int(sell.group(3))
            trade_price = float(sell.group(4))
            proceeds = float(sell.group(5))
            basis = avg_cost.get(symbol, trade_price)
            trades.append({
                "date": iso_for(current_date, sell.group(1)),
                "symbol": symbol,
                "side": "SELL",
                "quantity": qty,
                "price": trade_price,
                "amount": round(proceeds, 2),
                "fees": 0,
                "realizedProfit": round((trade_price - basis) * qty, 2),
                "note": "Reducing sale from the exit ladder.",
            })

        if current_date and any(marker in line for marker in ["GTC", "exit ladder", "authorized increasing", "merger-process update"]):
            if "order `" in line or "ref_id" in line:
                safe = scrub(line)
            else:
                safe = scrub(line.lstrip("- "))
            if "placed" in safe.lower() or "authorized" in safe.lower() or "update" in safe.lower():
                time_match = re.match(r"-?\s*([0-9]{2}:[0-9]{2})(?::[0-9]{2})?", line)
                action_time = time_match.group(1) if time_match else "15:31"
                symbol_match = re.search(r"\b(SUNE|AUUD|ZENA|XOS|VRA|PORTFOLIO)\b", safe)
                actions.append({
                    "date": iso_for(current_date, action_time),
                    "symbol": symbol_match.group(1) if symbol_match else "PORTFOLIO",
                    "type": action_type(safe),
                    "description": public_action_description(safe),
                })

    deduped = {}
    for item in snapshots:
        deduped[item["date"]] = item
    snapshots = sorted(deduped.values(), key=lambda item: item["date"])
    snapshots = add_performance_fields(snapshots)
    trades = sorted(trades, key=lambda item: item["date"])
    actions = sorted(actions, key=lambda item: item["date"])
    return trades, actions[-12:], snapshots


def add_performance_fields(snapshots):
    if not snapshots:
        return snapshots

    capital_added = snapshots[0]["value"]
    previous = snapshots[0]
    enriched = []

    for index, item in enumerate(snapshots):
        if index > 0:
            cash_change = item.get("cash", 0) - previous.get("cash", 0)
            value_change = item["value"] - previous["value"]
            exposure_change = item.get("exposure", 0) - previous.get("exposure", 0)
            if cash_change > 100 and value_change > 100:
                # The deposit may be partly spent before the next EOD snapshot.
                capital_added += cash_change + max(0, exposure_change)

        item["capitalAdded"] = round(capital_added, 2)
        item["tradingPnl"] = round(item["value"] - capital_added, 2)
        previous = item
        enriched.append(item)

    return enriched


def buy_note(symbol):
    notes = {
        "SUNE": "Opening scout after Suniva reverse-merger catalyst and tight high-volume tape.",
        "AUUD": "Manually approved buy after clean review; AI-infra merger and financing thesis.",
        "ZENA": "Manually requested buy after Russell 3000 inclusion catalyst.",
        "XOS": "Autonomous buy after $3M Xos Hub follow-on order catalyst.",
        "VRA": "Autonomous buy after earnings beat and tight cooled opening range.",
    }
    return notes.get(symbol, "Public-safe trade entry parsed from the trading journal.")


def action_type(text):
    lower = text.lower()
    if "authorized increasing" in lower:
        return "MANDATE_UPDATED"
    if "merger-process update" in lower or "fresh june 11" in lower:
        return "CATALYST_UPDATE"
    if "exit ladder" in lower:
        return "EXIT_LADDER_PLACED"
    if "gtc" in lower:
        return "GTC_LIMIT_PLACED"
    return "ACTION"


def public_action_description(text):
    text = re.sub(r"Order `[^`]+`,?\s*", "", text)
    text = re.sub(r"ref_id `[^`]+`,?\s*", "", text)
    text = re.sub(r"after `review_equity_order` returned no `order_checks` alerts", "after clean review", text)
    text = re.sub(r"Reviewed and ", "", text)
    text = text.replace("Ste" + "phen", "Manual")
    if len(text) > 240:
        text = text[:237].rstrip() + "..."
    return text


def latest_open_orders(journal_text):
    matches = re.findall(r"Open orders remain confirmed/unfilled:\s+(.+?)\.\s+No new orders placed", journal_text)
    if not matches:
        return []
    text = matches[-1]
    orders = []
    for segment in text.split(";"):
        symbol_match = re.search(r"\b([A-Z]{2,5})\b", segment)
        if not symbol_match:
            continue
        symbol = symbol_match.group(1)
        for match in re.finditer(r"(\d+)\s+shares?\s+(?:GTC\s+)?sell\s+at\s+\$([0-9]+(?:\.[0-9]+)?)|(\d+)\s+shares?\s+at\s+\$([0-9]+(?:\.[0-9]+)?)", segment):
            quantity = int(match.group(1) or match.group(3))
            limit_price = float(match.group(2) or match.group(4))
            orders.append({
                "symbol": symbol,
                "side": "SELL",
                "quantity": quantity,
                "limitPrice": limit_price,
                "purpose": order_purpose(limit_price),
            })
    return orders


def order_purpose(limit_price):
    if limit_price in (2.66, 2.92):
        return "Principal recovery"
    if limit_price in (3.99, 4.38, 8.04):
        return "3x runner tier"
    if limit_price in (6.65, 7.3, 13.4):
        return "5x runner tier"
    return "Exit ladder"


def build_holdings(state):
    positions = state["portfolioSnapshot"]["positions"]
    holdings = []
    for pos in positions:
        symbol = pos["symbol"]
        fallback = THESIS_FALLBACKS.get(symbol, {})
        holdings.append({
            "symbol": symbol,
            "company": fallback.get("company", symbol),
            "quantity": pos["quantity"],
            "averageCost": pos["averageBuyPrice"],
            "costBasis": pos["estimatedCost"],
            "lastPrice": pos["lastTradePrice"],
            "realizedProfit": 24.12 if symbol == "SUNE" else 0,
            "thesis": fallback.get("thesis", pos.get("thesis", "")),
            "invalidation": fallback.get("invalidation", pos.get("invalidation", "")),
            "plan": scrub(pos.get("reviewPlan", "")),
        })
    return holdings


def validate_public_safe(text):
    hits = []
    for pattern in PRIVATE_PATTERNS:
        if pattern.search(text):
            hits.append(pattern.pattern)
    if hits:
        raise SystemExit(f"Refusing to write site data; private-pattern hits: {hits}")


def main():
    state = load_json(STATE_PATH)
    journal_text = JOURNAL_PATH.read_text()
    trades, actions, snapshots = parse_journal()
    holdings = build_holdings(state)
    realized = round(sum(item["realizedProfit"] for item in trades), 2)
    payload = {
        "asOf": state["portfolioSnapshot"]["lastChecked"],
        "cash": state["portfolioSnapshot"]["cash"],
        "accountValue": state["portfolioSnapshot"]["totalValue"],
        "exposureCost": state["portfolioSnapshot"]["totalMoonshotExposureDollars"],
        "realizedProfit": realized,
        "snapshots": snapshots,
        "policy": {
            "perTicketCap": state["settings"]["maxAutonomousBuyDollars"],
            "exposureCap": state["settings"]["maxTotalMoonshotExposureDollars"],
            "rules": [
                "Listed common-stock microcap moonshots only.",
                "Prefer pre-catalyst, early underreaction, or second-catalyst setups over spent headline spikes.",
                "No averaging down.",
                "Recover principal near 2x when structure supports it.",
                "Sell partials into 3x-5x spikes.",
                "Hold runners only while catalyst, volume, and market structure remain intact.",
            ],
        },
        "holdings": holdings,
        "trades": trades,
        "actions": actions,
        "openOrders": latest_open_orders(journal_text),
    }
    output = "window.TRADE_HISTORY = " + json.dumps(payload, indent=2) + ";\n"
    validate_public_safe(output)
    OUT_PATH.write_text(output)
    print(f"Wrote {OUT_PATH}")


if __name__ == "__main__":
    main()
