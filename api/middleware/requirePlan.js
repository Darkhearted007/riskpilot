export function requirePlan(plan) {
  const rank = {
    FREE: 0,
    PRO: 1,
    PRO_PLUS: 2,
    ELITE: 3,
  };

  return (req, res, next) => {
    const userPlan = req.user?.plan || "FREE";

    if (rank[userPlan] < rank[plan]) {
      return res.status(403).json({
        error: "Upgrade required",
      });
    }

    next();
  };
}
