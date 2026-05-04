import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- PLAN DERIVATION ---------------- */
  const getPlan = useCallback((profile) => {
    if (!profile) return "FREE";

    if (profile.plan) return profile.plan;

    if (profile.is_gold) return "PRO";

    return "FREE";
  }, []);

  const plan = getPlan(profile);

  const isPro = plan === "PRO" || plan === "PRO_PLUS" || plan === "ELITE";
  const isProPlus = plan === "PRO_PLUS" || plan === "ELITE";
  const isElite = plan === "ELITE";

  /* ---------------- FETCH PROFILE ---------------- */
  const fetchProfile = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Profile fetch error:", error);
      return;
    }

    setProfile(data);
  }, []);

  /* ---------------- REFRESH (USED AFTER PAYSTACK) ---------------- */
  const refreshProfile = useCallback(async () => {
    if (!user) return;
    await fetchProfile(user.id);
  }, [user, fetchProfile]);

  /* ---------------- AUTH INIT ---------------- */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user || null;
      setUser(u);

      if (u) fetchProfile(u.id);
      setLoading(false);
    });

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {
        const u = session?.user || null;
        setUser(u);

        if (u) fetchProfile(u.id);
        else setProfile(null);
      });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  /* ---------------- PLAN FEATURES ---------------- */
  const canUseAdvancedRiskTools = isPro;
  const canAccessJournalAI = isProPlus;
  const canAccessEliteSignals = isElite;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        plan,

        isPro,
        isProPlus,
        isElite,

        canUseAdvancedRiskTools,
        canAccessJournalAI,
        canAccessEliteSignals,

        refreshProfile,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
