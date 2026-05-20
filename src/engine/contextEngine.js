export function getMarketContext(symbol) {
  const hour = new Date().getUTCHours();

  let session = "Asia";
  if (hour >= 7 && hour < 12) session = "London";
  if (hour >= 13 && hour < 21) session = "New York";

  const volatility =
    symbol === "XAUUSD" ? "high" :
    symbol.includes("JPY") ? "medium" :
    "low";

  const score =
    session === "New York" && volatility === "high" ? 90 :
    session === "London" ? 80 :
    70;

  return {
    session,
    volatility,
    score
  };
}
