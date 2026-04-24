import { useState, useEffect, useCallback } from 'react';
import { supabase } from './lib/supabaseClient';
import Calculator from './pages/Calculator';
import Journal from './pages/Journal';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import Affiliate from './pages/Affiliate';
import AuthScreen from './components/AuthScreen';
import AppHeader from './components/AppHeader';
import TabBar from './components/TabBar';
import { Pixel } from './lib/marketing';
import './styles/globals.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tab, setTab] = useState('calc');
  const [view, setView] = useState('landing'); // 'landing', 'auth', 'app', 'affiliate'

  // Initialize Pixel (Official ID)
  useEffect(() => {
    Pixel.init('1313953607262542');
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
      />
      <main style={{ paddingBottom: 80 }}>
        {tab === 'calc' && <Calculator user={user} isGold={profile?.is_gold} />}
        {tab === 'journal' && <Journal user={user} isGold={profile?.is_gold} />}
        {tab === 'dashboard' && <Dashboard user={user} isGold={profile?.is_gold} />}
      </main>
      <TabBar active={tab} setActive={setTab} />
    </div>
  );
}
