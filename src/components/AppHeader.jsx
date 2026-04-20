import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import PaystackButton from './PaystackButton';

export default function AppHeader({ user, isGold, onSignOut, onUpgrade }) {
  const [open, setOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  return (
    <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 50 }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
        <span style={{ fontSize: 20, color: 'var(--gold)', filter: 'drop-shadow(0 0 6px var(--gold-glow))' }}>◈</span>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em', lineHeight: 1 }}>RiskPilot</div>
          <div style={{ fontFamily: 'var(--font-data)', fontSize: 8, color: 'var(--gold)', letterSpacing: '0.12em', lineHeight: 1, marginTop: 2 }}>
            {isGold ? 'GOLD EDITION' : 'LITE EDITION'}
          </div>
        </div>
      </div>

      {/* Upgrade CTA for non-gold users */}
      {!isGold && (
        <button 
          onClick={() => setShowUpgradeModal(true)}
          style={{ background: 'var(--gold-dim)', border: '1px solid var(--border-gold)', borderRadius: 'var(--radius-sm)', padding: '6px 12px', color: 'var(--gold)', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-data)', letterSpacing: '0.05em' }}
        >
          GO GOLD $47
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

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setShowUpgradeModal(false)}>
          <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border-gold)', borderRadius: 'var(--radius-xl)', padding: 32, width: '100%', maxWidth: 400, textAlign: 'center', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowUpgradeModal(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer' }}>×</button>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🚀</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Scale to $30k/Week</h2>
            <p style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.5, marginBottom: 24 }}>Unlock advanced performance tracking, historical journaling, and the robotic equity curve log.</p>
            
            <PaystackButton user={user} onSuccess={(ref) => {
              onUpgrade();
              setShowUpgradeModal(false);
            }} />
            
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 16, fontFamily: 'var(--font-data)' }}>ONE-TIME LIFETIME ACCESS · LIMITED OFFER</p>
          </div>
        </div>
      )}
    </header>
  );
}
