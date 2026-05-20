export function checkProtection({ dailyLoss, maxDailyLoss, drawdown }) {
  if (dailyLoss >= maxDailyLoss) {
    return {
      allowed: false,
      reason: "Daily loss limit reached",
    };
  }

  if (drawdown >= 10) {
    return {
      allowed: false,
      reason: "Max drawdown protection triggered",
    };
  }

  return {
    allowed: true,
  };
}
