import { fmt } from '../../utils/format';

export function RRRDisplay({ rrr }) {
  const color = rrr == null ? '#484f58' : rrr >= 3 ? '#22c55e' : rrr >= 2 ? '#84cc16' : rrr >= 1 ? '#f59e0b' : '#ef4444';
  const tag = rrr == null ? 'Enter trade details' : rrr >= 3 ? 'Elite Setup' : rrr >= 2 ? 'Good Setup' : rrr >= 1 ? 'Marginal' : 'Poor Risk';
  return (
    <div className="flex flex-col items-center justify-center py-6">
      <p className="text-xs text-[#8b949e] uppercase tracking-widest mb-2 font-semibold">Risk/Reward Ratio</p>
      <div className="text-6xl font-black tabular-nums transition-all duration-300" style={{ color, fontFamily: "'Space Mono', monospace" }}>
        {rrr == null ? '—' : `${fmt.rrr(rrr)}R`}
      </div>
      <p className="mt-2 text-xs font-semibold tracking-wider uppercase" style={{ color }}>{tag}</p>
    </div>
  );
}
