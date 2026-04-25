import RiskPilotInteractiveBanner from "./components/RiskPilotInteractiveBanner";

export default function App() {
  return (
    <div style={{ background: "#05070A", minHeight: "100vh", padding: 40 }}>
      <RiskPilotInteractiveBanner />
    </div>
  );
}
import RiskCalculator from "../components/RiskCalculator";

export default function Landing() {
  return (
    <div style={{ background: "#05070A", color: "#fff", minHeight: "100vh", padding: "40px" }}>
      
      {/* HERO */}
      <div style={{ textAlign: "center", marginBottom: 50 }}>
        <h1 style={{ fontSize: "3rem", fontWeight: "800" }}>
          RiskPilot <span style={{ color: "#D4AF37" }}>Gold</span>
        </h1>

        <p style={{ fontSize: "1.2rem", opacity: 0.8 }}>
          Stop blowing your trading account with poor risk management.
        </p>

        <p style={{ marginTop: 10, color: "#aaa" }}>
          Trade smarter. Protect capital. Control risk.
        </p>

        {/* CTA */}
        <a
          href="https://paystack.shop/pay/cqc6umcs3y"
          target="_blank"
          style={{
            display: "inline-block",
            marginTop: 20,
            padding: "12px 24px",
            background: "#D4AF37",
            color: "#000",
            fontWeight: "700",
            borderRadius: 8,
            textDecoration: "none"
          }}
        >
          Get RiskPilot Gold
        </a>
      </div>

      {/* VALUE SECTION */}
      <div style={{ display: "grid", gap: 20, maxWidth: 900, margin: "0 auto" }}>
        <div style={{ padding: 20, background: "#0C111A", borderRadius: 12 }}>
          <h3>📊 Position Size Calculator</h3>
          <p>Know exactly how much to trade before entering the market.</p>
        </div>

        <div style={{ padding: 20, background: "#0C111A", borderRadius: 12 }}>
          <h3>⚠️ Risk Control Engine</h3>
          <p>Set risk limits and avoid account blowups automatically.</p>
        </div>

        <div style={{ padding: 20, background: "#0C111A", borderRadius: 12 }}>
          <h3>💰 Reward Planning</h3>
          <p>Always know your R:R before executing trades.</p>
        </div>
      </div>

      {/* DEMO TOOL */}
      <div style={{ marginTop: 50 }}>
        <RiskCalculator />
      </div>
    </div>
  );
}
