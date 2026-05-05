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
    <div style={{
      padding: "20px 16px 32px",
      width: "100%",
      maxWidth: 520,
      margin: "0 auto",
    }}>
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
        color: "var(--text-sub)",
        textAlign: "center",
        marginBottom: 24,
        fontFamily: "var(--font-data)",
      }}>
        Cancel anytime · Secured by Paystack
      </p>

      {/* Vertical stack — scrolls naturally with page */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}>
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            style={{
              width: "100%",
              border: `1px solid ${plan.highlighted ? plan.color : "var(--border-high)"}`,
              borderRadius: "var(--radius-lg)",
              padding: "20px 18px",
              background: plan.highlighted
                ? `linear-gradient(135deg, var(--surface) 0%, ${plan.color}15 100%)`
                : "var(--surface)",
              display: "flex",
              flexDirection: "column",
              gap: 0,
            }}
          >
            {/* Badge */}
            <div style={{
              display: "inline-block",
              fontSize: 9,
              fontWeight: 700,
              fontFamily: "var(--font-data)",
              letterSpacing: "0.08em",
              padding: "3px 10px",
              borderRadius: 20,
              background: plan.highlighted ? plan.color : "var(--surface-top)",
              color: plan.highlighted ? "#000" : "var(--text-muted)",
              marginBottom: 14,
              alignSelf: "flex-start",
            }}>
              {plan.highlighted ? "⭐ " : ""}{plan.tag}
            </div>

            {/* Name + Price row */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}>
              <h3 style={{
                fontFamily: "var(--font-display)",
                fontSize: 22,
                fontWeight: 800,
                color: plan.color,
              }}>
                {plan.name}
              </h3>
              <div style={{ textAlign: "right" }}>
                <span style={{
                  fontFamily: "var(--font-data)",
                  fontSize: 20,
                  fontWeight: 700,
                  color: plan.highlighted ? plan.color : "var(--text)",
                }}>
                  {plan.price}
                </span>
                <span style={{
                  fontFamily: "var(--font-data)",
                  fontSize: 11,
                  color: "var(--text-muted)",
                  marginLeft: 4,
                }}>
                  {plan.period}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div style={{
              height: 1,
              background: "var(--border)",
              marginBottom: 16,
            }} />

            {/* Features */}
            <ul style={{
              listStyle: "none",
              padding: 0,
              margin: "0 0 20px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}>
              {plan.features.map((f, i) => (
                <li key={i} style={{
                  fontSize: 13,
                  color: "var(--text-sub)",
                  lineHeight: 1.5,
                  fontFamily: "var(--font-body)",
                }}>
                  {f}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <button
              onClick={() => handleClick(plan)}
              style={{
                width: "100%",
                padding: "13px 16px",
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

      <p style={{
        fontSize: 11,
        color: "var(--text-muted)",
        textAlign: "center",
        marginTop: 20,
        fontFamily: "var(--font-data)",
      }}>
        🔒 No hidden fees · Cancel anytime
      </p>
    </div>
  );
}
