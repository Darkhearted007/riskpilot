import React from "react";
import { useAuth } from "../context/AuthContext";

const PLANS = [
  {
    name: "Pro",
    tag: "STARTER",
    price: "₦5,000",
    period: "/ month",
    color: "#4CAF82",
    plan: "pro",
    url: "https://paystack.shop/pay/riskpilot-pro",
    highlighted: false,
    features: [
      "✅ XAUUSD Risk Calculator",
      "✅ Trade Journal (50/mo)",
      "✅ Basic Discipline Score",
      "✅ Session Detection",
      "✅ Email Support",
    ],
  },
  {
    name: "Pro+",
    tag: "MOST POPULAR",
    price: "₦15,000",
    period: "/ month",
    color: "#7B6FF0",
    plan: "pro_plus",
    url: "https://paystack.shop/pay/riskpilot-pro-plus",
    highlighted: true,
    features: [
      "✅ Everything in Pro",
      "✅ Unlimited Trade Journal",
      "✅ Advanced Discipline Engine",
      "✅ Performance Analytics",
      "✅ Equity Curve Tracking",
      "✅ Priority Support",
    ],
  },
  {
    name: "Elite",
    tag: "FULL ACCESS",
    price: "₦30,000",
    period: "/ month",
    color: "#D4AF5A",
    plan: "elite",
    url: "https://paystack.shop/pay/riskpilot-elite",
    highlighted: false,
    features: [
      "✅ Everything in Pro+",
      "✅ Elite Dashboard",
      "✅ Session Analytics",
      "✅ Win Rate Intelligence",
      "✅ Admin Reporting",
      "✅ Dedicated Support",
    ],
  },
];

export default function UpgradePlans() {
  const { user } = useAuth();

  const handleClick = (plan) => {
    const url = new URL(plan.url);
    url.searchParams.append("userId", user?.id || "");
    url.searchParams.append("email", user?.email || "");
    url.searchParams.append("plan", plan.plan);
    window.location.href = url.toString();
  };

  return (
    <div style={{ padding: "24px 0 8px", width: "100%" }}>
      <p style={{
        fontFamily: "var(--font-data)",
        fontSize: 10,
        fontWeight: 700,
        color: "var(--gold)",
        letterSpacing: "0.14em",
        marginBottom: 8,
        textAlign: "center",
      }}>
        CHOOSE YOUR PLAN
      </p>

      <h2 style={{
        fontFamily: "var(--font-display)",
        fontSize: 22,
        fontWeight: 800,
        color: "var(--text)",
        textAlign: "center",
        marginBottom: 6,
        letterSpacing: "-0.01em",
      }}>
        Scale Your Trading Edge
      </h2>

      <p style={{
        fontSize: 12,
        color: "var(--text-muted)",
        textAlign: "center",
        marginBottom: 24,
        fontFamily: "var(--font-data)",
      }}>
        Cancel anytime. Secure payment via Paystack.
      </p>

      <div style={{
        width: "100%",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
        paddingBottom: 8,
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}>
        <div style={{
          display: "flex",
          flexDirection: "row",
          gap: 14,
          minWidth: "max-content",
          padding: "4px 4px 8px",
        }}>
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              style={{
                width: 230,
                flexShrink: 0,
                border: `1px solid ${plan.highlighted ? plan.color : "var(--border)"}`,
                borderRadius: "var(--radius-lg)",
                padding: "20px 18px",
                background: plan.highlighted
                  ? `linear-gradient(135deg, var(--surface) 0%, ${plan.color}15 100%)`
                  : "var(--surface)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{
                display: "inline-block",
                fontSize: 9,
                fontWeight: 700,
                fontFamily: "var(--font-data)",
                letterSpacing: "0.08em",
                padding: "3px 10px",
                borderRadius: 20,
                background: plan.highlighted ? plan.color : "var(--bg-3)",
                color: plan.highlighted ? "#000" : "var(--text-muted)",
                marginBottom: 14,
                alignSelf: "flex-start",
              }}>
                {plan.highlighted ? "⭐ " : ""}{plan.tag}
              </div>

              <h3 style={{
                fontFamily: "var(--font-display)",
                fontSize: 20,
                fontWeight: 800,
                color: plan.color,
                marginBottom: 8,
              }}>
                {plan.name}
              </h3>

              <div style={{
                display: "flex",
                alignItems: "baseline",
                gap: 4,
                marginBottom: 16,
              }}>
                <span style={{
                  fontFamily: "var(--font-data)",
                  fontSize: 22,
                  fontWeight: 700,
                  color: plan.highlighted ? plan.color : "var(--text)",
                }}>
                  {plan.price}
                </span>
                <span style={{
                  fontFamily: "var(--font-data)",
                  fontSize: 11,
                  color: "var(--text-muted)",
                }}>
                  {plan.period}
                </span>
              </div>

              <div style={{
                height: 1,
                background: "var(--border)",
                marginBottom: 16,
              }} />

              <ul style={{
                listStyle: "none",
                padding: 0,
                margin: "0 0 20px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                flex: 1,
              }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{
                    fontSize: 12,
                    color: "var(--text-sub)",
                    lineHeight: 1.5,
                  }}>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleClick(plan)}
                style={{
                  width: "100%",
                  padding: "11px 16px",
                  background: plan.highlighted ? plan.color : "transparent",
                  border: `1px solid ${plan.color}`,
                  borderRadius: "var(--radius)",
                  cursor: "pointer",
                  color: plan.highlighted ? "#000" : plan.color,
                  fontWeight: 700,
                  fontSize: 13,
                  fontFamily: "var(--font-data)",
                  letterSpacing: "0.06em",
                  transition: "all 0.2s",
                }}
              >
                Get {plan.name} →
              </button>
            </div>
          ))}
        </div>
      </div>

      <p style={{
        fontSize: 11,
        color: "var(--text-muted)",
        textAlign: "center",
        marginTop: 16,
        fontFamily: "var(--font-data)",
      }}>
        🔒 Secured by Paystack · No hidden fees · Cancel anytime
      </p>
    </div>
  );
}
