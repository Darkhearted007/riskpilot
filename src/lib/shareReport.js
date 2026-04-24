/**
 * Social Sharing Utility
 * Generates text-based performance summaries for social media.
 */

export const generateShareText = (stats) => {
  const { winRate, disciplineGrade, netPnl, tradesCount } = stats;
  
  const emoji = disciplineGrade.includes('A') ? '🏆' : disciplineGrade === 'B' ? '📈' : '⚖️';
  
  return `◈ RiskPilot | XAUUSD Discipline Report ◈

Grade: ${disciplineGrade} ${emoji}
Win Rate: ${winRate}%
Total Trades: ${tradesCount}
Net P/L: ${netPnl > 0 ? '+' : ''}$${netPnl}

"Consistency > Luck. Mastering the math of Gold."

Join the elite: https://riskpilot-gold.com #RiskPilot #XAUUSD #ForexDiscipline`;
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy: ', err);
    return false;
  }
};
