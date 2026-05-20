import WebSocket from "ws";

/* ===============================
   CONFIG
================================ */
const URL = "ws://127.0.0.1:4000/ws";

const socket = new WebSocket(URL);

/* ===============================
   CONNECTION OPEN
================================ */
socket.on("open", () => {
  console.log("✅ connected to Risk Engine");

  // initial trade payload
  sendTrade();

  // keep-alive traffic (prevents silent disconnect)
  setInterval(() => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "ping", ts: Date.now() }));
    }
  }, 5000);
});

/* ===============================
   MESSAGE HANDLER
================================ */
socket.on("message", (msg) => {
  try {
    const data = JSON.parse(msg.toString());
    console.log("📩 response:", data);
  } catch (err) {
    console.log("📩 raw response:", msg.toString());
  }
});

/* ===============================
   ERROR HANDLING
================================ */
socket.on("error", (err) => {
  console.error("❌ socket error:", err.message);
});

/* ===============================
   CLOSE HANDLING
================================ */
socket.on("close", () => {
  console.log("⚠️ disconnected from Risk Engine");
});

/* ===============================
   SEND TRADE FUNCTION
================================ */
function sendTrade() {
  const trade = {
    type: "trade",
    direction: "BUY",
    lot_size: 0.1,
    risk_percent: 1.5,
    entry_price: 2320,
    symbol: "XAUUSD",
  };

  console.log("📤 sending trade:", trade);

  socket.send(JSON.stringify(trade));
}

/* ===============================
   OPTIONAL: repeated test trades
================================ */
setInterval(() => {
  if (socket.readyState === WebSocket.OPEN) {
    sendTrade();
  }
}, 10000);
