const userMemory = new Map();

/* =========================
   INIT USER PROFILE
========================= */
function initUser(userId) {
  if (!userMemory.has(userId)) {
    userMemory.set(userId, {
      trades: [],
      wins: 0,
      losses: 0,
      totalRisk: 0,
      avgScore: 50,
      behavior: "UNKNOWN",
    });
  }

  return userMemory.get(userId);
}

/* =========================
   UPDATE MEMORY
========================= */
export function updateMemory(userId, trade, resultScore) {
  const profile = initUser(userId);

  profile.trades.push({
    ...trade,
    score: resultScore,
    timestamp: Date.now(),
  });

  profile.totalRisk += trade.risk_percent || 1;

  if (resultScore >= 70) profile.wins += 1;
  else profile.losses += 1;

  const total = profile.wins + profile.losses;

  profile.avgScore =
    profile.trades.reduce((a, t) => a + t.score, 0) / profile.trades.length;

  // behavior classification
  if (profile.avgScore >= 75) profile.behavior = "DISCIPLINED";
  else if (profile.avgScore >= 55) profile.behavior = "BALANCED";
  else profile.behavior = "AGGRESSIVE";

  return profile;
}

/* =========================
   GET MEMORY
========================= */
export function getMemory(userId) {
  return initUser(userId);
}
