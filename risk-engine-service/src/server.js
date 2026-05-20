import Fastify from "fastify";
import cors from "@fastify/cors";
import dotenv from "dotenv";
import http from "http";
import { WebSocketServer } from "ws";

import riskRoutes from "./routes/riskRoutes.js";
import { analyzeLiveBehavior } from "./engines/liveEngine.js";
import {
  getMarketSession,
  getVolatilityAdjustment,
} from "./engines/contextEngine.js";

dotenv.config();

/* ===============================
   FASTIFY INIT
================================ */
const app = Fastify({
  logger: true,
});

/* ===============================
   SAFETY HOOKS
================================ */
process.on("unhandledRejection", (err) => {
  console.log("⚠️ UNHANDLED REJECTION:", err);
});

process.on("uncaughtException", (err) => {
  console.log("⚠️ UNCAUGHT EXCEPTION:", err);
});

/* ===============================
   PLUGINS
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
    service: "RiskPilot Risk Engine",
    status: "online",
    version: "v2-context-clean",
    timestamp: new Date().toISOString(),
  };
});

/* ===============================
   CORE AI ENGINE (CLEAN v2 FUSION)
================================ */
function safeAnalyze(input) {
  try {
    const base = analyzeLiveBehavior(input);

    const context = getMarketSession();
    const vol = getVolatilityAdjustment(context.volatility, input);

    const rawScore =
      (base.score || 50) * context.bias * vol.multiplier;

    const adjustedScore = Math.min(100, Math.max(0, rawScore));

    /* -------------------------------
       CLEAN ALERT SYSTEM (NO DUPLICATES)
    -------------------------------- */
    const alerts = [];

    // only keep non-session alerts from base engine
    if (Array.isArray(base.alerts)) {
      for (const a of base.alerts) {
        const lower = a.toLowerCase();
        if (!lower.includes("session")) {
          alerts.push(a);
        }
      }
    }

    // inject structured intelligence ONLY once
    alerts.push(`Session: ${context.session}`);
    alerts.push(vol.note);

    return {
      score: Math.round(adjustedScore),
      state: base.state || "STABLE",
      alerts,
      context: {
        session: context.session,
        volatility: context.volatility,
      },
    };
  } catch (err) {
    console.log("⚠️ ENGINE FALLBACK:", err.message);

    return {
      score: 50,
      state: "STABLE",
      alerts: ["fallback mode active"],
      context: {
        session: "UNKNOWN",
        volatility: "UNKNOWN",
      },
    };
  }
}

/* ===============================
   HTTP SERVER WRAPPER
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

  /* -------------------------------
     HEARTBEAT
  -------------------------------- */
  socket.on("pong", () => {
    socket.isAlive = true;
  });

  const heartbeat = setInterval(() => {
    if (!socket.isAlive) {
      console.log("💀 DEAD SOCKET");
      return socket.terminate();
    }

    socket.isAlive = false;
    socket.ping();
  }, 20000);

  /* -------------------------------
     MESSAGE FLOW
  -------------------------------- */
  socket.on("message", (msg) => {
    try {
      const raw = msg.toString();

      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        data = { type: "trade" };
      }

      const payload = {
        type: data.type || "trade",
        direction: data.direction || "BUY",
        lot_size: Number(data.lot_size || 0.1),
        risk_percent: Number(data.risk_percent || 1),
        entry_price: Number(data.entry_price || 0),
        symbol: data.symbol || "XAUUSD",
      };

      const result = safeAnalyze(payload);

      const response = {
        type: "LIVE_FEEDBACK",
        score: result.score,
        state: result.state,
        alerts: result.alerts,
        context: result.context,
        timestamp: new Date().toISOString(),
      };

      if (socket.readyState === 1) {
        socket.send(JSON.stringify(response));
      }
    } catch (err) {
      try {
        socket.send(
          JSON.stringify({
            type: "ERROR",
            message: "engine error recovered",
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
  console.log(`🚀 Risk Engine v2 CLEAN running on port ${PORT}`);
});
