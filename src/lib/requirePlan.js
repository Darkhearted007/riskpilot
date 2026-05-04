export const PLANS = {
  FREE: "FREE",
  PRO: "PRO",
  PRO_PLUS: "PRO_PLUS",
  ELITE: "ELITE",
};

export function normalizePlan(profile) {
  if (!profile) return PLANS.FREE;
  return profile.plan?.toUpperCase() || PLANS.FREE;
}

export function hasMinPlan(userPlan, requiredPlan) {
  const rank = {
    FREE: 0,
    PRO: 1,
    PRO_PLUS: 2,
    ELITE: 3,
  };

  return rank[userPlan] >= rank[requiredPlan];
}
