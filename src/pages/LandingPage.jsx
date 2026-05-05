import { useState, useEffect } from 'react';
import { Pixel } from '../lib/marketing';

const RECENT_PURCHASES = [
  { name: 'Kweku M.',  city: 'Accra',        time: '2m ago'  },
  { name: 'Samuel O.', city: 'Lagos',         time: '5m ago'  },
  { name: 'Elena R.',  city: 'London',        time: '12m ago' },
  { name: 'David T.',  city: 'Johannesburg',  time: '15m ago' },
  { name: 'Sarah L.',  city: 'New York',      time: '18m ago' },
];

const FEATURES = [
  { icon: '🎯', title: 'Precision XAUUSD Engine',   desc: 'Custom-tuned for Gold volatility. Calculate exact lot sizes based on your balance and risk appetite.' },
  { icon: '⚖️', title: 'Discipline Scoring',         desc: 'Our algorithm grades every trade setup. Stop trading emotionally — start trading robotically.' },
  { icon: '📊', title: 'Performance Dashboard',      desc: 'Real-time equity tracking and win-rate analytics. See exactly where your edge is.' },
  { icon: '🌍', title: 'Session Awareness',          desc: 'Know when to trade. Analytics broken down by London, New York, and Asia sessions.' },
];

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    badge: 'GET STARTED',
    price: '₦0',
    period: '/ forever',
    color: '#6b7280',
    features: [
      '✅ XAUUSD Risk Calculator',
      '✅ Basic Trade Journal',
      '✅ Limited Analytics',
      '✅ No payment required',
    ],
    cta: 'Start Free',
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    badge: 'MOST POPULAR',
    price: '₦5,000',
    period: '/ month',
    color: '#D4AF37',
    features: [
      '✅ Precision XAUUSD Calculator',
      '✅ Unlimited Trade Journal',
      '✅ Full Performance Analytics',
      '✅ Session Insights',
      '✅ Discipline Scoring',
      '✅ Priority Support',
    ],
    cta: 'Get Pro',
    highlighted: true,
  },
  {
    id: 'pro_plus',
    name: 'Pro+',
    badge: 'ADVANCED',
    price: '₦15,000',
    period: '/ month',
    color: '#7B6FF0',
    features: [
      '✅ Everything in Pro',
      '✅ XAUUSD + XAG Trading',
      '✅ Trade Signal Access',
      '✅ Advanced Risk Tools',
      '✅ Custom Alerts',
    ],
    cta: 'Get Pro+',
    highlighted: false,
  },
  {
    id: 'elite',
    name: 'Elite',
    badge: 'FULL ACCESS',
    price: '₦30,000',
    period: '/ month',
    color: '#E05C5C',
    features: [
      '✅ Everything in Pro+',
      '✅ All Forex Pairs',
      '✅ API Access',
      '✅ Team Collaboration',
      '✅ Dedicated Support',
    ],
    cta: 'Get Elite',
    highlighted: false,
  },
];

const FAQS = [
  { q: 'Is this a trading bot?',           a: 'No. RiskPilot is a professional discipline utility. It calculates your risk so YOU can execute with confidence — it does not place trades for you.' },
  { q: 'How does the subscription work?',  a: 'Subscriptions renew automatically each month and can be cancelled anytime. You keep access until your paid period ends.' },
  { q: 'Can I cancel anytime?',            a: 'Yes. Cancel anytime from your account. You keep access until the end of your billing period — no questions asked.' },
  { q: 'Does it work on mobile?',          a: 'Yes. RiskPilot is fully responsive and can be installed as a PWA on iOS and Android for instant home screen access.' },
  { q: 'Is my data secure?',               a: 'We use Supabase for enterprise-grade security. Your trade data is private, encrypted, and only accessible by you.' },
];

