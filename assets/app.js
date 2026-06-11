const data = window.TRADE_HISTORY;

const money = (value) => {
  const sign = value < 0 ? "-" : "";
  return `${sign}$${Math.abs(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

const shares = (value) => value.toLocaleString(undefined, { maximumFractionDigits: 4 });
const price = (value) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
const dt = (value) => new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit"
}).format(new Date(value));

const marketValue = data.holdings.reduce((sum, h) => sum + h.quantity * h.lastPrice, 0);
const unrealizedProfit = data.holdings.reduce((sum, h) => sum + (h.quantity * h.lastPrice - h.costBasis), 0);
const totalProfit = data.realizedProfit + unrealizedProfit;

document.querySelector("#asOf").textContent = `As of ${dt(data.asOf)} ET`;
document.querySelector("#accountValue").textContent = money(data.accountValue);
document.querySelector("#exposureCost").textContent = money(data.exposureCost);
document.querySelector("#marketValue").textContent = money(marketValue);
document.querySelector("#totalProfit").textContent = money(totalProfit);
document.querySelector("#totalProfit").className = totalProfit >= 0 ? "gain" : "loss";

document.querySelector("#rules").innerHTML = data.policy.rules.map((rule) => `<li>${rule}</li>`).join("");

const holdingsEl = document.querySelector("#holdings");
holdingsEl.innerHTML = data.holdings.map((holding) => {
  const value = holding.quantity * holding.lastPrice;
  const unrealized = value - holding.costBasis;
  const total = unrealized + holding.realizedProfit;
  const cls = total >= 0 ? "gain" : "loss";

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
        <div class="stat"><span>Total P/L</span><strong class="${cls}">${money(total)}</strong></div>
      </div>
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
