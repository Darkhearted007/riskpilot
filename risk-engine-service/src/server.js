import Fastify from "fastify";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import dotenv from "dotenv";

// ===============================
// AI ENGINES
// ===============================
import { analyzeLiveBehavior } from "./engines/liveEngine.js";
import { evaluateTradeGuard } from "./engines/guardEngine.js";
import { generateRiskCoaching } from "./engines/coachEngine.js";
import { detectTraderEmotion } from "./engines/emotionEngine.js";

// ===============================
// ADMIN STATE (IN-MEMORY)
// ===============================
import {
  upsertTrader,
  removeTrader,
  getAllTraders,
  getTrader,
} from "./state/traderRegistry.js";

// ===============================
// DATABASE (SUPABASE)
// ===============================
import { db } from "./lib/db.js";

import riskRoutes from "./routes/riskRoutes.js";

dotenv.config();

// ===============================
// INIT
// ===============================
const app = Fastify({ logger: true });

// ===============================
// PLUGINS
// ===============================
await app.register(cors, { origin: "*" });
await app.register(websocket);

// ===============================
// REST ROUTES
// ===============================
app.register(riskRoutes, {
  prefix: "/api/risk",
});

// ===============================
// HEALTH CHECK
// ===============================
app.get("/", async () => {
  return {
    service: "RiskPilot Risk Engine",
    status: "online",
    version: "3.0-institutional-ai",
    features: [
      "behavior-engine",
      "emotion-engine",
      "trade-guard",
      "ai-coach",
      "admin-control-room",
      "supabase-persistence",
    ],
    timestamp: new Date().toISOString(),
  };
});

// ===============================
// ADMIN API
// ===============================
app.get("/admin/traders", async () => {
  const traders = getAllTraders();

  return {
    total: traders.length,
    traders,
    timestamp: new Date().toISOString(),
  };
});

app.get("/admin/traders/:id", async (req) => {
  return {
    trader: getTrader(req.params.id),
    timestamp: new Date().toISOString(),
  };
});

// ===============================
// WEBSOCKET CONTROL ROOM
// ===============================
app.get("/ws", { websocket: true }, (connection, req) => {
  const traderId =
    req.headers["x-trader-id"] ||
    `trader_${Math.random().toString(36).slice(2, 10)}`;

  console.log(`🔌 Trader connected: ${traderId}`);

  // ===============================
  // REGISTER TRADER
  // ===============================
  upsertTrader(traderId, {
    connected: true,
    connectedAt: new Date().toISOString(),
  });

  // ===============================
  // MESSAGE HANDLER
  // ===============================
  connection.socket.on("message", async (message) => {
    try {
      const data = JSON.parse(message.toString());

      // =========================
      // 1. BEHAVIOR ENGINE
      // =========================
      const behavior = analyzeLiveBehavior(data);

      // =========================
      // 2. GUARD ENGINE
      // =========================
      const guard = evaluateTradeGuard({
        score: behavior.score,
        state: behavior.state,
        data,
      });

      // =========================
      // 3. EMOTION ENGINE
      // =========================
      const emotion = detectTraderEmotion(data);

      // =========================
      // 4. AI COACH ENGINE
      // =========================
      const coaching = generateRiskCoaching({
        behavior,
        guard,
        emotion,
      });

      // =========================
      // 5. UPDATE MEMORY STORE
      // =========================
      upsertTrader(traderId, {
        lastSeen: new Date().toISOString(),
        behavior,
        guard,
        emotion,
      });

      // =========================
      // 6. PERSIST TO DATABASE
      // =========================

      // traders table
      await db.from("traders").upsert({
        id: traderId,
        connected: true,
        last_seen: new Date().toISOString(),
        metadata: {
          lastScore: behavior.score,
          state: behavior.state,
        },
      });

      // risk events table
      await db.from("risk_events").insert({
        trader_id: traderId,
        score: behavior.score,
        state: behavior.state,
        alerts: behavior.alerts,
        emotion: {
          state: emotion.emotion,
          score: emotion.emotionScore,
          signals: emotion.signals,
        },
        guard: {
          allowTrade: guard.allowTrade,
          level: guard.level,
          reason: guard.reason,
        },
      });

      // =========================
      // 7. RESPONSE
      // =========================
      connection.socket.send(
        JSON.stringify({
          type: "LIVE_FEEDBACK",
          traderId,

          // risk engine
          score: behavior.score,
          state: behavior.state,
          alerts: behavior.alerts,

          // guard system
          guard: {
            allowTrade: guard.allowTrade,
            level: guard.level,
            reason: guard.reason,
          },

          // psychology layer
          emotion: {
            state: emotion.emotion,
            score: emotion.emotionScore,
            signals: emotion.signals,
          },

          // AI coaching
          coaching,

          timestamp: new Date().toISOString(),
        })
      );
    } catch (err) {
      connection.socket.send(
        JSON.stringify({
          type: "ERROR",
          traderId,
          message: "Invalid payload received by Risk Engine",
          timestamp: new Date().toISOString(),
        })
      );
    }
  });

  // ===============================
  // CLEANUP ON DISCONNECT
  // ===============================
  connection.socket.on("close", async () => {
    console.log(`🔌 Trader disconnected: ${traderId}`);

    removeTrader(traderId);

    await db
      .from("traders")
      .update({
        connected: false,
        last_seen: new Date().toISOString(),
      })
      .eq("id", traderId);
  });
});

// ===============================
// START SERVER
// ===============================
const start = async () => {
  try {
    const port = process.env.PORT || 4000;

    await app.listen({
      port,
      host: "0.0.0.0",
    });

    console.log(`🚀 RiskPilot Engine running on port ${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
