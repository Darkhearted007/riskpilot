import { useEffect, useState } from 'react';

export default function DisciplineScore({ score, grade, label, color, tradesUsed, breakdown, loading }) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (loading) return;
    let start = 0;
    const end = score || 0;
    const step = end / 30;
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setDisplayScore(end); clearInterval(timer); }
      else { setDisplayScore(Math.floor(start)); }
    }, 16);
    return () => clearInterval(timer);
  }, [score, loading]);

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const progress = loading ? 0 : ((displayScore / 100) * circumference);
  const dashOffset = circumference - progress;

  if (loading) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'24px 16px' }}>
      <div style={{ width:130, height:130, borderRadius:'50%', background:'var(--surface-high)' }} />
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, padding:'24px 16px' }}>
      <p style={{ fontFamily:'var(--font-data)', fontSize:10, fontWeight:600, color:'var(--text-muted)', letterSpacing:'0.14em', marginBottom:4 }}>DISCIPLINE SCORE</p>
      <div style={{ position:'relative', width:130, height:130 }}>
        <svg width={130} height={130} viewBox="0 0 130 130" style={{ transform:'rotate(-90deg)' }}>
          <circle cx={65} cy={65} r={radius} fill="none" stroke="var(--surface-top)" strokeWidth={8} />
          <circle cx={65} cy={65} r={radius} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={dashOffset}
            style={{ transition:'stroke-dashoffset 0.05s linear', filter:`drop-shadow(0 0 6px ${color}66)` }} />
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2 }}>
          <span className="font-data" style={{ fontSize:28, fontWeight:700, lineHeight:1, color }}>{displayScore}</span>
          <span className="font-data" style={{ fontSize:13, fontWeight:600, lineHeight:1, color }}>{grade}</span>
        </div>
      </div>
      <p style={{ fontFamily:'var(--font-body)', fontSize:14, fontWeight:600, marginTop:4, color }}>{label}</p>
      {tradesUsed > 0 && (
        <div style={{ display:'flex', gap:24, marginTop:8, padding:'10px 20px', background:'var(--surface-high)', borderRadius:'var(--radius)', border:'1px solid var(--border)' }}>
          {[['safe', breakdown?.safe||0, 'Safe', 'var(--green)'], ['agg', breakdown?.aggressive||0, 'Mod', 'var(--amber)'], ['dan', breakdown?.danger||0, 'Danger', 'var(--red)']].map(([k,n,l,c]) => (
            <div key={k} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
              <span className="font-data" style={{ fontSize:14, fontWeight:700, color:c }}>{n}</span>
              <span style={{ fontSize:10, color:'var(--text-muted)', letterSpacing:'0.08em' }}>{l.toUpperCase()}</span>
            </div>
          ))}
        </div>
      )}
      <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>
        {tradesUsed > 0 ? `Based on last ${tradesUsed} trade${tradesUsed!==1?'s':''}` : 'Log trades to generate score'}
      </p>
    </div>
  );
}
