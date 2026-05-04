import React, { useEffect, useState } from "react";

export default function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("/api/admin/users", {
      headers: {
        "x-admin-key": import.meta.env.VITE_ADMIN_SECRET,
      },
    })
      .then((res) => res.json())
      .then(setUsers);
  }, []);

  const upgradeUser = async (email, plan) => {
    await fetch("/api/admin/force-upgrade", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": import.meta.env.VITE_ADMIN_SECRET,
      },
      body: JSON.stringify({ email, plan }),
    });

    alert("User updated");
  };

  return (
    <div style={{ padding: 20, color: "#fff" }}>
      <h2>👥 Users</h2>

      <div style={{ marginTop: 20 }}>
        {users.map((u) => (
          <div
            key={u.id}
            style={{
              padding: 12,
              border: "1px solid #333",
              marginBottom: 10,
              borderRadius: 10,
              background: "#111",
            }}
          >
            <p>{u.email}</p>
            <p>Plan: {u.plan}</p>

            <button onClick={() => upgradeUser(u.email, "PRO")}>
              Upgrade Pro
            </button>

            <button onClick={() => upgradeUser(u.email, "ELITE")}>
              Upgrade Elite
            </button>

            <button onClick={() => upgradeUser(u.email, "FREE")}>
              Downgrade
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
