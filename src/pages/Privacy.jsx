export default function Privacy({ onBack }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: '40px 24px', fontFamily: 'var(--font-body)' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', marginBottom: 32, fontFamily: 'var(--font-data)', letterSpacing: '0.05em' }}
        >
          ← BACK TO MAIN
        </button>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, marginBottom: 4 }}>Privacy Policy</h1>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 32, fontFamily: 'var(--font-data)' }}>Last updated: May 2, 2026</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.7 }}>
          <section>
            <h3 style={{ color: 'var(--text)', marginBottom: 6 }}>1. Business Information</h3>
            <p>RiskPilot is operated by Olugbenga Adeyemi. For any privacy-related concerns, contact us at <a href="mailto:olugbenga1000@gmail.com" style={{ color: 'var(--gold)' }}>olugbenga1000@gmail.com</a>.</p>
          </section>

          <section>
            <h3 style={{ color: 'var(--text)', marginBottom: 6 }}>2. Information We Collect</h3>
            <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>Email address (for account authentication)</li>
              <li>Trade journal entries (stored privately per user)</li>
              <li>Payment confirmation reference (processed via Paystack)</li>
            </ul>
          </section>

          <section>
            <h3 style={{ color: 'var(--text)', marginBottom: 6 }}>3. Data Storage</h3>
            <p>Your trade data is stored securely via Supabase with enterprise-grade encryption. Only you can access your private trading records. We do not sell your data to third parties.</p>
          </section>

          <section>
            <h3 style={{ color: 'var(--text)', marginBottom: 6 }}>4. Payments</h3>
            <p>All transactions are processed by <strong>Paystack</strong>, a PCI-DSS Level 1 compliant payment processor. RiskPilot does not store your card details or banking information at any point.</p>
          </section>

          <section>
            <h3 style={{ color: 'var(--text)', marginBottom: 6 }}>5. Cookies</h3>
            <p>We use minimal session cookies required for authentication. Meta Pixel may be used for ad performance measurement. No additional third-party tracking cookies are set without consent.</p>
          </section>

          <section>
            <h3 style={{ color: 'var(--text)', marginBottom: 6 }}>6. Your Rights</h3>
            <p>You may request deletion of your account and all associated data at any time by emailing <a href="mailto:olugbenga1000@gmail.com" style={{ color: 'var(--gold)' }}>olugbenga1000@gmail.com</a>. We will process your request within 7 business days.</p>
          </section>

          <section>
            <h3 style={{ color: 'var(--text)', marginBottom: 6 }}>7. Disclaimer</h3>
            <p>RiskPilot is a software utility for informational and educational purposes only. It does not constitute financial advice or a brokerage service. Trading involves significant risk of loss.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
