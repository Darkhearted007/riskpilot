export function detectTraderEmotion(data) {
  const {
    recentTrades = [],
    tradesToday = 0,
    currentRisk = 0,
  } = data;

  let emotionScore = 100;

  const signals = [];
  let emotion = "NEUTRAL";

  // =========================
  // 1. OVERTRADING → IMPULSIVE / FRUSTRATED
  // =========================
  if (tradesToday > 10) {
    emotionScore -= 25;
    signals.push("High frequency trading detected");
    emotion = "IMPULSIVE";
  }

  // =========================
  // 2. LOSS CHASING → REVENGE STATE
  // =========================
  if (recentTrades.length >= 3) {
    const last3 = recentTrades.slice(-3);
    const losses = last3.filter(t => t.is_win === false).length;

    if (losses >= 2) {
      emotionScore -= 30;
      signals.push("Consecutive losses detected");
      emotion = "REVENGE";
    }
  }

  // =========================
  // 3. OVER-RISKING → OVERCONFIDENT
  // =========================
  if (currentRisk > 3) {
    emotionScore -= 20;
    signals.push("Excessive position sizing");
    emotion = "OVERCONFIDENT";
  }

  // =========================
  // 4. CONSISTENT DISCIPLINE → CALM STATE
  // =========================
  if (
    tradesToday <= 5 &&
    currentRisk <= 2 &&
    recentTrades.length > 0 &&
    recentTrades.slice(-3).every(t => t.is_win === true)
  ) {
    emotionScore += 10;
    emotion = "DISCIPLINED";
  }

  // =========================
  // FINAL NORMALIZATION
  // =========================
  emotionScore = Math.max(0, Math.min(100, emotionScore));

  return {
    emotion,
    emotionScore,
    signals,
  };
}
