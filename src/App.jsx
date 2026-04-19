import { useState, useEffect } from 'react';
import { supabase }   from './lib/supabaseClient';
import Calculator     from './pages/Calculator';
import Dashboard      from './pages/Dashboard';
import './styles/globals.css';

function AuthInput({ type, value, onChange, placeholder, onKeyDown }) {
  const [focused, setFocused] = useState(false);
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} onKeyDown={onKeyDown}
      style={{ width:'100%', background:'var(--bg-3)', border:`1px solid ${focused?'var(--gold)':'var(--border)'}`, borderRadius:'var(--radius)', padding:'13px 14px', color:'var(--text)', fontSize:15, fontFamily:'var(--font-body)', outline:'none', transition:'all 0.2s', boxShadow:focused?'0 0 0 3px var(--gold-dim)':'none' }}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
  );
}

function AuthScreen({ onAuth }) {
  const [mode,     setMode]     = useState('login');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');

  const handle = async () => {
    if (!email) return setError('Email is required');
    if (mode !== 'reset' && !password) return setError('Password is required');
    if (mode !== 'reset' && password.length < 6) return setError('Password must be at least 6 characters');
    setError(''); setSuccess(''); setLoading(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess('Account created! Check your email to confirm, then sign in.');
        setMode('login');
      } else if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuth(data.user);
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        setSuccess('Reset email sent. Check your inbox.');
      }
    } catch (e) { setError(e.message || 'Something went wrong.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px 16px', maxWidth:440, margin:'0 auto', position:'relative' }} className="fade-up">
      <div style={{ position:'absolute', top:'20%', left:'50%', transform:'translateX(-50%)', width:300, height:300, background:'radial-gradient(circle, var(--gold-dim) 0%, transparent 70%)', pointerEvents:'none' }} />
      <div style={{ textAlign:'center', marginBottom:36, zIndex:1 }}>
        <div style={{ fontSize:44, color:'var(--gold)', lineHeight:1, marginBottom:10, filter:'drop-shadow(0 0 20px var(--gold-glow))' }}>◈</div>
        <div style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:800, color:'var(--text)', letterSpacing:'-0.01em' }}>RiskPilot</div>
        <div style={{ fontFamily:'var(--font-data)', fontSize:10, color:'var(--gold)', letterSpacing:'0.12em', marginTop:4 }}>GOLD EDITION · XAUUSD DISCIPLINE ENGINE</div>
      </div>
      <div style={{ width:'100%', background:'var(--surface)', border:'1px solid var(--border-gold)', borderRadius:'var(--radius-xl)', padding:'28px 24px', display:'flex', flexDirection:'column', gap:18, zIndex:1, boxShadow:'var(--shadow-gold)' }}>
        <p style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:700, color:'var(--text)' }}>
          {mode==='login'?'Welcome back':mode==='signup'?'Create account':'Reset password'}
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div>
            <p style={{ fontFamily:'var(--font-data)', fontSize:10, color:'var(--text-muted)', letterSpacing:'0.12em', marginBottom:6 }}>EMAIL ADDRESS</p>
            <AuthInput type="email" value={email} onChange={setEmail} placeholder="you@email.com" onKeyDown={e => e.key==='Enter' && handle()} />
          </div>
          {mode !== 'reset' && (
            <div>
              <p style={{ fontFamily:'var(--font-data)', fontSize:10, color:'var(--text-muted)', letterSpacing:'0.12em', marginBottom:6 }}>PASSWORD</p>
              <AuthInput type="password" value={password} onChange={setPassword} placeholder="••••••••" onKeyDown={e => e.key==='Enter' && handle()} />
            </div>
          )}
        </div>
        {error   && <div style={{ padding:'10px 14px', background:'var(--red-dim)', border:'1px solid rgba(255,61,87,0.3)', borderRadius:'var(--radius)', fontSize:13, color:'var(--red)' }}>{error}</div>}
        {success && <div style={{ padding:'10px 14px', background:'var(--green-dim)', border:'1px solid rgba(0,230,118,0.3)', borderRadius:'var(--radius)', fontSize:13, color:'var(--green)' }}>{success}</div>}
        <button onClick={handle} disabled={loading} style={{ width:'100%', padding:14, borderRadius:'var(--radius)', border:'none', background:'var(--gold)', color:'#080600', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-data)', letterSpacing:'0.06em', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
          {loading ? <span className="spin" style={{ display:'inline-block', width:16, height:16, border:'2px solid rgba(0,0,0,0.2)', borderTop:'2px solid #0A0800', borderRadius:'50%' }} /> : mode==='login'?'Sign In →':mode==='signup'?'Create Account →':'Send Reset Email →'}
        </button>
        <div style={{ display:'flex', justifyContent:'center', gap:10, alignItems:'center' }}>
          {mode==='login' && <>
            <button onClick={() => { setMode('signup'); setError(''); }} style={{ background:'none', border:'none', color:'var(--gold)', fontSize:13, cursor:'pointer' }}>Create account</button>
            <span style={{ color:'var(--text-faint)' }}>·</span>
            <button onClick={() => { setMode('reset'); setError(''); }} style={{ background:'none', border:'none', color:'var(--text-muted)', fontSize:12, cursor:'pointer' }}>Forgot password?</button>
          </>}
          {mode !== 'login' && <button onClick={() => { setMode('login'); setError(''); }} style={{ background:'none', border:'none', color:'var(--gold)', fontSize:13, cursor:'pointer' }}>Back to sign in</button>}
        </div>
      </div>
      <p style={{ marginTop:24, fontSize:12, color:'var(--text-muted)', fontFamily:'var(--font-data)', zIndex:1 }}>Built for Gold traders who take risk seriously.</p>
    </div>
  );
}

