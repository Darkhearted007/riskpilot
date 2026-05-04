import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AdminDashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // mock analytics (replace with API later)
    setData([
      { day: "Mon", revenue: 5000 },
      { day: "Tue", revenue: 12000 },
      { day: "Wed", revenue: 8000 },
      { day: "Thu", revenue: 15000 },
      { day: "Fri", revenue: 22000 },
      { day: "Sat", revenue: 18000 },
      { day: "Sun", revenue: 30000 },
    ]);
  }, []);

  return (
    <div style={{ padding: 20, color: "#fff" }}>
      <h2>📊 Admin Dashboard</h2>

      <div
        style={{
          marginTop: 20,
          background: "#111",
          padding: 20,
          borderRadius: 12,
        }}
      >
        <h3>Revenue Analytics</h3>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#4CAF82" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
