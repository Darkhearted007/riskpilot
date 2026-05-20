import { calculateRisk } from "../engines/riskEngine.js";
import { calculateDiscipline } from "../engines/disciplineEngine.js";
import { checkProtection } from "../engines/protectionEngine.js";

export default async function riskRoutes(app) {
  app.post("/evaluate", async (req, reply) => {
    try {
      const {
        balance,
        riskPercent,
        stopLossPips,
        pipValue,
        trades = [],
        dailyLoss = 0,
        maxDailyLoss = 3,
        drawdown = 0,
      } = req.body;

      // ─────────────────────────────
      // 1. CAPITAL PROTECTION LAYER
      // ─────────────────────────────
      const protection = checkProtection({
        dailyLoss,
        maxDailyLoss,
        drawdown,
      });

      if (!protection.allowed) {
        return reply.send({
          status: "REJECTED",
          stage: "PROTECTION",
          reason: protection.reason,
        });
      }

      // ─────────────────────────────
      // 2. RISK CALCULATION ENGINE
      // ─────────────────────────────
      const risk = calculateRisk({
        balance,
        riskPercent,
        stopLossPips,
        pipValue,
      });

      // ─────────────────────────────
      // 3. DISCIPLINE ENGINE
      // ─────────────────────────────
      const discipline = calculateDiscipline(trades);

      // ─────────────────────────────
      // 4. FINAL DECISION LOGIC
      // ─────────────────────────────

      let status = "APPROVED";

      if (discipline.score < 40) {
        status = "REJECTED";
      } else if (discipline.score < 60) {
        status = "WARNING";
      }

      // ─────────────────────────────
      // 5. RESPONSE PAYLOAD
      // ─────────────────────────────
      return reply.send({
        status,
        risk,
        discipline,
        protection,
        meta: {
          evaluatedAt: new Date().toISOString(),
        },
      });
    } catch (err) {
      return reply.status(500).send({
        status: "ERROR",
        message: err.message,
      });
    }
  });
}
