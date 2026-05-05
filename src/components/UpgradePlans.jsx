import React from "react";
import { useAuth } from "../context/AuthContext";

const PLANS = [
  {
    name: "RiskPilot Pro",
    price: "₦5,000",
    period: "/month",
    url: "https://paystack.shop/pay/YOUR_PRO_LINK",
    plan: "pro",
    color: "#D4AF37",
    features: [
      "Precision XAUUSD Calculator",
      "Unlimited Active Trades",
      "Full Trade Journal",
      "Advanced Analytics",
      "Session Insights",
      "Priority Support"
    ]
  },
  {
    name: "RiskPilot Pro-Plus",
    price: "₦15,000",
    period: "/month",
    url: "https://paystack.shop/pay/YOUR_PRO_PLUS_LINK",
    plan: "pro_plus",
    color: "#7B6FF0",
    features: [
      "Everything in Pro",
      "XAUUSD + XAG (Silver)",
      "Trade Signals Access",
      "Advanced Risk Tools",
      "Custom Alerts",
      "Early Access Features"
    ]
  },
  {
    name: "RiskPilot Elite",
    price: "₦30,000",
    period: "/month",
    url: "https://paystack.shop/pay/YOUR_ELITE_LINK",
    plan: "elite",
    color: "#E05C5C",
    features: [
      "Everything in Pro-Plus",
      "All Forex Pairs Support",
      "API Access",
      "Team Collaboration",
      "White-Label Option",
      "Dedicated Support"
    ]
  },
];

export default function UpgradePlans() {
  const { user } = useAuth();

  const handleClick = (plan) => {
    // Check if using placeholder - warn user
    if (plan.url.includes("YOUR_")) {
      alert("Payment link not configured. Contact support to set up payment.");
      return;
    }

    const url = new URL(plan.url);

    // Attach identity for webhook tracking
    url.searchParams.append("userId", user?.id || "");
    url.searchParams.append("email", user?.email || "");
    url.searchParams.append("plan", plan.plan);

    window.location.href = url.toString();
  };

  return (
    <div style={{ display: "grid", gap: 20, marginTop: 30 }}>
      {PLANS.map((plan) => (
        <div
          key={plan.name}
          style={{
            border: `2px solid ${plan.color}`,
            padding: 20,
            borderRadius: 12,
            background: "#0f0f14",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <h3 style={{ color: plan.color, fontSize: 20, margin: 0, fontWeight: "bold" }}>{plan.name}</h3>
              <p style={{ color: "#666", fontSize: 12, margin: "4px 0 0" }}>Monthly Subscription</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ color: "#fff", fontSize: 28, fontWeight: "bold" }}>{plan.price}</span>
              <span style={{ color: "#666", fontSize: 14 }}>{plan.period}</span>
            </div>
          </div>

          <ul style={{ margin: "16px 0", paddingLeft: 20, color: "#aaa", fontSize: 13 }}>
            {plan.features.map((feature, i) => (
              <li key={i} style={{ marginBottom: 6 }}>✅ {feature}</li>
            ))}
          </ul>

          <button
            onClick={() => handleClick(plan)}
            style={{
              width: "100%",
              padding: "14px 16px",
              background: plan.color,
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              color: "#000",
              fontWeight: "bold",
              fontSize: 15,
            }}
          >
            Subscribe to {plan.name} - {plan.price}{plan.period}
          </button>
        </div>
      ))}
    </div>
  );
}