function AppHeader({ user, onSignOut }) {
  const [open, setOpen] = useState(false);
  return (
    <header style={{ background:'var(--surface)', borderBottom:'1px solid var(--border)', padding:'12px 16px', display:'flex', alignItems:'center', gap:12, position:'sticky', top:0, zIndex:50 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, flex:1 }}>
        <span style={{ fontSize:20, color:'var(--gold)', filter:'drop-shadow(0 0 6px var(--gold-glow))' }}>◈</span>
        <div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:700, color:'var(--text)', letterSpacing:'-0.01em', lineHeight:1 }}>RiskPilot</div>
          <div style={{ fontFamily:'var(--font-data)', fontSize:8, color:'var(--gold)', letterSpacing:'0.12em', lineHeight:1, marginTop:2 }}>GOLD EDITION</div>
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', borderRadius:'var(--radius-sm)', background:'var(--gold-dim)', border:'1px solid var(--border-gold)' }}>
        <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--gold)', animation:'goldPulse 2s infinite' }} />
        <span style={{ fontFamily:'var(--font-data)', fontSize:10, fontWeight:600, color:'var(--gold)', letterSpacing:'0.08em' }}>XAUUSD</span>
      </div>
      <div style={{ position:'relative' }}>
        <button onClick={() => setOpen(o => !o)} style={{ background:'var(--surface-high)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'6px 12px', color:'var(--text-sub)', fontSize:12, cursor:'pointer', fontFamily:'var(--font-data)' }}>
          {user.email.split('@')[0].slice(0,8)}
        </button>
        {open && (
          <div className="fade-in" style={{ position:'absolute', right:0, top:'110%', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:8, minWidth:180, zIndex:200, boxShadow:'var(--shadow-card)' }}>
            <p style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'var(--font-data)', padding:'4px 10px 8px', borderBottom:'1px solid var(--border)', marginBottom:6, wordBreak:'break-all' }}>{user.email}</p>
            <button onClick={() => { supabase.auth.signOut(); onSignOut(); }} style={{ width:'100%', background:'var(--red-dim)', border:'1px solid rgba(255,61,87,0.3)', borderRadius:'var(--radius-sm)', padding:'8px 12px', color:'var(--red)', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'var(--font-data)', textAlign:'left' }}>Sign Out</button>
          </div>
        )}
      </div>
    </header>
  );
}

function TabBar({ active, setActive }) {
  const tabs = [{ id:'calc', icon:'◈', label:'Calculator' }, { id:'dashboard', icon:'▦', label:'Dashboard' }];
  return (
    <nav style={{ display:'grid', gridTemplateColumns:'1fr 1fr', background:'var(--surface)', borderTop:'1px solid var(--border)', position:'fixed', bottom:0, left:0, right:0, zIndex:100, maxWidth:520, margin:'0 auto' }}>
      <div style={{ position:'absolute', top:0, left:active==='calc'?'0%':'50%', width:'50%', height:2, background:'var(--gold)', boxShadow:'0 0 8px var(--gold-glow)', transition:'left 0.3s cubic-bezier(0.16,1,0.3,1)' }} />
      {tabs.map(t => (
        <button key={t.id} onClick={() => setActive(t.id)} style={{ padding:'13px 8px 11px', background:'transparent', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:4, fontFamily:'var(--font-body)', color:active===t.id?'var(--gold)':'var(--text-muted)', transition:'color 0.2s' }}>
          <span style={{ fontSize:16, lineHeight:1 }}>{t.icon}</span>
          <span style={{ fontSize:10, fontWeight:600, letterSpacing:'0.06em' }}>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}

export default function App() {
  const [user,        setUser]        = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tab,         setTab]         = useState('calc');

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

  if (authLoading) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
      <div style={{ fontSize:32, color:'var(--gold)' }}>◈</div>
      <p style={{ fontFamily:'var(--font-data)', fontSize:11, color:'var(--text-muted)', letterSpacing:'0.1em' }}>LOADING...</p>
    </div>
  );

  if (!user) return <AuthScreen onAuth={setUser} />;

  return (
    <div style={{ maxWidth:520, margin:'0 auto', minHeight:'100vh', background:'var(--bg-1)', position:'relative' }}>
      <AppHeader user={user} onSignOut={() => setUser(null)} />
      <main>
        {tab==='calc'      && <Calculator user={user} />}
        {tab==='dashboard' && <Dashboard  user={user} />}
      </main>
      <TabBar active={tab} setActive={setTab} />
    </div>
  );
}
