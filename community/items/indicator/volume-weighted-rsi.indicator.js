// Volume-Weighted RSI. Like RSI, but each bar's gain or loss is multiplied by
// its volume before averaging, so moves on heavy volume weigh more.
export default indicator({
  name: "Volume-Weighted RSI",
  shortName: "VW-RSI",
  description: "RSI where each bar's move counts in proportion to its volume, so heavy-volume moves matter more than quiet drift.",
  category: "Momentum",
  placement: "pane",
  author: "Stockyard team",
  levels: [70, 30],
  range: [0, 100],
  format: "number",

  inputs: {
    length: input.length(14, "Length"),
    signal: input.length(9, "Signal length"),
    source: input.source("close"),
  },

  plots: {
    vrsi: { label: "VW-RSI", color: "#a78bfa" },
    signal: { label: "Signal", color: "#f59e0b", lineWidth: 1 },
  },

  compute(bars, inputs) {
    const price = ta.source(bars, inputs.source);
    const volume = ta.source(bars, "volume");
    const move = ta.change(price);
    const gains = ta.rma(ta.zip((m, v) => Math.max(m, 0) * v, move, volume), inputs.length);
    const losses = ta.rma(ta.zip((m, v) => Math.max(-m, 0) * v, move, volume), inputs.length);
    const vrsi = ta.zip((g, l) => (l === 0 ? 100 : 100 - 100 / (1 + g / l)), gains, losses);
    return { vrsi, signal: ta.ema(vrsi, inputs.signal) };
  },
});
