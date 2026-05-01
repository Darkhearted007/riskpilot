import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';

import Contact from './pages/Contact';
import { supabase } from './lib/supabaseClient';
import Calculator from './pages/Calculator';
import Journal from './pages/Journal';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import Affiliate from './pages/Affiliate';
import AuthScreen from './components/AuthScreen';
import AppHeader from './components/AppHeader';
import TabBar from './components/TabBar';
import PaystackButton from './components/PaystackButton';
import { Pixel } from './lib/marketing';
import './styles/globals.css';

/* ---------------- ERROR BOUNDARY ---------------- */
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
        <div style={{
          padding: 24,
          color: '#ef4444',
          fontFamily: 'monospace',
          fontSize: 12,
          background: '#0a0e13',
          minHeight: '50vh',
          whiteSpace: 'pre-wrap'
        }}>
          {this.state.error.toString()}
          {'\n\n'}
          {this.state.error.stack}
        </div>
      );
    }
    return this.props.children;
  }
}

/* ---------------- MAIN APP ---------------- */
export default function App() {

  /* ---------------- STATE ---------------- */
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tab, setTab] = useState('calc');
  const [view, setView] = useState('landing');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const isConfigured =
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_ANON_KEY;

  /* ---------------- TAB HANDLER ---------------- */
  const handleTabChange = (t) => {
    setTab(t);
    window.scrollTo(0, 0);
  };

  /* ---------------- PIXEL INIT ---------------- */
  useEffect(() => {
    Pixel.init('1313953607262542');

    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      localStorage.setItem('rp_referrer', ref);
    }
  }, []);

  /* ---------------- FETCH PROFILE ---------------- */
  const fetchProfile = useCallback(async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) setProfile(data);
  }, []);

  /* ---------------- AUTH STATE ---------------- */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);

      if (u) {
        setView('app');
        fetchProfile(u.id);
      }

      setAuthLoading(false);
    });

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_e, session) => {
        const u = session?.user ?? null;
        setUser(u);

        if (u) {
          setView('app');
          fetchProfile(u.id);
        } else {
          setView('landing');
          setProfile(null);
        }
      });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  /* ---------------- LOADING STATE ---------------- */
  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff'
      }}>
        Loading RiskPilot...
      </div>
    );
  }

  /* ---------------- PUBLIC ROUTES ---------------- */
  if (!user) {
    if (view === 'auth') {
      return <AuthScreen onAuth={(u) => {
        setUser(u);
        setView('app');
        fetchProfile(u.id);
      }} />;
    }

    if (view === 'affiliate') {
      return <Affiliate onBack={() => setView('landing')} />;
    }

    return (
      <LandingPage
        onGetStarted={(v) =>
          setView(v === 'affiliate' ? 'affiliate' : 'auth')
        }
      />
    );
  }

  /* ---------------- PRIVATE APP ---------------- */
  return (
    <div style={{
      maxWidth: 520,
      margin: '0 auto',
      minHeight: '100vh',
      background: 'var(--bg-1)',
      position: 'relative'
    }}>

      <AppHeader
        user={user}
        isGold={profile?.is_gold}
        onSignOut={() => {
          setUser(null);
          setView('landing');
        }}
        onOpenUpgrade={() => setShowUpgradeModal(true)}
      />

      <main style={{ paddingBottom: 80 }}>
        {tab === 'calc' && (
          <ErrorBoundary>
            <Calculator
              user={user}
              isGold={profile?.is_gold}
              onUpgrade={() => setShowUpgradeModal(true)}
            />
          </ErrorBoundary>
        )}

        {tab === 'journal' && (
          <ErrorBoundary>
            <Journal user={user} isGold={profile?.is_gold} />
          </ErrorBoundary>
        )}

        {tab === 'dashboard' && (
          <ErrorBoundary>
            <Dashboard user={user} isGold={profile?.is_gold} />
          </ErrorBoundary>
        )}
      </main>

      <TabBar active={tab} setActive={handleTabChange} />

      {/* ---------------- UPGRADE MODAL ---------------- */}
      {showUpgradeModal && !profile?.is_gold && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowUpgradeModal(false)}
        >
          <div
            style={{
              background: 'var(--bg-2)',
              padding: 32,
              borderRadius: 16,
              maxWidth: 400,
              width: '100%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Upgrade RiskPilot</h2>

            <PaystackButton
              user={user}
              onSuccess={() => {
                fetchProfile(user.id);
                setShowUpgradeModal(false);
              }}
            />

            <button onClick={() => setShowUpgradeModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
