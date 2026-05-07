import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { generateShareText, copyToClipboard } from '../lib/shareReport';

/* ── HELPERS ─────────────────────────────────────────────── */
const fmtMoney = (n) => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtPct   = (n) => `${Number(n || 0).toFixed(1)}%`;

/* ── STAT CARD ───────────────────────────────────────────── */
function StatCard({ label, value, sub, color, icon }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <p style={{ fontFamily: 'var(--font-data)', fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{label}</p>
        <span style={{ fontSize: 16 }}>{icon}</span>
      </div>
      <p style={{ fontFamily: 'var(--font-data)', fontSize: 20, fontWeight: 700, color: color || 'var(--text)', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</p>}
    </div>
  );
}

/* ── EQUITY CURVE ────────────────────────────────────────── */
function EquityCurve({ trades }) {
  if (trades.length < 2) return null;

  const points = [...trades].reverse().reduce((acc, t) => {
    const prev = acc.length > 0 ? acc[acc.length - 1] : 0;
    acc.push(prev + parseFloat(t.pnl_amount || 0));
    return acc;
  }, []);

  const min = Math.min(0, ...points);
  const max = Math.max(0.1, ...points);
  const range = max - min || 1;
  const W = 100, H = 50;

  const svgPoints = points.map((p, i) => {
    const x = (i / Math.max(points.length - 1, 1)) * W;
    const y = H - ((p - min) / range) * H;
    return `${x},${y}`;
  }).join(' ');

  const lastVal   = points[points.length - 1];
  const lineColor = lastVal >= 0 ? 'var(--green)' : 'var(--red)';
  const zeroY     = H - ((0 - min) / range) * H;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <p style={{ fontFamily: 'var(--font-data)', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.14em' }}>EQUITY CURVE</p>
        <p style={{ fontFamily: 'var(--font-data)', fontSize: 13, fontWeight: 700, color: lineColor }}>{fmtMoney(lastVal)}</p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: 80, overflow: 'visible' }}>
        <defs>
          <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1="0" y1={zeroY} x2={W} y2={zeroY} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2,2" />
        <polygon points={`0,${H} ${svgPoints} ${W},${H}`} fill="url(#eqGrad)" />
        <polyline points={svgPoints} fill="none" stroke={lineColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/* ── SESSION BAR ─────────────────────────────────────────── */
function SessionBar({ label, icon, color, count, winRate, pct }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: 'var(--text-sub)' }}>{icon} {label}</span>
        <span style={{ fontFamily: 'var(--font-data)', fontSize: 11, color }}>{count}T · {winRate}% WR</span>
      </div>
      <div style={{ height: 4, background: 'var(--surface-top)', borderRadius: 4 }}>
        <div style={{ height: '100%', background: color, borderRadius: 4, width: `${pct}%`, transition: 'width 0.8s' }} />
      </div>
    </div>
  );
}

/* ── TRADE ROW ───────────────────────────────────────────── */
function TradeRow({ trade }) {
  const pnl      = parseFloat(trade.pnl_amount || 0);
  const isClosed = trade.status === 'closed';
  const color    = isClosed ? (trade.is_win ? 'var(--green)' : 'var(--red)') : 'var(--gold)';
  const date     = new Date(trade.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-data)',
          padding: '2px 8px', borderRadius: 4,
          background: trade.direction === 'BUY' ? 'var(--green-dim)' : 'var(--red-dim)',
          color: trade.direction === 'BUY' ? 'var(--green)' : 'var(--red)',
        }}>
          {trade.direction}
        </div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>
            {trade.lot_size} lots @ ${trade.entry_price}
          </p>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-data)' }}>
            {date} · {trade.setup_type || 'XAUUSD'} · {trade.session || '—'}
          </p>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <p style={{ fontFamily: 'var(--font-data)', fontSize: 13, fontWeight: 700, color }}>
          {isClosed ? `${pnl >= 0 ? '+' : ''}${fmtMoney(pnl)}` : 'OPEN'}
        </p>
        {trade.risk_percent && (
          <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{trade.risk_percent}% risk</p>
        )}
      </div>
    </div>
  );
}

