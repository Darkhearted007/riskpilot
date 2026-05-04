import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext();

/* =========================
   PLAN CONSTANTS (SINGLE SOURCE OF TRUTH)
========================= */
const PLANS = {
  FREE: "FREE",
  PRO: "PRO",
  PRO_PLUS: "PRO_PLUS",
  ELITE: "ELITE",
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =========================
     NORMALIZE PLAN
  ========================= */
  const getPlan = useCallback((profile) => {
    if (!profile) return PLANS.FREE;
    return profile.plan || PLANS.FREE;
  }, []);

  const plan = getPlan(profile);

  /* =========================
     ACCESS RULES (UI LOCK SYSTEM)
  ========================= */
  const isPro = [PLANS.PRO, PLANS.PRO_PLUS, PLANS.ELITE].includes(plan);
  const isProPlus = [PLANS.PRO_PLUS, PLANS.ELITE].includes(plan);
  const isElite = plan === PLANS.ELITE;

  const permissions = {
    canUseAdvancedRiskTools: isPro,
    canAccessJournalAI: isProPlus,
    canAccessEliteSignals: isElite,
  };

  /* =========================
     FETCH PROFILE (SOURCE OF TRUTH)
  ========================= */
  const fetchProfile = useCallback(async (userId) => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Profile fetch error:", error.message);
      return;
    }

    setProfile(data);
  }, []);

  /* =========================
     REFRESH AFTER PAYMENT / WEBHOOK
  ========================= */
  const refreshProfile = useCallback(async () => {
    if (!user?.id) return;
    await fetchProfile(user.id);
  }, [user, fetchProfile]);

  /* =========================
     AUTH INITIALIZATION
  ========================= */
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data?.session?.user || null;

      if (!mounted) return;

      setUser(sessionUser);

      if (sessionUser) {
        await fetchProfile(sessionUser.id);
      }

      setLoading(false);
    };

    init();

    /* =========================
       AUTH STATE LISTENER
    ========================= */
    const { data: subscription } =
      supabase.auth.onAuthStateChange(async (_event, session) => {
        const sessionUser = session?.user || null;

        setUser(sessionUser);

        if (sessionUser) {
          await fetchProfile(sessionUser.id);
        } else {
          setProfile(null);
        }
      });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  /* =========================
     REALTIME PROFILE UPDATES (ENTERPRISE FEATURE)
  ========================= */
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel("profiles-realtime")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          setProfile(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  /* =========================
     FINAL CONTEXT VALUE
  ========================= */
  return (
    <AuthContext.Provider
      value={{
        /* user state */
        user,
        profile,
        loading,

        /* plan system */
        plan,
        isPro,
        isProPlus,
        isElite,

        /* permissions */
        ...permissions,

        /* actions */
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* =========================
   HOOK
========================= */
export function useAuth() {
  return useContext(AuthContext);
}
