import { useState, useEffect, useCallback } from "react";

// ─── THEME ───────────────────────────────────────────────────────────────────
const T = {
  bg: "#0B0E13",
  surface: "#13181F",
  surfaceHigh: "#1A2130",
  border: "#1E2D3D",
  borderHigh: "#2A3F55",
  green: "#00D97E",
  greenDim: "#00D97E22",
  amber: "#F5A623",
  amberDim: "#F5A62322",
  red: "#FF4757",
  redDim: "#FF475722",
  text: "#E8EDF3",
  textSub: "#7A8FA6",
  textMuted: "#3D5168",
  font: "'IBM Plex Mono', monospace",
  fontSans: "'DM Sans', sans-serif",
};

// ─── INJECT STYLES ────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: ${T.bg};
  color: ${T.text};
  font-family: ${T.fontSans};
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: ${T.surface}; }
::-webkit-scrollbar-thumb { background: ${T.borderHigh}; border-radius: 2px; }

input, select, textarea {
  font-family: ${T.fontSans};
  outline: none;
}

input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
@keyframes flash {
  0% { background: ${T.greenDim}; }
  100% { background: transparent; }
}
.fade-up { animation: fadeUp 0.35s ease forwards; }
.result-flash { animation: flash 0.6s ease; }
`;

function injectStyles() {
  if (document.getElementById("rp-styles")) return;
  const s = document.createElement("style");
  s.id = "rp-styles";
  s.textContent = GLOBAL_CSS;
  document.head.appendChild(s);
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = (n, decimals = 2) =>
  isNaN(n) || !isFinite(n) ? "—" : Number(n).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

const fmtLots = (n) => (isNaN(n) || !isFinite(n) ? "—" : Number(n).toFixed(2));

const LS_KEY = "riskpilot_journal_v1";
const loadJournal = () => { try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; } catch { return []; } };
const saveJournal = (data) => localStorage.setItem(LS_KEY, JSON.stringify(data));

const EMOTIONS = ["Confident", "Neutral", "Greedy", "Fearful", "FOMO", "Disciplined", "Revenge"];
const EMOTION_COLORS = {
  Confident: T.green, Neutral: T.textSub, Greedy: T.amber,
  Fearful: "#A78BFA", FOMO: T.red, Disciplined: "#38BDF8", Revenge: "#FB7185",
};

// ─── UI PRIMITIVES ────────────────────────────────────────────────────────────
const Label = ({ children }) => (
  <div style={{ fontFamily: T.font, fontSize: 10, fontWeight: 600, color: T.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>
    {children}
  </div>
);

const Input = ({ value, onChange, type = "text", placeholder, min, step, style = {} }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    min={min}
    step={step}
    style={{
      width: "100%",
      background: T.surfaceHigh,
      border: `1px solid ${T.border}`,
      borderRadius: 8,
      padding: "12px 14px",
      color: T.text,
      fontSize: 15,
      fontFamily: type === "number" ? T.font : T.fontSans,
      fontWeight: 500,
      transition: "border-color 0.2s",
      ...style,
    }}
    onFocus={e => (e.target.style.borderColor = T.amber)}
    onBlur={e => (e.target.style.borderColor = T.border)}
  />
);

const Select = ({ value, onChange, options, style = {} }) => (
  <select
    value={value}
    onChange={onChange}
    style={{
      width: "100%",
      background: T.surfaceHigh,
      border: `1px solid ${T.border}`,
      borderRadius: 8,
      padding: "12px 14px",
      color: value ? T.text : T.textMuted,
      fontSize: 15,
      fontFamily: T.fontSans,
      fontWeight: 500,
      cursor: "pointer",
      ...style,
    }}
  >
    {options.map(o => (
      <option key={o.value ?? o} value={o.value ?? o} style={{ background: T.surface }}>{o.label ?? o}</option>
    ))}
  </select>
);

const Card = ({ children, style = {}, className = "" }) => (
  <div className={className} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: "20px 18px", ...style }}>
    {children}
  </div>
);

const ResultRow = ({ label, value, valueColor, sub }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
    <span style={{ color: T.textSub, fontSize: 13, fontFamily: T.fontSans }}>{label}</span>
    <div style={{ textAlign: "right" }}>
      <span style={{ fontFamily: T.font, fontSize: 16, fontWeight: 700, color: valueColor || T.text }}>{value}</span>
      {sub && <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{sub}</div>}
    </div>
  </div>
);

const Badge = ({ children, color }) => (
  <span style={{
    display: "inline-block", padding: "3px 10px", borderRadius: 20,
    fontSize: 11, fontWeight: 600, fontFamily: T.font,
    background: color + "22", color: color, border: `1px solid ${color}44`,
  }}>{children}</span>
);

const Pill = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{
    padding: "8px 16px", borderRadius: 8, border: `1px solid ${active ? T.amber : T.border}`,
    background: active ? T.amberDim : "transparent", color: active ? T.amber : T.textSub,
    fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: T.fontSans,
    transition: "all 0.2s",
  }}>{children}</button>
);

// ─── TAB BAR ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: "calc", label: "Calculator", icon: "⚡" },
  { id: "journal", label: "Journal", icon: "📋" },
  { id: "stats", label: "Performance", icon: "📊" },
];

function TabBar({ active, setActive }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
      background: T.surface, borderTop: `1px solid ${T.border}`,
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
      maxWidth: 480, margin: "0 auto",
    }}>
      {TABS.map(t => (
        <button key={t.id} onClick={() => setActive(t.id)} style={{
          padding: "12px 4px 10px",
          background: "transparent",
          border: "none",
          borderTop: `2px solid ${active === t.id ? T.amber : "transparent"}`,
          color: active === t.id ? T.amber : T.textMuted,
          fontSize: 11,
          fontWeight: 600,
          fontFamily: T.fontSans,
          cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          transition: "all 0.2s",
          letterSpacing: "0.04em",
        }}>
          <span style={{ fontSize: 18 }}>{t.icon}</span>
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ─── CALCULATOR TAB ───────────────────────────────────────────────────────────
function CalculatorTab() {
  const [form, setForm] = useState({ balance: "", risk: "1", entry: "", sl: "", rrr: "2" });
  const [result, setResult] = useState(null);
  const [flashKey, setFlashKey] = useState(0);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const calc = useCallback(() => {
    const bal = parseFloat(form.balance);
    const riskPct = parseFloat(form.risk);
    const entry = parseFloat(form.entry);
    const sl = parseFloat(form.sl);
    const rrr = parseFloat(form.rrr);

    if (!bal || !riskPct || !entry || !sl) return;

    const riskAmt = (bal * riskPct) / 100;
    const slDist = Math.abs(entry - sl);
    if (!slDist) return;

    const positionSize = riskAmt / slDist;
    const estProfit = riskAmt * rrr;
    const tp = entry > sl ? entry + slDist * rrr : entry - slDist * rrr;

    setResult({ riskAmt, slDist, positionSize, estProfit, tp, rrr, riskPct });
    setFlashKey(k => k + 1);
  }, [form]);

  useEffect(() => {
    const t = setTimeout(calc, 300);
    return () => clearTimeout(t);
  }, [form, calc]);

  const riskLevel = result
    ? result.riskPct <= 1 ? { label: "SAFE", color: T.green }
    : result.riskPct <= 2 ? { label: "MODERATE", color: T.amber }
    : { label: "HIGH RISK", color: T.red }
    : null;

  return (
    <div style={{ padding: "20px 16px 100px" }} className="fade-up">
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: T.font, fontSize: 11, color: T.amber, letterSpacing: "0.14em", marginBottom: 4 }}>RISK CALCULATOR</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: T.text }}>Position Sizing</div>
        <div style={{ fontSize: 13, color: T.textSub, marginTop: 4 }}>Calculate before you enter. Every. Single. Time.</div>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <Label>Account Balance ($)</Label>
            <Input type="number" value={form.balance} onChange={set("balance")} placeholder="10000" min="0" />
          </div>
          <div>
            <Label>Risk % per Trade</Label>
            <Input type="number" value={form.risk} onChange={set("risk")} placeholder="1" min="0.1" step="0.1" />
          </div>
          <div>
            <Label>Risk:Reward Ratio</Label>
            <Input type="number" value={form.rrr} onChange={set("rrr")} placeholder="2" min="0.5" step="0.5" />
          </div>
          <div>
            <Label>Entry Price</Label>
            <Input type="number" value={form.entry} onChange={set("entry")} placeholder="1.0850" step="any" />
          </div>
          <div>
            <Label>Stop Loss Price</Label>
            <Input type="number" value={form.sl} onChange={set("sl")} placeholder="1.0820" step="any" />
          </div>
        </div>
      </Card>

      {result ? (
        <Card key={flashKey} className="result-flash" style={{ border: `1px solid ${T.greenDim}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <div style={{ fontFamily: T.font, fontSize: 10, color: T.textMuted, letterSpacing: "0.12em" }}>ANALYSIS RESULT</div>
            {riskLevel && <Badge color={riskLevel.color}>{riskLevel.label}</Badge>}
          </div>

          <ResultRow label="💰 Risk Amount" value={`$${fmt(result.riskAmt)}`} valueColor={T.amber} />
          <ResultRow label="📏 SL Distance" value={fmt(result.slDist, 5)} sub="price units" />
          <ResultRow label="📦 Position Size" value={`${fmtLots(result.positionSize / 100000)} lots`} valueColor={T.text} sub={`${fmt(result.positionSize, 0)} units`} />
          <ResultRow label="🎯 Take Profit" value={fmt(result.tp, 5)} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "12px 0" }}>
            <span style={{ color: T.textSub, fontSize: 13 }}>✅ Est. Profit (1:{result.rrr})</span>
            <span style={{ fontFamily: T.font, fontSize: 18, fontWeight: 700, color: T.green }}>${fmt(result.estProfit)}</span>
          </div>

          <div style={{ marginTop: 8, padding: "10px 14px", background: result.riskPct > 2 ? T.redDim : T.greenDim, borderRadius: 8, border: `1px solid ${result.riskPct > 2 ? T.red + "44" : T.green + "44"}` }}>
            <div style={{ fontSize: 12, color: result.riskPct > 2 ? T.red : T.green, fontWeight: 600 }}>
              {result.riskPct > 2
                ? `⚠️ Risking ${result.riskPct}% is aggressive. Pro traders risk 0.5–2% max.`
                : `✓ ${result.riskPct}% risk is within disciplined range. Stay consistent.`}
            </div>
          </div>
        </Card>
      ) : (
        <Card style={{ textAlign: "center", padding: "32px 18px" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⚡</div>
          <div style={{ color: T.textSub, fontSize: 14 }}>Fill in the fields above</div>
          <div style={{ color: T.textMuted, fontSize: 12, marginTop: 4 }}>Results appear in real-time</div>
        </Card>
      )}

      <div style={{ marginTop: 16, padding: "14px 16px", background: T.surfaceHigh, borderRadius: 10, border: `1px solid ${T.border}` }}>
        <div style={{ fontFamily: T.font, fontSize: 10, color: T.textMuted, letterSpacing: "0.1em", marginBottom: 8 }}>RISK TIERS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[["0.5–1%", "Conservative — recommended for beginners", T.green],
            ["1–2%", "Standard — experienced traders", T.amber],
            [">2%", "Aggressive — account risk elevated", T.red]].map(([tier, desc, color]) => (
            <div key={tier} style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontFamily: T.font, fontSize: 11, color, minWidth: 44 }}>{tier}</span>
              <span style={{ fontSize: 12, color: T.textSub }}>{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── JOURNAL TAB ──────────────────────────────────────────────────────────────
const BLANK_TRADE = { pair: "", entry: "", sl: "", tp: "", result: "", emotion: "", notes: "" };

function JournalTab() {
  const [trades, setTrades] = useState(loadJournal);
  const [form, setForm] = useState(BLANK_TRADE);
  const [adding, setAdding] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = () => {
    if (!form.pair || !form.entry || !form.sl || !form.result) return;
    const newTrades = [{ ...form, id: Date.now(), date: new Date().toLocaleDateString("en-GB") }, ...trades];
    setTrades(newTrades);
    saveJournal(newTrades);
    setForm(BLANK_TRADE);
    setAdding(false);
  };

  const remove = (id) => {
    const updated = trades.filter(t => t.id !== id);
    setTrades(updated);
    saveJournal(updated);
  };

  return (
    <div style={{ padding: "20px 16px 100px" }} className="fade-up">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: T.font, fontSize: 11, color: T.amber, letterSpacing: "0.14em", marginBottom: 4 }}>TRADE JOURNAL</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>Your Trades</div>
          <div style={{ fontSize: 13, color: T.textSub, marginTop: 4 }}>{trades.length} trade{trades.length !== 1 ? "s" : ""} logged</div>
        </div>
        <button onClick={() => setAdding(a => !a)} style={{
          padding: "10px 16px", borderRadius: 10, border: `1px solid ${adding ? T.border : T.amber}`,
          background: adding ? T.surfaceHigh : T.amberDim, color: adding ? T.textSub : T.amber,
          fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: T.font,
        }}>
          {adding ? "✕ Cancel" : "+ LOG TRADE"}
        </button>
      </div>

      {adding && (
        <Card style={{ marginBottom: 20, border: `1px solid ${T.amber}44` }} className="fade-up">
          <div style={{ fontFamily: T.font, fontSize: 10, color: T.amber, letterSpacing: "0.12em", marginBottom: 16 }}>NEW TRADE ENTRY</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <Label>Pair *</Label>
              <Input value={form.pair} onChange={set("pair")} placeholder="XAUUSD" />
            </div>
            <div>
              <Label>Result *</Label>
              <Select value={form.result} onChange={set("result")} options={[{ value: "", label: "Select..." }, { value: "Win", label: "✅ Win" }, { value: "Loss", label: "❌ Loss" }, { value: "BE", label: "↔ Break Even" }]} />
            </div>
            <div>
              <Label>Entry *</Label>
              <Input type="number" value={form.entry} onChange={set("entry")} placeholder="1.0850" step="any" />
            </div>
            <div>
              <Label>Stop Loss *</Label>
              <Input type="number" value={form.sl} onChange={set("sl")} placeholder="1.0820" step="any" />
            </div>
            <div>
              <Label>Take Profit</Label>
              <Input type="number" value={form.tp} onChange={set("tp")} placeholder="1.0910" step="any" />
            </div>
            <div>
              <Label>Emotion</Label>
              <Select value={form.emotion} onChange={set("emotion")} options={[{ value: "", label: "None" }, ...EMOTIONS.map(e => ({ value: e, label: e }))]} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <Label>Notes</Label>
              <textarea value={form.notes} onChange={set("notes")} placeholder="Setup, confluences, what went right/wrong..." rows={3}
                style={{ width: "100%", background: T.surfaceHigh, border: `1px solid ${T.border}`, borderRadius: 8, padding: "12px 14px", color: T.text, fontSize: 14, fontFamily: T.fontSans, resize: "vertical" }}
                onFocus={e => (e.target.style.borderColor = T.amber)}
                onBlur={e => (e.target.style.borderColor = T.border)}
              />
            </div>
          </div>
          <button onClick={submit} style={{
            marginTop: 16, width: "100%", padding: "14px", borderRadius: 10,
            background: T.green, border: "none", color: "#001A0D", fontSize: 15,
            fontWeight: 700, cursor: "pointer", fontFamily: T.font, letterSpacing: "0.06em",
          }}>
            SAVE TRADE
          </button>
        </Card>
      )}

      {trades.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "40px 18px" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
          <div style={{ color: T.textSub, fontSize: 15, fontWeight: 600 }}>No trades logged yet</div>
          <div style={{ color: T.textMuted, fontSize: 13, marginTop: 6 }}>Your journal helps you spot patterns in your trading psychology</div>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {trades.map((t) => {
            const isWin = t.result === "Win";
            const isBE = t.result === "BE";
            const resColor = isWin ? T.green : isBE ? T.amber : T.red;
            const expanded = expandedId === t.id;

            return (
              <Card key={t.id} style={{ cursor: "pointer", transition: "border-color 0.2s", border: `1px solid ${expanded ? T.borderHigh : T.border}` }}
                onClick={() => setExpandedId(expanded ? null : t.id)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: resColor + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                      {isWin ? "✅" : isBE ? "↔" : "❌"}
                    </div>
                    <div>
                      <div style={{ fontFamily: T.font, fontSize: 14, fontWeight: 700, color: T.text }}>{t.pair}</div>
                      <div style={{ fontSize: 12, color: T.textMuted }}>{t.date}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {t.emotion && <Badge color={EMOTION_COLORS[t.emotion] || T.textSub}>{t.emotion}</Badge>}
                    <span style={{ color: T.textMuted, fontSize: 16 }}>{expanded ? "▲" : "▼"}</span>
                  </div>
                </div>

                {expanded && (
                  <div className="fade-up" style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
                      {[["Entry", t.entry], ["SL", t.sl], ["TP", t.tp || "—"]].map(([l, v]) => (
                        <div key={l} style={{ background: T.surfaceHigh, borderRadius: 8, padding: "8px 10px" }}>
                          <div style={{ fontSize: 10, color: T.textMuted, fontFamily: T.font, marginBottom: 3 }}>{l}</div>
                          <div style={{ fontSize: 13, fontFamily: T.font, fontWeight: 600 }}>{v}</div>
                        </div>
                      ))}
                    </div>
                    {t.notes && <div style={{ fontSize: 13, color: T.textSub, marginBottom: 12, lineHeight: 1.6 }}>{t.notes}</div>}
                    <button onClick={(e) => { e.stopPropagation(); remove(t.id); }} style={{
                      background: T.redDim, border: `1px solid ${T.red}44`, borderRadius: 8,
                      color: T.red, fontSize: 12, fontWeight: 600, padding: "8px 14px", cursor: "pointer", fontFamily: T.font,
                    }}>DELETE TRADE</button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── STATS TAB ────────────────────────────────────────────────────────────────
function StatsTab() {
  const [trades] = useState(loadJournal);

  const wins = trades.filter(t => t.result === "Win").length;
  const losses = trades.filter(t => t.result === "Loss").length;
  const be = trades.filter(t => t.result === "BE").length;
  const total = trades.length;
  const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : 0;

  const pairCount = trades.reduce((acc, t) => { acc[t.pair] = (acc[t.pair] || 0) + 1; return acc; }, {});
  const topPairs = Object.entries(pairCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const emotionCount = trades.filter(t => t.emotion).reduce((acc, t) => { acc[t.emotion] = (acc[t.emotion] || 0) + 1; return acc; }, {});
  const emotionEntries = Object.entries(emotionCount).sort((a, b) => b[1] - a[1]);

  const winRateColor = parseFloat(winRate) >= 55 ? T.green : parseFloat(winRate) >= 45 ? T.amber : T.red;

  return (
    <div style={{ padding: "20px 16px 100px" }} className="fade-up">
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: T.font, fontSize: 11, color: T.amber, letterSpacing: "0.14em", marginBottom: 4 }}>PERFORMANCE</div>
        <div style={{ fontSize: 22, fontWeight: 700 }}>Your Statistics</div>
        <div style={{ fontSize: 13, color: T.textSub, marginTop: 4 }}>Based on {total} logged trade{total !== 1 ? "s" : ""}</div>
      </div>

      {total === 0 ? (
        <Card style={{ textAlign: "center", padding: "40px 18px" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
          <div style={{ color: T.textSub, fontSize: 15, fontWeight: 600 }}>No data yet</div>
          <div style={{ color: T.textMuted, fontSize: 13, marginTop: 6 }}>Log trades in the Journal tab to see your stats</div>
        </Card>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[
              { label: "Win Rate", value: `${winRate}%`, color: winRateColor, icon: "🎯" },
              { label: "Total Trades", value: total, color: T.text, icon: "📋" },
              { label: "Wins", value: wins, color: T.green, icon: "✅" },
              { label: "Losses", value: losses, color: T.red, icon: "❌" },
            ].map(s => (
              <Card key={s.label} style={{ textAlign: "center", padding: "18px 12px" }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontFamily: T.font, fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>{s.label}</div>
              </Card>
            ))}
          </div>

          <Card style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: T.font, fontSize: 10, color: T.textMuted, letterSpacing: "0.1em", marginBottom: 14 }}>WIN / LOSS DISTRIBUTION</div>
            <div style={{ display: "flex", height: 10, borderRadius: 6, overflow: "hidden", gap: 2 }}>
              {wins > 0 && <div style={{ flex: wins, background: T.green, borderRadius: 4 }} />}
              {be > 0 && <div style={{ flex: be, background: T.amber, borderRadius: 4 }} />}
              {losses > 0 && <div style={{ flex: losses, background: T.red, borderRadius: 4 }} />}
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
              {[[wins, "Wins", T.green], [be, "Break Even", T.amber], [losses, "Losses", T.red]].map(([n, l, c]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
                  <span style={{ fontSize: 12, color: T.textSub }}>{n} {l}</span>
                </div>
              ))}
            </div>
          </Card>

          {topPairs.length > 0 && (
            <Card style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: T.font, fontSize: 10, color: T.textMuted, letterSpacing: "0.1em", marginBottom: 14 }}>MOST TRADED PAIRS</div>
              {topPairs.map(([pair, count]) => (
                <div key={pair} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontFamily: T.font, fontSize: 13, fontWeight: 600, color: T.text }}>{pair}</span>
                    <span style={{ fontSize: 12, color: T.textMuted }}>{count} trade{count !== 1 ? "s" : ""}</span>
                  </div>
                  <div style={{ height: 4, background: T.surfaceHigh, borderRadius: 4 }}>
                    <div style={{ height: "100%", background: T.amber, borderRadius: 4, width: `${(count / total) * 100}%`, transition: "width 0.6s ease" }} />
                  </div>
                </div>
              ))}
            </Card>
          )}

          {emotionEntries.length > 0 && (
            <Card>
              <div style={{ fontFamily: T.font, fontSize: 10, color: T.textMuted, letterSpacing: "0.1em", marginBottom: 14 }}>EMOTIONAL PATTERNS</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {emotionEntries.map(([em, count]) => (
                  <div key={em} style={{ display: "flex", alignItems: "center", gap: 6, background: T.surfaceHigh, borderRadius: 8, padding: "6px 12px" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: EMOTION_COLORS[em] || T.textSub }} />
                    <span style={{ fontSize: 13, color: T.text }}>{em}</span>
                    <span style={{ fontFamily: T.font, fontSize: 12, color: T.textMuted }}>×{count}</span>
                  </div>
                ))}
              </div>
              {emotionEntries.some(([em]) => em === "Greedy" || em === "FOMO" || em === "Revenge") && (
                <div style={{ marginTop: 14, padding: "10px 14px", background: T.redDim, borderRadius: 8, border: `1px solid ${T.red}33`, fontSize: 12, color: T.red, fontWeight: 600 }}>
                  ⚠️ Emotional trading detected. Review these trades — emotions are your biggest edge killer.
                </div>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  );
}

// ─── HEADER ───────────────────────────────────────────────────────────────────
function Header({ tab }) {
  return (
    <div style={{
      background: T.surface,
      borderBottom: `1px solid ${T.border}`,
      padding: "14px 16px 12px",
      position: "sticky", top: 0, zIndex: 50,
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, background: T.amberDim,
          border: `1px solid ${T.amber}55`, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: T.font, fontSize: 14, fontWeight: 700, color: T.amber,
        }}>RP</div>
        <div>
          <div style={{ fontFamily: T.font, fontSize: 14, fontWeight: 700, color: T.text, letterSpacing: "0.04em" }}>RiskPilot</div>
          <div style={{ fontSize: 10, color: T.textMuted, fontFamily: T.font }}>Stop blowing accounts.</div>
        </div>
      </div>
      <div style={{ fontFamily: T.font, fontSize: 10, color: T.textMuted, textAlign: "right" }}>
        {new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  injectStyles();
  const [tab, setTab] = useState("calc");

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: T.bg, position: "relative" }}>
      <Header tab={tab} />
      {tab === "calc" && <CalculatorTab />}
      {tab === "journal" && <JournalTab />}
      {tab === "stats" && <StatsTab />}
      <TabBar active={tab} setActive={setTab} />
    </div>
  );
}