export default function LandingPage({ onGetStarted }) {
  const [showPrivacy,  setShowPrivacy]  = useState(false);
  const [showTerms,    setShowTerms]    = useState(false);
  const [showRefund,   setShowRefund]   = useState(false);
  const [proofIndex,   setProofIndex]   = useState(0);
  const [showProof,    setShowProof]    = useState(true);
  const [timeLeft,     setTimeLeft]     = useState('02:47:15');
  const [activeFaq,    setActiveFaq]    = useState(null);

  const handleSelectPlan = (planId) => {
    localStorage.setItem('selected_plan', planId);
    Pixel.trackInitiateCheckout(planId);
    onGetStarted();
  };

  useEffect(() => {
    const proofInterval = setInterval(() => {
      setShowProof(false);
      setTimeout(() => {
        setProofIndex(p => (p + 1) % RECENT_PURCHASES.length);
        setShowProof(true);
      }, 500);
    }, 8000);

    const timerInterval = setInterval(() => {
      setTimeLeft(prev => {
        let [h, m, s] = prev.split(':').map(Number);
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 2; m = 47; s = 15; }
        return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
      });
    }, 1000);

    return () => { clearInterval(proofInterval); clearInterval(timerInterval); };
  }, []);

  const proof = RECENT_PURCHASES[proofIndex];

  return (
    <div style={S.container}>
      <div style={S.glow} />

      {/* ── HERO ─────────────────────────────────── */}
      <section style={S.hero}>
        <div style={S.badge}>◈ INSTITUTIONAL RISK MANAGEMENT</div>
        <h1 style={S.title}>
          Stop Blowing Accounts.<br />Start Trading Like a Pro.
        </h1>
        <p style={S.subtitle}>
          The precision discipline engine for professional XAUUSD traders.
          Protect your capital, master your psychology, and scale your edge with robotic risk management.
        </p>
        <div style={S.timer}>
          <span>⚡️ OFFER ENDS IN: </span>
          <span style={{ color: '#fff', fontWeight: 700 }}>{timeLeft}</span>
        </div>
        <button style={S.btnPrimary} onClick={() => handleSelectPlan('pro')}>
          GET STARTED FREE →
        </button>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-data)', marginTop: 12 }}>
          TRUSTED BY 1,200+ DISCIPLINED GOLD TRADERS
        </p>
      </section>

      {/* ── FEATURES ─────────────────────────────── */}
      <section style={S.section}>
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

      {/* ── PROBLEM ──────────────────────────────── */}
      <section style={S.section}>
        <div style={S.problemCard}>
          <h2 style={{ ...S.sectionTitle, textAlign: 'left', marginBottom: 16 }}>
            Why 95% of Traders Fail.
          </h2>
          <p style={{ color: 'var(--text-sub)', lineHeight: 1.7, marginBottom: 20, fontSize: 14 }}>
            It's not the strategy — it's the math. Most traders blow accounts because of emotional
            over-leveraging and inconsistent position sizing. RiskPilot removes the emotion and
            gives you the exact math to survive and thrive.
          </p>
          {['No more guessing lot sizes.', 'No more emotional revenge trading.', 'No more blowing accounts on a single candle.'].map((t, i) => (
            <div key={i} style={S.problemItem}>❌ {t}</div>
          ))}
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────── */}
      <section style={S.section}>
        <h2 style={S.sectionTitle}>Choose Your Plan</h2>
        <p style={{ fontSize: 13, color: 'var(--text-sub)', textAlign: 'center', marginBottom: 28, fontFamily: 'var(--font-data)' }}>
          Cancel anytime · Secured by Paystack
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              style={{
                background: plan.highlighted
                  ? `linear-gradient(135deg, var(--surface) 0%, ${plan.color}14 100%)`
                  : 'var(--surface)',
                border: `2px solid ${plan.highlighted ? plan.color : 'var(--border-high)'}`,
                borderRadius: 'var(--radius-xl)',
                padding: '24px 20px',
                width: '100%',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Badge */}
              <div style={{
                display: 'inline-block',
                fontSize: 9,
                fontWeight: 700,
                fontFamily: 'var(--font-data)',
                letterSpacing: '0.1em',
                padding: '3px 12px',
                borderRadius: 20,
                background: plan.highlighted ? plan.color : 'var(--surface-top)',
                color: plan.highlighted ? '#000' : 'var(--text-muted)',
                marginBottom: 14,
              }}>
                {plan.highlighted ? '⭐ ' : ''}{plan.badge}
              </div>

              {/* Name + Price */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: plan.color }}>
                  {plan.name}
                </h3>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontFamily: 'var(--font-data)', fontSize: 22, fontWeight: 700, color: plan.highlighted ? plan.color : 'var(--text)' }}>
                    {plan.price}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4, fontFamily: 'var(--font-data)' }}>
                    {plan.period}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: 'var(--border)', marginBottom: 16 }} />

              {/* Features */}
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.5 }}>{f}</li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => handleSelectPlan(plan.id)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: plan.highlighted ? plan.color : 'transparent',
                  border: `1px solid ${plan.color}`,
                  borderRadius: 'var(--radius)',
                  color: plan.highlighted ? '#000' : plan.color,
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: 'var(--font-data)',
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {plan.cta} →
              </button>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 16, textAlign: 'center', fontFamily: 'var(--font-data)' }}>
          🔒 Secure payment via Paystack · Cancel anytime
        </p>
      </section>

      {/* ── FAQ ──────────────────────────────────── */}
      <section style={S.section}>
        <h2 style={S.sectionTitle}>Frequently Asked Questions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, width: '100%' }}>
          {FAQS.map((faq, i) => (
            <div
              key={i}
              style={{
                borderBottom: '1px solid var(--border)',
                padding: '16px 0',
                cursor: 'pointer',
              }}
              onClick={() => setActiveFaq(activeFaq === i ? null : i)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', lineHeight: 1.5 }}>{faq.q}</span>
                <span style={{ color: activeFaq === i ? 'var(--gold)' : 'var(--text-muted)', fontSize: 18, flexShrink: 0 }}>
                  {activeFaq === i ? '−' : '+'}
                </span>
              </div>
              {activeFaq === i && (
                <p style={{ marginTop: 12, fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.7 }}>{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────── */}
      <footer style={S.footer}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20, marginBottom: 20 }}>
          {[
            { label: 'PRIVACY POLICY',    action: () => setShowPrivacy(true) },
            { label: 'TERMS OF SERVICE',  action: () => setShowTerms(true) },
            { label: 'REFUND POLICY',     action: () => setShowRefund(true) },
          ].map(({ label, action }) => (
            <button key={label} onClick={action} style={S.footerLink}>{label}</button>
          ))}
          <button onClick={() => onGetStarted('affiliate')} style={{ ...S.footerLink, color: 'var(--gold)' }}>
            AFFILIATE PROGRAM
          </button>
          <a href="mailto:olugbenga1000@gmail.com" style={{ ...S.footerLink, textDecoration: 'none' }}>
            CONTACT SUPPORT
          </a>
        </div>
        <p style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-data)', textAlign: 'center', lineHeight: 1.7 }}>
          © 2026 RiskPilot. Not financial advice. Trading involves significant risk of loss.<br />
          Support: <a href="mailto:olugbenga1000@gmail.com" style={{ color: 'var(--gold)', textDecoration: 'none' }}>olugbenga1000@gmail.com</a>
        </p>
      </footer>

      {/* ── SOCIAL PROOF TOAST ───────────────────── */}
      {showProof && (
        <div style={S.proofToast} className="fade-in">
          <div style={S.proofIcon}>💰</div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>{proof.name} upgraded to Pro</p>
            <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{proof.city} · {proof.time}</p>
          </div>
        </div>
      )}

      {/* ── MODALS ───────────────────────────────── */}
      {showPrivacy && (
        <Modal title="Privacy Policy" date="May 2, 2026" onClose={() => setShowPrivacy(false)}>
          <p><strong>1. Business Information</strong><br />RiskPilot is operated by Olugbenga Ajayi — <a href="mailto:olugbenga1000@gmail.com" style={{ color: 'var(--gold)' }}>olugbenga1000@gmail.com</a></p>
          <p><strong>2. Data We Collect</strong><br />We collect your email and trade data solely to provide the service. We do not sell your data to third parties.</p>
          <p><strong>3. Data Storage</strong><br />Your data is stored securely via Supabase with enterprise-grade encryption. Only you can access your trading records.</p>
          <p><strong>4. Payments</strong><br />Transactions are processed by Paystack (PCI-DSS compliant). RiskPilot never stores your card or banking information.</p>
          <p><strong>5. Cookies</strong><br />We use minimal session cookies for authentication. Meta Pixel is used for ad performance only.</p>
          <p><strong>6. Your Rights</strong><br />Request deletion of your account anytime by emailing <a href="mailto:olugbenga1000@gmail.com" style={{ color: 'var(--gold)' }}>olugbenga1000@gmail.com</a>.</p>
          <p><strong>7. Disclaimer</strong><br />RiskPilot is a software utility for educational purposes only. It does not constitute financial advice.</p>
        </Modal>
      )}

      {showTerms && (
        <Modal title="Terms of Service" date="May 2, 2026" onClose={() => setShowTerms(false)}>
          <p><strong>1. Acceptance</strong><br />By using RiskPilot, you agree to these terms. If you do not agree, do not use the service.</p>
          <p><strong>2. Service</strong><br />RiskPilot is a risk management and trade journaling utility. It does not execute trades, manage funds, or provide investment advice.</p>
          <p><strong>3. License</strong><br />You receive a personal, non-transferable subscription. Sharing or reselling your account is strictly prohibited.</p>
          <p><strong>4. Billing</strong><br />Subscriptions are billed monthly. You can cancel anytime and retain access until your paid period ends.</p>
          <p><strong>5. No Financial Advice</strong><br />Nothing on RiskPilot constitutes financial or trading advice. All trading decisions are solely your responsibility.</p>
          <p><strong>6. Liability</strong><br />RiskPilot shall not be liable for any trading losses or damages arising from use of the service.</p>
          <p><strong>7. Contact</strong><br /><a href="mailto:olugbenga1000@gmail.com" style={{ color: 'var(--gold)' }}>olugbenga1000@gmail.com</a></p>
        </Modal>
      )}

      {showRefund && (
        <Modal title="Refund Policy" date="May 2, 2026" onClose={() => setShowRefund(false)}>
          <p><strong>7-Day Money-Back Guarantee</strong><br />If you are unsatisfied within 7 days of purchase, email us with your Paystack reference and we will issue a full refund — no questions asked.</p>
          <p><strong>How to Request</strong><br />Email <a href="mailto:olugbenga1000@gmail.com" style={{ color: 'var(--gold)' }}>olugbenga1000@gmail.com</a> within 7 days. Include your registered email and payment reference (starts with RP-).</p>
          <p><strong>Processing Time</strong><br />Refunds are processed within 3–5 business days to your original payment method via Paystack.</p>
          <p><strong>After 7 Days</strong><br />Refunds are not available after 7 days. If you experience a technical issue, contact us and we will resolve it.</p>
          <p><strong>Chargebacks</strong><br />Please contact us before initiating a chargeback. Unauthorized chargebacks result in immediate account suspension.</p>
        </Modal>
      )}
    </div>
  );
}

/* ── MODAL COMPONENT ─────────────────────────── */
function Modal({ title, date, onClose, children }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(8,11,15,0.95)',
        backdropFilter: 'blur(10px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '24px 16px',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-2)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px 24px',
          maxWidth: 520,
          width: '100%',
          margin: 'auto',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}
          >×</button>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 24, fontFamily: 'var(--font-data)' }}>
          Last updated: {date}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.7, marginBottom: 28 }}>
          {children}
        </div>
        <button
          onClick={onClose}
          style={{
            width: '100%', padding: 13,
            background: 'var(--gold)', border: 'none',
            borderRadius: 'var(--radius)', color: '#000',
            fontSize: 13, fontWeight: 700,
            fontFamily: 'var(--font-data)', cursor: 'pointer',
          }}
        >
          CLOSE
        </button>
      </div>
    </div>
  );
}

