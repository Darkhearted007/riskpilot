export function getMarketSession() {
  const hour = new Date().getUTCHours();

  // London: 7–16 UTC
  if (hour >= 7 && hour < 16) {
    return {
      session: "London",
      bias: 1.1,
      volatility: "medium",
    };
  }

  // New York: 13–22 UTC
  if (hour >= 13 && hour < 22) {
    return {
      session: "New York",
      bias: 1.3,
      volatility: "high",
    };
  }

  // Asia: 23–6 UTC
  return {
    session: "Asia",
    bias: 0.9,
    volatility: "low",
  };
}

export function getVolatilityAdjustment(volatility, trade) {
  const risk = Number(trade.risk_percent || 1);

  switch (volatility) {
    case "high":
      return {
        multiplier: risk > 2 ? 0.8 : 1.1,
        note: "High volatility detected",
      };

    case "medium":
      return {
        multiplier: 1.0,
        note: "Normal conditions",
      };

    case "low":
      return {
        multiplier: 0.9,
        note: "Low volatility market",
      };

    default:
      return {
        multiplier: 1,
        note: "Unknown volatility",
      };
  }
}
