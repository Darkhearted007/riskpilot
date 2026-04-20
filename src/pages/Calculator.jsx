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
// XAUUSD: 1 pip = $0.10 price movement (standard broker definition)
// Pip value per 1.0 standard lot = $10
// Point value per lot is managed in riskEngine.js

const LEVEL_STYLE = {
  safe:       { color:'var(--green)', bg:'var(--green-dim)', border:'rgba(0,230,118,0.2)',  label:'SAFE',     icon:'🛡' },
  aggressive: { color:'var(--amber)', bg:'var(--amber-dim)', border:'rgba(255,179,0,0.2)',  label:'MODERATE', icon:'⚠' },
  danger:     { color:'var(--red)',   bg:'var(--red-dim)',   border:'rgba(255,61,87,0.2)',   label:'DANGER',   icon:'🚨' },
};

// ── Helpers ───────────────────────────────────────────────────
const fmt  = (n, d=2) => isNaN(n)||!isFinite(n) ? '—' : Number(n).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
const fmtR = (n) => isNaN(n)||!isFinite(n)||n<=0 ? '—' : `1 : ${Number(n).toFixed(2)}`;

// Convert price distance to pips for XAUUSD
// 1 pip = $0.10, so pips = price_distance / 0.10
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

// RRR Visual Bar
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

