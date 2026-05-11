import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase }           from '../lib/supabaseClient';
import { calculateGoldLotSize, getTradeWarnings, XAUUSD_POINT } from '../lib/riskEngine';
import { getSessionInfo }     from '../lib/sessionDetector';
import RiskAlert              from '../components/RiskAlert';
import { RRRDisplay }         from '../components/calculator/RRRDisplay';
import { BreakEvenDisplay }   from '../components/calculator/BreakEvenDisplay';
import { DisciplineMeter }    from '../components/calculator/DisciplineMeter';
import { calculateRRR, calculateBreakEven, pipDistance } from '../lib/calculations';
import { calculateDisciplineScore } from '../lib/discipline';

/* ── CONSTANTS ───────────────────────────────────────────── */
const LEVEL_STYLE = {
  safe:       { color:'var(--green)', bg:'var(--green-dim)', border:'rgba(0,230,118,0.2)',  label:'SAFE',     icon:'🛡' },
  aggressive: { color:'var(--amber)', bg:'var(--amber-dim)', border:'rgba(255,179,0,0.2)',  label:'MODERATE', icon:'⚠' },
  danger:     { color:'var(--red)',   bg:'var(--red-dim)',   border:'rgba(255,61,87,0.2)',   label:'DANGER',   icon:'🚨' },
};

const SETUP_TYPES = ['Retest', 'Breakout', 'Reversal', 'Trend Follow', 'Range', 'News Play', 'Scalp'];
const EMOTIONS    = ['Calm', 'Confident', 'Anxious', 'Revenge', 'FOMO', 'Bored', 'Focused'];

const fmt = (n, d=2) => isNaN(n)||!isFinite(n) ? '—' : Number(n).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});

function priceToPips(dist) { return Math.abs(dist) / XAUUSD_POINT; }

/* ── SUB COMPONENTS ──────────────────────────────────────── */
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
  return (
    <div>
      <FieldLabel hint={hint}>{label}</FieldLabel>
      <div style={{ position:'relative' }}>
        <input
          type="number" value={value} step="0.01" placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width:'100%', background:'var(--bg-3)',
            border:`1px solid ${focused ? (accent||'var(--gold)') : value ? 'var(--border-high)' : 'var(--border)'}`,
            borderRadius:'var(--radius)', padding:'12px 14px 12px 40px',
            color:'var(--text)', fontSize:15, fontFamily:'var(--font-data)',
            fontWeight:600, outline:'none', transition:'all 0.2s',
            boxShadow: focused ? `0 0 0 3px ${accent||'var(--gold-dim)'}` : 'none',
          }}
        />
        <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:12, color: value ? (accent||'var(--gold)') : 'var(--text-muted)', fontFamily:'var(--font-data)', fontWeight:700 }}>$</span>
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
          type="number" value={value} step={step} min={min} max={max} placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width:'100%', background:'var(--bg-3)',
            border:`1px solid ${focused?'var(--gold)':'var(--border)'}`,
            borderRadius:'var(--radius)', padding:`12px ${suffix?'40px':14}px 12px 14px`,
            color:'var(--text)', fontSize:15, fontFamily:'var(--font-data)',
            fontWeight:600, outline:'none', transition:'all 0.2s',
            boxShadow: focused ? '0 0 0 3px var(--gold-dim)' : 'none',
          }}
        />
        {suffix && <span style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', fontSize:11, color:'var(--text-muted)', fontFamily:'var(--font-data)' }}>{suffix}</span>}
      </div>
    </div>
  );
}

function SelectInput({ value, onChange, options, label, icon }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div style={{ position:'relative' }}>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            width:'100%', background:'var(--bg-3)',
            border:'1px solid var(--border)',
            borderRadius:'var(--radius)', padding:'12px 36px 12px 14px',
            color:'var(--text)', fontSize:13, fontFamily:'var(--font-data)',
            fontWeight:600, outline:'none', appearance:'none', cursor:'pointer',
          }}
        >
          {options.map(o => <option key={o} value={o}>{icon ? `${icon} ` : ''}{o}</option>)}
        </select>
        <span style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', fontSize:10, color:'var(--text-muted)', pointerEvents:'none' }}>▼</span>
      </div>
    </div>
  );
}

