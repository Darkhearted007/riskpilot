import { useEffect, useMemo, useState } from "react";
import { useRiskLive } from "../hooks/useRiskLive";

export default function Dashboard() {
  const { connected, insight } = useRiskLive();

  const [accountBalance, setAccountBalance] = useState(10000);
  const [riskPercent, setRiskPercent] = useState(1);
  const [entryPrice, setEntryPrice] = useState(2650);
  const [stopLoss, setStopLoss] = useState(2630);
  const [takeProfit, setTakeProfit] = useState(2690);
  const [direction, setDirection] = useState("BUY");

  const riskAmount = useMemo(() => {
    return ((accountBalance * riskPercent) / 100).toFixed(2);
  }, [accountBalance, riskPercent]);

  const riskDistance = useMemo(() => {
    return Math.abs(entryPrice - stopLoss);
  }, [entryPrice, stopLoss]);

  const rewardDistance = useMemo(() => {
    return Math.abs(takeProfit - entryPrice);
  }, [takeProfit, entryPrice]);

  const rrr = useMemo(() => {
    if (!riskDistance) return 0;
    return (rewardDistance / riskDistance).toFixed(2);
  }, [riskDistance, rewardDistance]);

  const disciplineScore = useMemo(() => {
    let score = 50;

    if (rrr >= 2) score += 20;
    if (riskPercent <= 2) score += 15;
    if (riskDistance > 0) score += 10;

    return Math.min(score, 100);
  }, [rrr, riskPercent, riskDistance]);

  const disciplineLabel = useMemo(() => {
    if (disciplineScore >= 85) return "Excellent";
    if (disciplineScore >= 70) return "Good";
    if (disciplineScore >= 50) return "Average";
    return "Poor";
  }, [disciplineScore]);

  const sessionName = insight?.context?.session || "New York";
  const volatility = insight?.context?.volatility || "Medium";

  return (
    <div className="min-h-screen bg-[#050816] text-white p-5">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-cyan-400">
              RiskPilot
            </h1>

            <p className="text-gray-400 mt-1">
              Institutional Trading Intelligence
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`px-4 py-2 rounded-full text-sm font-bold ${
                connected
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {connected ? "AI ENGINE ONLINE" : "ENGINE OFFLINE"}
            </div>
          </div>
        </div>

        {/* LIVE AI PANEL */}
        <div className="bg-[#0B1220] border border-cyan-500/20 rounded-3xl p-6 shadow-2xl mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-cyan-400">
                LIVE AI RISK ENGINE
              </h2>

              <p className="text-gray-400 mt-1">
                Real-time trader intelligence feed
              </p>
            </div>

            <div
              className={`px-4 py-2 rounded-xl font-bold ${
                connected
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {connected ? "CONNECTED" : "OFFLINE"}
            </div>
          </div>

          {!insight ? (
            <div className="mt-6 text-gray-500">
              Waiting for live engine signals...
            </div>
          ) : (
            <div className="grid md:grid-cols-4 gap-4 mt-6">
              <div className="bg-black/30 rounded-2xl p-5 border border-white/5">
                <p className="text-gray-400 text-sm">
                  Stability Score
                </p>

                <h1 className="text-5xl font-bold text-cyan-400 mt-2">
                  {insight.score}
                </h1>
              </div>

              <div className="bg-black/30 rounded-2xl p-5 border border-white/5">
                <p className="text-gray-400 text-sm">
                  Market State
                </p>

                <h1 className="text-3xl font-bold text-white mt-2">
                  {insight.state}
                </h1>
              </div>

              <div className="bg-black/30 rounded-2xl p-5 border border-white/5">
                <p className="text-gray-400 text-sm">
                  Session
                </p>

                <h1 className="text-3xl font-bold text-yellow-400 mt-2">
                  {sessionName}
                </h1>
              </div>

              <div className="bg-black/30 rounded-2xl p-5 border border-white/5">
                <p className="text-gray-400 text-sm">
                  Volatility
                </p>

                <h1 className="text-3xl font-bold text-pink-400 mt-2">
                  {volatility}
                </h1>
              </div>
            </div>
          )}
        </div>

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* LEFT PANEL */}
          <div className="bg-[#0B1220] rounded-3xl p-6 border border-white/5">
            <h2 className="text-2xl font-bold mb-6">
              Trade Calculator
            </h2>

            <div className="space-y-5">
              <div>
                <label className="text-gray-400 text-sm">
                  Account Balance
                </label>

                <input
                  type="number"
                  value={accountBalance}
                  onChange={(e) =>
                    setAccountBalance(Number(e.target.value))
                  }
                  className="w-full mt-2 bg-black/30 border border-white/10 rounded-xl p-4 outline-none"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm">
                  Risk %
                </label>

                <input
                  type="number"
                  value={riskPercent}
                  onChange={(e) =>
                    setRiskPercent(Number(e.target.value))
                  }
                  className="w-full mt-2 bg-black/30 border border-white/10 rounded-xl p-4 outline-none"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm">
                  Direction
                </label>

                <select
                  value={direction}
                  onChange={(e) => setDirection(e.target.value)}
                  className="w-full mt-2 bg-black/30 border border-white/10 rounded-xl p-4 outline-none"
                >
                  <option>BUY</option>
                  <option>SELL</option>
                </select>
              </div>

              <div>
                <label className="text-gray-400 text-sm">
                  Entry Price
                </label>

                <input
                  type="number"
                  value={entryPrice}
                  onChange={(e) =>
                    setEntryPrice(Number(e.target.value))
                  }
                  className="w-full mt-2 bg-black/30 border border-white/10 rounded-xl p-4 outline-none"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm">
                  Stop Loss
                </label>

                <input
                  type="number"
                  value={stopLoss}
                  onChange={(e) =>
                    setStopLoss(Number(e.target.value))
                  }
                  className="w-full mt-2 bg-black/30 border border-white/10 rounded-xl p-4 outline-none"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm">
                  Take Profit
                </label>

                <input
                  type="number"
                  value={takeProfit}
                  onChange={(e) =>
                    setTakeProfit(Number(e.target.value))
                  }
                  className="w-full mt-2 bg-black/30 border border-white/10 rounded-xl p-4 outline-none"
                />
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="space-y-6">
            {/* RISK OVERVIEW */}
            <div className="bg-[#0B1220] rounded-3xl p-6 border border-white/5">
              <h2 className="text-2xl font-bold mb-6">
                Risk Overview
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/30 rounded-2xl p-5">
                  <p className="text-gray-400 text-sm">
                    Risk Amount
                  </p>

                  <h1 className="text-3xl font-bold mt-2">
                    ${riskAmount}
                  </h1>
                </div>

                <div className="bg-black/30 rounded-2xl p-5">
                  <p className="text-gray-400 text-sm">
                    Risk Reward
                  </p>

                  <h1 className="text-3xl font-bold text-cyan-400 mt-2">
                    {rrr}R
                  </h1>
                </div>
              </div>
            </div>

            {/* DISCIPLINE */}
            <div className="bg-[#0B1220] rounded-3xl p-6 border border-white/5">
              <h2 className="text-2xl font-bold mb-6">
                Discipline Intelligence
              </h2>

              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-6xl font-bold text-green-400">
                    {disciplineScore}
                  </h1>

                  <p className="text-gray-400 mt-2">
                    {disciplineLabel}
                  </p>
                </div>

                <div className="w-32 h-32 rounded-full border-8 border-cyan-400 flex items-center justify-center text-xl font-bold">
                  {disciplineScore}%
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">
                    Risk Control
                  </span>

                  <span className="text-green-400">
                    Excellent
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">
                    RRR Quality
                  </span>

                  <span className="text-cyan-400">
                    Strong
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">
                    Emotional Stability
                  </span>

                  <span className="text-yellow-400">
                    Stable
                  </span>
                </div>
              </div>
            </div>

            {/* MARKET INTELLIGENCE */}
            <div className="bg-[#0B1220] rounded-3xl p-6 border border-white/5">
              <h2 className="text-2xl font-bold mb-6">
                Market Intelligence
              </h2>

              <div className="space-y-4">
                <div className="bg-black/30 rounded-2xl p-4">
                  <p className="text-gray-400 text-sm">
                    Active Session
                  </p>

                  <h1 className="text-2xl font-bold text-yellow-400 mt-2">
                    {sessionName}
                  </h1>
                </div>

                <div className="bg-black/30 rounded-2xl p-4">
                  <p className="text-gray-400 text-sm">
                    Market Volatility
                  </p>

                  <h1 className="text-2xl font-bold text-pink-400 mt-2">
                    {volatility}
                  </h1>
                </div>

                <div className="bg-black/30 rounded-2xl p-4">
                  <p className="text-gray-400 text-sm">
                    AI Alerts
                  </p>

                  <ul className="mt-3 space-y-2">
                    {insight?.alerts?.map((alert, idx) => (
                      <li
                        key={idx}
                        className="text-sm text-gray-300"
                      >
                        • {alert}
                      </li>
                    )) || (
                      <li className="text-gray-500">
                        No active alerts
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
