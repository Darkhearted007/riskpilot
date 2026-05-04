import React from "react";

const PLANS = [
  {
    name: "Pro",
    price: "₦5,000 / month",
    url: "https://paystack.shop/pay/riskpilot-pro",
    color: "#4CAF82",
  },
  {
    name: "Pro+",
    price: "₦15,000 / month",
    url: "https://paystack.shop/pay/riskpilot-pro-plus",
    color: "#7B6FF0",
  },
  {
    name: "Elite",
    price: "₦30,000 / month",
    url: "https://paystack.shop/pay/riskpilot-elite",
    color: "#E05C5C",
  },
];

export default function UpgradePlans() {
  const handleClick = (url) => {
    window.location.href = url;
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
            onClick={() => handleClick(plan.url)}
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
