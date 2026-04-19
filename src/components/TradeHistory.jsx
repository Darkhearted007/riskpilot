import { SESSION_META } from '../lib/sessionDetector';

const LEVEL_CONFIG = {
  safe:       { label:'SAFE',   color:'var(--green)', bg:'var(--green-dim)' },
  aggressive: { label:'MOD',    color:'var(--amber)', bg:'var(--amber-dim)' },
  danger:     { label:'DANGER', color:'var(--red)',   bg:'var(--red-dim)'   },
};

export default function TradeHistory({ trades=[], loading, limit=10 }) {
  if (loading) return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{ height:62, borderRadius:'var(--radius)', background:'var(--surface-high)' }} />
      ))}
    </div>
  );

  if (trades.length === 0) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'40px 20px', textAlign:'center', gap:8 }}>
      <span style={{ fontSize:36 }}>📊</span>
      <p style={{ fontSize:15, fontWeight:600, color:'var(--text-sub)' }}>No trades yet</p>
      <p style={{ fontSize:13, color:'var(--text-muted)' }}>Use the Calculator to log your first trade</p>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }} className="stagger">
      {trades.slice(0, limit).map(trade => {
        const level   = LEVEL_CONFIG[trade.risk_level] || LEVEL_CONFIG.safe;
        const session = SESSION_META[trade.session];
        const date    = new Date(trade.created_at);
        const timeStr = date.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
        const dateStr = date.toLocaleDateString([], { day:'numeric', month:'short' });
        return (
          <div key={trade.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'var(--surface-high)', borderRadius:'var(--radius)', border:'1px solid var(--border)' }}>
            <div style={{ minWidth:48, textAlign:'center', padding:'4px 8px', borderRadius:'var(--radius-sm)', fontSize:10, fontWeight:700, fontFamily:'var(--font-data)', letterSpacing:'0.08em', background:level.bg, color:level.color, border:`1px solid ${level.color}44` }}>
              {level.label}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span className="font-data" style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>{trade.lot_size} lots</span>
                <span className="font-data" style={{ fontSize:13, fontWeight:600, color:'var(--gold)' }}>${Number(trade.risk_amount).toFixed(2)}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:11, color:'var(--text-muted)' }}>{Number(trade.risk_percent).toFixed(1)}% · {trade.stop_loss} pips</span>
                <span style={{ fontSize:11, color:session?.color||'var(--text-muted)' }}>{session?.icon} {trade.session}</span>
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:2 }}>
              <span className="font-data" style={{ fontSize:11, color:'var(--text-sub)' }}>{timeStr}</span>
              <span style={{ fontSize:10, color:'var(--text-muted)' }}>{dateStr}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