/* ── STYLES ──────────────────────────────────── */
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
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '80px 24px 60px',
    width: '100%',
    maxWidth: 520,
    zIndex: 2,
    gap: 16,
  },
  badge: {
    fontFamily: 'var(--font-data)',
    fontSize: 10,
    fontWeight: 700,
    color: 'var(--gold)',
    letterSpacing: '0.14em',
    background: 'var(--gold-dim)',
    border: '1px solid var(--border-gold)',
    borderRadius: 20,
    padding: '6px 16px',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 32,
    fontWeight: 800,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
    color: 'var(--text)',
  },
  subtitle: {
    fontSize: 15,
    color: 'var(--text-sub)',
    lineHeight: 1.7,
    maxWidth: 400,
  },
  timer: {
    fontFamily: 'var(--font-data)',
    fontSize: 11,
    color: 'var(--text-muted)',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '8px 16px',
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  btnPrimary: {
    padding: '14px 28px',
    background: 'var(--gold)',
    border: 'none',
    borderRadius: 'var(--radius)',
    color: '#000',
    fontSize: 14,
    fontWeight: 800,
    fontFamily: 'var(--font-data)',
    letterSpacing: '0.06em',
    cursor: 'pointer',
    width: '100%',
    maxWidth: 340,
    transition: 'all 0.2s',
  },
  section: {
    width: '100%',
    maxWidth: 520,
    padding: '60px 24px',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 26,
    fontWeight: 800,
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: '-0.01em',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 14,
    width: '100%',
  },
  featureCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px 16px',
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 10,
  },
  featureTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 8,
    color: 'var(--text)',
  },
  featureDesc: {
    fontSize: 12,
    color: 'var(--text-sub)',
    lineHeight: 1.6,
  },
  problemCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)',
    padding: '28px 24px',
    width: '100%',
  },
  problemItem: {
    fontSize: 13,
    color: 'var(--text-sub)',
    padding: '10px 14px',
    background: 'var(--red-dim)',
    border: '1px solid rgba(255,61,87,0.15)',
    borderRadius: 'var(--radius)',
    marginBottom: 8,
    lineHeight: 1.5,
  },
  footer: {
    width: '100%',
    maxWidth: 520,
    padding: '40px 24px',
    borderTop: '1px solid var(--border)',
    zIndex: 2,
  },
  footerLink: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: 10,
    fontWeight: 600,
    fontFamily: 'var(--font-data)',
    letterSpacing: '0.06em',
    cursor: 'pointer',
  },
  proofToast: {
    position: 'fixed',
    bottom: 24,
    left: 16,
    background: 'var(--surface)',
    border: '1px solid var(--border-gold)',
    borderRadius: 'var(--radius)',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    zIndex: 100,
    boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
    maxWidth: 260,
  },
  proofIcon: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    background: 'var(--gold-dim)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    flexShrink: 0,
  },
};
