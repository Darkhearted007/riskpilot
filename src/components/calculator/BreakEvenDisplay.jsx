import { fmt } from '../../utils/format';

export function BreakEvenDisplay({ rrr, breakEven }) {
  if (rrr == null || breakEven == null) {
    return (
      <div className="rounded-lg bg-[#0d1117] border border-[#21262d] p-4 text-center">
        <p className="text-xs text-[#484f58]">Enter trade details to see break-even rate</p>
      </div>
    );
  }
  const msg = breakEven < 40
    ? `You only need ${fmt.percent(breakEven)} win rate at ${fmt.rrr(rrr)}R. Strong edge even at low win rates.`
    : breakEven < 50
    ? `You only need ${fmt.percent(breakEven)} win rate at ${fmt.rrr(rrr)}R. Win less than half your trades to break even.`
    : `You need ${fmt.percent(breakEven)} win rate at ${fmt.rrr(rrr)}R. High requirement — improve your RRR.`;
  return (
    <div className="rounded-lg bg-[#0d1117] border border-[#21262d] p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#8b949e] uppercase tracking-wider font-semibold">Break-Even Win Rate</span>
        <span className="text-xl font-black text-[#D4AF5A] font-mono">{fmt.percent(breakEven)}</span>
      </div>
      <div className="h-1.5 bg-[#21262d] rounded-full overflow-hidden">
        <div className="h-full bg-[#D4AF5A] rounded-full transition-all duration-500" style={{ width: `${Math.min(breakEven, 100)}%` }} />
      </div>
      <p className="text-xs text-[#8b949e] leading-relaxed">{msg}</p>
    </div>
  );
}