function DirectionToggle({ value, onChange }) {
  return (
    <div>
      <FieldLabel>Direction</FieldLabel>
      <div style={{ display:'flex', gap:8 }}>
        {['BUY','SELL'].map(dir => {
          const active = value === dir;
          const color  = dir === 'BUY' ? 'var(--green)' : 'var(--red)';
          return (
            <button key={dir} onClick={() => onChange(dir)} style={{
              flex:1, padding:'12px', borderRadius:'var(--radius)',
              border:`1px solid ${active ? color : 'var(--border)'}`,
              background: active ? (dir==='BUY'?'var(--green-dim)':'var(--red-dim)') : 'var(--bg-3)',
              color: active ? color : 'var(--text-muted)',
              fontSize:13, fontWeight:700, cursor:'pointer',
              fontFamily:'var(--font-data)', letterSpacing:'0.08em', transition:'all 0.2s',
            }}>
              {dir === 'BUY' ? '▲ BUY' : '▼ SELL'}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── MAIN CALCULATOR ─────────────────────────────────────── */
export default function Calculator({ user, isGold, onUpgrade }) {
  const [balance,   setBalance]   = useState('');
  const [riskPct,   setRiskPct]   = useState('1');
  const [entry,     setEntry]     = useState('');
  const [sl,        setSl]        = useState('');
  const [tp,        setTp]        = useState('');
  const [direction, setDirection] = useState('BUY');
  const [setupType, setSetupType] = useState('Retest');
  const [emotion,   setEmotion]   = useState('Calm');
  const [notes,     setNotes]     = useState('');
  const [session,   setSession]   = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    const update = () => setSession(getSessionInfo());
    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, []);

  /* ── LOT SIZE CALCULATION ────────────────────────────── */
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
      const rrrVal = tpPips > 0 ? tpPips / slPips : 0;
      const calcResult = calculateGoldLotSize(b, r, slPips);
      const traps      = getTradeWarnings(r, slPips);
      const riskAmt    = b * (r / 100);
      return {
        result: calcResult,
        warnings: traps,
        derived: {
          slDist, slPips, tpPips,
          rrr:       rrrVal > 0 ? rrrVal : null,
          potProfit: tpPips > 0 ? riskAmt * rrrVal : null,
          slValid, tpValid,
        }
      };
    }
    return {
      result: null, warnings: [],
      derived: entP > 0 && slP > 0 && !slValid ? { slError: true, isBuy: direction === 'BUY' } : null
    };
  }, [balance, riskPct, entry, sl, tp, direction]);

  /* ── RRR / DISCIPLINE ────────────────────────────────── */
  const rrr       = calculateRRR(entry, sl, tp, direction);
  const breakEven = calculateBreakEven(rrr);
  const slDist    = pipDistance(entry, sl);
  const disc      = rrr != null
    ? calculateDisciplineScore(rrr, slDist)
    : { score: null, rating: null, breakdown: null };

  /* ── SAVE TRADE ──────────────────────────────────────── */
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
      direction,
      entry_price:       parseFloat(entry),
      stop_loss_price:   parseFloat(sl),
      take_profit_price: tp ? parseFloat(tp) : null,
      setup_type:        setupType,
      emotion,
      notes:             notes.trim() || null,
      status:            'open',
      rrr:               derived?.rrr ?? null,
      discipline_score:  disc.score,
    });
    if (error) {
      console.error('[Calculator] Save error:', error);
      setSaveError('Failed to save: ' + error.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      setEntry(''); setSl(''); setTp(''); setNotes('');
    }
    setSaving(false);
  }, [user.id, balance, riskPct, session, result, notes, direction, entry, sl, tp, setupType, emotion, saving, derived, disc]);

  const levelStyle = result ? LEVEL_STYLE[result.riskLevel] : null;
  const riskAmount = balance && riskPct ? parseFloat(balance) * (parseFloat(riskPct)/100) : 0;
  const showAnalysis = entry || sl || tp;

  return (
    <div style={S.page} className="fade-up">

      {/* Upgrade banner */}
      {!isGold && (
        <div style={{ background:'var(--gold-dim)', border:'1px solid var(--border-gold)', borderRadius:'var(--radius)', padding:'12px 16px', display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:18 }}>🚀</span>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:11, fontWeight:700, color:'var(--gold)', fontFamily:'var(--font-data)' }}>UPGRADE TO PRO</p>
            <p style={{ fontSize:10, color:'var(--text-sub)', marginTop:2 }}>Unlock full journal, analytics and equity tracking.</p>
          </div>
          <button onClick={onUpgrade} style={{ background:'var(--gold)', border:'none', borderRadius:'var(--radius-sm)', padding:'6px 12px', color:'#000', fontSize:10, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-data)', whiteSpace:'nowrap' }}>
            UPGRADE
          </button>
        </div>
      )}

      {/* Top bar — pair + session */}
      <div style={S.topBar}>
        <div>
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

      {/* Account parameters */}
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

      {/* Trade setup */}
      <div style={S.card}>
        <p style={S.cardLabel}>TRADE SETUP</p>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <DirectionToggle value={direction} onChange={setDirection} />
          <PriceInput label="Entry Price"  value={entry} onChange={setEntry} placeholder="2650.00" accent="var(--gold)" />
          <PriceInput label="Stop Loss"    value={sl}    onChange={setSl}    placeholder="2630.00" accent="var(--red)" />
          <PriceInput label="Take Profit"  value={tp}    onChange={setTp}    placeholder="2690.00" accent="var(--green)" />
          {derived?.slError && (
            <div style={{ padding:'10px 12px', background:'var(--red-dim)', border:'1px solid rgba(255,61,87,0.3)', borderRadius:'var(--radius)', fontSize:12, color:'var(--red)', fontWeight:500 }}>
              ⚠ Invalid Stop Loss for {direction} trade
            </div>
          )}
        </div>
      </div>

      {/* Trade metadata */}
      <div style={S.card}>
        <p style={S.cardLabel}>TRADE METADATA</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <SelectInput label="Setup Type" value={setupType} onChange={setSetupType} options={SETUP_TYPES} />
          <SelectInput label="Emotion"    value={emotion}   onChange={setEmotion}   options={EMOTIONS} />
        </div>
        <div style={{ marginTop:12 }}>
          <FieldLabel>Notes (optional)</FieldLabel>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Setup reasoning, confluences, market context…"
            rows={2}
            style={{
              width:'100%', background:'var(--bg-3)', border:'1px solid var(--border)',
              borderRadius:'var(--radius)', padding:'11px 14px', color:'var(--text)',
              fontSize:13, fontFamily:'var(--font-body)', outline:'none', resize:'none',
              lineHeight:1.5,
            }}
          />
        </div>
      </div>

      {/* Risk alerts */}
      <RiskAlert warnings={warnings} />

      {/* Result — lot size */}
      {result && result.isValid ? (
        <div className="fade-up" style={{ ...S.resultCard, borderColor: levelStyle.border, background:`linear-gradient(135deg, var(--surface) 0%, ${levelStyle.bg} 100%)` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <p style={S.cardLabel}>POSITION SIZE</p>
            <div style={{ padding:'4px 12px', borderRadius:20, fontSize:10, fontWeight:700, fontFamily:'var(--font-data)', background:levelStyle.bg, color:levelStyle.color }}>
              {levelStyle.icon} {levelStyle.label}
            </div>
          </div>

          {/* Lot size */}
          <div style={{ textAlign:'center', padding:'16px 0 12px', borderBottom:'1px solid var(--border)' }}>
            <div style={{ display:'flex', alignItems:'baseline', justifyContent:'center', gap:8 }}>
              <span style={{ fontFamily:'var(--font-display)', fontSize:64, fontWeight:800, color:levelStyle.color, filter:`drop-shadow(0 0 20px ${levelStyle.color}44)` }}>
                {result.lotSize}
              </span>
              <span style={{ fontSize:14, fontWeight:700, color:'var(--text-muted)' }}>LOTS</span>
            </div>
          </div>

          {/* Trade stats row */}
          {derived && (
            <div style={{ display:'flex', gap:8, marginTop:14, marginBottom:4 }}>
              <div style={S.chip}>
                <p style={S.chipLabel}>SL PIPS</p>
                <p style={{ ...S.chipVal, color:'var(--red)' }}>{fmt(derived.slPips, 1)}</p>
              </div>
              {derived.tpPips > 0 && (
                <div style={S.chip}>
                  <p style={S.chipLabel}>TP PIPS</p>
                  <p style={{ ...S.chipVal, color:'var(--green)' }}>{fmt(derived.tpPips, 1)}</p>
                </div>
              )}
              {derived.rrr && (
                <div style={S.chip}>
                  <p style={S.chipLabel}>RRR</p>
                  <p style={{ ...S.chipVal, color:'var(--gold)' }}>{derived.rrr.toFixed(2)}R</p>
                </div>
              )}
              {derived.potProfit && (
                <div style={S.chip}>
                  <p style={S.chipLabel}>POT. PROFIT</p>
                  <p style={{ ...S.chipVal, color:'var(--green)' }}>${fmt(derived.potProfit)}</p>
                </div>
              )}
            </div>
          )}

          {/* Log button */}
          <button
            onClick={handleSave}
            disabled={saving || saved}
            style={{
              marginTop:12, width:'100%', padding:14, borderRadius:'var(--radius)',
              background: saved ? 'var(--green-dim)' : 'var(--gold)',
              color: saved ? 'var(--green)' : '#080600',
              fontSize:13, fontWeight:700, cursor: saving||saved ? 'not-allowed' : 'pointer',
              fontFamily:'var(--font-data)', letterSpacing:'0.08em', transition:'all 0.3s',
              border: saved ? '1px solid var(--green)' : 'none',
            }}
          >
            {saving ? 'SAVING…' : saved ? '✓ TRADE LOGGED' : 'LOG THIS TRADE →'}
          </button>
          {saveError && (
            <p style={{ color:'var(--red)', fontSize:11, textAlign:'center', marginTop:10, fontWeight:600 }}>{saveError}</p>
          )}
        </div>
      ) : (
        <div style={S.emptyState}>
          <div style={{ fontSize:40, color:'var(--gold)', marginBottom:8 }}>◈</div>
          <p style={{ fontSize:15, fontWeight:600, color:'var(--text-sub)' }}>Enter trade parameters above</p>
          <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:6 }}>Balance, risk %, entry, and stop loss required</p>
        </div>
      )}

      {/* RRR + Break-even + Discipline */}
      {showAnalysis && (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <div style={S.card}>
            <RRRDisplay rrr={rrr} />
          </div>
          <BreakEvenDisplay rrr={rrr} breakEven={breakEven} />
          <DisciplineMeter score={disc.score} rating={disc.rating} breakdown={disc.breakdown} />
        </div>
      )}

    </div>
  );
}

