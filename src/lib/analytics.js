export function tradeRMultiple(trade) {
  if (trade.result === 'win') return trade.rrr ?? 0;
  if (trade.result === 'loss') return -1;
  return 0;
}

export function computeDashboardStats(trades = []) {
  if (!trades.length) return {
    totalTrades: 0, winRate: 0, avgRRR: 0, avgDisciplineScore: 0,
    netR: 0, wins: 0, losses: 0, breakevens: 0, rSeries: [],
  };
  const closed = trades.filter(t => t.result);
  const wins = closed.filter(t => t.result === 'win').length;
  const losses = closed.filter(t => t.result === 'loss').length;
  const breakevens = closed.filter(t => t.result === 'breakeven').length;
  const winRate = closed.length ? (wins / closed.length) * 100 : 0;
  const rrrValues = trades.filter(t => t.rrr != null).map(t => t.rrr);
  const avgRRR = rrrValues.length ? rrrValues.reduce((a,b) => a+b,0) / rrrValues.length : 0;
  const discScores = trades.filter(t => t.discipline_score != null).map(t => t.discipline_score);
  const avgDisciplineScore = discScores.length ? discScores.reduce((a,b) => a+b,0) / discScores.length : 0;
  const sorted = [...closed].sort((a,b) => new Date(a.created_at) - new Date(b.created_at));
  let cumulative = 0;
  const rSeries = sorted.map((trade, i) => {
    cumulative += tradeRMultiple(trade);
    return { index: i+1, cumulative: Math.round(cumulative*100)/100, result: trade.result };
  });
  return {
    totalTrades: trades.length,
    winRate: Math.round(winRate*100)/100,
    avgRRR: Math.round(avgRRR*100)/100,
    avgDisciplineScore: Math.round(avgDisciplineScore*10)/10,
    netR: Math.round(cumulative*100)/100,
    wins, losses, breakevens, rSeries,
  };
}
