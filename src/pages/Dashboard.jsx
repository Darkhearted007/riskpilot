import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { generateShareText, copyToClipboard } from '../lib/shareReport';
import { useRiskLive } from "../hooks/useRiskLive";

/* ── HELPERS ─────────────────────────────────────────────── */
const fmtMoney = (n) =>
  `$${Number(n || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const fmtPct = (n) => `${Number(n || 0).toFixed(1)}%`;

/* ── STAT CARD ───────────────────────────────────────────── */
function StatCard({ label, value, sub, color, icon }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px 14px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 8
      }}>
        <p style={{
          fontSize: 9,
          fontWeight: 700,
          color: 'var(--text-muted)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase'
        }}>
          {label}
        </p>
        <span>{icon}</span>
      </div>

      <p style={{
        fontSize: 20,
        fontWeight: 700,
        color: color || 'var(--text)'
      }}>
        {value}
      </p>

      {sub && (
        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {sub}
        </p>
      )}
    </div>
  );
}

/* ── MAIN DASHBOARD ──────────────────────────────────────── */
export default function Dashboard({ user, isElite }) {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);

  /* ── LIVE RISK ENGINE ───────────────────────────────── */
  const { risk, connected } = useRiskLive();

  /* ── FETCH TRADES ───────────────────────────────────── */
  const fetchTrades = useCallback(async (isRefresh = false) => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    if (isRefresh) setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;
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

  /* ── ANALYTICS ──────────────────────────────────────── */
  const closed = trades.filter(t => t.status === 'closed');
  const open = trades.filter(t => t.status === 'open');

  const wins = closed.filter(t => t.is_win);
  const losses = closed.filter(t => !t.is_win);

  const winRate = closed.length ? (wins.length / closed.length) * 100 : 0;

  const grossProfit = wins.reduce((s, t) => s + Number(t.pnl_amount || 0), 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + Number(t.pnl_amount || 0), 0));

  const netPnl = grossProfit - grossLoss;

  const profitFactor =
    grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;

  const avgRisk =
    trades.length
      ? trades.reduce((s, t) => s + Number(t.risk_percent || 0), 0) / trades.length
      : 0;

  const disciplineAvg =
    trades.length
      ? trades.reduce((s, t) => s + Number(t.discipline_score || 0), 0) / trades.length
      : 0;

  /* ── SHARE ─────────────────────────────────────────── */
  const handleShare = async () => {
    setSharing(true);

    const text = generateShareText({
      winRate: winRate.toFixed(0),
      netPnl: netPnl.toFixed(2),
      tradesCount: trades.length,
    });

    const ok = await copyToClipboard(text);

    if (ok) {
      setShared(true);
      setTimeout(() => setShared(false), 3000);
    }

    setSharing(false);
  };

  /* ── UI ─────────────────────────────────────────────── */
  return (
    <div style={{
      padding: '20px 16px 110px',
      maxWidth: 520,
      margin: '0 auto'
    }}>

      {/* HEADER */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 14
      }}>
        <div>
          <p style={{
            fontSize: 10,
            letterSpacing: '0.16em',
            color: 'var(--gold)'
          }}>
            PERFORMANCE
          </p>
          <h1>Dashboard</h1>
        </div>

        <button onClick={handleShare}>
          {shared ? '✓ COPIED' : 'SHARE'}
        </button>
      </div>

      {/* ── LIVE RISK ENGINE PANEL ───────────────────── */}
      {risk && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 14,
          marginBottom: 14
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 8
          }}>
            <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>
              LIVE RISK ENGINE
            </p>

            <span style={{
              fontSize: 10,
              color: connected ? 'green' : 'red'
            }}>
              {connected ? '🟢 LIVE' : '🔴 OFFLINE'}
            </span>
          </div>

          <h2>Score: {risk.score}</h2>

          <p style={{
            color:
              risk.state === 'DANGEROUS'
                ? 'red'
                : risk.state === 'UNSTABLE'
                ? 'orange'
                : 'green'
          }}>
            {risk.state}
          </p>

          {risk.alerts?.length > 0 && (
            <ul>
              {risk.alerts.map((a, i) => (
                <li key={i}>⚠ {a}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* LOADING */}
      {loading && <p>Loading...</p>}

      {/* ERROR */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* STATS */}
      {!loading && trades.length > 0 && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <StatCard label="Trades" value={trades.length} icon="📊" />
            <StatCard label="Win Rate" value={fmtPct(winRate)} icon="🎯" />
            <StatCard label="Net PnL" value={fmtMoney(netPnl)} icon="💰" />
            <StatCard label="Risk Avg" value={fmtPct(avgRisk)} icon="🛡" />
          </div>

          <div style={{ marginTop: 20 }}>
            <StatCard
              label="Discipline"
              value={Math.round(disciplineAvg)}
              icon="🧠"
            />
          </div>
        </>
      )}
    </div>
  );
}
