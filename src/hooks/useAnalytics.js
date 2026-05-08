// src/hooks/useAnalytics.js
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function resolveTag(row) {
  const emotion = (row.emotion || "").toLowerCase();
  const setup   = row.setup_type || "Plan";
  if (emotion.includes("fomo"))    return "FOMO";
  if (emotion.includes("revenge")) return "Revenge";
  if (emotion.includes("fear"))    return "Fear";
  if (emotion.includes("impuls"))  return "Impulse";
  if (emotion.includes("confid"))  return "Confident";
  return setup;
}

function transformTrade(row, index, allRows) {
  const date       = new Date(row.created_at);
  const pnlPct     = Number(row.pnl_amount)     || 0;
  const rrr        = Number(row.rrr)             || 0;
  const riskPct    = Number(row.risk_percentage) || 1;
  const discipline = Number(row.discipline_score)|| 75;
  const win = row.is_win === true ||
              row.is_win === "true" ||
              String(row.result || "").toUpperCase() === "WIN";

  let equity = Number(allRows[0].balance) || 1000;
  for (let i = 0; i <= index; i++) {
    equity *= 1 + (Number(allRows[i].pnl_amount) || 0) / 100;
  }

  return {
    id:         row.id,
    date:       date.toISOString().slice(0, 10),
    day:        DAYS[date.getDay()],
    session:    row.session    || "London",
    tag:        resolveTag(row),
    pair:       row.pair       || "XAUUSD",
    direction:  row.direction  || "BUY",
    rrr:        +rrr.toFixed(2),
    risk:       +riskPct.toFixed(2),
    pnl:        +pnlPct.toFixed(2),
    equity:     +equity.toFixed(2),
    win,
    discipline: +discipline.toFixed(0),
    riskLevel:  row.risk_level || "medium",
    lotSize:    Number(row.lot_size) || 0,
    notes:      row.notes      || "",
  };
}

function getStartDate(range) {
  if (range === "ALL") return null;
  const days = { "7D": 7, "30D": 30, "90D": 90 };
  const d = new Date();
  d.setDate(d.getDate() - (days[range] || 30));
  return d.toISOString();
}

export function useAnalytics(range = "ALL") {
  const [trades,  setTrades]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchTrades = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setTrades([]);
        setLoading(false);
        return;
      }

      let query = supabase
        .from("trades")
        .select(`
          id, created_at, balance, risk_percentage, lot_size,
          risk_amount, risk_level, session, direction,
          entry_price, stop_loss_price, take_profit_price,
          setup_type, emotion, notes, status, is_win,
          pnl_amount, pair, rrr, discipline_score, result
        `)
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: true });

      const startDate = getStartDate(range);
      if (startDate) query = query.gte("created_at", startDate);

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      if (!data || data.length === 0) { setTrades([]); return; }

      setTrades(data.map((row, i) => transformTrade(row, i, data)));
    } catch (err) {
      console.error("[useAnalytics] error:", err);
      setError(err.message || "Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { fetchTrades(); }, [fetchTrades]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "SIGNED_IN") fetchTrades();
        if (event === "SIGNED_OUT") setTrades([]);
      }
    );
    return () => subscription.unsubscribe();
  }, [fetchTrades]);

  useEffect(() => {
    const channel = supabase
      .channel("riskpilot-analytics-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "trades" },
        () => fetchTrades())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [fetchTrades]);

  return { trades, loading, error, refetch: fetchTrades };
}
