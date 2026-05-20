/**
 * RiskPilot v4.1 Hedge Execution Engine
 * Converts prediction → actionable execution plan
 */

export function generateExecutionPlan(input, prediction, context, memory) {
  const risk = Number(input.risk_percent || 1);
  const score = prediction.score || 50;

  const confidence = Math.min(100, score + (memory.avgScore || 50) * 0.1);

  const directionBias =
    context.session === "New York" ? 1.2 :
    context.session === "London" ? 1.1 : 0.9;

  const positionSize = Math.min(
    1,
    (risk / 100) * (confidence / 100) * directionBias
  );

  const hedgeRatio =
    memory.behavior === "AGGRESSIVE" ? 1.5 :
    memory.behavior === "DISCIPLINED" ? 0.7 : 1.0;

  const executionScore = Math.min(
    100,
    score * directionBias * hedgeRatio
  );

  return {
    executionScore: Math.round(executionScore),
    confidence: Math.round(confidence),
    positionSize: Number(positionSize.toFixed(4)),
    hedgeRatio,
    recommendation:
      executionScore > 80
        ? "AGGRESSIVE ENTRY"
        : executionScore > 60
        ? "CONTROLLED ENTRY"
        : "NO TRADE / WAIT",
    riskLevel:
      executionScore > 80 ? "HIGH EXPOSURE" :
      executionScore > 60 ? "MEDIUM" : "LOW",
  };
}
