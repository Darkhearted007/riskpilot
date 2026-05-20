export function evaluateTradeGuard({ score, state, risk }) {
  const result = {
    allowTrade: true,
    level: "OK",
    reason: null,
  };

  // 🔴 HARD BLOCK
  if (state === "DANGEROUS" || score < 40) {
    result.allowTrade = false;
    result.level = "BLOCKED";
    result.reason = "Risk score too low — trading disabled";
    return result;
  }

  // 🟠 WARNING MODE
  if (state === "UNSTABLE" || score < 60) {
    result.level = "WARNING";
    result.reason = "High risk detected — proceed carefully";
    return result;
  }

  // 🟢 SAFE MODE
  if (risk?.currentRisk > 3) {
    result.level = "WARNING";
    result.reason = "Position size too aggressive";
  }

  return result;
}
