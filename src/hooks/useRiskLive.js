import { useEffect, useRef, useState } from "react";

const WS_URL =
  import.meta.env.VITE_WS_URL ||
  "ws://localhost:4000/ws";

export function useRiskLive() {
  const [connected, setConnected] = useState(false);
  const [insight, setInsight] = useState(null);

  const wsRef = useRef(null);

  useEffect(() => {
    const socket = new WebSocket(WS_URL);

    wsRef.current = socket;

    socket.onopen = () => {
      console.log("✅ Risk Engine Connected");
      setConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setInsight(data);
      } catch (err) {
        console.log("WS Parse Error:", err);
      }
    };

    socket.onerror = (err) => {
      console.log("WS Error:", err);
    };

    socket.onclose = () => {
      console.log("⚠️ Risk Engine Disconnected");
      setConnected(false);
    };

    return () => {
      socket.close();
    };
  }, []);

  return {
    connected,
    insight,
    socket: wsRef.current,
  };
}
