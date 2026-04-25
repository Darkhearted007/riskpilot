import { useState } from "react";

export default function RiskPilotInteractiveBanner() {
  const [balance, setBalance] = useState(1000);
  const [risk, setRisk] = useState(2);
  const [sl, setSl] = useState(50);

  const riskAmount = (balance * risk) / 100;
  const positionSize = riskAmount / sl || 0;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 1100,
        margin: "0 auto",
        padding: 30,
        borderRadius: 20,
        background: "radial-gradient(circle at 70% 40%, #101826, #05070A)",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
        border: "1px solid rgba(212,175,55,0.2)"
      }}
    >
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div
          style={{
            background: "#D4AF37",
            color: "#000",
            padding: "6px 12px",
            borderRadius: 20,
            fontWeight: 700,
            fontSize: 12
          }}
        >
          GOLD EDITION
        </div>

        <div style={{ fontSize: 12, opacity: 0.7 }}>
          LIVE RISK CALCULATOR
        </div>
      </div>

      {/* TITLE */}
      <h1 style={{ fontSize: 42, marginTop: 20 }}>
        RiskPilot <span style={{ color: "#D4AF37" }}>Gold</span>
      </h1>

      <p style={{ opacity: 0.8 }}>
        Trade smarter. Control risk before entering any trade.
      </p>

      {/* INTERACTIVE CALCULATOR */}
      <div
        style={{
          marginTop: 25,
          padding: 20,
          background: "#0C111A",
          borderRadius: 16
        }}
      >
        <h3 style={{ marginBottom: 15 }}>Try Live Calculator</h3>

        <input
          type="number"
          placeholder="Account Balance"
          value={balance}
          onChange={(e) => setBalance(Number(e.target.value))}
          style={inputStyle}
        />

        <input
          type="number"
          placeholder="Risk %"
          value={risk}
          onChange={(e) => setRisk(Number(e.target.value))}
          style={inputStyle}
        />

        <input
          type="number"
          placeholder="Stop Loss"
          value={sl}
          onChange={(e) => setSl(Number(e.target.value))}
          style={inputStyle}
        />

        <div style={{ marginTop: 15 }}>
          <p>⚠️ Risk Amount: ${riskAmount.toFixed(2)}</p>
          <p>📊 Position Size: {positionSize.toFixed(2)}</p>
        </div>
      </div>

      {/* CTA SECTION */}
      <div style={{ marginTop: 25, display: "flex", gap: 10 }}>
        <a
          href="https://paystack.shop/pay/cqc6umcs3y"
          target="_blank"
          style={ctaButton}
        >
          Get RiskPilot Gold
        </a>

        <button
          onClick={() => alert("Redirecting to demo...")}
          style={secondaryButton}
        >
          Watch Demo
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: 10,
  marginBottom: 10,
  borderRadius: 8,
  border: "1px solid #333",
  background: "#05070A",
  color: "#fff"
};

const ctaButton = {
  padding: "10px 16px",
  background: "#D4AF37",
  color: "#000",
  fontWeight: "700",
  borderRadius: 10,
  textDecoration: "none"
};

const secondaryButton = {
  padding: "10px 16px",
  background: "transparent",
  color: "#fff",
  border: "1px solid #444",
  borderRadius: 10,
  cursor: "pointer"
};
