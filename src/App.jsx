class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  componentDidCatch(error) { this.setState({ error }); }
  render() {
    if (this.state.error) return (
      <div style={{ padding: 24, color: '#ef4444', fontFamily: 'monospace', fontSize: 12, background: '#0a0e13', minHeight: '50vh', whiteSpace: 'pre-wrap' }}>
        {this.state.error.toString()}\n\n{this.state.error.stack}
      </div>
    );
    return this.props.children;
  }
}
import React, { useState, useEffect, useCallback } from 'react';
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

export default function App() {
  // 1. Immediate Diagnostic Check
  const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!isConfigured) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: 32, textAlign: 'center', background: '#080B0F', color: '#fff' }}>
        <div style={{ fontSize: 48 }}>⚙️</div>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, marginBottom: 8, color: '#D4AF37' }}>Configuration Required</h1>
          <p style={{ fontSize: 14, color: '#8A9BB0', maxWidth: 300, margin: '0 auto', lineHeight: 1.6 }}>
            RiskPilot is missing its database connection. Please add <strong>VITE_SUPABASE_URL</strong> and <strong>VITE_SUPABASE_ANON_KEY</strong> to your Vercel Environment Variables.
          </p>
        </div>
        <button onClick={() => window.location.reload()} style={{ background: '#162030', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 24px', color: '#D4AF37', fontWeight: 600, cursor: 'pointer' }}>
          RETRY SYNC
        </button>
      </div>
    );
  }

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tab, setTab] = useState('calc');
  const [view, setView] = useState('landing'); // 'landing', 'auth', 'app', 'affiliate'
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleTabChange = (t) => {
    setTab(t);
    window.scrollTo(0, 0);
  };

  // Initialize Pixel (Official ID)
  useEffect(() => {
    Pixel.init('1313953607262542');
    
    // Capture Referral
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      localStorage.setItem('rp_referrer', ref);
      console.log('[RiskPilot] Referrer captured:', ref);
    }
  }, []);

  const fetchProfile = useCallback(async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) setProfile(data);
  }, []);

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
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
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

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ fontSize: 32, color: 'var(--gold)' }}>◈</div>
        <p style={{ fontFamily: 'var(--font-data)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>LOADING...</p>
      </div>
    );
  }

  // PUBLIC VIEWS
  if (!user) {
    if (view === 'auth') return <AuthScreen onAuth={(u) => { setUser(u); setView('app'); fetchProfile(u.id); }} />;
    if (view === 'affiliate') return <Affiliate onBack={() => setView('landing')} />;
    return <LandingPage onGetStarted={(v) => setView(v === 'affiliate' ? 'affiliate' : 'auth')} />;
  }

  // PRIVATE APP
  return (
    <div style={{ maxWidth: 520, margin: '0 auto', minHeight: '100vh', background: 'var(--bg-1)', position: 'relative' }}>
      <AppHeader 
        user={user} 
        isGold={profile?.is_gold} 
        onSignOut={() => { setUser(null); setView('landing'); }} 
        onUpgrade={() => fetchProfile(user.id)}
        onOpenUpgrade={() => setShowUpgradeModal(true)}
      />
      <main style={{ paddingBottom: 80 }}>
        {tab === 'calc' && (
          <ErrorBoundary>
            <Calculator user={user} isGold={profile?.is_gold} onUpgrade={() => setShowUpgradeModal(true)} />
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

      {/* Global Upgrade Modal */}
      {showUpgradeModal && !profile?.is_gold && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setShowUpgradeModal(false)}>
          <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border-gold)', borderRadius: 'var(--radius-xl)', padding: 32, width: '100%', maxWidth: 400, textAlign: 'center', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowUpgradeModal(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer' }}>×</button>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🚀</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Scale to $30k/Week</h2>
            <p style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.5, marginBottom: 24 }}>Unlock advanced performance tracking, historical journaling, and the robotic equity curve log.</p>
            
            <PaystackButton user={user} onSuccess={(ref) => {
              fetchProfile(user.id);
              setShowUpgradeModal(false);
            }} />
            
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 16, fontFamily: 'var(--font-data)' }}>ONE-TIME LIFETIME ACCESS · LIMITED OFFER</p>
          </div>
        </div>
      )}
    </div>
  );
}
