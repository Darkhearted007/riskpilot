export const PLANS = {
  free: {
    id: 'free',
    name: 'RiskPilot Free',
    price: 0,
    priceDisplay: 'Free',
    priceSymbol: '₦',
    features: [
      'Basic XAUUSD Calculator',
      '1 Active Trade',
      '5 Closed Trades History',
      'Basic Win Rate Stats',
    ],
    limits: {
      activeTrades: 1,
      closedTrades: 5,
      journalAccess: false,
      analytics: 'basic',
    },
  },
  pro: {
    id: 'pro',
    name: 'RiskPilot Pro',
    price: 15000,
    priceDisplay: '₦15,000',
    priceSymbol: '₦',
    pricePeriod: 'lifetime',
    features: [
      'Precision XAUUSD Calculator',
      'Unlimited Active Trades',
      'Full Trade Journal',
      'Advanced Analytics',
      'Session-Specific Insights',
      'Priority Support',
      'Lifetime Updates',
    ],
    limits: {
      activeTrades: 999,
      closedTrades: 100,
      journalAccess: true,
      analytics: 'full',
    },
  },
  pro_plus: {
    id: 'pro_plus',
    name: 'RiskPilot Pro-Plus',
    price: 35000,
    priceDisplay: '₦35,000',
    priceSymbol: '₦',
    pricePeriod: 'lifetime',
    features: [
      'Everything in RiskPilot Pro',
      'XAUUSD + XAG (Silver)',
      'Trade Signals Access',
      'Advanced Risk Tools',
      'Custom Alerts',
      'Early Access Features',
    ],
    limits: {
      activeTrades: 999,
      closedTrades: 300,
      journalAccess: true,
      analytics: 'full',
      multiAsset: true,
    },
  },
  elite: {
    id: 'elite',
    name: 'RiskPilot Elite',
    price: 75000,
    priceDisplay: '₦75,000',
    priceSymbol: '₦',
    pricePeriod: 'lifetime',
    features: [
      'Everything in RiskPilot Pro-Plus',
      'All Forex Pairs Support',
      'API Access',
      'Team Collaboration',
      'White-Label Option',
      'Dedicated Support',
      'Revenue Share Program',
    ],
    limits: {
      activeTrades: 999,
      closedTrades: 999,
      journalAccess: true,
      analytics: 'full',
      multiAsset: true,
      fullAccess: true,
    },
  },
};

export const DEFAULT_PLAN = 'free';

export function getPlan(planId) {
  return PLANS[planId] || PLANS[DEFAULT_PLAN];
}

export function isPlanActive(planId) {
  return planId === 'pro' || planId === 'pro_plus' || planId === 'elite';
}

export function canAccessFeature(planId, feature) {
  const plan = getPlan(planId);
  return plan.features.includes(feature);
}

export function getPlanLimit(planId, limitKey) {
  const plan = getPlan(planId);
  return plan.limits[limitKey] ?? 0;
}

export const SUBSCRIPTION_AMOUNTS = {
  pro: 1500000,
  pro_plus: 3500000,
  elite: 7500000,
};

export function getAmountForPlan(planId) {
  return SUBSCRIPTION_AMOUNTS[planId] || 0;
}

export function getPlanDisplayPrice(planId) {
  const plan = getPlan(planId);
  return plan.priceDisplay;
}

export const PLAN_DISPLAY_NAMES = {
  free: 'RiskPilot Free',
  pro: 'RiskPilot Pro',
  pro_plus: 'RiskPilot Pro-Plus',
  elite: 'RiskPilot Elite',
};