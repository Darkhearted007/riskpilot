import { useState } from 'react';
import { fmt } from '../../utils/format';
import { getRatingColor } from '../../lib/discipline';

export function TradeTable({ trades = [], onDelete, onUpdateResult }) {
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;
  const paginated = trades.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(trades.length / PAGE_SIZE);
  const th = 'text-left text-xs text-[#8b949e] uppercase tracking-wider font-semibold pb-3 px-3';
  const td = 'px-3 py-3.5 text-sm text-[#e6edf3] font-mono';
  return (
    <div className="rounded-xl border border-[#21262d] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#0d1117] border-b border-[#21262d]">
            <tr>
              {['Date','Pair','Dir','Entry','SL','TP','RRR','Risk%','Disc.','Result',''].map(h => (
                <th key={h} className={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#21262d] bg-[#0d1117]/50">
            {!paginated.length && (
              <tr><td colSpan={11} className="px-3 py-8 text-center text-sm text-[#484f58]">No trades yet. Log your first trade.</td></tr>
            )}
            {paginated.map(t => {
              const rColor = { win:'#22c55e', loss:'#ef4444', breakeven:'#f59e0b' }[t.result] ?? '#484f58';
              const ds = t.discipline_score;
              const dColor = ds >= 80 ? '#22c55e' : ds >= 60 ? '#84cc16' : ds >= 40 ? '#f59e0b' : '#ef4444';
              return (
                <tr key={t.id} className="hover:bg-[#161b22] transition-colors">
                  <td className={td + ' text-[#8b949e]'}>{fmt.date(t.created_at)}</td>
                  <td className={td}>{t.pair}</td>
                  <td className={td}>
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded"
                      style={{ color: t.direction==='BUY'?'#22c55e':'#ef4444', background: t.direction==='BUY'?'#22c55e18':'#ef444418' }}>
                      {t.direction}
                    </span>
                  </td>
                  <td className={td}>{fmt.price(t.entry)}</td>
                  <td className={td + ' text-[#ef4444]'}>{fmt.price(t.sl)}</td>
                  <td className={td + ' text-[#22c55e]'}>{fmt.price(t.tp)}</td>
                  <td className={td} style={{ color: t.rrr>=2?'#22c55e':t.rrr>=1?'#f59e0b':'#ef4444' }}>
                    {t.rrr != null ? `${fmt.rrr(t.rrr)}R` : '—'}
                  </td>
                  <td className={td + ' text-[#8b949e]'}>{t.risk_percent != null ? `${t.risk_percent}%` : '—'}</td>
                  <td className={td} style={{ color: dColor }}>{fmt.score(t.discipline_score)}</td>
                  <td className={td}>
                    {onUpdateResult
                      ? <select value={t.result ?? ''} onChange={e => onUpdateResult(t.id, e.target.value || null)}
                          className="bg-transparent text-xs font-bold uppercase cursor-pointer focus:outline-none"
                          style={{ color: rColor }}>
                          <option value="">OPEN</option>
                          <option value="win">WIN</option>
                          <option value="loss">LOSS</option>
                          <option value="breakeven">BE</option>
                        </select>
                      : <span className="text-xs font-bold" style={{ color: rColor }}>
                          {t.result ? t.result.toUpperCase() : 'OPEN'}
                        </span>
                    }
                  </td>
                  <td className={td}>
                    {onDelete && <button onClick={() => onDelete(t.id)} className="text-[#484f58] hover:text-[#ef4444] transition-colors text-xs">✕</button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#21262d] bg-[#0d1117]">
          <p className="text-xs text-[#484f58]">{trades.length} trades · Page {page+1} of {totalPages}</p>
          <div className="flex gap-2">
            <button disabled={page===0} onClick={() => setPage(p=>p-1)}
              className="px-3 py-1 text-xs rounded border border-[#21262d] text-[#8b949e] disabled:opacity-30">← Prev</button>
            <button disabled={page>=totalPages-1} onClick={() => setPage(p=>p+1)}
              className="px-3 py-1 text-xs rounded border border-[#21262d] text-[#8b949e] disabled:opacity-30">Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}
