import { WebSocketServer } from "ws";

let wss;

export function initWS(server) {
  if (wss) return wss;

  wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    console.log("🟢 Client connected");

    ws.isAlive = true;

    ws.on("pong", () => {
      ws.isAlive = true;
    });

    ws.on("message", (msg) => {
      try {
        const data = JSON.parse(msg.toString());

        if (data.type === "ping") {
          ws.send(JSON.stringify({ type: "pong" }));
        }

        if (data.type === "trade") {
          ws.send(JSON.stringify({
            type: "LIVE_FEEDBACK",
            score: 95,
            state: "STABLE",
            alerts: ["Session: London", "Normal conditions"],
            timestamp: new Date().toISOString()
          }));
        }

      } catch (e) {
        ws.send(JSON.stringify({ error: "Invalid message format" }));
      }
    });
  });

  // heartbeat (prevents ghost connections)
  setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  return wss;
}
