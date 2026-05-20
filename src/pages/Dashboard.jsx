import { useRiskLive } from "../hooks/useRiskLive";
import { useMemo, useState } from "react";

export default function Dashboard() {
  const { connected, insight } = useRiskLive();

  const [balance, setBalance] = useState(1000);
  const [risk, setRisk] = useState(1);
  const [entry, setEntry] = useState(2650);
  const [sl, setSl] = useState(2630);
  const [tp, setTp] = useState(2690);

  const riskAmount = useMemo(() => (balance * risk) / 100, [balance, risk]);

  const rrr = useMemo(() => {
    const riskDist = Math.abs(entry - sl);
    const rewardDist = Math.abs(tp - entry);
    return riskDist ? (rewardDist / riskDist).toFixed(2) : "0";
  }, [entry, sl, tp]);

  return (
    <div className="min-h-screen bg-[#050816] text-white p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-cyan-400">
          RiskPilot
        </h1>

        <div className={`px-3 py-1 rounded ${
          connected ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
        }`}>
          {connected ? "ENGINE ONLINE" : "ENGINE OFFLINE"}
        </div>
      </div>

      {/* AI PANEL */}
      <div className="bg-[#0B1220] p-5 rounded-xl border border-cyan-500/20 mb-6">
        <h2 className="text-xl font-bold text-cyan-400">
          LIVE AI ENGINE
        </h2>

        {!insight ? (
          <p className="text-gray-400 mt-3">Waiting for signals...</p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>Score: {insight.score}</div>
            <div>State: {insight.state}</div>
            <div>Session: {insight?.context?.session}</div>
            <div>Volatility: {insight?.context?.volatility}</div>
          </div>
        )}
      </div>

      {/* SIMPLE CALCULATOR */}
      <div className="bg-[#0B1220] p-5 rounded-xl border border-white/10">
        <h2 className="text-xl mb-4">Trade Calculator</h2>

        <input
          className="w-full mb-2 p-2 bg-black/40"
          value={balance}
          onChange={(e) => setBalance(+e.target.value)}
          placeholder="Balance"
        />

        <input
          className="w-full mb-2 p-2 bg-black/40"
          value={risk}
          onChange={(e) => setRisk(+e.target.value)}
          placeholder="Risk %"
        />

        <div className="mt-4">
          Risk Amount: ${riskAmount.toFixed(2)}
        </div>

        <div>
          RRR: {rrr}
        </div>
      </div>

    </div>
  );
}
