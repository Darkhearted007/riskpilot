import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { calculateGoldLotSize, getTradeWarnings } from '../lib/riskEngine';
import { getSessionInfo } from '../lib/sessionDetector';
import RiskAlert from '../components/RiskAlert';

const LEVEL_STYLE = {
  safe:       { color:'var(--green)', bg:'var(--green-dim)', border:'rgba(0,230,118,0.25)',  label:'SAFE'     },
  aggressive: { color:'var(--amber)', bg:'var(--amber-dim)', border:'rgba(255,179,0,0.25)',   label:'MODERATE' },
  danger:     { color:'var(--red)',   bg:'var(--red-dim)',   border:'rgba(255,61,87,0.25)',    label:'DANGER'   },
};

function FieldLabel({ children }) {
  return <p style={{ fontFamily:'var(--font-data)', fontSize:10, fontWeight:600, color:'var(--text-muted)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:6 }}>{children}</p>;
}

function NumberInput({ value, onChange, placeholder, step='any', min, max }) {
  const [focused, setFocused] = useState(false);
  return (
    <input type="number" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} step={step} min={min} max={max}
      style={{ width:'100%', background:'var(--bg-3)', border:`1px solid ${focused?'var(--gold)':'var(--border)'}`, borderRadius:'var(--radius)', padding:'13px 14px', color:'var(--text)', fontSize:15, fontFamily:'var(--font-data)', fontWeight:500, transition:'all 0.2s', boxShadow:focused?'0 0 0 3px var(--gold-dim)':'none', outline:'none' }}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
  );
}

function MetricBox({ label, value, color }) {
  return (
    <div style={{ flex:1, background:'var(--surface-top)', borderRadius:'var(--radius)', padding:'10px 12px' }}>
      <p style={{ fontSize:10, color:'var(--text-muted)', fontFamily:'var(--font-data)', letterSpacing:'0.1em', marginBottom:4 }}>{label.toUpperCase()}</p>
      <p className="font-data" style={{ fontSize:13, fontWeight:700, color }}>{value}</p>
    </div>
  );
}

export default function Calculator({ user }) {
  const [balance,   setBalance]   = useState('');
  const [riskPct,   setRiskPct]   = useState('1');
  const [slPips,    setSlPips]    = useState('');
  const [notes,     setNotes]     = useState('');
  const [result,    setResult]    = useState(null);
  const [warnings,  setWarnings]  = useState([]);
  const [session,   setSession]   = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    const update = () => setSession(getSessionInfo());
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const b = parseFloat(balance), r = parseFloat(riskPct), s = parseFloat(slPips);
    if (b > 0 && r > 0 && s > 0) {
      setResult(calculateGoldLotSize(b, r, s));
      setWarnings(getTradeWarnings(r, s));
    } else { setResult(null); setWarnings([]); }
  }, [balance, riskPct, slPips]);

  const handleSave = useCallback(async () => {
    if (!result || !result.isValid || saving) return;
    setSaving(true); setSaved(false); setSaveError('');
    const { error } = await supabase.from('trades').insert({
      user_id: user.id, balance: parseFloat(balance), risk_percent: parseFloat(riskPct),
      stop_loss: parseFloat(slPips), lot_size: result.lotSize, risk_amount: result.riskAmount,
      risk_level: result.riskLevel, session: session?.session || 'London', notes: notes.trim() || null,
    });
    if (error) { setSaveError('Failed to save. Please try again.'); }
    else { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    setSaving(false);
  }, [result, balance, riskPct, slPips, notes, session, user, saving]);

  const levelStyle = result ? LEVEL_STYLE[result.riskLevel] : null;

  return (
    <div style={{ padding:'20px 16px 110px', display:'flex', flexDirection:'column', gap:14, maxWidth:520, margin:'0 auto' }} className="fade-up">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
        <div>
          <p style={{ fontFamily:'var(--font-data)', fontSize:10, color:'var(--gold)', letterSpacing:'0.16em', marginBottom:4 }}>XAUUSD · GOLD</p>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:700, lineHeight:1.1 }}>Risk Calculator</h1>
        </div>
        {session && (
          <div style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:'var(--radius)', border:`1px solid ${session.color}44`, background:'var(--surface)', color:session.color, fontSize:14 }}>
            <span>{session.icon}</span>
            <span className="font-data" style={{ fontSize:11 }}>{session.session}</span>
          </div>
        )}
      </div>

      {session && (
        <div style={{ padding:'10px 14px', borderRadius:'var(--radius)', background:'var(--surface)', border:'1px solid var(--border)', borderLeft:`2px solid ${session.color}`, paddingLeft:12 }}>
          <p style={{ fontSize:12, color:session.color, fontWeight:600, marginBottom:2 }}>{session.volatility} volatility session</p>
          <p style={{ fontSize:12, color:'var(--text-sub)' }}>{session.goldNote}</p>
        </div>
      )}

      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'18px 16px' }}>
        <p style={{ fontFamily:'var(--font-data)', fontSize:10, fontWeight:600, color:'var(--text-muted)', letterSpacing:'0.14em', marginBottom:16 }}>TRADE PARAMETERS</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div style={{ gridColumn:'1 / -1' }}>
            <FieldLabel>Account Balance (USD)</FieldLabel>
            <NumberInput value={balance} onChange={setBalance} placeholder="e.g. 10000" />
          </div>
          <div><FieldLabel>Risk % per Trade</FieldLabel><NumberInput value={riskPct} onChange={setRiskPct} placeholder="1.0" step="0.1" min="0.1" max="100" /></div>
          <div><FieldLabel>Stop Loss (Pips)</FieldLabel><NumberInput value={slPips} onChange={setSlPips} placeholder="e.g. 150" step="1" min="1" /></div>
        </div>
        {riskPct && !isNaN(parseFloat(riskPct)) && (
          <div style={{ marginTop:16, paddingTop:16, borderTop:'1px solid var(--border)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              <span className="font-data" style={{ fontSize:11, color:'var(--text-muted)' }}>RISK LEVEL</span>
              <span className="font-data" style={{ fontSize:11, color:levelStyle?.color||'var(--text-muted)' }}>{parseFloat(riskPct).toFixed(1)}%</span>
            </div>
            <div style={{ height:6, borderRadius:4, background:'var(--surface-top)', overflow:'hidden' }}>
              <div style={{ height:'100%', borderRadius:4, transition:'width 0.4s cubic-bezier(0.16,1,0.3,1)', width:`${Math.min((parseFloat(riskPct)/5)*100,100)}%`, background:levelStyle?.color||'var(--green)', boxShadow:`0 0 8px ${levelStyle?.color||'var(--green)'}66` }} />
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
              <span style={{ fontSize:10, color:'var(--green)' }}>0%</span>
              <span style={{ fontSize:10, color:'var(--amber)' }}>2%</span>
              <span style={{ fontSize:10, color:'var(--red)' }}>3%+</span>
            </div>
          </div>
        )}
      </div>

      <RiskAlert warnings={warnings} />

      {result && result.isValid ? (
        <div className="fade-up" style={{ borderRadius:'var(--radius-lg)', border:`1px solid ${levelStyle.border}`, background:`linear-gradient(135deg, var(--surface) 0%, ${levelStyle.bg} 100%)`, padding:'18px 16px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <p style={{ fontFamily:'var(--font-data)', fontSize:10, fontWeight:600, color:'var(--text-muted)', letterSpacing:'0.14em' }}>CALCULATION RESULT</p>
            <div style={{ padding:'4px 10px', borderRadius:'var(--radius-sm)', fontSize:10, fontWeight:700, fontFamily:'var(--font-data)', letterSpacing:'0.1em', background:levelStyle.bg, color:levelStyle.color, border:`1px solid ${levelStyle.border}` }}>{levelStyle.label}</div>
          </div>
          <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:4 }}>
            <span style={{ fontFamily:'var(--font-display)', fontSize:52, fontWeight:800, lineHeight:1, color:levelStyle.color }}>{result.lotSize}</span>
            <span className="font-data" style={{ fontSize:14, fontWeight:600, color:'var(--text-muted)', letterSpacing:'0.1em' }}>LOTS</span>
          </div>
          <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:14 }}>XAUUSD position size for this trade</p>
          <div style={{ display:'flex', gap:8 }}>
            <MetricBox label="Risk Amount" value={`$${result.riskAmount.toLocaleString('en-US',{minimumFractionDigits:2})}`} color="var(--gold)" />
            <MetricBox label="Pip Value"   value={`$${result.pipValue}/lot`} color="var(--text-sub)" />
            <MetricBox label="Max Loss"    value={`$${result.maxLoss.toLocaleString('en-US',{minimumFractionDigits:2})}`} color="var(--red)" />
          </div>
          <div style={{ marginTop:14 }}>
            <FieldLabel>Trade Notes (optional)</FieldLabel>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Setup, confluence, reason for entry..." rows={2}
              style={{ width:'100%', background:'var(--bg-3)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'12px 14px', color:'var(--text)', fontSize:13, fontFamily:'var(--font-body)', resize:'vertical', minHeight:68, outline:'none', transition:'border-color 0.2s' }}
              onFocus={e => (e.target.style.borderColor='var(--gold)')} onBlur={e => (e.target.style.borderColor='var(--border)')} />
          </div>
          <button onClick={handleSave} disabled={saving||saved}
            style={{ marginTop:12, width:'100%', padding:14, borderRadius:'var(--radius)', border:`1px solid ${saved?'var(--green)':'transparent'}`, background:saved?'var(--green-dim)':'var(--gold)', color:saved?'var(--green)':'#0A0800', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-data)', letterSpacing:'0.08em', transition:'all 0.3s', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            {saving ? <span className="spin" style={{ display:'inline-block', width:16, height:16, border:'2px solid rgba(0,0,0,0.2)', borderTop:'2px solid #0A0800', borderRadius:'50%' }} /> : saved ? '✓ Saved to Journal' : 'LOG THIS TRADE →'}
          </button>
          {saveError && <p style={{ fontSize:12, color:'var(--red)', textAlign:'center', marginTop:8 }}>{saveError}</p>}
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'32px 20px', background:'var(--surface)', borderRadius:'var(--radius-lg)', border:'1px solid var(--border)', gap:8 }}>
          <div style={{ fontSize:36, color:'var(--gold)', marginBottom:4, filter:'drop-shadow(0 0 12px var(--gold-glow))' }}>◈</div>
          <p style={{ fontSize:14, color:'var(--text-sub)' }}>Enter your parameters above</p>
          <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:4 }}>Position size calculates in real-time</p>
        </div>
      )}
    </div>
  );
}
