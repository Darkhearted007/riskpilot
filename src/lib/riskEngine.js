export const XAUUSD_PIP_VALUE = 10;

export function classifyRiskLevel(riskPercent) {
  if (riskPercent <= 2) return 'safe';
  if (riskPercent <= 3) return 'aggressive';
  return 'danger';
}

export function calculateGoldLotSize(balance, riskPercent, stopLossPips) {
  if (!balance || balance <= 0)           return _invalid('Account balance must be greater than 0');
  if (!riskPercent || riskPercent <= 0)   return _invalid('Risk percent must be greater than 0');
  if (!stopLossPips || stopLossPips <= 0) return _invalid('Stop loss must be greater than 0');
  if (riskPercent > 100)                  return _invalid('Risk percent cannot exceed 100%');

  const riskAmount = balance * (riskPercent / 100);
  const pipValue   = XAUUSD_PIP_VALUE;
  const lotSize    = riskAmount / (stopLossPips * pipValue);
  const maxLoss    = lotSize * stopLossPips * pipValue;
  const riskLevel  = classifyRiskLevel(riskPercent);

  return {
    riskAmount: parseFloat(riskAmount.toFixed(2)),
    lotSize:    parseFloat(lotSize.toFixed(4)),
    riskLevel, pipValue,
    maxLoss:    parseFloat(maxLoss.toFixed(2)),
    isValid:    true,
    error:      null,
  };
}

export function calculateDisciplineScore(trades) {
  if (!trades || trades.length === 0) {
    return { score: 0, grade: '—', label: 'No data', color: '#3D5168', tradesUsed: 0, breakdown: { safe: 0, aggressive: 0, danger: 0 } };
  }
  const recent = trades.slice(0, 20);
  const breakdown = { safe: 0, aggressive: 0, danger: 0 };
  let rawScore = 50;
  for (const trade of recent) {
    const level = trade.risk_level;
    breakdown[level] = (breakdown[level] || 0) + 1;
    if (level === 'safe')             rawScore += 10;
    else if (level === 'aggressive')  rawScore += 5;
    else if (level === 'danger')      rawScore -= 10;
  }
  const score = Math.max(0, Math.min(100, rawScore));
  let grade, label, color;
  if (score >= 90)      { grade='A+'; label='Elite';        color='#00E676'; }
  else if (score >= 75) { grade='A';  label='Disciplined';  color='#69F0AE'; }
  else if (score >= 60) { grade='B';  label='Consistent';   color='#FFB300'; }
  else if (score >= 45) { grade='C';  label='Moderate';     color='#FF9100'; }
  else if (score >= 30) { grade='D';  label='Risky';        color='#FF6D00'; }
  else                  { grade='F';  label='Reckless';      color='#FF3D57'; }
  return { score, grade, label, color, tradesUsed: recent.length, breakdown };
}

export function getTradeWarnings(riskPercent, stopLossPips) {
  const warnings = [];
  if (riskPercent > 3)    warnings.push({ type: 'error',   message: '⚠ Risk exceeds 3%. This is account-threatening territory on Gold.' });
  if (stopLossPips < 100) warnings.push({ type: 'warning', message: '⚠ Gold is highly volatile. A stop loss under 100 pips risks getting stopped out by normal noise.' });
  if (riskPercent > 5)    warnings.push({ type: 'error',   message: '🚨 Over 5% risk per trade. One loss can devastate your account. Reduce immediately.' });
  return warnings;
}

function _invalid(error) {
  return { riskAmount: 0, lotSize: 0, riskLevel: 'danger', pipValue: XAUUSD_PIP_VALUE, maxLoss: 0, isValid: false, error };
}
