import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "./lib/supabaseClient";

import Support from "./pages/Support";
import Privacy from "./pages/Privacy";
import Calculator from "./pages/Calculator";
import Journal from "./pages/Journal";
import Dashboard from "./pages/Dashboard";
import LandingPage from "./pages/LandingPage";
import Affiliate from "./pages/Affiliate";
import AuthScreen from "./components/AuthScreen";
import AppHeader from "./components/AppHeader";
import TabBar from "./components/TabBar";
import UpgradePlans from "./components/UpgradePlans";

import AdminDashboard from "./pages/admin/Dashboard";
import Users from "./pages/admin/Users";
import Transactions from "./pages/admin/Transactions";

import "./styles/globals.css";

/* ================= ERROR BOUNDARY ================= */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  componentDidCatch(error) {
    this.setState({ error });
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, color: "#ef4444" }}>
          {this.state.error.toString()}
        </div>
      );
    }
    return this.props.children;
  }
}

/* ================= MAIN APP ================= */
export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState("calc");
  const [view, setView] = useState("landing");
  const [showUpgrade, setShowUpgrade] = useState(false);

  /* ================= FETCH PROFILE ================= */
  const fetchProfile = useCallback(async (userId) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (data) setProfile(data);
  }, []);

  /* ================= AUTH INIT ================= */
  useEffect(() => {
  let mounted = true;

  // 🧯 safety fallback: prevent infinite loading
  const timeout = setTimeout(() => {
    console.warn("[RiskPilot] Auth timeout fallback triggered");
    setLoading(false);
  }, 5000);

  // ================= GET SESSION =================
  supabase.auth.getSession()
    .then(({ data: { session } }) => {
      if (!mounted) return;

      clearTimeout(timeout);

      const u = session?.user ?? null;
      setUser(u);

      if (u) {
        fetchProfile(u.id);
        setView("app");
      }

      setLoading(false);
    })
    .catch((err) => {
      console.error("[Auth Init Error]", err);
      clearTimeout(timeout);
      setLoading(false);
    });

  // ================= LISTENER =================
  const { data: { subscription } } =
    supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);

      if (u) {
        fetchProfile(u.id);
        setView("app");
      } else {
        setProfile(null);
        setView("landing");
      }

      setLoading(false);
    });

  // ================= CLEANUP =================
  return () => {
    mounted = false;
    clearTimeout(timeout);
    subscription.unsubscribe();
  };
}, [fetchProfile]);

  /* ================= PLAN LOGIC ================= */
  const plan = profile?.plan?.toUpperCase() || "FREE";
  const role = profile?.role || "user";

  const isPro = ["PRO", "PRO_PLUS", "ELITE"].includes(plan);
  const isElite = plan === "ELITE";
  const isAdmin = role === "admin";

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        Loading RiskPilot...
      </div>
    );
  }

  /* ================= PUBLIC ROUTES ================= */
  if (!user) {
    if (view === "auth")
      return <AuthScreen onAuth={(u) => { 
        setUser(u); 
        fetchProfile(u.id);
        // Check if user selected a plan before registering
        const selectedPlan = localStorage.getItem('selected_plan');
        if (selectedPlan && selectedPlan !== 'free') {
          // Show upgrade modal after registration
          setTimeout(() => setShowUpgrade(true), 500);
          localStorage.removeItem('selected_plan');
        }
      }} />;

    if (view === "affiliate")
      return <Affiliate onBack={() => setView("landing")} />;

    if (view === "support")
      return <Support onBack={() => setView("landing")} />;

    if (view === "privacy")
      return <Privacy onBack={() => setView("landing")} />;

    return <LandingPage onGetStarted={() => setView("auth")} />;
  }

  /* ================= ADMIN PANEL ================= */
  if (window.location.pathname.startsWith("/admin")) {
    if (!isAdmin) {
      return (
        <div style={{ padding: 40 }}>
          <h2>Unauthorized</h2>
          <p>You do not have admin access.</p>
        </div>
      );
    }

    return (
      <ErrorBoundary>
        <AdminDashboard>
          <Users />
          <Transactions />
        </AdminDashboard>
      </ErrorBoundary>
    );
  }

  /* ================= MAIN APP ================= */
  return (
    <div className="app-container">
      <AppHeader
        user={user}
        plan={plan}
        onSignOut={() => {
          supabase.auth.signOut();
          setUser(null);
        }}
        onUpgrade={() => setShowUpgrade(true)}
      />

      <main style={{ paddingBottom: 80 }}>
        {tab === "calc" && (
          <ErrorBoundary>
            <Calculator user={user} isPro={isPro} />
          </ErrorBoundary>
        )}

        {tab === "journal" && (
          <ErrorBoundary>
            <Journal user={user} />
          </ErrorBoundary>
        )}

        {tab === "dashboard" && (
          <ErrorBoundary>
            <Dashboard user={user} isElite={isElite} />
          </ErrorBoundary>
        )}
      </main>

      <TabBar active={tab} setActive={setTab} />

      {/* ================= UPGRADE MODAL ================= */}
      {showUpgrade && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onClick={() => setShowUpgrade(false)}
        >
          <div
            style={{
              background: "#111",
              padding: 32,
              borderRadius: 12,
              width: 400
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Upgrade Your Plan</h2>
            <UpgradePlans />
          </div>
        </div>
      )}
    </div>
  );
}
