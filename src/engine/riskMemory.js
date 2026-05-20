const memoryStore = new Map();

/**
 * Stores evolving trader behavior
 */
export function updateRiskMemory(userId, trade) {
  const prev = memoryStore.get(userId) || {
    trades: [],
    avgRisk: 0,
    winBias: 0,
  };

  prev.trades.push(trade);

  const totalRisk = prev.trades.reduce((a, t) => a + (t.risk_percent || 0), 0);
  prev.avgRisk = totalRisk / prev.trades.length;

  const wins = prev.trades.filter(t => t.result === "win").length;
  prev.winBias = prev.trades.length ? wins / prev.trades.length : 0;

  memoryStore.set(userId, prev);

  return prev;
}

export function getRiskMemory(userId) {
  return memoryStore.get(userId) || null;
}
