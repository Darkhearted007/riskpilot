import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { PLANS, DEFAULT_PLAN, isPlanActive, getPlan } from '../lib/subscription';

export function useSubscription(userId) {
  const [subscription, setSubscription] = useState({
    plan: DEFAULT_PLAN,
    status: 'active',
    expiresAt: null,
    loading: true,
  });

  const fetchSubscription = useCallback(async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_plan, subscription_status, subscription_expires_at')
        .eq('id', userId)
        .single();

      if (error) throw error;

      const plan = data?.subscription_plan || DEFAULT_PLAN;
      const status = data?.subscription_status || 'active';
      const expiresAt = data?.subscription_expires_at;

      const isActive = isPlanActive(plan) && status === 'active';
      
      let finalStatus = status;
      if (expiresAt && new Date(expiresAt) < new Date()) {
        finalStatus = 'expired';
      }

      setSubscription({
        plan,
        status: finalStatus,
        expiresAt,
        loading: false,
      });
    } catch (err) {
      console.error('[Subscription] Fetch error:', err);
      setSubscription({
        plan: DEFAULT_PLAN,
        status: 'active',
        expiresAt: null,
        loading: false,
      });
    }
  }, [userId]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const planDetails = getPlan(subscription.plan);

  return {
    ...subscription,
    planDetails,
    isPro: subscription.plan === 'pro' || subscription.plan === 'pro_plus' || subscription.plan === 'elite',
    isProPlus: subscription.plan === 'pro_plus' || subscription.plan === 'elite',
    isElite: subscription.plan === 'elite',
    isActive: isPlanActive(subscription.plan) && subscription.status === 'active',
    refresh: fetchSubscription,
  };
}

export function hasFeature(subscription, feature) {
  if (!subscription || subscription.loading) return false;
  return subscription.planDetails.features.includes(feature) || false;
}

export function getLimit(subscription, limitKey) {
  if (!subscription || subscription.loading) return 0;
  return subscription.planDetails.limits[limitKey] ?? 0;
}