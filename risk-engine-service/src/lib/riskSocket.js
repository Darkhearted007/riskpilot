let socket = null;
let listeners = [];
let reconnectAttempts = 0;
let reconnectTimer = null;

// ===============================
// CONNECT TO RISK ENGINE WS
// ===============================
export function connectRiskSocket() {
  if (socket && socket.readyState === WebSocket.OPEN) {
    return socket;
  }

  const WS_URL =
    import.meta.env.VITE_RISK_WS_URL || "ws://127.0.0.1:4000/ws";

  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    console.log("🔌 Connected to Risk Engine WS");
    reconnectAttempts = 0;
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      // ignore heartbeat ping
      if (data.type === "PING") return;

      // normalize backend response
      const payload =
        data.type === "LIVE_FEEDBACK" ? data.payload : data;

      // broadcast to all subscribers
      listeners.forEach((fn) => fn(payload));
    } catch (err) {
      console.error("❌ WS parse error:", err);
    }
  };

  socket.onclose = () => {
    console.warn("⚠️ Risk Engine WS disconnected");
    attemptReconnect();
  };

  socket.onerror = (err) => {
    console.error("❌ WS error:", err);
  };

  return socket;
}

// ===============================
// AUTO RECONNECT LOGIC
// ===============================
function attemptReconnect() {
  if (reconnectTimer) return;

  reconnectAttempts += 1;

  const delay = Math.min(1000 * reconnectAttempts, 10000);

  reconnectTimer = setTimeout(() => {
    console.log(`🔄 Reconnecting... attempt ${reconnectAttempts}`);

    reconnectTimer = null;
    connectRiskSocket();
  }, delay);
}

// ===============================
// SUBSCRIBE TO LIVE RISK FEED
// ===============================
export function subscribeToRisk(fn) {
  listeners.push(fn);

  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

// ===============================
// SEND DATA TO RISK ENGINE
// ===============================
export function sendRiskData(payload) {
  if (!socket || socket.readyState !== WebSocket.OPEN) return;

  socket.send(JSON.stringify(payload));
}

// ===============================
// FORCE DISCONNECT (optional)
// ===============================
export function disconnectRiskSocket() {
  if (socket) {
    socket.close();
    socket = null;
  }

  listeners = [];

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}
