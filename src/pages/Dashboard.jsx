import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { calculateDisciplineScore } from '../lib/riskEngine';
import DisciplineScore from '../components/DisciplineScore';
import TradeHistory from '../components/TradeHistory';

function StatCard({ label, value, icon, color }) {
  return (
    <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'16px 12px', display:'flex', flexDirection:'column', alignItems:'center', gap:4, textAlign:'center' }}>
      <span style={{ fontSize:22, marginBottom:4 }}>{icon}</span>
      <span className="font-data" style={{ fontSize:22, fontWeight:700, lineHeight:1, color }}>{value}</span>
      <span style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{label}</span>
    </div>
  );
}

export default function Dashboard({ user }) {
  const [trades,    setTrades]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [lastFetch, setLastFetch] = useState(null);

  const fetchTrades = useCallback(async (isRefresh = false) => {
    if (isRefresh) setLoading(true);
    setError('');
    try {
      const { data, error: fetchError } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (fetchError) {
        setError('Failed to load trades. Check your connection.');
      } else {
        setTrades(data || []);
        setLastFetch(new Date());
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTrades();
  }, [fetchTrades]);

  const disciplineData = calculateDisciplineScore(trades);
  const totalTrades = trades.length;
  const avgRisk  = totalTrades > 0 ? (trades.reduce((s,t) => s + parseFloat(t.risk_percent), 0) / totalTrades).toFixed(2) : 0;
  const maxRisk  = totalTrades > 0 ? Math.max(...trades.map(t => parseFloat(t.risk_percent))).toFixed(2) : 0;
  const safeRate = totalTrades > 0 ? ((trades.filter(t => t.risk_level==='safe').length / totalTrades)*100).toFixed(0) : 0;
  const dangerCount = trades.filter(t => t.risk_level==='danger').length;
  const sessionCounts = trades.reduce((acc,t) => { acc[t.session]=(acc[t.session]||0)+1; return acc; }, {});

  return (
    <div style={{ padding:'20px 16px 110px', display:'flex', flexDirection:'column', gap:14, maxWidth:520, margin:'0 auto' }} className="fade-up">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
        <div>
          <p style={{ fontFamily:'var(--font-data)', fontSize:10, color:'var(--gold)', letterSpacing:'0.16em', marginBottom:4 }}>PERFORMANCE</p>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:700, lineHeight:1.1 }}>Dashboard</h1>
        </div>
        <button onClick={() => fetchTrades(true)} disabled={loading} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', color:'var(--text-sub)', width:36, height:36, fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={loading?{display:'inline-block',animation:'spin 0.8s linear infinite'}:{}}>↻</span>
        </button>
      </div>

      {lastFetch && <p style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'var(--font-data)', marginTop:-6 }}>Last synced {lastFetch.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</p>}

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
        <StatCard label="Total Trades" value={loading?'—':totalTrades} icon="📋" color="var(--text)" />
        <StatCard label="Avg Risk %" value={loading?'—':`${avgRisk}%`} icon="⚖" color={parseFloat(avgRisk)<=2?'var(--green)':parseFloat(avgRisk)<=3?'var(--amber)':'var(--red)'} />
        <StatCard label="Highest Risk" value={loading?'—':`${maxRisk}%`} icon="🔺" color={parseFloat(maxRisk)>3?'var(--red)':'var(--amber)'} />
        <StatCard label="Safe Rate" value={loading?'—':`${safeRate}%`} icon="🛡" color="var(--green)" />
      </div>

      {dangerCount > 0 && !loading && (
        <div style={{ padding:14, background:'var(--red-dim)', border:'1px solid rgba(255,61,87,0.25)', borderRadius:'var(--radius)' }} className="fade-up">
          <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
            <span style={{ fontSize:18 }}>🚨</span>
            <div>
              <p style={{ fontSize:13, fontWeight:700, color:'var(--red)', marginBottom:2 }}>{dangerCount} danger-level trade{dangerCount!==1?'s':''} detected</p>
              <p style={{ fontSize:12, color:'var(--text-sub)' }}>Review your high-risk entries. Consistent over-risking depletes accounts faster than bad setups.</p>
            </div>
          </div>
        </div>
      )}

      {totalTrades > 0 && !loading && (
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'18px 16px' }}>
          <p style={{ fontFamily:'var(--font-data)', fontSize:10, fontWeight:600, color:'var(--text-muted)', letterSpacing:'0.14em', marginBottom:14 }}>SESSION ACTIVITY</p>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[['London','🇬🇧','var(--amber)'],['New York','🗽','var(--red)'],['Asia','🌏','var(--blue)']].map(([key,icon,color]) => {
              const count = sessionCounts[key]||0;
              const pct = totalTrades > 0 ? (count/totalTrades)*100 : 0;
              return (
                <div key={key}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <span style={{ fontSize:12, color:'var(--text-sub)' }}>{icon} {key}</span>
                    <span className="font-data" style={{ fontSize:12, color }}>{count} trade{count!==1?'s':''} · {pct.toFixed(0)}%</span>
                  </div>
                  <div style={{ height:4, background:'var(--surface-top)', borderRadius:4 }}>
                    <div style={{ height:'100%', background:color, borderRadius:4, width:`${pct}%`, transition:'width 0.8s cubic-bezier(0.16,1,0.3,1)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'18px 16px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <p style={{ fontFamily:'var(--font-data)', fontSize:10, fontWeight:600, color:'var(--text-muted)', letterSpacing:'0.14em' }}>RECENT TRADES</p>
          {totalTrades > 10 && <span className="font-data" style={{ fontSize:11, color:'var(--text-muted)' }}>Showing 10 of {totalTrades}</span>}
        </div>
        <TradeHistory trades={trades} loading={loading} limit={10} />
      </div>
    </div>
  );
}
