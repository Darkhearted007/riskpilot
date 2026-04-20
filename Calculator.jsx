import { useState } from "react";
import {
  calculateRRR,
  getRRRLabel,
  calculateBreakEvenWinRate
} from "../lib/riskEngine";

export default function Calculator() {
  const [entry, setEntry] = useState("");
  const [sl, setSl] = useState("");
  const [tp, setTp] = useState("");
  const [direction, setDirection] = useState("BUY");

  const rrr = calculateRRR(
    Number(entry),
    Number(sl),
    Number(tp),
    direction
  );

  const rrrLabel = getRRRLabel(rrr);
  const breakEven = calculateBreakEvenWinRate(rrr);

  return (
    <div className="card">

      <h2>XAUUSD Trade Validator</h2>

      {/* Direction Toggle */}
      <select
        value={direction}
        onChange={(e) => setDirection(e.target.value)}
      >
        <option value="BUY">BUY</option>
        <option value="SELL">SELL</option>
      </select>

      {/* Inputs */}
      <input
        type="number"
        placeholder="Entry Price (e.g. 2650)"
        onChange={(e) => setEntry(e.target.value)}
      />

      <input
        type="number"
        placeholder="Stop Loss"
        onChange={(e) => setSl(e.target.value)}
      />

      <input
        type="number"
        placeholder="Take Profit"
        onChange={(e) => setTp(e.target.value)}
      />

      {/* RRR Output */}
      {rrr && (
        <div className="result">
          <h3>RRR: {rrr}</h3>
          <p>{rrrLabel}</p>
        </div>
      )}

      {/* Break-even Win Rate */}
      {breakEven && (
        <div className="breakeven-box">
          <p>
            Break-even win rate required:
            <strong> {breakEven}%</strong>
          </p>
          <small>
            If your win rate is above this, you're profitable long term.
          </small>
        </div>
      )}

      {/* Warning */}
      {rrr && rrr < 1 && (
        <div className="warning-box">
          This trade requires a very high win rate to be profitable.
        </div>
      )}

    </div>
  );
}
