import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { calculateDisciplineScore } from '../lib/riskEngine';
import { generateShareText, copyToClipboard } from '../lib/shareReport';
import DisciplineScore from '../components/DisciplineScore';
import TradeHistory from '../components/TradeHistory';

function EquityCurve({ trades, isLocked }) {
  if (trades.length < 2) return null;
  
  if (isLocked) {
    return (
      <div style={{ marginTop:14, position:'relative', height:100, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'var(--bg-1)', borderRadius:'var(--radius)', border:'1px dashed var(--border)' }}>
        <p style={{ fontFamily:'var(--font-data)', fontSize:10, fontWeight:600, color:'var(--text-muted)', letterSpacing:'0.14em', marginBottom:8 }}>EQUITY CURVE</p>
        <div style={{ color:'var(--gold)', fontSize:18, marginBottom:4 }}>🔒</div>
        <p style={{ fontSize:10, color:'var(--text-muted)' }}>UPGRADE TO UNLOCK</p>
      </div>
    );
  }

  // Calculate cumulative P/L
  const points = trades
    .slice()
    .reverse()
    .reduce((acc, t) => {
      const prev = acc.length > 0 ? acc[acc.length - 1] : 0;
      acc.push(prev + parseFloat(t.pnl_amount || 0));
      return acc;
    }, []);

  const min = Math.min(0, ...points);
  const max = Math.max(0.1, ...points);
  const range = max - min;
  const width = 100;
  const height = 40;

  const svgPoints = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - ((p - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const zeroY = height - ((0 - min) / range) * height;

  return (
    <div style={{ marginTop:14 }}>
      <p style={{ fontFamily:'var(--font-data)', fontSize:10, fontWeight:600, color:'var(--text-muted)', letterSpacing:'0.14em', marginBottom:10 }}>EQUITY CURVE (CUMULATIVE PNL)</p>
      <div style={{ position:'relative', height:height + 20, width:'100%' }}>
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ width:'100%', height:'100%', overflow:'visible' }}>
          {/* Zero Line */}
          <line x1="0" y1={zeroY} x2={width} y2={zeroY} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2,2" />
          <defs>
            <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`M 0,${zeroY} L ${svgPoints} L ${width},${height} L 0,${height} Z`} fill="url(#curveGradient)" />
          <polyline points={svgPoints} fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter:'drop-shadow(0 0 4px var(--gold-glow))' }} />
        </svg>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'16px 12px', display:'flex', flexDirection:'column', alignItems:'center', gap:4, textAlign:'center' }}>
      <span style={{ fontSize:22, marginBottom:4 }}>{icon}</span>
      <span className="font-data" style={{ fontSize:22, fontWeight:700, lineHeight:1, color }}>{value}</span>
      <span style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{label}</span>
    </div>
  );
}