// ── Main Component ────────────────────────────────────────────
export default function Calculator({ user }) {
  // ── Inputs ──────────────────────────────────────────────
  const [balance,   setBalance]   = useState('');
  const [riskPct,   setRiskPct]   = useState('1');
  const [entry,     setEntry]     = useState('');
  const [sl,        setSl]        = useState('');
  const [tp,        setTp]        = useState('');
  const [direction, setDirection] = useState('BUY');
  const [setupType, setSetupType] = useState('Retest');
  const [emotion,   setEmotion]   = useState('Calm');
  const [notes,     setNotes]     = useState('');

  // ── Computed ─────────────────────────────────────────────
  const [session,  setSession]  = useState(null);

  // Derived metrics — computed on every render (memoized for performance)
  const { result, warnings, derived } = useMemo(() => {
    const b    = parseFloat(balance);
    const r    = parseFloat(riskPct);
    const entP = parseFloat(entry);
    const slP  = parseFloat(sl);
    const tpP  = parseFloat(tp);

    // Validate direction logic
    const isBuy   = direction === 'BUY';
    const slValid = isBuy ? slP < entP : slP > entP;
    const tpValid = tpP > 0 ? (isBuy ? tpP > entP : tpP < entP) : true;

    if (b > 0 && r > 0 && entP > 0 && slP > 0 && slValid) {
      // Calculate pip distances from price
      const slDist = Math.abs(entP - slP);
      const slPips = priceToPips(slDist);
      const tpPips = tpP > 0 && tpValid ? priceToPips(Math.abs(tpP - entP)) : 0;
      const rrr    = tpPips > 0 ? tpPips / slPips : 0;

      // Run lot size calculation
      const calcResult = calculateGoldLotSize(b, r, slPips);
      const traps      = getTradeWarnings(r, slPips);

      // Derived price metrics
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

    return {
      result: null,
      warnings: [],
      derived: entP > 0 && slP > 0 && !slValid ? { slError: true, isBuy } : null
    };
  }, [balance, riskPct, entry, sl, tp, direction]);

  // ── UI state ─────────────────────────────────────────────
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [saveError, setSaveError] = useState('');

  // Session detection
  useEffect(() => {
    const update = () => setSession(getSessionInfo());
    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Save trade to Supabase
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
      
      // New Journaling Fields
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

      {/* ── Top bar: session + direction ── */}
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

      {/* ── Session note ── */}
      {session && (
        <div style={{ ...S.sessionNote, borderLeftColor: session.color }}>
          <p style={{ fontSize:12, color:session.color, fontWeight:600, marginBottom:2 }}>{session.volatility} volatility · {session.description}</p>
          <p style={{ fontSize:12, color:'var(--text-sub)' }}>{session.goldNote}</p>
        </div>
      )}

      {/* ── Account + Risk ── */}
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

        {/* Risk % visual bar */}
        {riskPct && parseFloat(riskPct) > 0 && (
          <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid var(--border)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              <span style={{ fontFamily:'var(--font-data)', fontSize:10, color:'var(--text-muted)', letterSpacing:'0.1em' }}>RISK EXPOSURE</span>
              <span style={{ fontFamily:'var(--font-data)', fontSize:11, fontWeight:700, color: levelStyle?.color||'var(--green)' }}>
                {levelStyle?.icon} {levelStyle?.label || 'SAFE'}
              </span>
            </div>
            <div style={{ height:6, background:'var(--surface-top)', borderRadius:4, overflow:'hidden' }}>
              <div style={{ height:'100%', borderRadius:4, width:`${Math.min((parseFloat(riskPct)/5)*100,100)}%`, background: levelStyle?.color||'var(--green)', transition:'all 0.4s cubic-bezier(0.16,1,0.3,1)', boxShadow:`0 0 10px ${levelStyle?.color||'var(--green)'}66` }} />
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
              {[['0%','var(--text-muted)'],['1%','var(--green)'],['2%','var(--amber)'],['3%+','var(--red)']].map(([l,c]) => (
                <span key={l} style={{ fontSize:9, color:c, fontFamily:'var(--font-data)' }}>{l}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Trade Setup ── */}
      <div style={S.card}>
        <p style={S.cardLabel}>TRADE SETUP</p>

        <DirectionToggle value={direction} onChange={setDirection} />

        <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:12, marginTop:12 }}>
          <PriceInput
            label="Entry Price"
            value={entry}
            onChange={setEntry}
            placeholder="2650.00"
            hint="Your entry point"
            accent="var(--gold)"
          />
          <PriceInput
            label="Stop Loss"
            value={sl}
            onChange={setSl}
            placeholder={direction==='BUY' ? '2630.00 (below entry)' : '2670.00 (above entry)'}
            hint={direction==='BUY' ? 'Must be below entry' : 'Must be above entry'}
            accent="var(--red)"
          />
          <PriceInput
            label="Take Profit"
            value={tp}
            onChange={setTp}
            placeholder={direction==='BUY' ? '2690.00 (above entry)' : '2610.00 (below entry)'}
            hint="Optional — for RRR calc"
            accent="var(--green)"
          />
        </div>

        {/* Journaling Setup */}
        <div style={{ display:'flex', gap:10, marginTop:12 }}>
          <SelectionInput
            label="Setup Type"
            value={setupType}
            onChange={setSetupType}
            icon="🎯"
            options={['Breakout', 'Retest', 'Order Block', 'SMC Setup', 'Trendline', 'News Event']}
          />
          <SelectionInput
            label="Emotion"
            value={emotion}
            onChange={setEmotion}
            icon="🧠"
            options={['Calm', 'FOMO', 'Anxious', 'Confident', 'Bored', 'Aggressive']}
          />
        </div>

        {/* Direction validation error */}
        {derived?.slError && (
          <div style={{ marginTop:10, padding:'10px 12px', background:'var(--red-dim)', borderRadius:'var(--radius)', border:'1px solid rgba(255,61,87,0.3)', fontSize:12, color:'var(--red)', fontWeight:500 }}>
            ⚠ Stop loss must be {derived.isBuy ? 'below' : 'above'} entry price for a {derived.isBuy ? 'BUY' : 'SELL'} trade
          </div>
        )}

        {/* Live pip distances */}
        {derived && !derived.slError && (
          <div style={{ marginTop:12, padding:'12px', background:'var(--surface-top)', borderRadius:'var(--radius)', border:'1px solid var(--border)' }}>
            <p style={{ fontFamily:'var(--font-data)', fontSize:9, color:'var(--text-muted)', letterSpacing:'0.12em', marginBottom:10 }}>DISTANCE METRICS</p>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <StatChip label="SL DISTANCE" value={`$${derived.slDist}`} color="var(--red)" />
              <StatChip label="SL PIPS" value={derived.slPips} color="var(--red)" />
              {derived.tpPips && <StatChip label="TP PIPS" value={derived.tpPips} color="var(--green)" />}
              {derived.rrr > 0 && <StatChip label="RISK : REWARD" value={fmtR(derived.rrr)} color="var(--gold)" />}
            </div>
            {derived.rrr > 0 && (
              <div style={{ marginTop:10 }}>
                <RRRBar rrr={derived.rrr} slPips={derived.rawSlPips} tpPips={derived.rawTpPips} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Risk Alerts ── */}
      <RiskAlert warnings={warnings} />

      {/* ── Results ── */}
      {result && result.isValid ? (
        <div className="fade-up" style={{ ...S.resultCard, borderColor: levelStyle.border, background:`linear-gradient(135deg, var(--surface) 0%, ${levelStyle.bg} 100%)` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <p style={S.cardLabel}>POSITION SIZE</p>
            <div style={{ padding:'4px 12px', borderRadius:20, fontSize:10, fontWeight:700, fontFamily:'var(--font-data)', letterSpacing:'0.1em', background:levelStyle.bg, color:levelStyle.color, border:`1px solid ${levelStyle.border}` }}>
              {levelStyle.icon} {levelStyle.label}
            </div>
          </div>

          {/* Main lot size */}
          <div style={{ textAlign:'center', padding:'16px 0 12px', borderBottom:'1px solid var(--border)' }}>
            <div style={{ display:'flex', alignItems:'baseline', justifyContent:'center', gap:8 }}>
              <span style={{ fontFamily:'var(--font-display)', fontSize:64, fontWeight:800, lineHeight:1, color:levelStyle.color, filter:`drop-shadow(0 0 20px ${levelStyle.color}44)` }}>
                {result.lotSize}
              </span>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-start', gap:2 }}>
                <span style={{ fontFamily:'var(--font-data)', fontSize:14, fontWeight:700, color:'var(--text-muted)', letterSpacing:'0.1em' }}>LOTS</span>
                <span style={{ fontFamily:'var(--font-data)', fontSize:10, color:'var(--text-muted)' }}>XAU/USD</span>
              </div>
            </div>
            <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:6 }}>
              {direction === 'BUY' ? '▲ LONG' : '▼ SHORT'} · Entry @ ${parseFloat(entry).toFixed(2)}
            </p>
          </div>

          {/* Metrics grid */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:14 }}>
            <MetricRow label="Risk Amount"    value={`$${fmt(result.riskAmount)}`}   color="var(--amber)" />
            <MetricRow label="Max Loss"       value={`$${fmt(result.maxLoss)}`}       color="var(--red)" />
            <MetricRow label="SL Distance"    value={`${derived?.slPips} pips`}       color="var(--text-sub)" />
            <MetricRow label="Pip Value"      value={`$${result.pipValue}/lot`}       color="var(--text-sub)" />
            {derived?.rrr > 0 && <>
              <MetricRow label="Risk : Reward" value={fmtR(derived.rrr)}              color="var(--gold)" />
              <MetricRow label="Est. Profit"   value={`$${fmt(derived.potProfit)}`}   color="var(--green)" />
            </>}
            {tp && parseFloat(tp) > 0 && derived?.tpPips && <>
              <MetricRow label="TP Distance"  value={`${derived.tpPips} pips`}        color="var(--text-sub)" />
              <MetricRow label="TP Price"     value={`$${parseFloat(tp).toFixed(2)}`} color="var(--green)" />
            </>}
          </div>

          {/* RRR quality message */}
          {derived?.rrr > 0 && (
            <div style={{ marginTop:12, padding:'10px 14px', borderRadius:'var(--radius)', background: derived.rrr >= 2 ? 'var(--green-dim)' : derived.rrr >= 1 ? 'var(--amber-dim)' : 'var(--red-dim)', border:`1px solid ${derived.rrr >= 2 ? 'rgba(0,230,118,0.2)' : derived.rrr >= 1 ? 'rgba(255,179,0,0.2)' : 'rgba(255,61,87,0.2)'}` }}>
              <p style={{ fontSize:12, fontWeight:600, color: derived.rrr >= 2 ? 'var(--green)' : derived.rrr >= 1 ? 'var(--amber)' : 'var(--red)' }}>
                {derived.rrr >= 3 ? '🏆 Excellent RRR — This is a high-quality setup.' :
                 derived.rrr >= 2 ? '✅ Good RRR — Meets the 1:2 minimum standard.' :
                 derived.rrr >= 1 ? '⚠ Marginal RRR — Consider a better TP level.' :
                 '❌ Poor RRR — Risk outweighs potential reward. Avoid this setup.'}
              </p>
            </div>
          )}

          {/* Notes */}
          <div style={{ marginTop:14 }}>
            <FieldLabel>Trade Notes (optional)</FieldLabel>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Setup, confluence, news event, pattern..."
              rows={2}
              style={{ width:'100%', background:'var(--bg-3)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'12px 14px', color:'var(--text)', fontSize:13, fontFamily:'var(--font-body)', resize:'vertical', minHeight:64, outline:'none', transition:'border-color 0.2s' }}
              onFocus={e => (e.target.style.borderColor='var(--gold)')}
              onBlur={e  => (e.target.style.borderColor='var(--border)')}
            />
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving || saved}
            style={{ marginTop:12, width:'100%', padding:14, borderRadius:'var(--radius)', border:`1px solid ${saved?'var(--green)':'transparent'}`, background:saved?'var(--green-dim)':'var(--gold)', color:saved?'var(--green)':'#080600', fontSize:13, fontWeight:700, cursor:saving||saved?'not-allowed':'pointer', fontFamily:'var(--font-data)', letterSpacing:'0.08em', transition:'all 0.3s', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}
          >
            {saving
              ? <span className="spin" style={{ display:'inline-block', width:16, height:16, border:'2px solid rgba(0,0,0,0.2)', borderTop:'2px solid #080600', borderRadius:'50%' }} />
              : saved ? '✓ Trade Logged' : 'LOG THIS TRADE →'}
          </button>
          {saveError && <p style={{ fontSize:12, color:'var(--red)', textAlign:'center', marginTop:8 }}>{saveError}</p>}
        </div>
      ) : (
        <div style={S.emptyState}>
          <div style={{ fontSize:40, color:'var(--gold)', filter:'drop-shadow(0 0 16px var(--gold-glow))', marginBottom:8 }}>◈</div>
          <p style={{ fontSize:15, fontWeight:600, color:'var(--text-sub)' }}>Enter trade parameters</p>
          <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:4, textAlign:'center', lineHeight:1.6 }}>Fill in your account balance, risk %, entry price and stop loss to calculate position size</p>
        </div>
      )}

      {/* ── Pip Reference ── */}
      <div style={S.refCard}>
        <p style={S.cardLabel}>XAUUSD PIP REFERENCE</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {[
            ['1 pip', '$0.10 price move'],
            ['Pip value', '$10 per lot'],
            ['Min SL (rec)', '100+ pips'],
            ['Spread (avg)', '20–30 pips'],
          ].map(([k,v]) => (
            <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
              <span style={{ fontSize:12, color:'var(--text-muted)', fontFamily:'var(--font-data)' }}>{k}</span>
              <span style={{ fontSize:12, color:'var(--text-sub)', fontFamily:'var(--font-data)', fontWeight:600 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

function MetricRow({ label, value, color }) {
  return (
    <div style={{ background:'var(--surface-top)', borderRadius:'var(--radius-sm)', padding:'10px 12px' }}>
      <p style={{ fontSize:9, color:'var(--text-muted)', fontFamily:'var(--font-data)', letterSpacing:'0.1em', marginBottom:4 }}>{label.toUpperCase()}</p>
      <p style={{ fontFamily:'var(--font-data)', fontSize:14, fontWeight:700, color }}>{value}</p>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────
const S = {
  page: {
    padding:'16px 16px 110px',
    display:'flex', flexDirection:'column', gap:14,
    maxWidth:520, margin:'0 auto',
  },
  topBar: {
    display:'flex', justifyContent:'space-between', alignItems:'center',
    padding:'12px 16px', background:'var(--surface)',
    borderRadius:'var(--radius-lg)', border:'1px solid var(--border-gold)',
  },
  pair: { display:'flex', flexDirection:'column', gap:2 },
  pairName: { fontFamily:'var(--font-display)', fontSize:20, fontWeight:700, color:'var(--gold)', letterSpacing:'-0.01em' },
  pairSub:  { fontFamily:'var(--font-data)', fontSize:10, color:'var(--text-muted)', letterSpacing:'0.08em' },
  sessionChip: {
    display:'flex', alignItems:'center', gap:6,
    padding:'6px 12px', borderRadius:'var(--radius)',
    border:'1px solid', background:'var(--surface-high)',
  },
  sessionNote: {
    padding:'10px 14px', borderRadius:'var(--radius)',
    background:'var(--surface)', border:'1px solid var(--border)',
    borderLeft:'2px solid', paddingLeft:12,
  },
  card: {
    background:'var(--surface)', border:'1px solid var(--border)',
    borderRadius:'var(--radius-lg)', padding:'16px',
  },
  cardLabel: {
    fontFamily:'var(--font-data)', fontSize:10, fontWeight:600,
    color:'var(--text-muted)', letterSpacing:'0.14em', marginBottom:14,
  },
  resultCard: {
    borderRadius:'var(--radius-lg)', border:'1px solid', padding:'16px',
  },
  emptyState: {
    display:'flex', flexDirection:'column', alignItems:'center',
    padding:'36px 20px', background:'var(--surface)',
    borderRadius:'var(--radius-lg)', border:'1px solid var(--border)',
  },
  refCard: {
    background:'var(--surface)', border:'1px solid var(--border)',
    borderRadius:'var(--radius-lg)', padding:'16px',
    opacity:0.7,
  },
};
