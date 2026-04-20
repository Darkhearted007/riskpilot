// src/pages/Calculator.jsx
// ─────────────────────────────────────────────────────────────
// Gold Risk Calculator — Upgraded
// - Entry price, Stop Loss price, Take Profit price
// - Proper RRR computed from price distances
// - Pip distance auto-calculated from entry/SL
// - Potential profit computed from RRR
// - Modern forex terminal feel
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase }           from '../lib/supabaseClient';
import { calculateGoldLotSize, getTradeWarnings, XAUUSD_POINT, XAUUSD_PIP_VALUE } from '../lib/riskEngine';
import { getSessionInfo }     from '../lib/sessionDetector';
import RiskAlert              from '../components/RiskAlert';

// ── Constants ─────────────────────────────────────────────────
const LEVEL_STYLE = {
  safe:       { color:'var(--green)', bg:'var(--green-dim)', border:'rgba(0,230,118,0.2)',  label:'SAFE',     icon:'🛡' },
  aggressive: { color:'var(--amber)', bg:'var(--amber-dim)', border:'rgba(255,179,0,0.2)',  label:'MODERATE', icon:'⚠' },
  danger:     { color:'var(--red)',   bg:'var(--red-dim)',   border:'rgba(255,61,87,0.2)',   label:'DANGER',   icon:'🚨' },
};

const fmt  = (n, d=2) => isNaN(n)||!isFinite(n) ? '—' : Number(n).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
const fmtR = (n) => isNaN(n)||!isFinite(n)||n<=0 ? '—' : `1 : ${Number(n).toFixed(2)}`;

function priceToPips(priceDist) {
  return Math.abs(priceDist) / XAUUSD_POINT;
}

// ── Sub-components ────────────────────────────────────────────
function FieldLabel({ children, hint }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
      <p style={{ fontFamily:'var(--font-data)', fontSize:10, fontWeight:600, color:'var(--text-muted)', letterSpacing:'0.12em', textTransform:'uppercase' }}>{children}</p>
      {hint && <p style={{ fontSize:10, color:'var(--text-faint)', fontFamily:'var(--font-data)' }}>{hint}</p>}
    </div>
  );
}

function PriceInput({ value, onChange, placeholder, label, hint, accent }) {
  const [focused, setFocused] = useState(false);
  const borderColor = focused ? (accent || 'var(--gold)') : value ? 'var(--border-high)' : 'var(--border)';
  return (
    <div>
      <FieldLabel hint={hint}>{label}</FieldLabel>
      <div style={{ position:'relative' }}>
        <input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          step="0.01"
          style={{
            width:'100%', background:'var(--bg-3)',
            border:`1px solid ${borderColor}`,
            borderRadius:'var(--radius)', padding:'12px 14px 12px 40px',
            color:'var(--text)', fontSize:15, fontFamily:'var(--font-data)',
            fontWeight:600, outline:'none', transition:'all 0.2s',
            boxShadow: focused ? `0 0 0 3px ${accent||'var(--gold-dim)'}` : 'none',
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:12, color: value ? (accent||'var(--gold)') : 'var(--text-muted)', fontFamily:'var(--font-data)', fontWeight:700, transition:'color 0.2s' }}>$</span>
      </div>
    </div>
  );
}

function NumberInput({ value, onChange, placeholder, label, hint, suffix, step='any', min, max }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <FieldLabel hint={hint}>{label}</FieldLabel>
      <div style={{ position:'relative' }}>
        <input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          step={step}
          min={min}
          max={max}
          style={{
            width:'100%', background:'var(--bg-3)',
            border:`1px solid ${focused?'var(--gold)':'var(--border)'}`,
            borderRadius:'var(--radius)', padding:`12px ${suffix?'36px':14}px 12px 14px`,
            color:'var(--text)', fontSize:15, fontFamily:'var(--font-data)',
            fontWeight:600, outline:'none', transition:'all 0.2s',
            boxShadow: focused ? '0 0 0 3px var(--gold-dim)' : 'none',
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {suffix && <span style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', fontSize:11, color:'var(--text-muted)', fontFamily:'var(--font-data)' }}>{suffix}</span>}
      </div>
    </div>
  );
}

function StatChip({ label, value, color, bg }) {
  return (
    <div style={{ flex:1, background: bg||'var(--surface-top)', borderRadius:'var(--radius)', padding:'10px 12px', border:`1px solid ${color}22` }}>
      <p style={{ fontSize:9, color:'var(--text-muted)', fontFamily:'var(--font-data)', letterSpacing:'0.1em', marginBottom:5 }}>{label}</p>
      <p style={{ fontFamily:'var(--font-data)', fontSize:14, fontWeight:700, color: color||'var(--text)' }}>{value}</p>
    </div>
  );
}

function SelectionInput({ value, onChange, options, label, icon }) {
  return (
    <div style={{ flex: 1 }}>
      <FieldLabel>{label}</FieldLabel>
      <div style={{ position: 'relative' }}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%', background: 'var(--bg-3)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '12px 14px 12px 36px',
            color: 'var(--text)', fontSize: 14, fontFamily: 'var(--font-data)',
            fontWeight: 600, outline: 'none', transition: 'all 0.2s',
            appearance: 'none', cursor: 'pointer'
          }}
        >
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14 }}>{icon}</span>
        <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: 'var(--text-muted)', pointerEvents: 'none' }}>▼</span>
      </div>
    </div>
  );
}

