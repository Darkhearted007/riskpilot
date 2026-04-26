import { fmt } from '../../utils/format';

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="flex flex-col bg-[#0d1117] border border-[#21262d] rounded-xl p-5 gap-1 hover:border-[#30363d] transition-colors">
      <p className="text-xs text-[#8b949e] uppercase tracking-wider font-semibold">{label}</p>
      <p className="text-2xl font-black font-mono tabular-nums mt-1" style={{ color: accent ?? '#e6edf3' }}>{value}</p>
      {sub && <p className="text-xs text-[#484f58]">{sub}</p>}
    </div>
  );
}

export function DashboardStats({ stats }) {
  const { totalTrades=0, winRate=0, avgRRR=0, avgDisciplineScore=0, netR=0, wins=0, losses=0, breakevens=0 } = stats ?? {};
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      <StatCard label="Total Trades" value={totalTrades} sub={`${wins}W · ${losses}L · ${breakevens}BE`} />
      <StatCard label="Win Rate" value={fmt.percent(winRate)} sub="Closed trades only"
        accent={winRate >= 50 ? '#22c55e' : winRate >= 40 ? '#f59e0b' : '#ef4444'} />
      <StatCard label="Avg RRR" value={`${fmt.rrr(avgRRR)}R`}
        sub={avgRRR >= 2 ? 'Good ratio' : 'Needs improvement'}
        accent={avgRRR >= 2 ? '#22c55e' : avgRRR >= 1 ? '#f59e0b' : '#ef4444'} />
      <StatCard label="Discipline Avg" value={fmt.score(avgDisciplineScore)}
        sub={avgDisciplineScore >= 70 ? 'Excellent' : avgDisciplineScore >= 50 ? 'Good' : 'Needs work'}
        accent="#D4AF5A" />
      <StatCard label="Net R" value={fmt.rMultiple(netR)} sub="Total accumulated"
        accent={netR > 0 ? '#22c55e' : netR < 0 ? '#ef4444' : '#8b949e'} />
    </div>
  );
}
