import React from "react";
import { useAuth } from "../context/AuthContext";

const PLANS = [
  {
    name: "Pro",
    price: "₦5,000 / month",
    url: "https://paystack.shop/pay/riskpilot-pro",
    plan: "pro",
    color: "#4CAF82",
  },
  {
    name: "Pro+",
    price: "₦15,000 / month",
    url: "https://paystack.shop/pay/riskpilot-pro-plus",
    plan: "pro_plus",
    color: "#7B6FF0",
  },
  {
    name: "Elite",
    price: "₦30,000 / month",
    url: "https://paystack.shop/pay/riskpilot-elite",
    plan: "elite",
    color: "#E05C5C",
  },
];

export default function UpgradePlans() {
  const { user } = useAuth();

  const handleClick = (plan) => {
    const url = new URL(plan.url);

    // 🔥 attach identity (critical for webhook)
    url.searchParams.append("userId", user?.id || "");
    url.searchParams.append("email", user?.email || "");
    url.searchParams.append("plan", plan.plan);

    window.location.href = url.toString();
  };

  return (
    <div style={{ display: "grid", gap: 16, marginTop: 30 }}>
      {PLANS.map((plan) => (
        <div
          key={plan.name}
          style={{
            border: `1px solid ${plan.color}`,
            padding: 16,
            borderRadius: 10,
            background: "#0f0f14",
          }}
        >
          <h3 style={{ color: plan.color }}>{plan.name}</h3>
          <p style={{ color: "#aaa" }}>{plan.price}</p>

          <button
            onClick={() => handleClick(plan)}
            style={{
              marginTop: 10,
              padding: "10px 16px",
              background: plan.color,
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              color: "#000",
              fontWeight: "bold",
            }}
          >
            Upgrade
          </button>
        </div>
      ))}
    </div>
  );
}
