import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

/* ── CLOSE TRADE FORM ────────────────────────────────────── */
function CloseForm({ trade, onDone, onCancel }) {
  const [exitPrice, setExitPrice] = useState('');
  const [loading,   setLoading]   = useState(false);
  const [err,       setErr]       = useState('');

  const handleClose = async () => {
    const xp = parseFloat(exitPrice);
    if (!xp || isNaN(xp)) { setErr('Enter a valid exit price'); return; }

    setLoading(true); setErr('');

    const ep    = parseFloat(trade.entry_price);
    const isBuy = trade.direction === 'BUY';
    const pips  = isBuy ? (xp - ep) / 0.1 : (ep - xp) / 0.1;
    const pnl   = pips * (trade.lot_size * 10);
    const win   = pnl > 0;

    const { error } = await supabase
      .from('trades')
      .update({ status: 'closed', exit_price: xp, pnl_amount: pnl, is_win: win })
      .eq('id', trade.id);

    if (error) { setErr(error.message); setLoading(false); return; }
    onDone();
    setLoading(false);
  };

  return (
    <div style={{ marginTop: 12, padding: '12px 14px', background: 'var(--bg-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
      <p style={{ fontFamily: 'var(--font-data)', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 10 }}>CLOSE TRADE</p>
      <input
        type="number"
        step="0.01"
        placeholder="Exit price e.g. 2685.50"
        value={exitPrice}
        onChange={e => setExitPrice(e.target.value)}
        style={{
          width: '100%', padding: '10px 14px',
          background: 'var(--bg-3)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', color: 'var(--text)',
          fontSize: 14, fontFamily: 'var(--font-data)',
          outline: 'none', marginBottom: 8,
        }}
      />
      {err && <p style={{ fontSize: 11, color: 'var(--red)', marginBottom: 8 }}>{err}</p>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={handleClose}
          disabled={loading}
          style={{
            flex: 1, padding: '10px', background: 'var(--gold)',
            border: 'none', borderRadius: 'var(--radius)',
            color: '#000', fontSize: 12, fontWeight: 700,
            fontFamily: 'var(--font-data)', cursor: 'pointer',
          }}
        >
          {loading ? 'Closing…' : 'Confirm Close'}
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: '10px 16px', background: 'transparent',
            border: '1px solid var(--border)', borderRadius: 'var(--radius)',
            color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ── TRADE CARD ──────────────────────────────────────────── */
function TradeCard({ trade, onRefresh }) {
  const [closing, setClosing] = useState(false);

  const isClosed = trade.status === 'closed';
  const pnl      = parseFloat(trade.pnl_amount || 0);
  const pnlColor = isClosed ? (trade.is_win ? 'var(--green)' : 'var(--red)') : 'var(--gold)';
  const date     = new Date(trade.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });

  return (
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${isClosed ? 'var(--border)' : 'var(--border-gold)'}`,
      borderRadius: 'var(--radius-lg)',
      padding: '16px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Left accent bar for open trades */}
      {!isClosed && (
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: 'var(--gold)' }} />
      )}

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingLeft: !isClosed ? 8 : 0 }}>
        <div style={{ flex: 1 }}>
          {/* Direction + pair */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-data)',
              padding: '2px 8px', borderRadius: 4,
              background: trade.direction === 'BUY' ? 'var(--green-dim)' : 'var(--red-dim)',
              color: trade.direction === 'BUY' ? 'var(--green)' : 'var(--red)',
            }}>
              {trade.direction === 'BUY' ? '▲ BUY' : '▼ SELL'}
            </span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-data)' }}>
              {date}
            </span>
            {trade.session && (
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-data)' }}>
                · {trade.session}
              </span>
            )}
          </div>

          {/* Lot size + entry */}
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
            {trade.lot_size} Lots @ <span style={{ fontFamily: 'var(--font-data)' }}>${trade.entry_price}</span>
          </p>

          {/* SL / TP */}
          <div style={{ display: 'flex', gap: 12, fontSize: 11, fontFamily: 'var(--font-data)' }}>
            {trade.stop_loss_price && (
              <span style={{ color: 'var(--red)' }}>SL: ${trade.stop_loss_price}</span>
            )}
            {trade.take_profit_price && (
              <span style={{ color: 'var(--green)' }}>TP: ${trade.take_profit_price}</span>
            )}
            {trade.rrr && (
              <span style={{ color: 'var(--gold)' }}>{parseFloat(trade.rrr).toFixed(2)}R</span>
            )}
          </div>
        </div>

        {/* P&L or status */}
        <div style={{ textAlign: 'right', marginLeft: 12 }}>
          {isClosed ? (
            <>
              <p style={{ fontFamily: 'var(--font-data)', fontSize: 18, fontWeight: 700, color: pnlColor }}>
                {pnl >= 0 ? '+' : ''}${Math.abs(pnl).toFixed(2)}
              </p>
              <p style={{ fontSize: 10, color: pnlColor, fontFamily: 'var(--font-data)', fontWeight: 600 }}>
                {trade.is_win ? 'WIN' : 'LOSS'}
              </p>
              {trade.exit_price && (
                <p style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-data)', marginTop: 2 }}>
                  Exit: ${trade.exit_price}
                </p>
              )}
            </>
          ) : (
            <>
              <p style={{ fontFamily: 'var(--font-data)', fontSize: 11, fontWeight: 700, color: 'var(--gold)' }}>OPEN</p>
              {!closing && (
                <button
                  onClick={() => setClosing(true)}
                  style={{
                    marginTop: 6, padding: '5px 12px',
                    background: 'var(--gold)', border: 'none',
                    borderRadius: 'var(--radius-sm)', color: '#000',
                    fontSize: 10, fontWeight: 700, cursor: 'pointer',
                    fontFamily: 'var(--font-data)',
                  }}
                >
                  CLOSE
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Discipline score badge */}
      {trade.discipline_score != null && (
        <div style={{ marginTop: 10, paddingLeft: !isClosed ? 8 : 0 }}>
          <span style={{
            fontSize: 10, fontFamily: 'var(--font-data)', fontWeight: 600,
            color: trade.discipline_score >= 70 ? 'var(--green)' : trade.discipline_score >= 50 ? 'var(--amber)' : 'var(--red)',
          }}>
            Discipline: {trade.discipline_score}/100
          </span>
          {trade.risk_level && (
            <span style={{ fontSize: 10, fontFamily: 'var(--font-data)', color: 'var(--text-muted)', marginLeft: 10 }}>
              · Risk: {trade.risk_level.toUpperCase()}
            </span>
          )}
        </div>
      )}

      {/* Notes */}
      {trade.notes && (
        <p style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', paddingLeft: !isClosed ? 8 : 0 }}>
          "{trade.notes}"
        </p>
      )}

      {/* Close form */}
      {closing && (
        <CloseForm
          trade={trade}
          onDone={() => { setClosing(false); onRefresh(); }}
          onCancel={() => setClosing(false)}
        />
      )}
    </div>
  );
}

/* ── JOURNAL PAGE ────────────────────────────────────────── */
export default function Journal({ user }) {
  const [trades,  setTrades]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [filter,  setFilter]  = useState('all'); // all | open | closed
  const fetchedRef = useRef(false);

  const fetchTrades = useCallback(async () => {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true); setError('');
    const { data, error: err } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (err) { setError(err.message); }
    else { setTrades(data || []); }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchTrades();
    }
  }, []);

  const filtered = trades.filter(t =>
    filter === 'all'    ? true :
    filter === 'open'   ? t.status === 'open' :
    filter === 'closed' ? t.status === 'closed' : true
  );

  const openCount   = trades.filter(t => t.status === 'open').length;
  const closedCount = trades.filter(t => t.status === 'closed').length;

  return (
    <div style={{ padding: '20px 16px 110px', maxWidth: 520, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-data)', fontSize: 10, color: 'var(--gold)', letterSpacing: '0.16em' }}>TRADE JOURNAL</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800 }}>Journal</h1>
        </div>
        <button
          onClick={fetchTrades}
          disabled={loading}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-sub)', width: 36, height: 36, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <span style={loading ? { display: 'inline-block', animation: 'spin 0.8s linear infinite' } : {}}>↻</span>
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[
          { id: 'all',    label: `All (${trades.length})`   },
          { id: 'open',   label: `Open (${openCount})`      },
          { id: 'closed', label: `Closed (${closedCount})`  },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              padding: '6px 14px', borderRadius: 'var(--radius)',
              border: `1px solid ${filter === f.id ? 'var(--gold)' : 'var(--border)'}`,
              background: filter === f.id ? 'var(--gold-dim)' : 'transparent',
              color: filter === f.id ? 'var(--gold)' : 'var(--text-muted)',
              fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-data)',
              cursor: 'pointer', letterSpacing: '0.05em',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '12px 14px', background: 'var(--red-dim)', border: '1px solid rgba(255,61,87,0.3)', borderRadius: 'var(--radius)', fontSize: 13, color: 'var(--red)' }}>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 13 }}>
          Loading trades…
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📝</div>
          <p style={{ fontWeight: 600, color: 'var(--text-sub)', marginBottom: 6 }}>
            {filter === 'all' ? 'No trades logged yet' : `No ${filter} trades`}
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {filter === 'all' ? 'Log a trade from the Calculator tab to get started' : `Switch to "All" to see all trades`}
          </p>
        </div>
      )}

      {/* Trade list */}
      {!loading && filtered.map(trade => (
        <TradeCard key={trade.id} trade={trade} onRefresh={fetchTrades} />
      ))}
    </div>
  );
}
