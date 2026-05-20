import { useEffect, useState, useRef } from "react";

export function useRiskLive() {
  const [data, setData] = useState(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4000/ws");
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      console.log("✅ RiskLive connected");
    };

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        setData(parsed);
      } catch (err) {
        console.log("WS parse error:", err);
      }
    };

    ws.onerror = (err) => {
      console.log("❌ WS error:", err);
    };

    ws.onclose = () => {
      setConnected(false);
      console.log("⚠️ RiskLive disconnected");
    };

    return () => {
      ws.close();
    };
  }, []);

  return {
    data,
    connected,
    socket: wsRef.current,
  };
}
