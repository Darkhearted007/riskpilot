import { useState, useEffect } from 'react';
import { Pixel, getAttribution } from '../lib/marketing';

const S = {
  container: {
    minHeight: '100vh',
    background: 'var(--bg)',
    color: 'var(--text)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '60px 20px',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  hero: {
    maxWidth: 700,
    marginTop: 40,
    position: 'relative',
    zIndex: 2,
  },
  glow: {
    position: 'absolute',
    top: -100,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 300,
    height: 300,
    background: 'radial-gradient(circle, var(--gold-dim) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  badge: {
    display: 'inline-block',
    padding: '6px 12px',
    borderRadius: 20,
    background: 'var(--gold-dim)',
    border: '1px solid var(--border-gold)',
    color: 'var(--gold)',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.12em',
    marginBottom: 24,
    fontFamily: 'var(--font-data)',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(40px, 8vw, 64px)',
    fontWeight: 800,
    lineHeight: 1,
    letterSpacing: '-0.02em',
    marginBottom: 20,
    background: 'linear-gradient(180deg, #fff 0%, var(--text-sub) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: 18,
    color: 'var(--text-sub)',
    maxWidth: 500,
    margin: '0 auto 40px',
    lineHeight: 1.6,
  },
  ctaContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    width: '100%',
    maxWidth: 400,
    zIndex: 2,
  },
  btnPrimary: {
    background: 'var(--gold)',
    color: '#000',
    padding: '18px 32px',
    borderRadius: 'var(--radius)',
    border: 'none',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'var(--font-data)',
    letterSpacing: '0.04em',
    transition: 'all 0.2s',
    boxShadow: '0 8px 32px rgba(212,175,55,0.2)',
  },
  pricingCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border-gold)',
    borderRadius: 'var(--radius-xl)',
    padding: '32px',
    marginTop: 60,
    width: '100%',
    maxWidth: 360,
    position: 'relative',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-gold)',
    zIndex: 2,
  },
  priceTag: {
    fontSize: 48,
    fontWeight: 800,
    fontFamily: 'var(--font-display)',
    color: 'var(--gold)',
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 4,
  },
  footer: {
    marginTop: 100,
    borderTop: '1px solid var(--border)',
    paddingTop: 40,
    width: '100%',
    maxWidth: 600,
    zIndex: 2,
  },
  legal: {
    fontSize: 10,
    color: 'var(--text-muted)',
    lineHeight: 1.6,
    fontFamily: 'var(--font-data)',
    marginTop: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  modal: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(8,11,15,0.95)',
    backdropFilter: 'blur(10px)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)',
    padding: 32,
    maxWidth: 500,
    maxHeight: '80vh',
    overflowY: 'auto',
    textAlign: 'left',
  }
};

export default function LandingPage({ onGetStarted }) {
  const [showPrivacy, setShowPrivacy] = useState(false);

  useEffect(() => {
    Pixel.track('PageView');
  }, []);

  const handleJoin = () => {
    Pixel.trackInitiateCheckout('Gold Lifetime');
    onGetStarted();
  };

  return (
    <div style={S.container}>
      <div style={S.glow} />
      
      <div style={S.hero}>
        <div style={S.badge}>◈ RISK PILOT GOLD EDITION</div>
        <h1 style={S.title}>Stop Blowing Accounts.</h1>
        <p style={S.subtitle}>
          The precision discipline engine for Gold traders. Calculate lot sizes, track performance, and scale to 
          <span style={{ color: 'var(--gold)', fontWeight: 700 }}> $30k/week </span> 
          with robotic risk management.
        </p>

        <div style={S.ctaContainer}>
          <button style={S.btnPrimary} onClick={handleJoin}>START SCALING →</button>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-data)' }}>
            JOIN 1,200+ DISCIPLINED XAUUSD TRADERS
          </div>
        </div>
      </div>

      <div style={S.pricingCard}>
        <div style={{ position: 'absolute', top: 12, right: -30, background: 'var(--red)', color: '#fff', fontSize: 10, fontWeight: 800, padding: '4px 40px', transform: 'rotate(45deg)' }}>
          LAUNCH OFFER
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', textDecoration: 'line-through', marginBottom: 8 }}>Regularly $97</p>
        <div style={S.priceTag}>
          <span style={{ fontSize: 24 }}>$</span>47
          <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>/ LIFETIME</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 12, marginBottom: 24 }}>
          One-time payment. All future updates included.
        </p>
        <button style={S.btnPrimary} onClick={handleJoin}>UNLOOCK GOLD ACCESS</button>
      </div>

      <footer style={S.footer}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 20 }}>
          <button onClick={() => setShowPrivacy(true)} style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-data)' }}>PRIVACY POLICY</button>
          <button onClick={() => setShowPrivacy(true)} style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-data)' }}>TERMS OF SERVICE</button>
        </div>
        <div style={S.legal}>
          <p>RiskPilot is a software utility and does not provide financial advice, trading signals, or investment strategies.</p>
          <p>Trading Gold (XAUUSD) involves significant risk of loss. Past performance does not guarantee future results.</p>
          <p>© 2026 RiskPilot Gold. Built for Professional Discipline.</p>
        </div>
      </footer>

      {showPrivacy && (
        <div style={S.modal} onClick={() => setShowPrivacy(false)}>
          <div style={S.modalContent} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 20 }}>Privacy & Terms</h2>
            <div style={{ fontSize: 13, color: 'var(--text-sub)', display: 'flex', flexDirection: 'column', gap: 16, lineHeight: 1.6 }}>
              <p><strong>1. Data Collection:</strong> We collect only your email address for account management. We do not sell your data to third parties.</p>
              <p><strong>2. Payment:</strong> Payments are processed securely via Paystack. We do not store your credit card details.</p>
              <p><strong>3. Tracking:</strong> We use the Meta Pixel to improve our advertising performance. You can opt-out via Facebook settings.</p>
              <p><strong>4. Disclaimer:</strong> RiskPilot is a mathematical tool. You are solely responsible for your trading decisions and any resulting financial loss.</p>
            </div>
            <button onClick={() => setShowPrivacy(false)} style={{ marginTop: 30, width: '100%', padding: '12px', background: 'var(--gold)', border: 'none', borderRadius: 'var(--radius)', fontWeight: 700, cursor: 'pointer' }}>CLOSE</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Feature({ icon, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 24 }}>{icon}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>{label}</span>
    </div>
  );
}
