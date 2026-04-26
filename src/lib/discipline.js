export const DISCIPLINE_CONFIG = {
  minSLDistance: 15,
  tightSLThreshold: 8,
};

export function calculateDisciplineScore(rrr, slDistance, config = DISCIPLINE_CONFIG) {
  const { minSLDistance, tightSLThreshold } = config;
  let score = 50;
  const breakdown = { base: 50, rrrBonus: 0, rrrPenalty: 0, slBonus: 0, slPenalty: 0 };
  if (rrr >= 3) { score += 30; breakdown.rrrBonus = 30; }
  else if (rrr >= 2) { score += 20; breakdown.rrrBonus = 20; }
  else if (rrr < 1) { score -= 20; breakdown.rrrPenalty = -20; }
  if (slDistance >= minSLDistance) { score += 10; breakdown.slBonus = 10; }
  else if (slDistance < tightSLThreshold) { score -= 10; breakdown.slPenalty = -10; }
  score = Math.min(100, Math.max(0, score));
  return { score, rating: getRating(score), breakdown };
}

export function getRating(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Average';
  return 'Poor';
}

export function getRatingColor(rating) {
  return { Excellent: '#22c55e', Good: '#84cc16', Average: '#f59e0b', Poor: '#ef4444' }[rating] || '#6b7280';
}
