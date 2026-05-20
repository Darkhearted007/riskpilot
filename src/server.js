import Fastify from "fastify";
import cors from "@fastify/cors";
import http from "http";
import { WebSocketServer } from "ws";
import dotenv from "dotenv";

import riskRoutes from "./api/riskRoutes.js";
import { orchestrateTrade } from "./core/orchestrator.js";

dotenv.config();

const app = Fastify({ logger: true });

await app.register(cors, { origin: "*" });
app.register(riskRoutes, { prefix: "/api/risk" });

app.get("/", async () => ({
  service: "RiskPilot Institutional Engine v1",
  status: "online"
}));

const server = http.createServer(app.server);

const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (socket) => {
  socket.on("message", async (msg) => {
    const input = JSON.parse(msg.toString());

    const result = await orchestrateTrade(input, "anon");

    socket.send(JSON.stringify({
      type: "INSTITUTIONAL_V1",
      ...result,
      timestamp: new Date().toISOString()
    }));
  });
});

server.listen(process.env.PORT || 4000, () => {
  console.log("🏦 RiskPilot Institutional Architecture v1 running");
});
