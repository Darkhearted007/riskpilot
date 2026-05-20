import Fastify from "fastify";
import cors from "@fastify/cors";
import dotenv from "dotenv";
import http from "http";
import { WebSocketServer } from "ws";

import riskRoutes from "./routes/riskRoutes.js";

/* ===============================
   V4 INSTITUTIONAL ORCHESTRATOR
================================ */
import { processTrade } from "./v4/router/index.js";

dotenv.config();

/* ===============================
   FASTIFY INIT
================================ */
const app = Fastify({
  logger: true,
});

/* ===============================
   GLOBAL SAFETY HANDLERS
================================ */
process.on("unhandledRejection", (err) => {
  console.log("⚠️ UNHANDLED REJECTION:", err);
});

process.on("uncaughtException", (err) => {
  console.log("⚠️ UNCAUGHT EXCEPTION:", err);
});

/* ===============================
   CORS
================================ */
await app.register(cors, {
  origin: "*",
});

/* ===============================
   ROUTES
================================ */
app.register(riskRoutes, {
  prefix: "/api/risk",
});

/* ===============================
   HEALTH CHECK
================================ */
app.get("/", async () => {
  return {
    service: "RiskPilot Institutional Engine",
    status: "online",
    version: "v4-clean-router",
    timestamp: new Date().toISOString(),
  };
});

/* ===============================
   HTTP SERVER
================================ */
const server = http.createServer(app.server);

/* ===============================
   WEBSOCKET SERVER
================================ */
const wss = new WebSocketServer({
  server,
  path: "/ws",
});

/* ===============================
   CONNECTION HANDLER
================================ */
wss.on("connection", (socket) => {
  console.log("🔌 WS CONNECTED");

  socket.isAlive = true;

  socket.on("pong", () => {
    socket.isAlive = true;
  });

  /* -------------------------------
     HEARTBEAT SAFETY
  -------------------------------- */
  const heartbeat = setInterval(() => {
    if (!socket.isAlive) {
      console.log("💀 DEAD SOCKET");
      return socket.terminate();
    }

    socket.isAlive = false;
    socket.ping();
  }, 20000);

  /* -------------------------------
     MESSAGE HANDLER
  -------------------------------- */
  socket.on("message", async (msg) => {
    try {
      let data;

      try {
        data = JSON.parse(msg.toString());
      } catch {
        data = { type: "trade" };
      }

      const trade = {
        type: data.type || "trade",
        direction: data.direction || "BUY",
        lot_size: Number(data.lot_size || 0.1),
        risk_percent: Number(data.risk_percent || 1),
        entry_price: Number(data.entry_price || 0),
        symbol: data.symbol || "XAUUSD",
      };

      /* ===============================
         V4 MASTER BRAIN EXECUTION
      ================================= */
      const result = await processTrade("anon", trade);

      const response = {
        type: "RISKPILOT_V4_DECISION_STREAM",

        decision: result.decision,
        finalScore: result.finalScore,

        signal: result.signal,
        context: result.context,
        memory: result.memory,
        hedge: result.hedge,

        agents: result.agents,
        consensus: result.consensus,
        swarm: result.swarm,
        reward: result.reward,

        timestamp: new Date().toISOString(),
      };

      if (socket.readyState === 1) {
        socket.send(JSON.stringify(response));
      }

    } catch (err) {
      console.log("⚠️ WS ERROR:", err.message);

      try {
        socket.send(
          JSON.stringify({
            type: "ERROR",
            message: "v4 engine recovered safely",
            timestamp: new Date().toISOString(),
          })
        );
      } catch {}
    }
  });

  /* -------------------------------
     CLEANUP
  -------------------------------- */
  socket.on("close", () => {
    clearInterval(heartbeat);
    console.log("🔌 WS DISCONNECTED");
  });

  socket.on("error", (err) => {
    clearInterval(heartbeat);
    console.log("❌ WS ERROR:", err.message);
  });
});

/* ===============================
   START SERVER
================================ */
const PORT = process.env.PORT || 4000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(
    `🚀 RiskPilot V4 Institutional Engine running on port ${PORT}`
  );
});
