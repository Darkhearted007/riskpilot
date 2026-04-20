import { useState, useEffect } from 'react';

export default function RiskAlert({ warnings }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (warnings && warnings.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(false);
      const t = setTimeout(() => setVisible(true), 50);
      return () => clearTimeout(t);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(false);
    }
  }, [warnings]);

  if (!warnings || warnings.length === 0 || !visible) return null;

  return (
    <div className="fade-up" style={{ display:'flex', flexDirection:'column', gap:8 }} role="alert">
      {warnings.map((w, i) => {
        const isError = w.type === 'error';
        return (
          <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'12px 14px', borderRadius:'var(--radius)', background: isError ? 'var(--red-dim)' : 'var(--amber-dim)', border:`1px solid ${isError ? 'rgba(255,61,87,0.3)' : 'rgba(255,179,0,0.3)'}` }}>
            <div style={{ width:6, minWidth:6, height:6, borderRadius:'50%', background: isError ? 'var(--red)' : 'var(--amber)', marginTop:6 }} />
            <p style={{ fontFamily:'var(--font-body)', fontSize:13, fontWeight:500, color: isError ? 'var(--red)' : 'var(--amber)', lineHeight:1.5 }}>{w.message}</p>
          </div>
        );
      })}
    </div>
  );
}
