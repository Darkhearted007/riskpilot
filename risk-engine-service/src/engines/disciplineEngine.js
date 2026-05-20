export function calculateDiscipline(trades) {
  let score = 100;
  const flags = [];

  const recent = trades.slice(-10);

  const avgRisk =
    trades.reduce((s, t) => s + (t.risk_percent || 0), 0) /
    (trades.length || 1);

  if (avgRisk > 2) {
    score -= 10;
    flags.push("Over-risking detected");
  }

  for (let i = 1; i < recent.length; i++) {
    const prev = recent[i - 1];
    const curr = recent[i];

    const diff =
      new Date(curr.created_at) - new Date(prev.created_at);

    if (prev.is_win === false && diff < 10 * 60 * 1000) {
      score -= 15;
      flags.push("Revenge trading detected");
      break;
    }
  }

  if (score > 100) score = 100;
  if (score < 0) score = 0;

  return {
    score,
    grade:
      score >= 80
        ? "Excellent"
        : score >= 60
        ? "Good"
        : score >= 40
        ? "Average"
        : "Poor",
    flags,
  };
}