/* ── MAIN DASHBOARD ──────────────────────────────────────── */
export default function Dashboard({ user, isElite }) {
  const [trades,  setTrades]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [sharing, setSharing] = useState(false);
  const [shared,  setShared]  = useState(false);

  /* ── FETCH ───────────────────────────────────────────── */
  const fetchTrades = useCallback(async (isRefresh = false) => {
    if (!user?.id) { setLoading(false); return; }
    if (isRefresh) setLoading(true);
    setError('');
    try {
      const { data, error: err } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(200);
      if (err) throw err;
      setTrades(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  /* ── ANALYTICS ───────────────────────────────────────── */
  const closed        = trades.filter(t => t.status === 'closed');
  const open          = trades.filter(t => t.status === 'open');
  const wins          = closed.filter(t => t.is_win);
  const losses        = closed.filter(t => !t.is_win);
  const winRate       = closed.length ? (wins.length / closed.length) * 100 : 0;
  const grossProfit   = wins.reduce((s, t) => s + parseFloat(t.pnl_amount || 0), 0);
  const grossLoss     = Math.abs(losses.reduce((s, t) => s + parseFloat(t.pnl_amount || 0), 0));
  const netPnl        = grossProfit - grossLoss;
  const profitFactor  = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;
  const avgWin        = wins.length ? grossProfit / wins.length : 0;
  const avgLoss       = losses.length ? grossLoss / losses.length : 0;
  const avgRRR        = closed.filter(t => t.rrr).length
    ? closed.filter(t => t.rrr).reduce((s, t) => s + parseFloat(t.rrr), 0) / closed.filter(t => t.rrr).length
    : 0;
  const avgRisk       = trades.length
    ? trades.reduce((s, t) => s + parseFloat(t.risk_percent || 0), 0) / trades.length
    : 0;
  const expectancy    = closed.length
    ? (winRate / 100) * avgWin - (1 - winRate / 100) * avgLoss
    : 0;
  const maxDrawdown   = (() => {
    let peak = 0, dd = 0, cum = 0;
    [...closed].reverse().forEach(t => {
      cum += parseFloat(t.pnl_amount || 0);
      if (cum > peak) peak = cum;
      const d = peak - cum;
      if (d > dd) dd = d;
    });
    return dd;
  })();
  const disciplineAvg = trades.filter(t => t.discipline_score).length
    ? trades.filter(t => t.discipline_score).reduce((s, t) => s + t.discipline_score, 0) / trades.filter(t => t.discipline_score).length
    : 0;
  const discColor     = disciplineAvg >= 70 ? 'var(--green)' : disciplineAvg >= 50 ? 'var(--amber)' : 'var(--red)';
  const discGrade     = disciplineAvg >= 80 ? 'Excellent' : disciplineAvg >= 60 ? 'Good' : disciplineAvg >= 40 ? 'Average' : 'Poor';

  const sessionData = [
    { key: 'London',   icon: '🇬🇧', color: 'var(--amber)' },
    { key: 'New York', icon: '🗽',  color: 'var(--red)'   },
    { key: 'Asia',     icon: '🌏',  color: 'var(--blue)'  },
  ].map(s => {
    const st = trades.filter(t => t.session === s.key);
    const sc = closed.filter(t => t.session === s.key);
    const sw = sc.filter(t => t.is_win);
    return {
      ...s,
      count:   st.length,
      winRate: sc.length ? Math.round(sw.length / sc.length * 100) : 0,
      pct:     trades.length ? (st.length / trades.length) * 100 : 0,
    };
  });

  /* ── SHARE ───────────────────────────────────────────── */
  const handleShare = async () => {
    setSharing(true);
    const text = generateShareText({ winRate: winRate.toFixed(0), disciplineGrade: discGrade, netPnl: netPnl.toFixed(2), tradesCount: trades.length });
    const ok = await copyToClipboard(text);
    if (ok) { setShared(true); setTimeout(() => setShared(false), 3000); }
    setSharing(false);
  };

  /* ── RENDER ──────────────────────────────────────────── */
  return (
    <div style={{ padding: '20px 16px 110px', display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 520, margin: '0 auto' }} className="fade-up">

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-data)', fontSize: 10, color: 'var(--gold)', letterSpacing: '0.16em' }}>PERFORMANCE</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, lineHeight: 1.1 }}>Dashboard</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleShare}
            disabled={sharing || !trades.length}
            style={{ background: 'var(--gold-dim)', border: '1px solid var(--border-gold)', borderRadius: 'var(--radius)', color: 'var(--gold)', padding: '8px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-data)' }}
          >
            {shared ? '✓ COPIED' : '📤 SHARE'}
          </button>
          <button
            onClick={() => fetchTrades(true)}
            disabled={loading}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-sub)', width: 36, height: 36, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <span style={loading ? { display: 'inline-block', animation: 'spin 0.8s linear infinite' } : {}}>↻</span>
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '12px 14px', background: 'var(--red-dim)', border: '1px solid rgba(255,61,87,0.3)', borderRadius: 'var(--radius)', fontSize: 13, color: 'var(--red)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{error}</span>
          <button onClick={() => fetchTrades(true)} style={{ background: 'none', border: '1px solid var(--red)', borderRadius: 4, color: 'var(--red)', fontSize: 11, padding: '3px 10px', cursor: 'pointer' }}>Retry</button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: 24, color: 'var(--gold)', animation: 'spin 1s linear infinite', display: 'inline-block' }}>◈</div>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 12 }}>Loading analytics…</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && trades.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>◈</div>
          <p style={{ fontWeight: 600, color: 'var(--text-sub)' }}>No trades yet</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>Log your first trade from the Calculator tab</p>
        </div>
      )}

      {/* Content */}
      {!loading && trades.length > 0 && (
        <>
          {/* PRIMARY STATS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <StatCard label="Total Trades"  value={trades.length}         sub={`${open.length} open · ${closed.length} closed`}  icon="📋" />
            <StatCard label="Win Rate"      value={fmtPct(winRate)}       sub={`${wins.length}W · ${losses.length}L`}             icon="🎯" color={winRate >= 50 ? 'var(--green)' : winRate >= 40 ? 'var(--amber)' : 'var(--red)'} />
            <StatCard label="Net P/L"       value={fmtMoney(netPnl)}      sub="All closed trades"                                 icon="💰" color={netPnl >= 0 ? 'var(--green)' : 'var(--red)'} />
            <StatCard label="Profit Factor" value={profitFactor >= 999 ? 'MAX' : profitFactor.toFixed(2)} sub={profitFactor >= 1.5 ? 'Excellent' : profitFactor >= 1 ? 'Profitable' : 'Needs work'} icon="💹" color={profitFactor >= 1.5 ? 'var(--green)' : profitFactor >= 1 ? 'var(--amber)' : 'var(--red)'} />
          </div>

          {/* SECONDARY STATS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <StatCard label="Avg RRR"    value={avgRRR ? avgRRR.toFixed(2) + 'R' : '—'} sub={avgRRR >= 2 ? 'Good ratio' : 'Needs improvement'} icon="⚖️" color={avgRRR >= 2 ? 'var(--green)' : 'var(--amber)'} />
            <StatCard label="Expectancy" value={fmtMoney(expectancy)}  sub="Per trade avg"            icon="📈" color={expectancy >= 0 ? 'var(--green)' : 'var(--red)'} />
            <StatCard label="Avg Win"    value={fmtMoney(avgWin)}      sub={`${wins.length} wins`}    icon="✅" color="var(--green)" />
            <StatCard label="Avg Loss"   value={fmtMoney(avgLoss)}     sub={`${losses.length} losses`} icon="❌" color="var(--red)" />
          </div>

          {/* DISCIPLINE + RISK */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <StatCard label="Discipline"   value={disciplineAvg ? Math.round(disciplineAvg) : '—'} sub={discGrade}                                            icon="🧠" color={discColor} />
            <StatCard label="Avg Risk %"   value={fmtPct(avgRisk)}       sub={avgRisk > 2 ? 'High — review' : 'Controlled'}                                  icon="🛡" color={avgRisk <= 1 ? 'var(--green)' : avgRisk <= 2 ? 'var(--amber)' : 'var(--red)'} />
            <StatCard label="Max Drawdown" value={fmtMoney(maxDrawdown)}  sub="Peak-to-trough"                                                                icon="📉" color="var(--red)" />
            <StatCard label="Open Trades"  value={open.length}            sub={open.length > 3 ? 'Watch exposure' : 'Controlled'}                             icon="⏳" color={open.length > 3 ? 'var(--amber)' : 'var(--text)'} />
          </div>

          {/* EQUITY CURVE */}
          {closed.length >= 2 && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '18px 16px' }}>
              <EquityCurve trades={closed} />
            </div>
          )}

          {/* SESSION ANALYTICS */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '18px 16px', position: 'relative', overflow: 'hidden' }}>
            {!isElite && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(13,17,23,0.88)', backdropFilter: 'blur(6px)', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 20 }}>
                <span style={{ fontSize: 24 }}>🔒</span>
                <p style={{ fontFamily: 'var(--font-data)', fontSize: 10, fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.1em' }}>ELITE FEATURE</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>Upgrade to Elite to unlock session analytics</p>
              </div>
            )}
            <p style={{ fontFamily: 'var(--font-data)', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.14em', marginBottom: 14 }}>SESSION ANALYTICS</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {sessionData.map(s => (
                <SessionBar key={s.key} label={s.key} icon={s.icon} color={s.color} count={s.count} winRate={s.winRate} pct={s.pct} />
              ))}
            </div>
          </div>

          {/* RECENT TRADES */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '18px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <p style={{ fontFamily: 'var(--font-data)', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.14em' }}>RECENT TRADES</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{trades.length} total</p>
            </div>
            {trades.slice(0, 15).map(t => <TradeRow key={t.id} trade={t} />)}
          </div>
        </>
      )}
    </div>
  );
}
