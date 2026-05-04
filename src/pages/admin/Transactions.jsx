import React, { useEffect, useState } from "react";

export default function Transactions() {
  const [tx, setTx] = useState([]);

  useEffect(() => {
    fetch("/api/admin/transactions", {
      headers: {
        "x-admin-key": import.meta.env.VITE_ADMIN_SECRET,
      },
    })
      .then((res) => res.json())
      .then(setTx);
  }, []);

  return (
    <div style={{ padding: 20, color: "#fff" }}>
      <h2>💳 Transactions</h2>

      <div style={{ marginTop: 20 }}>
        {tx.map((t) => (
          <div
            key={t.id}
            style={{
              padding: 12,
              border: "1px solid #333",
              marginBottom: 10,
              borderRadius: 10,
              background: "#111",
            }}
          >
            <p>{t.email}</p>
            <p>₦{t.amount}</p>
            <p>Plan: {t.plan}</p>
            <p>{t.reference}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
