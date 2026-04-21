import { useState, useEffect } from 'react';
import { Pixel, getAttribution } from '../lib/marketing';

const RECENT_PURCHASES = [
  { name: 'Kweku M.', city: 'Accra', time: '2m ago' },
  { name: 'Samuel O.', city: 'Lagos', time: '5m ago' },
  { name: 'Elena R.', city: 'London', time: '12m ago' },
  { name: 'David T.', city: 'Johannesburg', time: '15m ago' },
  { name: 'Sarah L.', city: 'New York', time: '18m ago' },
];

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
  timer: {
    background: 'rgba(255,61,87,0.1)',
    border: '1px solid rgba(255,61,87,0.3)',
    borderRadius: 'var(--radius)',
    padding: '8px 12px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    color: 'var(--red)',
    fontFamily: 'var(--font-data)',
    fontSize: 11,
    fontWeight: 700,
  }
};

export default function LandingPage({ onGetStarted }) {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [proofIndex, setProofIndex] = useState(0);
  const [showProof, setShowProof] = useState(true);
  const [timeLeft, setTimeLeft] = useState('02:47:15');

  useEffect(() => {
    Pixel.track('PageView');
    
    // Social Proof Cycle
    const proofInterval = setInterval(() => {
      setShowProof(false);
      setTimeout(() => {
        setProofIndex((prev) => (prev + 1) % RECENT_PURCHASES.length);
        setShowProof(true);
      }, 500);
    }, 8000);

    // Countdown Timer (Simulated for urgency)
    const timerInterval = setInterval(() => {
      const parts = timeLeft.split(':').map(Number);
      let [h, m, s] = parts;
      s--;
      if (s < 0) { s = 59; m--; }
      if (m < 0) { m = 59; h--; }
      if (h < 0) { h = 2; m = 47; s = 15; } // Reset for demo
      setTimeLeft(`${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`);
    }, 1000);

    return () => {
      clearInterval(proofInterval);
      clearInterval(timerInterval);
    };
  }, [timeLeft]);

  const handleJoin = () => {
    Pixel.trackInitiateCheckout('Gold Lifetime');
    onGetStarted();
  };

  const currentProof = RECENT_PURCHASES[proofIndex];

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

        <div style={S.timer}>
          <span>⚡️ FLASH SALE ENDS IN: </span>
          <span style={{ fontSize: 13, minWidth: 65 }}>{timeLeft}</span>
        </div>

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
        <button style={S.btnPrimary} onClick={handleJoin}>UNLOCK GOLD ACCESS</button>
      </div>

      <footer style={{ marginTop: 100, paddingBottom: 40, width: '100%', maxWidth: 600, zIndex: 2 }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 20 }}>
          <button onClick={() => setShowPrivacy(true)} style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-data)' }}>PRIVACY POLICY</button>
          <button onClick={() => setShowPrivacy(true)} style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-data)' }}>TERMS OF SERVICE</button>
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.6, fontFamily: 'var(--font-data)' }}>
          <p>© 2026 RiskPilot Gold. Not financial advice. Trading involves risk.</p>
        </div>
      </footer>

      {showProof && (
        <div style={{ position: 'fixed', bottom: 20, left: 20, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, zIndex: 100, boxShadow: '0 4px 20px rgba(0,0,0,0.5)', animation: 'slideInUp 0.5s' }}>
          <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--gold-dim)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>💰</div>
          <div style={{ textAlign:'left' }}>
            <p style={{ fontSize:11, fontWeight:700, color:'var(--text)' }}>{currentProof.name} upgraded to Gold</p>
            <p style={{ fontSize:10, color:'var(--text-muted)' }}>{currentProof.city} • {currentProof.time}</p>
          </div>
        </div>
      )}

      {showPrivacy && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(8,11,15,0.95)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setShowPrivacy(false)}>
          <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 32, maxWidth: 500, maxHeight: '80vh', overflowY: 'auto', textAlign: 'left' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 20 }}>Privacy & Terms</h2>
            <div style={{ fontSize: 13, color: 'var(--text-sub)', display: 'flex', flexDirection: 'column', gap: 16, lineHeight: 1.6 }}>
              <p>RiskPilot is a software utility. We collect email addresses only for account management. Payments are processed via Paystack. We do not store card details.</p>
            </div>
            <button onClick={() => setShowPrivacy(false)} style={{ marginTop: 30, width: '100%', padding: '12px', background: 'var(--gold)', border: 'none', borderRadius: 'var(--radius)', fontWeight: 700, cursor: 'pointer' }}>CLOSE</button>
          </div>
        </div>
      )}
    </div>
  );
}
