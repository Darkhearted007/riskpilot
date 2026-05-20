import { getMarketSession, getVolatilityAdjustment } from "./contextEngine.js";

/* ===============================
   MAIN PREDICTION ENGINE
================================ */
export function predictTrade(trade) {
  const session = getMarketSession();
  const vol = getVolatilityAdjustment(session.volatility, trade);

  const risk = Number(trade.risk_percent || 1);
  const entry = Number(trade.entry_price || 0);

  /* ===============================
     BASE SIGNAL SCORE
  ================================ */
  let score = 50;

  // Session bias impact
  score *= session.bias;

  // Volatility adjustment
  score *= vol.multiplier;

  // Risk behavior penalty/bonus
  if (risk <= 1) score += 15;
  if (risk > 2) score -= 20;

  // Entry sanity check (simple heuristic)
  if (entry > 0) {
    score += 5;
  } else {
    score -= 15;
  }

  /* ===============================
     TRADE QUALITY CLASSIFICATION
  ================================ */
  let grade = "C";
  let recommendation = "AVOID";

  if (score >= 85) {
    grade = "A+";
    recommendation = "EXECUTE";
  } else if (score >= 75) {
    grade = "A";
    recommendation = "STRONG";
  } else if (score >= 60) {
    grade = "B";
    recommendation = "WEAK";
  }

  /* ===============================
     RISK HEAT INDEX
  ================================ */
  const riskHeat =
    risk * (session.volatility === "high" ? 1.5 : 1.0);

  return {
    score: Math.min(100, Math.max(0, Math.round(score))),
    grade,
    recommendation,
    riskHeat: Number(riskHeat.toFixed(2)),
    session: session.session,
    volatility: session.volatility,
    note: vol.note,
  };
}
