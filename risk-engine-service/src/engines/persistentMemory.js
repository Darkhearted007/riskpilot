import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";

/* ===============================
   ENV SAFETY
================================ */
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn("⚠️ Supabase disabled - using memory mode");
}

/* ===============================
   MEMORY CACHE (RUNTIME ONLY)
================================ */
const memoryStore = new Map();

/* ===============================
   SAVE TRADE (SOURCE OF TRUTH = DB)
================================ */
export async function saveTrade(userId, trade, score) {
  const record = {
    user_id: userId,
    symbol: trade.symbol,
    direction: trade.direction,
    lot_size: trade.lot_size,
    risk_percent: trade.risk_percent,
    entry_price: trade.entry_price,
    score,
    created_at: new Date().toISOString(),
  };

  try {
    if (supabase) {
      await supabase.from("trades").insert([record]);
    }
  } catch (err) {
    console.log("⚠️ DB save failed:", err.message);
  }

  // always mirror into memory cache
  if (!memoryStore.has(userId)) memoryStore.set(userId, []);
  memoryStore.get(userId).push(record);
}

/* ===============================
   GET USER STATS (DB FIRST)
================================ */
export async function getUserStats(userId) {
  let trades = [];

  try {
    if (supabase) {
      const { data } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(100);

      trades = data || [];
    }
  } catch (err) {
    console.log("⚠️ DB fetch failed:", err.message);
  }

  // fallback to memory ONLY if DB empty
  if (!trades.length && memoryStore.has(userId)) {
    trades = memoryStore.get(userId);
  }

  if (!trades.length) {
    return {
      totalTrades: 0,
      winRate: 0,
      avgScore: 0,
      pnlEstimate: 0,
      note: "No trading history",
    };
  }

  const totalTrades = trades.length;
  const wins = trades.filter(t => (t.score || 0) >= 70).length;

  const avgScore =
    trades.reduce((s, t) => s + (t.score || 0), 0) / totalTrades;

  const winRate = wins / totalTrades;

  const pnlEstimate = trades.reduce((sum, t) => {
    const risk = t.risk_percent || 1;
    const reward = (t.score || 50) / 100;
    return sum + reward * risk * 100;
  }, 0);

  return {
    totalTrades,
    winRate: Number(winRate.toFixed(2)),
    avgScore: Math.round(avgScore),
    pnlEstimate: Math.round(pnlEstimate),
    note: "institutional stats engine v3.7",
  };
}

/* ===============================
   MEMORY ENGINE (BEHAVIOR LAYER ONLY)
================================ */
export function updateMemory(userId, trade, score) {
  if (!memoryStore.has(userId)) {
    memoryStore.set(userId, []);
  }

  const history = memoryStore.get(userId);

  history.push({
    score,
    risk: trade.risk_percent,
    direction: trade.direction,
    time: Date.now(),
  });

  if (history.length > 50) history.shift();

  const avgScore =
    history.reduce((s, t) => s + t.score, 0) / history.length;

  const avgRisk =
    history.reduce((s, t) => s + t.risk, 0) / history.length;

  let behavior = "BALANCED";

  if (avgScore >= 75 && avgRisk <= 1.5) behavior = "DISCIPLINED";
  else if (avgScore < 60 && avgRisk > 2) behavior = "AGGRESSIVE";

  return {
    behavior,
    avgScore,
    avgRisk,
    trades: history.length,
  };
}
