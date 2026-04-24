// XAUUSD Constants
// 1 pip = $0.10 price movement on Gold (at 2 decimal places)
// 1.0 standard lot = $10.00 value per pip
export const XAUUSD_POINT     = 0.1;
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
    return { score: 0, grade: '—', label: 'No data', color: '#3D5168', tradesUsed: 0, breakdown: { risk: 0, psychology: 0, strategy: 0 } };
  }

  const recent = trades.slice(0, 20);
  let riskScore = 40;       // Max 40
  let psychScore = 30;      // Max 30
  let strategyScore = 30;   // Max 30

  let lastRisk = null;
  let riskFlippingCount = 0;

  for (const trade of recent) {
    // 1. Risk Component (Max 40)
    if (trade.risk_level === 'safe') riskScore += 0; // Baseline is safe
    else if (trade.risk_level === 'aggressive') riskScore -= 2;
    else if (trade.risk_level === 'danger') riskScore -= 8;

    // Detect Risk Flipping (Inconsistency)
    if (lastRisk && lastRisk !== trade.risk_level) riskFlippingCount++;
    lastRisk = trade.risk_level;

    // 2. Psychology Component (Max 30)
    const emotion = (trade.emotion || '').toLowerCase();
    if (['revenge', 'greedy', 'angry', 'frustrated'].includes(emotion)) psychScore -= 5;
    else if (['fearful', 'anxious'].includes(emotion)) psychScore -= 2;
    else if (['calm', 'confident', 'disciplined'].includes(emotion)) psychScore += 0.5;

    // 3. Strategy Component (Max 30)
    if (trade.setup_type) strategyScore += 0.5;
    else strategyScore -= 1;

    if (trade.notes && trade.notes.length > 10) strategyScore += 0.5;
    else strategyScore -= 1;
    
    // Penalize missing stop loss (if it was somehow bypassed in the app)
    if (!trade.stop_loss_price) strategyScore -= 5;
  }

  // Final Penalties
  if (riskFlippingCount > 3) riskScore -= 10; // High volatility penalty

  const totalScore = Math.max(0, Math.min(100, Math.round(riskScore + psychScore + strategyScore)));
  
  let grade, label, color;
  if (totalScore >= 90)      { grade='A+'; label='Elite';        color='#00E676'; }
  else if (totalScore >= 75) { grade='A';  label='Disciplined';  color='#69F0AE'; }
  else if (totalScore >= 60) { grade='B';  label='Consistent';   color='#FFB300'; }
  else if (totalScore >= 45) { grade='C';  label='Moderate';     color='#FF9100'; }
  else if (totalScore >= 30) { grade='D';  label='Risky';        color='#FF6D00'; }
  else                       { grade='F';  label='Reckless';      color='#FF3D57'; }

  return { 
    score: totalScore, 
    grade, label, color, 
    tradesUsed: recent.length, 
    breakdown: { 
      risk: Math.max(0, Math.round(riskScore)), 
      psychology: Math.max(0, Math.round(psychScore)), 
      strategy: Math.max(0, Math.round(strategyScore)) 
    } 
  };
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
