import { normalizeAgentOutput } from "./_agentContract.js";

export function runRiskAgent(trade, context, memory) {
  const risk = trade.risk_percent || 1;

  const score = 100 - (risk * 20);

  const action =
    score < 40 ? "BLOCK" :
    score < 65 ? "WATCH" :
    "BUY";

  return normalizeAgentOutput({
    score,
    action,
    confidence: 80 - risk * 10,
    meta: { type: "risk" }
  });
}
