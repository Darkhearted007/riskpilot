import { useEffect, useState, useRef } from "react";
import {
  connectRiskSocket,
  subscribeToRisk,
} from "../lib/riskSocket";

export function useRiskLive() {
  const [risk, setRisk] = useState(null);
  const [connected, setConnected] = useState(false);

  const socketRef = useRef(null);

  useEffect(() => {
    const socket = connectRiskSocket();
    socketRef.current = socket;

    // connection status
    socket.onopen = () => setConnected(true);
    socket.onclose = () => setConnected(false);

    // subscribe to live risk updates
    const unsubscribe = subscribeToRisk((data) => {
      if (!data) return;

      setRisk(data);
    });

    return () => {
      unsubscribe();

      // optional: do NOT auto-close shared socket
      socketRef.current = null;
    };
  }, []);

  return {
    risk,
    connected,
  };
}
