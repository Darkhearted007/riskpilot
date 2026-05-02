export default function Support({ onBack }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: '40px 24px', fontFamily: 'var(--font-body)' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', marginBottom: 32, fontFamily: 'var(--font-data)', letterSpacing: '0.05em' }}
        >
          ← BACK TO MAIN
        </button>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Contact Support</h1>
        <p style={{ color: 'var(--text-sub)', marginBottom: 32, lineHeight: 1.6 }}>
          Need help with your account, payment, or access? We're here to help.
        </p>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-data)', letterSpacing: '0.1em', marginBottom: 6 }}>SUPPORT EMAIL</p>
            <a
              href="mailto:olugbenga1000@gmail.com"
              style={{ color: 'var(--gold)', fontWeight: 700, fontSize: 16, textDecoration: 'none' }}
            >
              olugbenga1000@gmail.com
            </a>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <p style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.6 }}>
              Include your registered email address and Paystack payment reference (starts with <span style={{ color: 'var(--gold)', fontFamily: 'var(--font-data)' }}>RP-</span>) when reaching out about a payment issue.
              We typically respond within 24 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
