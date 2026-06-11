window.TRADE_HISTORY = {
  asOf: "2026-06-11T15:31:00-04:00",
  cash: 3.51,
  accountValue: 185.5319,
  exposureCost: 175.61,
  realizedProfit: 24.12,
  snapshots: [
    { date: "2026-06-08T09:30:00-04:00", label: "Start", value: 155, exposure: 0 },
    { date: "2026-06-08T15:31:00-04:00", label: "Jun 8", value: 185.745, exposure: 54.57 },
    { date: "2026-06-09T15:31:00-04:00", label: "Jun 9", value: 179.0062, exposure: 104.07 },
    { date: "2026-06-10T15:31:00-04:00", label: "Jun 10", value: 179, exposure: 151.95 },
    { date: "2026-06-11T15:31:00-04:00", label: "Jun 11", value: 185.5319, exposure: 175.61 }
  ],
  policy: {
    perTicketCap: 50,
    exposureCap: 1000,
    rules: [
      "Listed common-stock microcap moonshots only.",
      "No averaging down.",
      "Recover principal near 2x when structure supports it.",
      "Sell partials into 3x-5x spikes.",
      "Hold runners only while catalyst, volume, and market structure remain intact."
    ]
  },
  holdings: [
    {
      symbol: "SUNE",
      company: "SUNation Energy",
      quantity: 2,
      averageCost: 2.68,
      costBasis: 5.36,
      lastPrice: 2.6263,
      realizedProfit: 24.12,
      thesis: "Tiny Nasdaq-listed solar shell with a definitive Suniva reverse-merger catalyst, exceptional opening liquidity, and a tight regular-hours spread.",
      invalidation: "Review or sell if the merger-news bid fails, liquidity deteriorates, dilution and ownership math dominate the tape, or price breaks below the merger-thesis range around $2.26.",
      plan: "Hold/no add. Principal and the 3x tier are already harvested. Keep one share on the $13.40 GTC sell and one loose runner."
    },
    {
      symbol: "AUUD",
      company: "Auddia",
      quantity: 37,
      averageCost: 1.3299,
      costBasis: 49.21,
      lastPrice: 1.37,
      realizedProfit: 0,
      thesis: "Tiny Nasdaq-listed AI-infra merger story with completed financing, S-4 process, and planned McCarthy Finney combination.",
      invalidation: "Review or sell if the merger terms imply excessive dilution, the financing/S-4 path breaks, regular-hours volume cannot support the setup, or the move turns into no-news promotion.",
      plan: "Hold/no add. June 11 merger-process update was constructive: SEC comments received and July closing expected subject to clearance, Nasdaq approval, and shareholder vote. Keep the existing exit ladder."
    },
    {
      symbol: "ZENA",
      company: "ZenaTech",
      quantity: 34,
      averageCost: 1.4559,
      costBasis: 49.5,
      lastPrice: 1.555,
      realizedProfit: 0,
      thesis: "Russell 3000 inclusion effective June 29, listed common-stock structure, tight quote, and possible drone/AI retail attention if index-inclusion flow builds.",
      invalidation: "Review or sell if volume stays ordinary, the Russell addition fails to attract momentum, spread/liquidity deteriorate, or the move turns into low-quality promotion.",
      plan: "Hold/no add. Keep the principal-recovery, 3x, and 5x reducing sell limits."
    },
    {
      symbol: "XOS",
      company: "Xos",
      quantity: 12,
      averageCost: 3.9899,
      costBasis: 47.88,
      lastPrice: 4.1,
      realizedProfit: 0,
      thesis: "Real operating catalyst: follow-on order worth about $3M for 12 Xos Hub mobile energy storage and charging units from a leading autonomous fleet operator.",
      invalidation: "Review or sell if the order-news bid fades below the opening range, volume dries up, spread widens materially, or the market treats the catalyst as exhausted continuation.",
      plan: "Hold/no add. Price held above fill and prior close. No add because the ticket is already near the $50 per-ticket cap."
    },
    {
      symbol: "VRA",
      company: "Vera Bradley",
      quantity: 7,
      averageCost: 3.3799,
      costBasis: 23.66,
      lastPrice: 3.4299,
      realizedProfit: 0,
      thesis: "June 11 earnings surprise, Nasdaq common stock, heavy relative volume, tight regular-hours quote, and a cooled opening range rather than a vertical chase.",
      invalidation: "Review or sell if the earnings-gap bid fails, spread/liquidity deteriorate, volume dries up, or the setup proves to be only a modest turnaround bounce.",
      plan: "Hold/no add. Consider principal recovery near 2x only if volume and market structure stay supportive."
    }
  ],
  trades: [
    {
      date: "2026-06-08T09:49:15-04:00",
      symbol: "SUNE",
      side: "BUY",
      quantity: 9,
      price: 2.68,
      amount: -24.12,
      fees: 0,
      realizedProfit: 0,
      note: "Opening scout after Suniva reverse-merger catalyst and tight high-volume tape."
    },
    {
      date: "2026-06-08T12:03:29-04:00",
      symbol: "AUUD",
      side: "BUY",
      quantity: 37,
      price: 1.3299,
      amount: -49.21,
      fees: 0,
      realizedProfit: 0,
      note: "Manually approved buy after clean review; AI-infra merger and financing thesis."
    },
    {
      date: "2026-06-08T14:39:38-04:00",
      symbol: "SUNE",
      side: "SELL",
      quantity: 5,
      price: 5.36,
      amount: 26.8,
      fees: 0,
      realizedProfit: 13.4,
      note: "Principal-recovery sale near 2x entry."
    },
    {
      date: "2026-06-08T14:50:44-04:00",
      symbol: "SUNE",
      side: "SELL",
      quantity: 2,
      price: 8.04,
      amount: 16.08,
      fees: 0,
      realizedProfit: 10.72,
      note: "3x runner tier filled."
    },
    {
      date: "2026-06-09T09:52:39-04:00",
      symbol: "ZENA",
      side: "BUY",
      quantity: 34,
      price: 1.4559,
      amount: -49.5,
      fees: 0,
      realizedProfit: 0,
      note: "Manually requested buy after Russell 3000 inclusion catalyst."
    },
    {
      date: "2026-06-10T09:48:23-04:00",
      symbol: "XOS",
      side: "BUY",
      quantity: 12,
      price: 3.9899,
      amount: -47.88,
      fees: 0,
      realizedProfit: 0,
      note: "Autonomous buy after $3M Xos Hub follow-on order catalyst."
    },
    {
      date: "2026-06-11T09:48:58-04:00",
      symbol: "VRA",
      side: "BUY",
      quantity: 7,
      price: 3.3799,
      amount: -23.66,
      fees: 0,
      realizedProfit: 0,
      note: "Autonomous buy after earnings beat and tight cooled opening range."
    }
  ],
  actions: [
    {
      date: "2026-06-08T14:39:00-04:00",
      symbol: "SUNE",
      type: "GTC_LIMIT_PLACED",
      description: "Placed 5-share principal-recovery sell at $5.36. It filled seconds later."
    },
    {
      date: "2026-06-08T14:43:00-04:00",
      symbol: "SUNE",
      type: "GTC_LIMIT_PLACED",
      description: "Placed 2-share 3x runner sell at $8.04. It filled at 14:50:44."
    },
    {
      date: "2026-06-08T14:45:00-04:00",
      symbol: "SUNE",
      type: "GTC_LIMIT_PLACED",
      description: "Placed 1-share 5x runner sell at $13.40. Still open as of the last check."
    },
    {
      date: "2026-06-08T14:52:00-04:00",
      symbol: "AUUD",
      type: "EXIT_LADDER_PLACED",
      description: "Placed reducing sells: 19 @ $2.66, 9 @ $3.99, 5 @ $6.65."
    },
    {
      date: "2026-06-09T09:55:00-04:00",
      symbol: "PORTFOLIO",
      type: "MANDATE_UPDATED",
      description: "Exposure cap increased to $1,000; per-ticket autonomous buy cap remained $50."
    },
    {
      date: "2026-06-09T15:31:00-04:00",
      symbol: "ZENA",
      type: "EXIT_LADDER_PLACED",
      description: "Placed reducing sells: 17 @ $2.92, 8 @ $4.38, 5 @ $7.30."
    },
    {
      date: "2026-06-11T15:31:00-04:00",
      symbol: "AUUD",
      type: "CATALYST_UPDATE",
      description: "Constructive merger-process update: SEC comments received and July closing expected subject to clearance, Nasdaq approval, and shareholder vote."
    }
  ],
  openOrders: [
    {
      symbol: "SUNE",
      side: "SELL",
      quantity: 1,
      limitPrice: 13.4,
      purpose: "5x runner tier"
    },
    {
      symbol: "AUUD",
      side: "SELL",
      quantity: 19,
      limitPrice: 2.66,
      purpose: "Principal recovery"
    },
    {
      symbol: "AUUD",
      side: "SELL",
      quantity: 9,
      limitPrice: 3.99,
      purpose: "3x runner tier"
    },
    {
      symbol: "AUUD",
      side: "SELL",
      quantity: 5,
      limitPrice: 6.65,
      purpose: "5x runner tier"
    },
    {
      symbol: "ZENA",
      side: "SELL",
      quantity: 17,
      limitPrice: 2.92,
      purpose: "Principal recovery"
    },
    {
      symbol: "ZENA",
      side: "SELL",
      quantity: 8,
      limitPrice: 4.38,
      purpose: "3x runner tier"
    },
    {
      symbol: "ZENA",
      side: "SELL",
      quantity: 5,
      limitPrice: 7.3,
      purpose: "5x runner tier"
    }
  ]
};
