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
  },
  hero: {
    maxWidth: 700,
    marginTop: 40,
    position: 'relative',
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
    zIndex: 1,
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
  btnSecondary: {
    background: 'var(--surface-high)',
    color: 'var(--text)',
    padding: '16px 32px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'var(--font-data)',
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
  oldPrice: {
    fontSize: 16,
    color: 'var(--text-muted)',
    textDecoration: 'line-through',
    marginBottom: 8,
  },
  features: {
    marginTop: 80,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: 20,
    width: '100%',
    maxWidth: 800,
  },
  featureItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  featureText: {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--text-sub)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  }
};

export default function LandingPage({ onGetStarted }) {
  const [attribution, setAttribution] = useState({ source: 'organic' });

  useEffect(() => {
    const attr = getAttribution();
    setAttribution(attr);
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
        <p style={S.oldPrice}>Regularly $97</p>
        <div style={S.priceTag}>
          <span style={{ fontSize: 24 }}>$</span>47
          <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>/ LIFETIME</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 12, marginBottom: 24 }}>
          One-time payment. No subscriptions. <br/>All future updates included.
        </p>
        <ul style={{ listSetStyle: 'none', padding: 0, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {['Unlimited Calculations', 'Advanced Journaling', 'Discipline Analytics', 'Equity Curve Tracking'].map((f) => (
            <li key={f} style={{ fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ color: 'var(--green)' }}>✓</span> {f}
            </li>
          ))}
        </ul>
      </div>

      <div style={S.features}>
        <Feature icon="🛡" label="Risk Shield" />
        <Feature icon="🎯" label="Precision Lots" />
        <Feature icon="🧠" label="Emotion Logs" />
        <Feature icon="💹" label="Equity Curve" />
      </div>

      <footer style={{ marginTop: 100, borderTop: '1px solid var(--border)', paddingTop: 40, width: '100%', maxWidth: 500 }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          RiskPilot is a trading utility and does not guarantee profits. <br/>
          Trading involves high risk. Never risk money you cannot afford to lose.
        </p>
      </footer>
    </div>
  );
}

function Feature({ icon, label }) {
  return (
    <div style={S.featureItem}>
      <span style={S.featureIcon}>{icon}</span>
      <span style={S.featureText}>{label}</span>
    </div>
  );
}
