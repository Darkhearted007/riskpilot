import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AppHeader({ user, plan, onSignOut, onUpgrade }) {
  const [open, setOpen] = useState(false);
  const isPaid = plan && plan !== 'free';

  return (
    <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 50 }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
        <span style={{ fontSize: 20, color: 'var(--gold)', filter: 'drop-shadow(0 0 6px var(--gold-glow))' }}>◈</span>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em', lineHeight: 1 }}>RiskPilot</div>
          <div style={{ fontFamily: 'var(--font-data)', fontSize: 8, color: isPaid ? 'var(--gold)' : 'var(--text-muted)', letterSpacing: '0.12em', lineHeight: 1, marginTop: 2 }}>
            {isPaid ? plan.toUpperCase() : 'FREE'}
          </div>
        </div>
      </div>

      {/* Upgrade CTA for free users */}
      {!isPaid && (
        <button 
          onClick={onUpgrade}
          style={{ background: 'var(--gold-dim)', border: '1px solid var(--border-gold)', borderRadius: 'var(--radius-sm)', padding: '6px 12px', color: 'var(--gold)', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-data)', letterSpacing: '0.05em' }}
        >
          UPGRADE
        </button>
      )}

      {/* User Menu */}
      <div style={{ position: 'relative' }}>
        <button onClick={() => setOpen((o) => !o)} style={{ background: 'var(--surface-high)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '6px 12px', color: 'var(--text-sub)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-data)' }}>
          {user.email.split('@')[0].slice(0, 8)}
        </button>
        {open && (
          <div className="fade-in" style={{ position: 'absolute', right: 0, top: '110%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 8, minWidth: 180, zIndex: 200, boxShadow: 'var(--shadow-card)' }}>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-data)', padding: '4px 10px 8px', borderBottom: '1px solid var(--border)', marginBottom: 6, wordBreak: 'break-all' }}>{user.email}</p>
            <button
              onClick={() => {
                supabase.auth.signOut();
                onSignOut();
              }}
              style={{ width: '100%', background: 'var(--red-dim)', border: '1px solid rgba(255,61,87,0.3)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', color: 'var(--red)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-data)', textAlign: 'left' }}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
