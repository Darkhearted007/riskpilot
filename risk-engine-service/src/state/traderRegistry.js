// 🧠 In-memory trader registry (MVP version)

const traders = new Map();

/**
 * Register or update trader session
 */
export function upsertTrader(traderId, data) {
  const existing = traders.get(traderId) || {};

  traders.set(traderId, {
    ...existing,
    ...data,
    lastSeen: new Date().toISOString(),
  });
}

/**
 * Get single trader
 */
export function getTrader(traderId) {
  return traders.get(traderId);
}

/**
 * Get all traders
 */
export function getAllTraders() {
  return Array.from(traders.entries()).map(([id, data]) => ({
    traderId: id,
    ...data,
  }));
}

/**
 * Remove inactive trader
 */
export function removeTrader(traderId) {
  traders.delete(traderId);
}
