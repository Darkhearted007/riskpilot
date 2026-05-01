export default function Contact() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#080B0F",
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
      textAlign: "center"
    }}>
      <h1 style={{ fontSize: 28, marginBottom: 12, color: "#D4AF37" }}>
        Contact RiskPilot
      </h1>

      <p style={{ fontSize: 14, color: "#8A9BB0", marginBottom: 20 }}>
        For support or inquiries, reach us directly:
      </p>

      <a
        href="mailto:support@riskpilot.app"
        style={{
          padding: "12px 18px",
          background: "#162030",
          borderRadius: 8,
          color: "#D4AF37",
          textDecoration: "none",
          border: "1px solid rgba(255,255,255,0.1)"
        }}
      >
        support@riskpilot.app
      </a>
    </div>
  );
}
