import { analyzeRisk } from "../engines/risk/riskEngine.js";
import { generatePrediction } from "../engines/prediction/predictionEngine.js";
import { updateMemory } from "../engines/memory/memoryEngine.js";
import { saveTrade, getUserStats } from "../engines/persistent/persistentMemory.js";
import { executeTrade } from "../engines/execution/executionEngine.js";

import { getMarketSession, getVolatilityAdjustment } from "../engines/risk/context.js";

export async function orchestrateTrade(input, userId = "anon") {
  // 1. Risk analysis
  const risk = analyzeRisk(input);

  // 2. Market context
  const context = getMarketSession();
  const vol = getVolatilityAdjustment(context.volatility, input);

  // 3. Base score calculation
  let score = risk.score * context.bias * vol.multiplier;

  // 4. Memory layer
  const memory = updateMemory(userId, input, score);

  // 5. Adaptive adjustment
  if (memory.behavior === "DISCIPLINED") score *= 1.05;
  if (memory.behavior === "AGGRESSIVE") score *= 0.95;

  score = Math.min(100, Math.max(0, score));

  // 6. Prediction layer
  const prediction = generatePrediction(score, input);

  // 7. Execution decision
  const execution = executeTrade(input, score);

  // 8. Persistence
  await saveTrade(userId, input, score);

  const stats = await getUserStats(userId);

  return {
    score: Math.round(score),
    state: score > 80 ? "STABLE" : "CAUTION",
    context,
    memory,
    prediction,
    execution,
    stats,
    alerts: [
      `Session: ${context.session}`,
      vol.note,
      `Trader State: ${memory.behavior}`,
    ],
  };
}
