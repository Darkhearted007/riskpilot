import { useMemo } from 'react';
import { fmt } from '../../utils/format';

const W=600, H=180, PAD={top:20,right:20,bottom:30,left:48};

export function PerformanceChart({ rSeries=[] }) {
  const chart = useMemo(() => {
    if (!rSeries.length) return null;
    const vals = rSeries.map(p => p.cumulative);
    const minR = Math.min(0,...vals), maxR = Math.max(0,...vals);
    const range = maxR - minR || 1;
    const pW = W-PAD.left-PAD.right, pH = H-PAD.top-PAD.bottom;
    const toX = i => PAD.left + (i/Math.max(rSeries.length-1,1))*pW;
    const toY = v => PAD.top + pH - ((v-minR)/range)*pH;
    const zeroY = toY(0);
    const points = rSeries.map((p,i) => ({ x:toX(i), y:toY(p.cumulative), result:p.result }));
    const line = points.reduce((acc,p,i) => acc+(i===0?`M${p.x},${p.y}`:`L${p.x},${p.y}`),'');
    const fill = line+` L${points[points.length-1].x},${zeroY} L${PAD.left},${zeroY} Z`;
    return { points, line, fill, zeroY };
  }, [rSeries]);

  if (!chart) return (
    <div className="rounded-xl border border-[#21262d] bg-[#0d1117] p-6 flex items-center justify-center h-48">
      <p className="text-sm text-[#484f58]">No closed trades to chart yet</p>
    </div>
  );

  const lastR = rSeries[rSeries.length-1]?.cumulative ?? 0;
  const lineColor = lastR >= 0 ? '#22c55e' : '#ef4444';

  return (
    <div className="rounded-xl border border-[#21262d] bg-[#0d1117] p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-[#e6edf3]">Cumulative R Performance</p>
        <p className="text-sm font-black font-mono" style={{ color: lineColor }}>{fmt.rMultiple(lastR)}</p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <line x1={PAD.left} y1={chart.zeroY} x2={W-PAD.right} y2={chart.zeroY}
          stroke="#21262d" strokeWidth="1" strokeDasharray="4 4"/>
        <path d={chart.fill} fill={lineColor} fillOpacity="0.08"/>
        <path d={chart.line} fill="none" stroke={lineColor} strokeWidth="2" strokeLinejoin="round"/>
        {chart.points.map((p,i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4"
            fill={p.result==='win'?'#22c55e':p.result==='loss'?'#ef4444':'#f59e0b'}
            stroke="#0d1117" strokeWidth="1.5"/>
        ))}
      </svg>
      <p className="text-xs text-[#484f58] mt-2 text-center">Green = win · Red = loss · Amber = breakeven</p>
    </div>
  );
}
