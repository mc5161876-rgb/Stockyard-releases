// @name Example: Big movers
// A Stockyard plugin. Install it from the Community hub, or from
// Settings → Widgets & plugins → Add plugin file.
// It adds a "Big movers" widget that lists the biggest 24h moves among a few coins,
// and a "Grape" theme. It only uses the public plugin API (see docs/plugins.md).

export default function activate(stockyard) {
  stockyard.registerTheme({
    id: "example.grape",
    name: "Grape",
    description: "Purple theme from the example plugin",
    bg: "#140d1f", panel: "#1c1329", panelAlt: "#241833", border: "#33244a", hover: "#2b1d3d",
    grid: "#1a1226", text: "#f1e8ff", muted: "#a291bd", up: "#5eead4", down: "#fb7185",
    crosshair: "#7d6a99", accent: "#c084fc",
    palette: ["#c084fc", "#5eead4", "#fde047", "#f9a8d4", "#93c5fd", "#fdba74"],
    animation: { kind: "pulse", intensity: 0.5, speed: 1, colors: ["#7c3aed", "#db2777"] },
  });

  stockyard.registerWidget({
    id: "example.big-movers",
    name: "Big movers",
    description: "Biggest 24h moves among the coins you list (example plugin).",
    icon: "🚀",
    defaultSize: { w: 240, h: 220 },
    defaultConfig: { coins: "BTC-USD ETH-USD SOL-USD DOGE-USD XRP-USD ADA-USD AVAX-USD LINK-USD" },
    settings: [{ key: "coins", label: "Coins", type: "textarea" }],
    mount(el, ctx) {
      let symbols = [];
      let off = () => {};
      const stats = new Map();
      const draw = () => {
        const rows = [...stats.values()]
          .map((q) => ({ s: q.symbol, pct: ((q.last - q.reference) / q.reference) * 100 }))
          .sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct));
        el.innerHTML = "";
        for (const r of rows) {
          const row = document.createElement("div");
          row.style.cssText = "display:flex;justify-content:space-between;padding:4px 8px;border-bottom:1px solid var(--border);cursor:pointer";
          row.onclick = () => ctx.openSymbol(r.s);
          const pct = document.createElement("span");
          pct.textContent = `${r.pct >= 0 ? "+" : ""}${r.pct.toFixed(2)}%`;
          pct.style.color = r.pct >= 0 ? "var(--up)" : "var(--down)";
          row.append(r.s, pct);
          el.append(row);
        }
        if (!rows.length) el.textContent = "Waiting for prices…";
      };
      const listen = (c) => {
        const next = String(c.coins || "").split(/[\s,]+/).filter(Boolean);
        if (next.join() === symbols.join()) return;
        symbols = next;
        off();
        stats.clear();
        off = stockyard.markets.subscribeQuotes(symbols, (q) => stats.set(q.symbol, q));
      };
      listen(ctx.config);
      const timer = setInterval(draw, 1000);
      draw();
      return {
        update: (c) => listen(c.config),
        destroy: () => {
          clearInterval(timer);
          off();
        },
      };
    },
  });
}
