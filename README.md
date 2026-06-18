# Agentic Trading History

A public-safe static dashboard for the Agentic moonshot sleeve.

The site intentionally excludes private brokerage details:

- no account numbers
- no broker order IDs
- no internal reference IDs
- no personal identifiers

It does include trade dates, tickers, quantities, cost basis, proceeds, realized and unrealized P/L, theses, invalidation rules, and open exit plans.

## Run Locally

Open `index.html` directly, or serve the folder:

```sh
python3 -m http.server 8080
```

## Publish On GitHub Pages

1. Create a new GitHub repository.
2. Push this folder.
3. In GitHub, open `Settings` -> `Pages`.
4. Set source to `Deploy from a branch`.
5. Choose `main` and `/root`.

## Updating Data

Edit `/home/stbenjam/.openclaw/workspace/trading/public-trades.json` for filled buys and sells, then run:

```sh
./scripts/update_and_publish.sh
```

`assets/trades.js` is generated. Keep structured trade records public-safe: amounts are fine, but do not add account numbers, order IDs, ref IDs, or broker-specific private metadata.
