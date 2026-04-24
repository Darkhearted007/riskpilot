import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

function TradeCard({ trade, onRefresh }) {
  const [closing, setClosing] = useState(false);
  const [exitPrice, setExitPrice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClose = async () => {
    if (!exitPrice || isNaN(exitPrice)) return;
    setLoading(true);
    
    // XAUUSD Profit Calc: (Exit - Entry) / 0.1 * (LotSize * 1)
    // Paystack/Supabase Note: Smallest movement is 0.1 (1 pip). 1 slot = $1 per 0.1 move.
    const ep = parseFloat(trade.entry_price);
    const xp = parseFloat(exitPrice);
    const isBuy = trade.direction === 'BUY';
    const pips = isBuy ? (xp - ep) / 0.1 : (ep - xp) / 0.1;
    const pnl = pips * (trade.lot_size * 10); // Matches XAUUSD_PIP_VALUE = 10
    const win = pnl > 0;

    const { error } = await supabase
      .from('trades')
      .update({
        status: 'closed',
        exit_price: xp,
        pnl_amount: pnl,
        is_win: win
      })
      .eq('id', trade.id);

    if (!error) {
      setClosing(false);
      onRefresh();
    }
    setLoading(false);
  };

  const isClosed = trade.status === 'closed';
  const color = isClosed ? (trade.is_win ? 'var(--green)' : 'var(--red)') : 'var(--gold)';

  return (
    <div style={{ background:'var(--surface)', border:`1px solid ${isClosed ? 'var(--border)' : 'var(--gold-dim)'}`, borderRadius:'var(--radius-lg)', padding:16, position:'relative', overflow:'hidden' }}>
      {!isClosed && <div style={{ position:'absolute', top:0, left:0, width:3, height:'100%', background:'var(--gold)' }} />}
      
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:4, background: trade.direction === 'BUY' ? 'var(--green-dim)' : 'var(--red-dim)', color: trade.direction === 'BUY' ? 'var(--green)' : 'var(--red)' }}>
              {trade.direction === 'BUY' ? '▲ BUY' : '▼ SELL'}
            </span>
            <span className="font-data" style={{ fontSize:12, color:'var(--text-muted)' }}>{new Date(trade.created_at).toLocaleDateString()}</span>
          </div>
          <h3 className="font-display" style={{ fontSize:18, fontWeight:700, color:'var(--text)' }}>
            {trade.lot_size} Lots @ <span className="font-data">${trade.entry_price}</span>
          </h3>
        </div>
        {!isClosed && !closing && (
          <button onClick={() => setClosing(true)} style={{ background:'var(--gold)', border:'none', borderRadius:'var(--radius-sm)', padding:'6px 12px', fontSize:11, fontWeight:700, cursor:'pointer', color:'#000' }}>CLOSE</button>
        )}
        {isClosed && (
          <div style={{ textAlign:'right' }}>
            <p style={{ fontSize:10, color:'var(--text-muted)', marginBottom:2 }}>OUTCOME</p>
            <p className="font-data" style={{ fontSize:18, fontWeight:700, color }}>{trade.pnl_amount > 0 ? '+' : ''}${Number(trade.pnl_amount || 0).toFixed(2)}</p>
          </div>
        )}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
        <div style={{ background:'var(--surface-top)', padding:'8px 10px', borderRadius:6 }}>
          <p style={{ fontSize:9, color:'var(--text-muted)', marginBottom:2 }}>SETUP</p>
          <p style={{ fontSize:12, fontWeight:600, color:'var(--text-sub)' }}>🎯 {trade.setup_type || 'N/A'}</p>
        </div>
        <div style={{ background:'var(--surface-top)', padding:'8px 10px', borderRadius:6 }}>
          <p style={{ fontSize:9, color:'var(--text-muted)', marginBottom:2 }}>EMOTION</p>
          <p style={{ fontSize:12, fontWeight:600, color:'var(--text-sub)' }}>🧠 {trade.emotion || 'N/A'}</p>
        </div>
      </div>

      {trade.notes && <p style={{ fontSize:12, color:'var(--text-muted)', fontStyle:'italic', marginBottom:12, borderLeft:'2px solid var(--border)', paddingLeft:8 }}>"{trade.notes}"</p>}

      {closing && (
        <div style={{ marginTop:16, paddingTop:16, borderTop:'1px solid var(--border)', display:'flex', flexDirection:'column', gap:10 }}>
          <div style={{ display:'flex', gap:10 }}>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:10, color:'var(--text-muted)', marginBottom:4 }}>EXIT PRICE</p>
              <input 
                type="number" 
                value={exitPrice} 
                onChange={e => setExitPrice(e.target.value)} 
                placeholder="2675.50"
                style={{ width:'100%', background:'var(--bg-3)', border:'1px solid var(--gold)', borderRadius:6, padding:'10px', color:'var(--text)', fontSize:14, fontFamily:'var(--font-data)', outline:'none' }}
              />
            </div>
            <div style={{ display:'flex', alignItems:'flex-end', gap:6 }}>
              <button onClick={() => setClosing(false)} style={{ background:'var(--surface-top)', border:'1px solid var(--border)', borderRadius:6, padding:'10px 14px', fontSize:11, color:'var(--text-muted)', cursor:'pointer' }}>Cancel</button>
              <button 
                onClick={handleClose} 
                disabled={loading || !exitPrice}
                style={{ background:'var(--gold)', border:'none', borderRadius:6, padding:'10px 16px', fontSize:11, fontWeight:700, color:'#000', cursor:'pointer', flex:1 }}
              >
                {loading ? '...' : 'CONFIRM CLOSE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Journal({ user, isGold }) {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTrades = useCallback(async () => {
    setLoading(true);
    setError('');
    const { data, error: err } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .order('status', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (err) {
      console.error('Journal fetch error:', err);
      setError('Could not sync journal. Check your connection.');
    } else {
      setTrades(data || []);
    }
    setLoading(false);
  }, [user.id]);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  const openTrades = trades.filter(t => t.status === 'open');
  const closedTrades = trades.filter(t => t.status === 'closed');

  return (
    <div style={{ padding:'20px 16px 110px', display:'flex', flexDirection:'column', gap:16, maxWidth:520, margin:'0 auto' }} className="fade-up">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <p style={{ fontFamily:'var(--font-data)', fontSize:10, color:'var(--gold)', letterSpacing:'0.16em', marginBottom:4 }}>PORTFOLIO</p>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:700, lineHeight:1.1 }}>Trade Journal</h1>
        </div>
        <button onClick={fetchTrades} disabled={loading} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', color:'var(--text-sub)', width:36, height:36, cursor:'pointer' }}>
          <span style={loading?{display:'inline-block',animation:'spin 0.8s linear infinite'}:{}}>↻</span>
        </button>
      </div>

      {error && (
        <div style={{ background:'var(--red-dim)', border:'1px solid rgba(255,61,87,0.2)', borderRadius:'var(--radius)', padding:'12px 16px', color:'var(--red)', fontSize:12, textAlign:'center' }}>
          {error}
        </div>
      )}

      {loading && trades.length === 0 ? (
        <div style={{ padding:'40px 20px', textAlign:'center' }}>
          <div style={{ width:40, height:40, border:'3px solid var(--surface-top)', borderTopColor:'var(--gold)', borderRadius:'50%', margin:'0 auto', animation:'spin 1s linear infinite' }} />
        </div>
      ) : trades.length === 0 ? (
        <div style={{ padding:'80px 20px', textAlign:'center', background:'var(--surface)', borderRadius:'var(--radius-lg)', border:'1px solid var(--border)' }}>
          <span style={{ fontSize:40 }}>📝</span>
          <p style={{ fontSize:15, fontWeight:600, color:'var(--text-sub)', marginTop:12 }}>Your journal is empty</p>
          <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:4 }}>Log a trade from the Calculator to begin your journey.</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          {openTrades.length > 0 && (
            <section style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <p style={{ fontSize:10, fontWeight:700, color:'var(--gold)', letterSpacing:'0.1em' }}>ACTIVE POSITIONS ({openTrades.length})</p>
              {openTrades.map(t => <TradeCard key={t.id} trade={t} onRefresh={fetchTrades} />)}
            </section>
          )}

          {closedTrades.length > 0 && (
            <section style={{ display:'flex', flexDirection:'column', gap:12, position:'relative' }}>
              <p style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', letterSpacing:'0.1em' }}>HISTORICAL LOGS ({closedTrades.length})</p>
              
              {!isGold && (
                <div style={{ position:'absolute', inset:'24px 0 0', background:'rgba(8,11,15,0.7)', backdropFilter:'blur(4px)', zIndex:10, borderRadius:'var(--radius-lg)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', border:'1px dashed var(--gold-dim)', padding:20, textAlign:'center' }}>
                  <span style={{ fontSize:24, marginBottom:8 }}>🔒</span>
                  <p style={{ color:'var(--gold)', fontSize:14, fontWeight:700, fontFamily:'var(--font-data)' }}>HISTORY LOCKED</p>
                  <p style={{ color:'var(--text-sub)', fontSize:11, marginTop:4 }}>Upgrade to Gold to unlock your full trade history and performance analytics.</p>
                </div>
              )}

              <div style={{ display:'flex', flexDirection:'column', gap:12, opacity: isGold ? 1 : 0.2, pointerEvents: isGold ? 'auto' : 'none' }}>
                {closedTrades.slice(0, isGold ? 100 : 2).map(t => <TradeCard key={t.id} trade={t} onRefresh={fetchTrades} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