function DirectionToggle({ value, onChange }) {
  return (
    <div>
      <FieldLabel>Trade Direction</FieldLabel>
      <div style={{ display:'flex', gap:8 }}>
        {['BUY', 'SELL'].map(dir => {
          const active = value === dir;
          const color  = dir === 'BUY' ? 'var(--green)' : 'var(--red)';
          return (
            <button
              key={dir}
              onClick={() => onChange(dir)}
              style={{
                flex:1, padding:'12px', borderRadius:'var(--radius)',
                border:`1px solid ${active ? color : 'var(--border)'}`,
                background: active ? (dir==='BUY'?'var(--green-dim)':'var(--red-dim)') : 'var(--bg-3)',
                color: active ? color : 'var(--text-muted)',
                fontSize:13, fontWeight:700, cursor:'pointer',
                fontFamily:'var(--font-data)', letterSpacing:'0.08em',
                transition:'all 0.2s',
              }}
            >
              {dir === 'BUY' ? '▲ BUY' : '▼ SELL'}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RRRBar({ rrr, slPips, tpPips }) {
  if (!rrr || rrr <= 0) return null;
  const total  = slPips + tpPips;
  const slPct  = (slPips / total) * 100;
  const tpPct  = (tpPips / total) * 100;

  return (
    <div style={{ marginTop:4 }}>
      <div style={{ display:'flex', height:8, borderRadius:6, overflow:'hidden', gap:2 }}>
        <div style={{ width:`${slPct}%`, background:'var(--red)', borderRadius:4, opacity:0.8 }} />
        <div style={{ width:`${tpPct}%`, background:'var(--green)', borderRadius:4, opacity:0.8 }} />
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
        <span style={{ fontSize:10, color:'var(--red)', fontFamily:'var(--font-data)' }}>SL {fmt(slPips,0)} pips</span>
        <span style={{ fontSize:10, color:'var(--green)', fontFamily:'var(--font-data)' }}>TP {fmt(tpPips,0)} pips</span>
      </div>
    </div>
  );
}

export default function Calculator({ user, isGold }) {
  const [balance,   setBalance]   = useState('');
  const [riskPct,   setRiskPct]   = useState('1');
  const [entry,     setEntry]     = useState('');
  const [sl,        setSl]        = useState('');
  const [tp,        setTp]        = useState('');
  const [direction, setDirection] = useState('BUY');
  const [setupType, setSetupType] = useState('Retest');
  const [emotion,   setEmotion]   = useState('Calm');
  const [notes,     setNotes]     = useState('');

  const [session,  setSession]  = useState(null);

  const { result, warnings, derived } = useMemo(() => {
    const b    = parseFloat(balance);
    const r    = parseFloat(riskPct);
    const entP = parseFloat(entry);
    const slP  = parseFloat(sl);
    const tpP  = parseFloat(tp);

    const isBuy   = direction === 'BUY';
    const slValid = isBuy ? slP < entP : slP > entP;
    const tpValid = tpP > 0 ? (isBuy ? tpP > entP : tpP < entP) : true;

    if (b > 0 && r > 0 && entP > 0 && slP > 0 && slValid) {
      const slDist = Math.abs(entP - slP);
      const slPips = priceToPips(slDist);
      const tpPips = tpP > 0 && tpValid ? priceToPips(Math.abs(tpP - entP)) : 0;
      const rrr    = tpPips > 0 ? tpPips / slPips : 0;

      const calcResult = calculateGoldLotSize(b, r, slPips);
      const traps      = getTradeWarnings(r, slPips);
      const riskAmt   = b * (r / 100);
      const potProfit = tpPips > 0 ? riskAmt * rrr : 0;

      return {
        result: calcResult,
        warnings: traps,
        derived: {
          slDist:    fmt(slDist, 2),
          slPips:    fmt(slPips, 1),
          tpPips:    tpPips > 0 ? fmt(tpPips, 1) : null,
          rrr:       rrr > 0 ? rrr : null,
          potProfit: potProfit > 0 ? potProfit : null,
          slValid,
          tpValid,
          rawSlPips: slPips,
          rawTpPips: tpPips,
        }
      };
    }
    return { result: null, warnings: [], derived: entP > 0 && slP > 0 && !slValid ? { slError: true, isBuy } : null };
  }, [balance, riskPct, entry, sl, tp, direction]);

  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    const update = () => setSession(getSessionInfo());
    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, []);

  const handleSave = useCallback(async () => {
    if (!result || !result.isValid || saving) return;
    setSaving(true); setSaved(false); setSaveError('');
    const { error } = await supabase.from('trades').insert({
      user_id:           user.id,
      balance:           parseFloat(balance),
      risk_percent:      parseFloat(riskPct),
      lot_size:          result.lotSize,
      risk_amount:       result.riskAmount,
      risk_level:        result.riskLevel,
      session:           session?.session || 'London',
      direction:         direction,
      entry_price:       parseFloat(entry),
      stop_loss_price:   parseFloat(sl),
      take_profit_price: tp ? parseFloat(tp) : null,
      setup_type:        setupType,
      emotion:           emotion,
      notes:             notes.trim() || null,
      status:            'open'
    });
    if (error) { setSaveError('Failed to save. Try again.'); }
    else { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    setSaving(false);
  }, [user.id, balance, riskPct, session, result, notes, direction, entry, sl, tp, setupType, emotion, saving]);

  const levelStyle = result ? LEVEL_STYLE[result.riskLevel] : null;
  const riskAmount = balance && riskPct ? parseFloat(balance) * (parseFloat(riskPct)/100) : 0;

  return (
    <div style={S.page} className="fade-up">

      {!isGold && (
        <div style={{ background:'var(--gold-dim)', border:'1px solid var(--border-gold)', borderRadius:'var(--radius)', padding:'12px 16px', display:'flex', alignItems:'center', gap:12, marginBottom:4 }}>
          <span style={{ fontSize:20 }}>🚀</span>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:11, fontWeight:700, color:'var(--gold)', fontFamily:'var(--font-data)' }}>SCALE YOUR SUCCESS</p>
            <p style={{ fontSize:10, color:'var(--text-sub)' }}>Upgrade to Gold to unlock precision equity tracking and full trade history.</p>
          </div>
        </div>
      )}

      <div style={S.topBar}>
        <div style={S.pair}>
          <span style={S.pairName}>XAU/USD</span>
          <span style={S.pairSub}>Gold · Spot</span>
        </div>
        {session && (
          <div style={{ ...S.sessionChip, borderColor: session.color+'44', color: session.color }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:session.color, animation:'goldPulse 2s infinite' }} />
            <span style={{ fontFamily:'var(--font-data)', fontSize:11, fontWeight:600 }}>{session.icon} {session.session}</span>
            <span style={{ fontSize:10, color:'var(--text-muted)' }}>{session.volatility}</span>
          </div>
        )}
      </div>

      <div style={S.card}>
        <p style={S.cardLabel}>ACCOUNT PARAMETERS</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div style={{ gridColumn:'1 / -1' }}>
            <NumberInput label="Account Balance" value={balance} onChange={setBalance} placeholder="10000" suffix="USD" />
          </div>
          <NumberInput label="Risk Per Trade" value={riskPct} onChange={setRiskPct} placeholder="1.0" suffix="%" step="0.1" min="0.1" max="100" />
          <div>
            <FieldLabel hint={riskAmount > 0 ? `= $${fmt(riskAmount)}` : ''}>Risk Amount</FieldLabel>
            <div style={{ padding:'12px 14px', background:'var(--bg-3)', borderRadius:'var(--radius)', border:'1px solid var(--border)', fontFamily:'var(--font-data)', fontSize:15, fontWeight:700, color: riskAmount > 0 ? 'var(--gold)' : 'var(--text-muted)' }}>
              {riskAmount > 0 ? `$${fmt(riskAmount)}` : '—'}
            </div>
          </div>
        </div>
      </div>

      <div style={S.card}>
        <p style={S.cardLabel}>TRADE SETUP</p>
        <DirectionToggle value={direction} onChange={setDirection} />
        <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:12, marginTop:12 }}>
          <PriceInput label="Entry Price" value={entry} onChange={setEntry} placeholder="2650.00" accent="var(--gold)" />
          <PriceInput label="Stop Loss" value={sl} onChange={setSl} placeholder="2630.00" accent="var(--red)" />
          <PriceInput label="Take Profit" value={tp} onChange={setTp} placeholder="2690.00" accent="var(--green)" />
        </div>
        
        {derived?.slError && (
          <div style={{ marginTop:10, padding:'10px 12px', background:'var(--red-dim)', border:'1px solid rgba(255,61,87,0.3)', borderRadius:'var(--radius)', fontSize:12, color:'var(--red)', fontWeight:500 }}>
            ⚠ Invalid SL for {direction}
          </div>
        )}
      </div>

      <RiskAlert warnings={warnings} />

      {result && result.isValid ? (
        <div className="fade-up" style={{ ...S.resultCard, borderColor: levelStyle.border, background:`linear-gradient(135deg, var(--surface) 0%, ${levelStyle.bg} 100%)` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <p style={S.cardLabel}>POSITION SIZE</p>
            <div style={{ padding:'4px 12px', borderRadius:20, fontSize:10, fontWeight:700, fontFamily:'var(--font-data)', background:levelStyle.bg, color:levelStyle.color }}>{levelStyle.icon} {levelStyle.label}</div>
          </div>
          <div style={{ textAlign:'center', padding:'16px 0 12px', borderBottom:'1px solid var(--border)' }}>
            <div style={{ display:'flex', alignItems:'baseline', justifyContent:'center', gap:8 }}>
              <span style={{ fontFamily:'var(--font-display)', fontSize:64, fontWeight:800, color:levelStyle.color, filter:`drop-shadow(0 0 20px ${levelStyle.color}44)` }}>{result.lotSize}</span>
              <span style={{ fontSize:14, fontWeight:700, color:'var(--text-muted)' }}>LOTS</span>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving || saved} style={{ marginTop:12, width:'100%', padding:14, borderRadius:'var(--radius)', background:saved?'var(--green-dim)':'var(--gold)', color:saved?'var(--green)':'#080600', fontSize:13, fontWeight:700, cursor:saving||saved?'not-allowed':'pointer', fontFamily:'var(--font-data)', letterSpacing:'0.08em', transition:'all 0.3s' }}>
            {saving ? 'SAVING...' : saved ? '✓ LOGGED' : 'LOG THIS TRADE →'}
          </button>
        </div>
      ) : (
        <div style={S.emptyState}>
          <div style={{ fontSize:40, color:'var(--gold)', marginBottom:8 }}>◈</div>
          <p style={{ fontSize:15, fontWeight:600, color:'var(--text-sub)' }}>Enter trade parameters</p>
        </div>
      )}
    </div>
  );
}

const S = {
  page: { padding:'16px 16px 110px', display:'flex', flexDirection:'column', gap:14, maxWidth:520, margin:'0 auto' },
  topBar: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', background:'var(--surface)', borderRadius:'var(--radius-lg)', border:'1px solid var(--border-gold)' },
  pair: { display:'flex', flexDirection:'column', gap:2 },
  pairName: { fontFamily:'var(--font-display)', fontSize:20, fontWeight:700, color:'var(--gold)' },
  pairSub:  { fontFamily:'var(--font-data)', fontSize:10, color:'var(--text-muted)' },
  sessionChip: { display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:'var(--radius)', border:'1px solid', background:'var(--surface-high)' },
  card: { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'16px' },
  cardLabel: { fontFamily:'var(--font-data)', fontSize:10, fontWeight:600, color:'var(--text-muted)', letterSpacing:'0.14em', marginBottom:14 },
  resultCard: { borderRadius:'var(--radius-lg)', border:'1px solid', padding:'16px' },
  emptyState: { display:'flex', flexDirection:'column', alignItems:'center', padding:'36px 20px', background:'var(--surface)', borderRadius:'var(--radius-lg)', border:'1px solid var(--border)' },
};