export default function Dashboard({ user, isGold }) {
  const [trades,    setTrades]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [lastFetch, setLastFetch] = useState(null);
  const [sharing,   setSharing]   = useState(false);
  const [shared,    setShared]    = useState(false);

  // Ensure user exists
  const userId = user?.id;
  
  if (!userId) {
    console.warn('[Dashboard] No user ID provided');
  }

  const fetchTrades = useCallback(async (isRefresh = false) => {
    if (isRefresh) setLoading(true);
    setError('');
    
    // Guard: no user
    if (!userId) {
      setError('Please log in to view your trades');
      setLoading(false);
      return;
    }
    
    console.log('[Dashboard] Fetching trades for user:', userId);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);

      console.log('[Dashboard] Trades response:', { data, error: fetchError });

      if (fetchError) {
        console.error('[Dashboard] Fetch error:', fetchError);
        setError('Failed to load trades: ' + fetchError.message);
      } else {
        setTrades(data || []);
        setLastFetch(new Date());
        console.log('[Dashboard] Loaded', data?.length || 0, 'trades');
      }
    } catch (err) {
      console.error('[Dashboard] Catch error:', err);
      setError('An unexpected error occurred: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchTrades();
    }
  }, [fetchTrades, userId]);

  const disciplineData = calculateDisciplineScore(trades);
  
  const closedTrades = trades.filter(t => t.status === 'closed');
  const wins = closedTrades.filter(t => t.is_win);
  const winRate = closedTrades.length > 0 ? (wins.length / closedTrades.length * 100).toFixed(0) : 0;
  
  const grossProfit = closedTrades.reduce((s, t) => s + (t.pnl_amount > 0 ? t.pnl_amount : 0), 0);
  const grossLoss = Math.abs(closedTrades.reduce((s, t) => s + (t.pnl_amount < 0 ? t.pnl_amount : 0), 0));
  const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : grossProfit > 0 ? 'MAX' : '0.00';
  
  const netPnl = (grossProfit - grossLoss).toFixed(2);
  const avgRisk = trades.length > 0 ? (trades.reduce((s,t) => s + parseFloat(t.risk_percent), 0) / trades.length).toFixed(2) : 0;
  const dangerCount = trades.filter(t => t.risk_level==='danger').length;
  
  const sessionCounts = trades.reduce((acc,t) => { acc[t.session]=(acc[t.session]||0)+1; return acc; }, {});
  const sessionWins = closedTrades.reduce((acc,t) => { 
    if (!acc[t.session]) acc[t.session] = { total:0, wins:0 };
    acc[t.session].total++;
    if (t.is_win) acc[t.session].wins++;
    return acc;
  }, {});

  const handleShare = async () => {
    setSharing(true);
    const text = generateShareText({
      winRate,
      disciplineGrade: disciplineData.grade,
      netPnl,
      tradesCount: trades.length
    });
    const success = await copyToClipboard(text);
    if (success) {
      setShared(true);
      setTimeout(() => setShared(false), 3000);
    }
    setSharing(false);
  };

  return (
    <div style={{ padding:'20px 16px 110px', display:'flex', flexDirection:'column', gap:14, maxWidth:520, margin:'0 auto' }} className="fade-up">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
        <div>
          <p style={{ fontFamily:'var(--font-data)', fontSize:10, color:'var(--gold)', letterSpacing:'0.16em', marginBottom:4 }}>PERFORMANCE</p>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:700, lineHeight:1.1 }}>Dashboard</h1>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button 
            onClick={handleShare} 
            disabled={sharing || trades.length === 0} 
            style={{ 
              background:'var(--gold-dim)', border:'1px solid var(--border-gold)', borderRadius:'var(--radius)', 
              color:'var(--gold)', padding:'0 16px', fontSize:12, fontWeight:700, cursor:'pointer',
              display:'flex', alignItems:'center', gap:8
            }}
          >
            {shared ? '✓ COPIED' : '📤 SHARE'}
          </button>
          <button onClick={() => fetchTrades(true)} disabled={loading} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', color:'var(--text-sub)', width:36, height:36, fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={loading?{display:'inline-block',animation:'spin 0.8s linear infinite'}:{}}>↻</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 14px', background:'var(--red-dim)', border:'1px solid rgba(255,61,87,0.3)', borderRadius:'var(--radius)', fontSize:13, color:'var(--red)' }}>
          <span>{error}</span>
          <button onClick={() => fetchTrades(true)} style={{ background:'transparent', border:'1px solid var(--red)', borderRadius:'var(--radius-sm)', color:'var(--red)', fontSize:11, fontWeight:700, padding:'4px 10px', cursor:'pointer' }}>Retry</button>
        </div>
      )}

      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'18px 16px' }}>
        <DisciplineScore score={disciplineData.score} grade={disciplineData.grade} label={disciplineData.label} color={disciplineData.color} tradesUsed={disciplineData.tradesUsed} breakdown={disciplineData.breakdown} loading={loading} />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }} className="stagger">
        <StatCard label="Win Rate" value={loading?'—':`${winRate}%`} icon="🎯" color="var(--gold)" />
        <StatCard label="Profit Factor" value={loading?'—':profitFactor} icon="💹" color={parseFloat(profitFactor)>=1.5?'var(--green)':'var(--amber)'} />
        <StatCard label="Net P/L" value={loading?'—':`${netPnl>0?'+':''}$${netPnl}`} icon="💰" color={netPnl>=0?'var(--green)':'var(--red)'} />
        <StatCard label="Avg Risk %" value={loading?'—':`${avgRisk}%`} icon="⚖" color="var(--text-sub)" />
      </div>

      {!loading && closedTrades.length > 1 && (
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'18px 16px' }}>
          <EquityCurve trades={closedTrades} isLocked={!isGold} />
        </div>
      )}

      {trades.length > 0 && !loading && (
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'18px 16px', position:'relative', overflow:'hidden' }}>
          {!isGold && <div style={{ position:'absolute', inset:0, background:'rgba(15,21,32,0.8)', backdropFilter:'blur(4px)', zIndex:2, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:20 }}>
            <span style={{ fontSize:20, marginBottom:8 }}>🔒</span>
            <p style={{ fontFamily:'var(--font-data)', fontSize:10, fontWeight:700, color:'var(--gold)' }}>SESSION ANALYTICS LOCKED</p>
          </div>}
          <p style={{ fontFamily:'var(--font-data)', fontSize:10, fontWeight:600, color:'var(--text-muted)', letterSpacing:'0.14em', marginBottom:14 }}>SESSION ACTIVITY</p>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[['London','🇬🇧','var(--amber)'],['New York','🗽','var(--red)'],['Asia','🌏','var(--blue)']].map(([key,icon,color]) => {
              const count = sessionCounts[key]||0;
              const stats = sessionWins[key] || { total:0, wins:0 };
              const wr = stats.total > 0 ? (stats.wins/stats.total*100).toFixed(0) : 0;
              const pct = trades.length > 0 ? (count/trades.length)*100 : 0;
              return (
                <div key={key}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <span style={{ fontSize:12, color:'var(--text-sub)' }}>{icon} {key}</span>
                    <span className="font-data" style={{ fontSize:12, color }}>{count} T · {wr}% WR</span>
                  </div>
                  <div style={{ height:4, background:'var(--surface-top)', borderRadius:4 }}>
                    <div style={{ height:'100%', background:color, borderRadius:4, width:`${pct}%`, transition:'width 0.8s' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'18px 16px' }}>
        <p style={{ fontFamily:'var(--font-data)', fontSize:10, fontWeight:600, color:'var(--text-muted)', letterSpacing:'0.14em', marginBottom:16 }}>RECENT TRADES</p>
        <TradeHistory trades={trades} loading={loading} limit={10} />
      </div>
    </div>
  );
}
