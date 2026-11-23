// Zero-Lag EMA (ZLEMA). An EMA of price plus the change since `lag` bars ago,
// which cancels most of the delay a plain EMA has.
export default indicator({
  name: "Zero-Lag EMA",
  shortName: "ZLEMA",
  description: "An EMA fed with price plus its own recent change, so it turns with price instead of after it.",
  category: "Moving Averages",
  placement: "overlay",
  author: "Stockyard team",

  inputs: {
    length: input.length(21, "Length"),
    source: input.source("close"),
  },

  plots: {
    zlema: { label: "ZLEMA", color: "#f59e0b" },
  },

  compute(bars, inputs) {
    const price = ta.source(bars, inputs.source);
    const lag = Math.floor((inputs.length - 1) / 2);
    const adjusted = ta.zip((now, past) => 2 * now - past, price, ta.shift(price, lag));
    return { zlema: ta.ema(adjusted, inputs.length) };
  },
});
