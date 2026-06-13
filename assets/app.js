const data = window.TRADE_HISTORY;

const palette = ["#255f91", "#168057", "#a76c19", "#157f83", "#6752a3", "#bd4d4d"];

const money = (value) => {
  const sign = value < 0 ? "-" : "";
  return `${sign}$${Math.abs(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

const shares = (value) => value.toLocaleString(undefined, { maximumFractionDigits: 4 });
const price = (value) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
const pct = (value) => `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
const dt = (value) => new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit"
}).format(new Date(value));

const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const marketValue = data.holdings.reduce((sum, h) => sum + h.quantity * h.lastPrice, 0);
const unrealizedProfit = data.holdings.reduce((sum, h) => sum + (h.quantity * h.lastPrice - h.costBasis), 0);
const totalProfit = data.realizedProfit + unrealizedProfit;
const totalReturn = data.exposureCost ? (totalProfit / data.exposureCost) * 100 : 0;
const largest = data.holdings
  .map((h) => ({ ...h, marketValue: h.quantity * h.lastPrice }))
  .sort((a, b) => b.marketValue - a.marketValue)[0];

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("theme", theme);
  document.querySelector("#themeToggle").setAttribute(
    "aria-label",
    theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
  );
  drawCharts();
}

const savedTheme = localStorage.getItem("theme");
const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
setTheme(savedTheme || preferredTheme);

document.querySelector("#themeToggle").addEventListener("click", () => {
  setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
});

document.querySelector("#asOf").textContent = `As of ${dt(data.asOf)} ET`;
document.querySelector("#accountValue").textContent = money(data.accountValue);
document.querySelector("#exposureCost").textContent = money(data.exposureCost);
document.querySelector("#marketValue").textContent = money(marketValue);
document.querySelector("#cash").textContent = money(data.cash);
document.querySelector("#totalProfit").textContent = money(totalProfit);
document.querySelector("#totalProfit").className = totalProfit >= 0 ? "gain" : "loss";
document.querySelector("#heroReturn").textContent = `${money(totalProfit)} · ${pct(totalReturn)}`;
document.querySelector("#largestPosition").textContent = `${largest.symbol} ${money(largest.marketValue)}`;
document.querySelector("#rules").innerHTML = data.policy.rules.map((rule) => `<li>${rule}</li>`).join("");

const maxPositionValue = Math.max(...data.holdings.map((h) => h.quantity * h.lastPrice));
const holdingsEl = document.querySelector("#holdings");

holdingsEl.innerHTML = data.holdings.map((holding) => {
  const value = holding.quantity * holding.lastPrice;
  const unrealized = value - holding.costBasis;
  const total = unrealized + holding.realizedProfit;
  const returnPct = (total / holding.costBasis) * 100;
  const cls = total >= 0 ? "gain" : "loss";
  const barWidth = Math.max(5, (value / maxPositionValue) * 100);

  return `
    <article class="holding">
      <div class="holding-top">
        <div>
          <div class="ticker">${holding.symbol}</div>
          <div class="company">${holding.company}</div>
        </div>
        <div class="stat"><span>Shares</span><strong>${shares(holding.quantity)}</strong></div>
        <div class="stat"><span>Avg Cost</span><strong>${price(holding.averageCost)}</strong></div>
        <div class="stat"><span>Last</span><strong>${price(holding.lastPrice)}</strong></div>
        <div class="stat"><span>Market Value</span><strong>${money(value)}</strong></div>
        <div class="stat"><span>Total P/L</span><strong class="${cls}">${money(total)} · ${pct(returnPct)}</strong></div>
      </div>
      <div class="bar" aria-hidden="true"><span style="width: ${barWidth}%"></span></div>
      <div class="copygrid">
        <p><b>Thesis</b>${holding.thesis}</p>
        <p><b>Invalidation</b>${holding.invalidation}</p>
        <p><b>Plan</b>${holding.plan}</p>
      </div>
    </article>
  `;
}).join("");

const tradesEl = document.querySelector("#trades");

function renderTrades(filter = "ALL") {
  const rows = data.trades
    .filter((trade) => filter === "ALL" || trade.side === filter)
    .map((trade) => {
      const side = trade.side.toLowerCase();
      return `
        <tr>
          <td>${dt(trade.date)}</td>
          <td><strong>${trade.symbol}</strong></td>
          <td><span class="pill ${side}">${trade.side}</span></td>
          <td class="num">${shares(trade.quantity)}</td>
          <td class="num">${price(trade.price)}</td>
          <td class="num ${trade.amount >= 0 ? "gain" : "loss"}">${money(trade.amount)}</td>
          <td class="num ${trade.realizedProfit >= 0 ? "gain" : "loss"}">${money(trade.realizedProfit)}</td>
          <td>${trade.note}</td>
        </tr>
      `;
    });

  tradesEl.innerHTML = rows.join("");
}

renderTrades();