/* ── STYLES ──────────────────────────────────────────────── */
const S = {
  page:        { padding:'16px 16px 110px', display:'flex', flexDirection:'column', gap:14, maxWidth:520, margin:'0 auto' },
  topBar:      { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', background:'var(--surface)', borderRadius:'var(--radius-lg)', border:'1px solid var(--border-gold)' },
  pairName:    { fontFamily:'var(--font-display)', fontSize:20, fontWeight:700, color:'var(--gold)', display:'block' },
  pairSub:     { fontFamily:'var(--font-data)', fontSize:10, color:'var(--text-muted)', display:'block' },
  sessionChip: { display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:'var(--radius)', border:'1px solid', background:'var(--surface-high)' },
  card:        { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'16px' },
  cardLabel:   { fontFamily:'var(--font-data)', fontSize:10, fontWeight:600, color:'var(--text-muted)', letterSpacing:'0.14em', marginBottom:14 },
  resultCard:  { borderRadius:'var(--radius-lg)', border:'1px solid', padding:'16px' },
  emptyState:  { display:'flex', flexDirection:'column', alignItems:'center', padding:'36px 20px', background:'var(--surface)', borderRadius:'var(--radius-lg)', border:'1px solid var(--border)', textAlign:'center' },
  chip:        { flex:1, background:'var(--surface-top)', borderRadius:'var(--radius)', padding:'8px 10px', textAlign:'center' },
  chipLabel:   { fontFamily:'var(--font-data)', fontSize:8, color:'var(--text-muted)', letterSpacing:'0.1em', marginBottom:4 },
  chipVal:     { fontFamily:'var(--font-data)', fontSize:13, fontWeight:700 },
};
