import { normalizeAgentOutput } from "./_agentContract.js";

export function runLiquidityAgent(trade, context, memory) {
  const score =
    context.volatility === "high" ? 60 : 80;

  return normalizeAgentOutput({
    score,
    action: score > 70 ? "BUY" : "WATCH",
    confidence: 70,
    meta: { type: "liquidity" }
  });
}
