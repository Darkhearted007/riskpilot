// src/pages/Analytics.jsx
// ─────────────────────────────────────────────────────────────
// Full RiskPilot Analytics page — Supabase live data wired in
// ─────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ReferenceLine,
} from "recharts";
import { useAnalytics } from "../hooks/useAnalytics";

// ── Palette ───────────────────────────────────────────────────
const C = {
  bg: "#0a0b0d",
  surface: "#111318",
  border: "#1e2128",
  gold: "#c9a84c",
  goldDim: "#8a6f30",
  green: "#22c55e",
  red: "#ef4444",
  muted: "#4b5260",
  text: "#e8e9ec",
  sub: "#7b8291",
  purple: "#818cf8",
};

// ── Micro components ──────────────────────────────────────────
function CustomTooltip({ active, payload, label, prefix = "" }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 8, padding: "10px 14px", fontSize: 12, color: C.text,
    }}>
      <div style={{ color: C.sub, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || C.gold }}>
          {p.name}: <b>{prefix}{typeof p.value === "number" ? p.value.toFixed(2) : p.value}</b>
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 12, padding: "20px 22px", flex: 1, minWidth: 140,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${color || C.gold}, transparent)`,
      }} />
      <div style={{ fontSize: 11, color: C.sub, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: color || C.text, fontFamily: "'DM Mono', monospace" }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function Panel({ title, children, span }) {
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 14, padding: "22px 24px",
      gridColumn: span ? `span ${span}` : undefined,
    }}>
      <div style={{
        fontSize: 11, color: C.goldDim, letterSpacing: "0.1em",
        textTransform: "uppercase", marginBottom: 18, fontWeight: 600,
      }}>{title}</div>
      {children}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", height: 180, color: C.muted, gap: 8,
    }}>
      <div style={{ fontSize: 32 }}>📭</div>
      <div style={{ fontSize: 13 }}>{message}</div>
    </div>
  );
}

function LoadingPulse() {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "60vh", flexDirection: "column", gap: 16,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: "50%",
        border: `3px solid ${C.border}`,
        borderTop: `3px solid ${C.gold}`,
        animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ color: C.sub, fontSize: 13 }}>Loading analytics…</div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
const RANGES = ["7D", "30D", "90D", "ALL"];

export default function Analytics() {
  const [range, setRange] = useState("ALL");
  const { trades, loading, error } = useAnalytics(range);

  // ── Derived metrics ─────────────────────────────────────────
  const wins   = trades.filter(t => t.win);
  const losses = trades.filter(t => !t.win);

  const totalPnl      = trades.reduce((s, t) => s + t.pnl, 0);
  const winRate       = trades.length ? (wins.length / trades.length) * 100 : 0;
  const avgRRR        = trades.length ? trades.reduce((s, t) => s + t.rrr, 0) / trades.length : 0;
  const breakEvenWR   = avgRRR > 0 ? (1 / (1 + avgRRR)) * 100 : 0;
  const grossWin      = wins.reduce((s, t) => s + t.pnl, 0);
  const grossLoss     = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
  const profitFactor  = grossLoss > 0 ? grossWin / grossLoss : 0;
  const avgDiscipline = trades.length ? trades.reduce((s, t) => s + t.discipline, 0) / trades.length : 0;

  // Equity curve
  const equityCurve = trades.map((t, i) => ({ i: i + 1, equity: t.equity, date: t.date }));

  // Drawdown
  const drawdownData = useMemo(() => {
    let peak = -Infinity;
    return trades.map((t, i) => {
      if (t.equity > peak) peak = t.equity;
      const dd = peak > 0 ? ((t.equity - peak) / peak) * 100 : 0;
      return { i: i + 1, dd: +dd.toFixed(2) };
    });
  }, [trades]);
  const maxDD = drawdownData.length ? Math.min(...drawdownData.map(d => d.dd)) : 0;

  // Rolling 20-trade win rate
  const rollingWR = trades.map((_, i) => {
    const w = trades.slice(Math.max(0, i - 19), i + 1);
    return { i: i + 1, wr: +((w.filter(t => t.win).length / w.length) * 100).toFixed(1) };
  });

  // Daily P&L (last 30 days)
  const dailyPnl = useMemo(() => {
    const map = {};
    trades.forEach(t => { map[t.date] = (map[t.date] || 0) + t.pnl; });
    return Object.entries(map)
      .map(([date, pnl]) => ({ date: date.slice(5), pnl: +pnl.toFixed(2) }))
      .slice(-30);
  }, [trades]);

  // Session performance
  const sessionMap = useMemo(() => {
    const m = {};
    trades.forEach(t => {
      if (!m[t.session]) m[t.session] = { wins: 0, total: 0, pnl: 0 };
      m[t.session].total++;
      if (t.win) m[t.session].wins++;
      m[t.session].pnl += t.pnl;
    });
    return Object.entries(m).map(([session, d]) => ({
      session,
      wr: +((d.wins / d.total) * 100).toFixed(1),
      pnl: +d.pnl.toFixed(2),
      trades: d.total,
    }));
  }, [trades]);

  const bestSession = sessionMap.length ? [...sessionMap].sort((a, b) => b.wr - a.wr)[0] : null;

  // Day of week
  const dowMap = useMemo(() => {
    const order = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    const m = {};
    trades.forEach(t => {
      if (!m[t.day]) m[t.day] = { wins: 0, total: 0 };
      m[t.day].total++;
      if (t.win) m[t.day].wins++;
    });
    return order.map(day => ({
      day,
      wr: m[day] ? +((m[day].wins / m[day].total) * 100).toFixed(1) : 0,
    }));
  }, [trades]);

  const bestDay = [...dowMap].sort((a, b) => b.wr - a.wr)[0];

  // RRR distribution
  const rrrBuckets = useMemo(() => {
    const b = { "<1": 0, "1–2": 0, "2–3": 0, ">3": 0 };
    trades.forEach(t => {
      if (t.rrr < 1) b["<1"]++;
      else if (t.rrr < 2) b["1–2"]++;
      else if (t.rrr < 3) b["2–3"]++;
      else b[">3"]++;
    });
    return Object.entries(b).map(([label, count]) => ({ label, count }));
  }, [trades]);

  // Discipline trend
  const discTrend = trades.map((t, i) => ({ i: i + 1, score: t.discipline }));

  // Tag breakdown
  const tagMap = useMemo(() => {
    const m = {};
    trades.forEach(t => { m[t.tag] = (m[t.tag] || 0) + 1; });
    return Object.entries(m)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }, [trades]);

  const pct = v => `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`;

  // ── Render ──────────────────────────────────────────────────
  if (loading) return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <LoadingPulse />
    </div>
  );

  if (error) return (
    <div style={{
      background: C.bg, minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center", color: C.red,
      flexDirection: "column", gap: 12,
    }}>
      <div style={{ fontSize: 32 }}>⚠️</div>
      <div style={{ fontSize: 14 }}>Analytics error: {error}</div>
      <div style={{ fontSize: 12, color: C.muted }}>Check Supabase connection and RLS policies</div>
    </div>
  );

  return (
    <div style={{
      background: C.bg, minHeight: "100vh", color: C.text,
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif", paddingBottom: 60,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
      `}</style>

      {/* Header */}
      <div style={{
        borderBottom: `1px solid ${C.border}`, padding: "24px 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, background: C.bg, zIndex: 50,
      }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.2em", color: C.goldDim, textTransform: "uppercase", marginBottom: 4 }}>
            RiskPilot
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>
            Analytics <span style={{ color: C.gold }}>Terminal</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, background: C.surface, borderRadius: 10, padding: 4, border: `1px solid ${C.border}` }}>
          {RANGES.map(r => (
            <button key={r} onClick={() => setRange(r)} style={{
              padding: "6px 16px", borderRadius: 7, border: "none", cursor: "pointer",
              background: range === r ? C.gold : "transparent",
              color: range === r ? "#000" : C.sub,
              fontSize: 12, fontWeight: 600, transition: "all 0.15s",
            }}>{r}</button>
          ))}
        </div>

        <div style={{ fontSize: 12, color: C.sub }}>
          {trades.length} trades
          {trades.length > 0 && ` · ${trades[0].date} → ${trades[trades.length - 1].date}`}
        </div>
      </div>

      <div style={{ padding: "32px 40px" }}>

        {trades.length === 0 ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", height: "50vh", gap: 12, color: C.muted,
          }}>
            <div style={{ fontSize: 48 }}>📊</div>
            <div style={{ fontSize: 18, color: C.sub }}>No trades found for this range</div>
            <div style={{ fontSize: 13 }}>Log your first trade to see analytics</div>
          </div>
        ) : (
          <>
            {/* KPI Row */}
            <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
              <StatCard label="Total P&L" value={pct(totalPnl)} color={totalPnl >= 0 ? C.green : C.red} sub={`${trades.length} trades`} />
              <StatCard label="Win Rate" value={`${winRate.toFixed(1)}%`} color={winRate >= breakEvenWR ? C.green : C.red} sub={`Break-even: ${breakEvenWR.toFixed(1)}%`} />
              <StatCard label="Avg RRR" value={avgRRR.toFixed(2)} color={C.gold} sub="Risk/Reward ratio" />
              <StatCard label="Profit Factor" value={profitFactor.toFixed(2)} color={profitFactor >= 1.5 ? C.green : C.red} sub={profitFactor >= 1.5 ? "Solid edge" : "Needs improvement"} />
              <StatCard label="Max Drawdown" value={`${maxDD.toFixed(1)}%`} color={C.red} sub="Peak-to-trough" />
              <StatCard label="Discipline" value={`${avgDiscipline.toFixed(0)}/100`} color={avgDiscipline >= 75 ? C.green : C.gold} sub="Avg score" />
            </div>

            {/* Chart Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 14 }}>

              {/* Equity Curve */}
              <div style={{ gridColumn: "span 12" }}>
                <Panel title="📈 Equity Curve">
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={equityCurve}>
                      <defs>
                        <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={C.gold} stopOpacity={0.25} />
                          <stop offset="100%" stopColor={C.gold} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="i" tick={{ fill: C.muted, fontSize: 10 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fill: C.muted, fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} width={64} />
                      <Tooltip content={<CustomTooltip prefix="$" />} />
                      <Area type="monotone" dataKey="equity" name="Equity" stroke={C.gold} strokeWidth={2} fill="url(#eqGrad)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Panel>
              </div>

              {/* Drawdown */}
              <div style={{ gridColumn: "span 7" }}>
                <Panel title="📉 Drawdown">
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={drawdownData}>
                      <defs>
                        <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={C.red} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={C.red} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="i" tick={{ fill: C.muted, fontSize: 10 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fill: C.muted, fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} width={48} />
                      <Tooltip content={<CustomTooltip />} />
                      <ReferenceLine y={0} stroke={C.border} />
                      <Area type="monotone" dataKey="dd" name="Drawdown %" stroke={C.red} strokeWidth={1.5} fill="url(#ddGrad)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Panel>
              </div>

              {/* Rolling Win Rate */}
              <div style={{ gridColumn: "span 5" }}>
                <Panel title="🎯 Rolling Win Rate (20-trade)">
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={rollingWR}>
                      <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="i" tick={{ fill: C.muted, fontSize: 10 }} tickLine={false} axisLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fill: C.muted, fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} width={40} />
                      <Tooltip content={<CustomTooltip />} />
                      <ReferenceLine y={breakEvenWR} stroke={C.goldDim} strokeDasharray="4 4" label={{ value: "B/E", fill: C.goldDim, fontSize: 10 }} />
                      <Line type="monotone" dataKey="wr" name="Win Rate %" stroke={C.green} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </Panel>
              </div>

              {/* Daily P&L */}
              <div style={{ gridColumn: "span 12" }}>
                <Panel title="📊 Daily P&L (last 30 sessions)">
                  {dailyPnl.length === 0 ? <EmptyState message="No daily data yet" /> : (
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={dailyPnl} barSize={10}>
                        <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" tick={{ fill: C.muted, fontSize: 9 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fill: C.muted, fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} width={44} />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine y={0} stroke={C.border} />
                        <Bar dataKey="pnl" name="P&L %" radius={[3, 3, 0, 0]}>
                          {dailyPnl.map((d, i) => (
                            <Cell key={i} fill={d.pnl >= 0 ? C.green : C.red} fillOpacity={0.85} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </Panel>
              </div>

              {/* Session Performance */}
              <div style={{ gridColumn: "span 4" }}>
                <Panel title="🕐 Session Performance">
                  {sessionMap.length === 0 ? <EmptyState message="No session data" /> : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 4 }}>
                      {sessionMap.map(s => (
                        <div key={s.session}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                            <span>{s.session}</span>
                            <span style={{ color: s.wr >= 50 ? C.green : C.red, fontFamily: "'DM Mono', monospace" }}>{s.wr}%</span>
                          </div>
                          <div style={{ height: 4, background: C.border, borderRadius: 4 }}>
                            <div style={{
                              height: "100%", borderRadius: 4, width: `${s.wr}%`,
                              background: s.wr >= 50 ? C.green : C.red, transition: "width 0.5s",
                            }} />
                          </div>
                          <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>
                            {s.trades} trades · {pct(s.pnl)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Panel>
              </div>

              {/* Day of Week */}
              <div style={{ gridColumn: "span 4" }}>
                <Panel title="📅 Day of Week Win Rate">
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={dowMap} barSize={22}>
                      <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="day" tick={{ fill: C.muted, fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fill: C.muted, fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} width={36} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="wr" name="Win Rate %" radius={[4, 4, 0, 0]}>
                        {dowMap.map((d, i) => (
                          <Cell key={i} fill={d.wr >= 50 ? C.gold : C.muted} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Panel>
              </div>

              {/* RRR Distribution */}
              <div style={{ gridColumn: "span 4" }}>
                <Panel title="⚖️ RRR Distribution">
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={rrrBuckets} barSize={36}>
                      <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: C.muted, fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fill: C.muted, fontSize: 10 }} tickLine={false} axisLine={false} width={28} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" name="Trades" radius={[4, 4, 0, 0]} fill={C.gold} fillOpacity={0.75} />
                    </BarChart>
                  </ResponsiveContainer>
                </Panel>
              </div>

              {/* Discipline Trend */}
              <div style={{ gridColumn: "span 8" }}>
                <Panel title="🧠 Discipline Score Trend">
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={discTrend}>
                      <defs>
                        <linearGradient id="discGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={C.purple} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={C.purple} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="i" tick={{ fill: C.muted, fontSize: 10 }} tickLine={false} axisLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fill: C.muted, fontSize: 10 }} tickLine={false} axisLine={false} width={36} />
                      <Tooltip content={<CustomTooltip />} />
                      <ReferenceLine y={75} stroke={C.purple} strokeDasharray="4 4" strokeOpacity={0.4} />
                      <Area type="monotone" dataKey="score" name="Score" stroke={C.purple} strokeWidth={2} fill="url(#discGrad)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Panel>
              </div>

              {/* Trade Tags */}
              <div style={{ gridColumn: "span 4" }}>
                <Panel title="🏷️ Trade Tags">
                  {tagMap.length === 0 ? <EmptyState message="No tags recorded" /> : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                      {tagMap.map(t => {
                        const bad = ["FOMO", "Revenge", "Impulse"].includes(t.tag);
                        return (
                          <div key={t.tag} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                              fontSize: 10, color: bad ? C.red : C.green,
                              background: bad ? `${C.red}18` : `${C.green}18`,
                              borderRadius: 4, padding: "2px 8px", minWidth: 72, textAlign: "center",
                            }}>{t.tag}</div>
                            <div style={{ flex: 1, height: 4, background: C.border, borderRadius: 4 }}>
                              <div style={{
                                height: "100%", borderRadius: 4,
                                width: `${(t.count / trades.length) * 100}%`,
                                background: bad ? C.red : C.green, opacity: 0.7,
                              }} />
                            </div>
                            <div style={{ fontSize: 11, color: C.sub, fontFamily: "'DM Mono', monospace", minWidth: 20 }}>
                              {t.count}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Panel>
              </div>

              {/* Insight Bar */}
              <div style={{ gridColumn: "span 12" }}>
                <div style={{
                  background: `linear-gradient(135deg, ${C.surface}, #0f1117)`,
                  border: `1px solid ${C.goldDim}44`,
                  borderRadius: 12, padding: "18px 32px",
                  display: "flex", gap: 48, alignItems: "center", flexWrap: "wrap",
                }}>
                  {[
                    {
                      label: "⚡ Break-even Win Rate",
                      value: `${breakEvenWR.toFixed(1)}%`,
                      sub: `at avg RRR ${avgRRR.toFixed(2)}`,
                      color: C.gold,
                    },
                    {
                      label: "Your Win Rate",
                      value: `${winRate.toFixed(1)}%`,
                      sub: winRate >= breakEvenWR
                        ? `+${(winRate - breakEvenWR).toFixed(1)}% above B/E ✓`
                        : `${(winRate - breakEvenWR).toFixed(1)}% below B/E ✗`,
                      color: winRate >= breakEvenWR ? C.green : C.red,
                    },
                    {
                      label: "Best Session",
                      value: bestSession?.session || "—",
                      sub: bestSession ? `${bestSession.wr}% win rate` : "",
                      color: C.text,
                    },
                    {
                      label: "Best Day",
                      value: bestDay?.day || "—",
                      sub: bestDay ? `${bestDay.wr}% win rate` : "",
                      color: C.text,
                    },
                  ].map((item, i, arr) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 48 }}>
                      <div>
                        <div style={{ fontSize: 10, color: C.goldDim, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
                          {item.label}
                        </div>
                        <div style={{ fontSize: 26, fontWeight: 700, color: item.color, fontFamily: "'DM Mono', monospace" }}>
                          {item.value}
                        </div>
                        <div style={{ fontSize: 11, color: C.sub }}>{item.sub}</div>
                      </div>
                      {i < arr.length - 1 && (
                        <div style={{ width: 1, height: 48, background: C.border }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
}
