import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

/* =========================
   TRADE CARD
========================= */
function TradeCard({ trade, onRefresh }) {
  const [closing, setClosing] = useState(false);
  const [exitPrice, setExitPrice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClose = async () => {
    if (!exitPrice || isNaN(exitPrice)) return;

    setLoading(true);

    const ep = parseFloat(trade.entry_price);
    const xp = parseFloat(exitPrice);
    const isBuy = trade.direction === "BUY";

    const pips = isBuy ? (xp - ep) / 0.1 : (ep - xp) / 0.1;
    const pnl = pips * (trade.lot_size * 10);
    const win = pnl > 0;

    const { error } = await supabase
      .from("trades")
      .update({
        status: "closed",
        exit_price: xp,
        pnl_amount: pnl,
        is_win: win,
      })
      .eq("id", trade.id);

    if (!error) {
      setClosing(false);
      onRefresh();
    }

    setLoading(false);
  };

  const isClosed = trade.status === "closed";
  const color = isClosed
    ? trade.is_win
      ? "var(--green)"
      : "var(--red)"
    : "var(--gold)";

  return (
    <div
      style={{
        background: "var(--surface)",
        border: `1px solid ${
          isClosed ? "var(--border)" : "var(--gold-dim)"
        }`,
        borderRadius: "var(--radius-lg)",
        padding: 16,
        position: "relative",
      }}
    >
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <span style={{ fontSize: 12 }}>
            {trade.direction} • {trade.lot_size} lots
          </span>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Entry: ${trade.entry_price}
          </p>
        </div>

        {isClosed && (
          <div style={{ color }}>
            {trade.pnl_amount > 0 ? "+" : ""}$
            {Number(trade.pnl_amount || 0).toFixed(2)}
          </div>
        )}
      </div>

      {/* CLOSE TRADE */}
      {!isClosed && (
        <div style={{ marginTop: 10 }}>
          {!closing ? (
            <button
              onClick={() => setClosing(true)}
              style={{
                background: "var(--gold)",
                border: "none",
                padding: "6px 10px",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Close Trade
            </button>
          ) : (
            <div style={{ marginTop: 10 }}>
              <input
                type="number"
                value={exitPrice}
                onChange={(e) => setExitPrice(e.target.value)}
                placeholder="Exit price"
                style={{
                  padding: 8,
                  width: "100%",
                  marginBottom: 8,
                }}
              />

              <button onClick={handleClose} disabled={loading}>
                {loading ? "Closing..." : "Confirm"}
              </button>

              <button onClick={() => setClosing(false)}>Cancel</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* =========================
   JOURNAL
========================= */
export default function Journal({ user }) {
  const { isProPlus, isElite } = useAuth();

  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const canViewHistory = isProPlus || isElite;

  /* ---------------- FETCH ---------------- */
  const fetchTrades = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setError("Failed to load trades");
    } else {
      setTrades(data || []);
    }

    setLoading(false);
  }, [user.id]);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  const openTrades = trades.filter((t) => t.status === "open");
  const closedTrades = trades.filter((t) => t.status === "closed");

  /* =========================
     UI
  ========================= */
  return (
    <div style={{ padding: 20, maxWidth: 520, margin: "0 auto" }}>
      <h2>Trade Journal</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* OPEN TRADES */}
          <h4>Open Trades</h4>
          {openTrades.map((t) => (
            <TradeCard key={t.id} trade={t} onRefresh={fetchTrades} />
          ))}

          {/* CLOSED TRADES */}
          <h4 style={{ marginTop: 20 }}>History</h4>

          {!canViewHistory ? (
            <div
              style={{
                padding: 20,
                border: "1px dashed gold",
                textAlign: "center",
                borderRadius: 10,
              }}
            >
              <p>🔒 History Locked</p>
              <p style={{ fontSize: 12 }}>
                Upgrade to Pro+ to unlock full journal history
              </p>

              <button
                onClick={() =>
                  window.dispatchEvent(new Event("open-upgrade"))
                }
                style={{
                  marginTop: 10,
                  padding: "8px 12px",
                  background: "gold",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Upgrade
              </button>
            </div>
          ) : (
            closedTrades.map((t) => (
              <TradeCard key={t.id} trade={t} onRefresh={fetchTrades} />
            ))
          )}
        </>
      )}
    </div>
  );
}
