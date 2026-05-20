export function analyzeLiveBehavior(data) {
  let score = 100;
  const alerts = [];

  const {
    recentTrades = [],
    currentRisk = 0,
    tradesToday = 0,
    session = "UNKNOWN",
    dailyPnL = 0,
    maxDailyLoss = -100, // default safety threshold
  } = data;

  // =========================
  // 1. OVERTRADING
  // =========================
  if (tradesToday > 8) {
    score -= 20;
    alerts.push("Overtrading detected");
  }

  // =========================
  // 2. RISK EXPOSURE
  // =========================
  if (currentRisk > 2) {
    score -= 15;
    alerts.push("High risk per trade");
  }

  // =========================
  // 3. REVENGE TRADING
  // =========================
  if (recentTrades.length >= 2) {
    const last = recentTrades[recentTrades.length - 1];
    const prev = recentTrades[recentTrades.length - 2];

    const timeDiff = new Date(last.created_at) - new Date(prev.created_at);

    if (prev.is_win === false && timeDiff < 10 * 60 * 1000) {
      score -= 25;
      alerts.push("Revenge trading detected");
    }
  }

  // =========================
  // 4. PROP FIRM PROTECTION (NEW)
  // =========================
  let killSwitch = false;

  if (dailyPnL <= maxDailyLoss) {
    score = 0;
    killSwitch = true;
    alerts.push("DAILY LOSS LIMIT HIT — TRADING DISABLED");
  }

  if (dailyPnL < maxDailyLoss * 0.7) {
    score -= 40;
    alerts.push("Approaching max daily loss");
  }

  // =========================
  // 5. SESSION FACTOR
  // =========================
  if (session === "UNKNOWN") {
    score -= 5;
    alerts.push("No session context");
  }

  // =========================
  // FINAL STATE ENGINE
  // =========================
  let state = "STABLE";

  if (killSwitch) state = "KILL_SWITCH";
  else if (score < 60) state = "UNSTABLE";
  else if (score < 40) state = "DANGEROUS";

  return {
    score: Math.max(0, Math.min(100, score)),
    state,
    killSwitch,
    alerts,
  };
}
