import { normalizeAgentOutput } from "./_agentContract.js";

export function runExecutionAgent(trade, context, memory) {
  const score =
    50 +
    (memory.avgScore || 0) * 0.3 +
    (context.volatility === "high" ? -10 : 10);

  const action =
    score > 75 ? "BUY" :
    score < 40 ? "BLOCK" :
    "WATCH";

  const confidence = Math.abs(score - 50);

  return normalizeAgentOutput({
    score,
    action,
    confidence,
    meta: { type: "execution" }
  });
}
