export function calculateRisk({ balance, riskPercent, stopLossPips, pipValue }) {
  const riskAmount = balance * (riskPercent / 100);
  const lotSize = riskAmount / (stopLossPips * pipValue);

  return {
    riskAmount,
    lotSize,
  };
}
