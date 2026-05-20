import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./lib/supabaseClient";

import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Calculator from "./pages/Calculator";
import Journal from "./pages/Journal";
import Analytics from "./pages/Analytics";

import Support from "./pages/Support";
import Privacy from "./pages/Privacy";
import Affiliate from "./pages/Affiliate";

import AuthScreen from "./components/AuthScreen";
import AppHeader from "./components/AppHeader";
import TabBar from "./components/TabBar";
import UpgradePlans from "./components/UpgradePlans";

import AdminDashboard from "./pages/admin/Dashboard";
import Users from "./pages/admin/Users";
import Transactions from "./pages/admin/Transactions";

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
        <div style={{ padding: 20, color: "red" }}>
          {this.state.error.toString()}
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const fetchProfile = useCallback(async (userId) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (data) setProfile(data);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);

      if (u) fetchProfile(u.id);
      setLoading(false);
    });

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {
        const u = session?.user ?? null;
        setUser(u);

        if (u) fetchProfile(u.id);
        else setProfile(null);

        setLoading(false);
      });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const role = profile?.role || "user";
  const isAdmin = role === "admin";

  if (loading) return <div style={{ padding: 30 }}>Loading RiskPilot...</div>;

  return (
    <div className="app-container">

      <AppHeader
        user={user}
        plan={profile?.plan || "FREE"}
        onSignOut={() => supabase.auth.signOut()}
        onUpgrade={() => setShowUpgrade(true)}
      />

      <ErrorBoundary>
        <Routes>

          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthScreen setUser={setUser} />} />

          <Route path="/support" element={<Support />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/affiliate" element={<Affiliate />} />

          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/calculator" element={<Calculator user={user} />} />
          <Route path="/journal" element={<Journal user={user} />} />
          <Route path="/analytics" element={<Analytics user={user} />} />

          <Route
            path="/admin"
            element={
              isAdmin ? (
                <AdminDashboard>
                  <Users />
                  <Transactions />
                </AdminDashboard>
              ) : (
                <Navigate to="/" />
              )
            }
          />

        </Routes>
      </ErrorBoundary>

      <TabBar />

      {showUpgrade && (
        <div onClick={() => setShowUpgrade(false)}>
          <UpgradePlans />
        </div>
      )}

    </div>
  );
}
