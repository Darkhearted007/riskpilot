import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Pixel } from '../lib/marketing';

const RECENT_PURCHASES = [
  { name: 'Kweku M.', city: 'Accra', time: '2m ago' },
  { name: 'Samuel O.', city: 'Lagos', time: '5m ago' },
  { name: 'Elena R.', city: 'London', time: '12m ago' },
  { name: 'David T.', city: 'Johannesburg', time: '15m ago' },
  { name: 'Sarah L.', city: 'New York', time: '18m ago' },
];

const FEATURES = [
  { title: 'Precision XAUUSD Engine', desc: 'Custom-tuned for Gold volatility. Calculate exact lot sizes based on your unique balance and risk appetite.', icon: '🎯' },
  { title: 'Discipline Scoring', desc: 'Our algorithm grades your trades. Stop being emotional and start being robotic.', icon: '⚖️' },
  { title: 'Performance Dashboard', desc: 'Real-time equity tracking and win-rate analytics. See exactly where your edge is.', icon: '📊' },
  { title: 'Session Awareness', desc: 'Know when to trade. Analytics broken down by London, New York, and Asia sessions.', icon: '🌍' },
];

const FAQS = [
  { q: 'Is this a trading bot?', a: 'No. RiskPilot is a professional discipline utility. It calculates your risk so YOU can execute with confidence, but it does not place trades for you.' },
  { q: 'Why $47 for a lifetime?', a: 'This is a limited launch offer to build our initial community of disciplined traders. The price will transition to a monthly subscription soon.' },
  { q: 'Does it work on mobile?', a: 'Yes. RiskPilot is fully responsive and can be installed as a PWA on iOS and Android for instant access on your home screen.' },
  { q: 'Is my data secure?', a: 'We use Supabase for enterprise-grade security. Your trade data is private, encrypted, and only accessible by you.' },
];

