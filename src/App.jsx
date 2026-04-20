import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import Calculator from './pages/Calculator';
import Dashboard from './pages/Dashboard';
import AuthScreen from './components/AuthScreen';
import AppHeader from './components/AppHeader';
import TabBar from './components/TabBar';
import './styles/globals.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tab, setTab] = useState('calc');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ fontSize: 32, color: 'var(--gold)' }}>◈</div>
        <p style={{ fontFamily: 'var(--font-data)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>LOADING...</p>
      </div>
    );
  }

  if (!user) return <AuthScreen onAuth={setUser} />;

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', minHeight: '100vh', background: 'var(--bg-1)', position: 'relative' }}>
      <AppHeader user={user} onSignOut={() => setUser(null)} />
      <main>
        {tab === 'calc' && <Calculator user={user} />}
        {tab === 'dashboard' && <Dashboard user={user} />}
      </main>
      <TabBar active={tab} setActive={setTab} />
    </div>
  );
}