document.querySelectorAll(".filters button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filters button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderTrades(button.dataset.filter);
  });
});

document.querySelector("#actions").innerHTML = data.actions.map((action) => `
  <article class="event">
    <h3>${action.symbol} · ${action.type.replaceAll("_", " ")}</h3>
    <p>${action.description}</p>
    <time>${dt(action.date)}</time>
  </article>
`).join("");

document.querySelector("#openOrders").innerHTML = data.openOrders.map((order) => `
  <article class="order">
    <h3>${order.symbol} ${order.side} ${shares(order.quantity)} @ ${price(order.limitPrice)}</h3>
    <p>${order.purpose}</p>
    <span>Potential proceeds ${money(order.quantity * order.limitPrice)}</span>
  </article>
`).join("");

function setupCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  return { ctx, width: rect.width, height: rect.height };
}

function drawLineChart() {
  const canvas = document.querySelector("#equityChart");
  const { ctx, width, height } = setupCanvas(canvas);
  const pad = 34;
  const values = data.snapshots.map((item) => item.tradingPnl ?? item.value);
  const min = Math.min(...values, 0) - 5;
  const max = Math.max(...values, 0) + 5;
  const xFor = (index) => values.length === 1
    ? width / 2
    : pad + (index / (values.length - 1)) * (width - pad * 2);
  const yFor = (value) => height - pad - ((value - min) / (max - min)) * (height - pad * 2);

  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = css("--line");
  ctx.lineWidth = 1;
  ctx.font = "12px Inter, sans-serif";
  ctx.fillStyle = css("--soft");
  ctx.textAlign = "left";

  for (let i = 0; i < 4; i += 1) {
    const y = pad + i * ((height - pad * 2) / 3);
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(width - pad, y);
    ctx.stroke();
  }

  const zeroY = yFor(0);
  ctx.beginPath();
  ctx.moveTo(pad, zeroY);
  ctx.lineTo(width - pad, zeroY);
  ctx.strokeStyle = css("--soft");
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.beginPath();
  values.forEach((value, index) => {
    const x = xFor(index);
    const y = yFor(value);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = css("--green");
  ctx.lineWidth = 4;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke();

  values.forEach((value, index) => {
    const x = xFor(index);
    const y = yFor(value);
    ctx.fillStyle = css("--panel-strong");
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = css("--green");
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = css("--soft");
    ctx.fillText(data.snapshots[index].label, x - 18, height - 8);
  });
}

function drawAllocationChart() {
  const canvas = document.querySelector("#allocationChart");
  const { ctx, width, height } = setupCanvas(canvas);
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.34;
  const values = data.holdings.map((h) => h.quantity * h.lastPrice);
  const total = values.reduce((sum, value) => sum + value, 0);
  let start = -Math.PI / 2;

  ctx.clearRect(0, 0, width, height);
  values.forEach((value, index) => {
    const angle = (value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, start, start + angle);
    ctx.closePath();
    ctx.fillStyle = palette[index % palette.length];
    ctx.fill();
    start += angle;
  });

  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.58, 0, Math.PI * 2);
  ctx.fillStyle = css("--panel");
  ctx.fill();
  ctx.fillStyle = css("--ink");
  ctx.font = "700 20px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(money(total), cx, cy - 2);
  ctx.fillStyle = css("--soft");
  ctx.font = "12px Inter, sans-serif";
  ctx.fillText("market value", cx, cy + 18);

  document.querySelector("#allocationLegend").innerHTML = data.holdings.map((holding, index) => `
    <span><i style="background:${palette[index % palette.length]}"></i>${holding.symbol}</span>
  `).join("");
}

function drawProfitChart() {
  const canvas = document.querySelector("#profitChart");
  const { ctx, width, height } = setupCanvas(canvas);
  const rows = [
    ["Realized", data.realizedProfit, css("--green")],
    ["Unrealized", unrealizedProfit, css("--blue")],
    ["Total", totalProfit, css("--gold")]
  ];
  const max = Math.max(...rows.map((row) => Math.abs(row[1])));
  const left = 92;
  const right = 24;
  const barArea = width - left - right;

  ctx.clearRect(0, 0, width, height);
  ctx.font = "13px Inter, sans-serif";
  rows.forEach((row, index) => {
    const y = 34 + index * 48;
    const barWidth = Math.max(4, (Math.abs(row[1]) / max) * barArea);
    ctx.fillStyle = css("--soft");
    ctx.fillText(row[0], 8, y + 16);
    ctx.fillStyle = row[2];
    ctx.fillRect(left, y, barWidth, 24);
    ctx.fillStyle = css("--ink");
    ctx.fillText(money(row[1]), Math.min(left + barWidth + 10, width - 82), y + 16);
  });
}

function drawCharts() {
  drawLineChart();
  drawAllocationChart();
  drawProfitChart();
}

window.addEventListener("resize", drawCharts);
