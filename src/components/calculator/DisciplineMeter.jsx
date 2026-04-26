import { getRatingColor } from '../../lib/discipline';
import { fmt } from '../../utils/format';

export function DisciplineMeter({ score, rating, breakdown }) {
  if (score == null) {
    return (
      <div className="rounded-lg bg-[#0d1117] border border-[#21262d] p-4 text-center">
        <p className="text-xs text-[#484f58]">Discipline score awaiting input</p>
      </div>
    );
  }
  const color = getRatingColor(rating);
  const C = 2 * Math.PI * 36;
  const offset = C - (score / 100) * C;
  const bk = breakdown || {};
  const rows = [
    { label: 'Base', val: bk.base ?? 50, cls: 'text-[#8b949e]' },
    bk.rrrBonus > 0   && { label: 'RRR Bonus',  val: `+${bk.rrrBonus}`,  cls: 'text-[#22c55e]' },
    bk.rrrPenalty < 0 && { label: 'RRR Penalty', val: bk.rrrPenalty,      cls: 'text-[#ef4444]' },
    bk.slBonus > 0    && { label: 'SL Bonus',    val: `+${bk.slBonus}`,   cls: 'text-[#22c55e]' },
    bk.slPenalty < 0  && { label: 'SL Penalty',  val: bk.slPenalty,       cls: 'text-[#ef4444]' },
  ].filter(Boolean);
  return (
    <div className="rounded-lg bg-[#0d1117] border border-[#21262d] p-4">
      <div className="flex items-center gap-5">
        <svg width="88" height="88" viewBox="0 0 88 88" className="-rotate-90 shrink-0">
          <circle cx="44" cy="44" r="36" fill="none" stroke="#21262d" strokeWidth="6" />
          <circle cx="44" cy="44" r="36" fill="none" stroke={color} strokeWidth="6"
            strokeLinecap="round" strokeDasharray={C} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
          <text x="44" y="49" textAnchor="middle" fontSize="18" fontWeight="700"
            fill={color} transform="rotate(90 44 44)" fontFamily="Space Mono">
            {fmt.score(score)}
          </text>
        </svg>
        <div className="flex-1 space-y-2">
          <div>
            <p className="text-xs text-[#8b949e] uppercase tracking-wider font-semibold">Discipline Score</p>
            <p className="text-sm font-bold" style={{ color }}>{rating}</p>
          </div>
          <div className="space-y-1">
            {rows.map(({ label, val, cls }) => (
              <div key={label} className="flex justify-between text-xs">
                <span className="text-[#484f58]">{label}</span>
                <span className={cls}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