export default function LandingPage({ onGetStarted }) {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [purchases, setPurchases] = useState(RECENT_PURCHASES);
  const [proofIndex, setProofIndex] = useState(0);
  const [showProof, setShowProof] = useState(true);
  const [timeLeft, setTimeLeft] = useState('02:47:15');
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    // Social Proof Cycle
    const proofInterval = setInterval(() => {
      setShowProof(false);
      setTimeout(() => {
        setProofIndex((prev) => (prev + 1) % RECENT_PURCHASES.length);
        setShowProof(true);
      }, 500);
    }, 8000);

    // Countdown Timer — uses functional updater to avoid stale closure
    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        const parts = prev.split(':').map(Number);
        let [h, m, s] = parts;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 2; m = 47; s = 15; }
        return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
      });
    }, 1000);

    return () => {
      clearInterval(proofInterval);
      clearInterval(timerInterval);
    };
  }, []); // ← Empty array: runs ONCE on mount, never again

  const handleJoin = () => {
    Pixel.trackInitiateCheckout('Gold Lifetime');
    onGetStarted();
  };

  const currentProof = purchases[proofIndex];

  return (
    <div style={S.container}>
      <div style={S.glow} />
      
      {/* HERO SECTION */}
      <section style={S.hero}>
        <div style={S.badge}>◈ INSTITUTIONAL RISK MANAGEMENT</div>
        <h1 style={S.title}>Stop Blowing Accounts. <br/> Start Trading Like a Pro.</h1>
        <p style={S.subtitle}>
          The precision discipline engine for professional XAUUSD traders. 
          Protect your capital, master your psychology, and scale your trading career with robotic risk management.
        </p>

        <div style={S.timer}>
          <span>⚡️ LAUNCH OFFER ENDS IN: </span>
          <span style={{ fontSize: 13, minWidth: 65, color: '#fff' }}>{timeLeft}</span>
        </div>

        <div style={S.ctaContainer}>
          <button style={S.btnPrimary} onClick={handleJoin}>GET LIFETIME ACCESS →</button>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-data)', marginTop: 12 }}>
            TRUSTED BY 1,200+ DISCIPLINED GOLD TRADERS
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section style={S.featuresSection}>
        <h2 style={S.sectionTitle}>Built for Precision.</h2>
        <div style={S.featuresGrid}>
          {FEATURES.map((f, i) => (
            <div key={i} style={S.featureCard}>
              <div style={S.featureIcon}>{f.icon}</div>
              <h3 style={S.featureTitle}>{f.title}</h3>
              <p style={S.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* THE PROBLEM SECTION */}
      <section style={S.problemSection}>
        <div style={S.problemCard}>
          <h2 style={{ ...S.sectionTitle, textAlign: 'left', marginBottom: 16 }}>Why 95% of Traders Fail.</h2>
          <p style={{ color: 'var(--text-sub)', lineHeight: 1.6, marginBottom: 24 }}>
            It's not the strategy. It's the **math**. Most traders blow their accounts because of emotional over-leveraging and inconsistent position sizing. RiskPilot removes the emotion and gives you the exact math to survive and thrive.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={S.problemItem}>❌ No more "guessing" lot sizes.</div>
            <div style={S.problemItem}>❌ No more emotional revenge trading.</div>
            <div style={S.problemItem}>❌ No more blowing accounts on a single news candle.</div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section style={S.pricingSection}>
        <div style={S.pricingCard}>
          <div style={S.ribbon}>BEST VALUE</div>
          <p style={S.cardBadge}>GOLD EDITION</p>
          <div style={S.priceTag}>
            <span style={{ fontSize: 24, alignSelf: 'flex-start', marginTop: 10 }}>$</span>47
            <span style={{ fontSize: 14, color: 'var(--text-muted)', marginLeft: 8 }}>/ LIFETIME</span>
          </div>
          <ul style={S.priceFeatures}>
            <li>✅ Precision XAUUSD Calculator</li>
            <li>✅ Unlimited Trade Journaling</li>
            <li>✅ Advanced Performance Dashboard</li>
            <li>✅ Session-Specific Analytics</li>
            <li>✅ Lifetime Updates & Support</li>
          </ul>
          <button style={S.btnPrimary} onClick={handleJoin}>START SCALING NOW</button>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 16 }}>Secure payment via Paystack</p>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section style={S.faqSection}>
        <h2 style={S.sectionTitle}>Frequently Asked Questions</h2>
        <div style={S.faqList}>
          {FAQS.map((faq, i) => (
            <div key={i} style={S.faqItem} onClick={() => {
              setActiveFaq(activeFaq === i ? null : i);
              if (activeFaq !== i) Pixel.trackFAQView(faq.q);
            }}>
              <div style={S.faqHeader}>
                <span style={S.faqQuestion}>{faq.q}</span>
                <span style={{ color: activeFaq === i ? 'var(--gold)' : 'var(--text-muted)' }}>{activeFaq === i ? '−' : '+'}</span>
              </div>
              {activeFaq === i && <p style={S.faqAnswer}>{faq.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={S.footer}>
        <div style={S.footerLinks}>
          <button onClick={() => setShowPrivacy(true)} style={S.footerLink}>PRIVACY POLICY</button>
          <button onClick={() => setShowPrivacy(true)} style={S.footerLink}>TERMS OF SERVICE</button>
          <button onClick={() => onGetStarted('affiliate')} style={{ ...S.footerLink, color: 'var(--gold)' }}>AFFILIATE PROGRAM</button>
          <button style={S.footerLink}>CONTACT SUPPORT</button>
        </div>
        <div style={S.footerLegal}>
          <p>© 2026 RiskPilot Gold. Not financial advice. Trading involves significant risk of loss.</p>
        </div>
      </footer>

      {/* SOCIAL PROOF TOAST */}
      {showProof && (
        <div style={S.proofToast} className="fade-in">
          <div style={S.proofIcon}>💰</div>
          <div style={{ textAlign:'left' }}>
            <p style={{ fontSize:11, fontWeight:700, color:'var(--text)' }}>{currentProof.name} upgraded to Gold</p>
            <p style={{ fontSize:10, color:'var(--text-muted)' }}>{currentProof.city} • {currentProof.time}</p>
          </div>
        </div>
      )}

      {/* PRIVACY MODAL */}
      {showPrivacy && (
        <div style={S.modalOverlay} onClick={() => setShowPrivacy(false)}>
          <div style={S.modalContent} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 20 }}>Privacy & Terms</h2>
            <div style={S.modalBody}>
              <p>RiskPilot is a software utility designed for informational purposes only. We do not provide financial advice or brokerage services.</p>
              <p><strong>Data Privacy:</strong> We collect your email address for account management. Your trade data is stored securely in your private Supabase instance.</p>
              <p><strong>Payments:</strong> All transactions are processed via Paystack. RiskPilot does not store your credit card information.</p>
            </div>
            <button onClick={() => setShowPrivacy(false)} style={S.btnPrimary}>CLOSE</button>
          </div>
        </div>
      )}
    </div>
  );
}

const S = {
  container: {
    minHeight: '100vh',
    background: 'var(--bg)',
    color: 'var(--text)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    overflowX: 'hidden',
    paddingBottom: 60,
  },
  glow: {
    position: 'absolute',
    top: -150,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 800,
    height: 500,
    background: 'radial-gradient(circle, var(--gold-dim) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  hero: {
    maxWidth: 800,
    padding: '80px 20px 60px',
    textAlign: 'center',
    zIndex: 2,
    position: 'relative',
  },
  badge: {
    display: 'inline-block',
    padding: '8px 16px',
    borderRadius: 30,
    background: 'var(--gold-dim)',
    border: '1px solid var(--border-gold)',
    color: 'var(--gold)',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.14em',
    marginBottom: 24,
    fontFamily: 'var(--font-data)',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(36px, 7vw, 72px)',
    fontWeight: 800,
    lineHeight: 1.05,
    letterSpacing: '-0.03em',
    marginBottom: 24,
    background: 'linear-gradient(180deg, #fff 0%, var(--text-sub) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: 'clamp(16px, 3vw, 20px)',
    color: 'var(--text-sub)',
    maxWidth: 600,
    margin: '0 auto 40px',
    lineHeight: 1.5,
  },
  timer: {
    background: 'var(--surface-high)',
    border: '1px solid var(--border-high)',
    borderRadius: 'var(--radius)',
    padding: '10px 16px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 40,
    color: 'var(--red)',
    fontFamily: 'var(--font-data)',
    fontSize: 11,
    fontWeight: 700,
  },
  ctaContainer: {
    width: '100%',
    maxWidth: 400,
    margin: '0 auto',
  },
  btnPrimary: {
    width: '100%',
    background: 'var(--gold)',
    color: '#000',
    padding: '18px 32px',
    borderRadius: 'var(--radius)',
    border: 'none',
    fontSize: 16,
    fontWeight: 800,
    cursor: 'pointer',
    fontFamily: 'var(--font-data)',
    letterSpacing: '0.04em',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 8px 32px rgba(212,175,55,0.2)',
  },
  featuresSection: {
    width: '100%',
    maxWidth: 1000,
    padding: '80px 20px',
    zIndex: 2,
  },
  sectionTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 32,
    fontWeight: 700,
    marginBottom: 40,
    textAlign: 'center',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 20,
  },
  featureCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: 24,
    textAlign: 'left',
    transition: 'border-color 0.2s',
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 8,
    color: 'var(--gold)',
  },
  featureDesc: {
    fontSize: 14,
    color: 'var(--text-sub)',
    lineHeight: 1.6,
  },
  problemSection: {
    width: '100%',
    maxWidth: 800,
    padding: '40px 20px',
    zIndex: 2,
  },
  problemCard: {
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)',
    padding: '40px',
    textAlign: 'left',
  },
  problemItem: {
    fontSize: 14,
    color: 'var(--text)',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  pricingSection: {
    width: '100%',
    padding: '80px 20px',
    zIndex: 2,
    display: 'flex',
    justifyContent: 'center',
  },
  pricingCard: {
    background: 'var(--surface)',
    border: '2px solid var(--gold)',
    borderRadius: 'var(--radius-xl)',
    padding: '48px 32px',
    width: '100%',
    maxWidth: 400,
    position: 'relative',
    textAlign: 'center',
    boxShadow: '0 20px 50px rgba(0,0,0,0.5), var(--shadow-gold)',
  },
  ribbon: {
    position: 'absolute',
    top: 20,
    right: -35,
    background: 'var(--gold)',
    color: '#000',
    fontSize: 10,
    fontWeight: 800,
    padding: '6px 40px',
    transform: 'rotate(45deg)',
    fontFamily: 'var(--font-data)',
  },
  cardBadge: {
    fontSize: 12,
    fontWeight: 800,
    color: 'var(--gold)',
    letterSpacing: '0.2em',
    marginBottom: 16,
  },
  priceTag: {
    fontSize: 72,
    fontWeight: 800,
    fontFamily: 'var(--font-display)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  priceFeatures: {
    listStyle: 'none',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginBottom: 32,
    fontSize: 14,
    color: 'var(--text-sub)',
  },
  faqSection: {
    width: '100%',
    maxWidth: 700,
    padding: '80px 20px',
    zIndex: 2,
  },
  faqList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  faqItem: {
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '16px 20px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  faqHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: 600,
  },
  faqAnswer: {
    marginTop: 12,
    fontSize: 14,
    color: 'var(--text-sub)',
    lineHeight: 1.6,
    paddingTop: 12,
    borderTop: '1px solid var(--border)',
  },
  footer: {
    marginTop: 80,
    padding: '40px 20px',
    width: '100%',
    maxWidth: 800,
    textAlign: 'center',
    borderTop: '1px solid var(--border)',
    zIndex: 2,
  },
  footerLinks: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 24,
  },
  footerLink: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: 11,
    cursor: 'pointer',
    fontFamily: 'var(--font-data)',
    fontWeight: 600,
    letterSpacing: '0.05em',
    transition: 'color 0.2s',
  },
  footerLegal: {
    fontSize: 10,
    color: 'var(--text-faint)',
    lineHeight: 1.6,
    fontFamily: 'var(--font-data)',
  },
  proofToast: {
    position: 'fixed',
    bottom: 24,
    left: 24,
    background: 'var(--surface)',
    border: '1px solid var(--border-gold)',
    borderRadius: 'var(--radius)',
    padding: '12px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    zIndex: 100,
    boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
  },
  proofIcon: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: 'var(--gold-dim)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
  },
  modalOverlay: {
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
    padding: '40px',
    maxWidth: 500,
    width: '100%',
    textAlign: 'left',
  },
  modalBody: {
    fontSize: 14,
    color: 'var(--text-sub)',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    lineHeight: 1.6,
    marginBottom: 32,
  },
};
