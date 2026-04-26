import { useState } from 'react';
import { calculateRRR, calculateBreakEven, pipDistance } from '../../lib/calculations';
import { calculateDisciplineScore } from '../../lib/discipline';

const defaultState = { pair: 'XAUUSD', direction: 'BUY', entry: '', sl: '', tp: '', riskPercent: '1', notes: '' };

export function CalculatorForm({ onResult, onSave }) {
  const [form, setForm] = useState(defaultState);
  const [saving, setSaving] = useState(false);
  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  const rrr = calculateRRR(form.entry, form.sl, form.tp, form.direction);
  const breakEven = calculateBreakEven(rrr);
  const slDist = pipDistance(form.entry, form.sl);
  const disc = rrr != null ? calculateDisciplineScore(rrr, slDist) : { score: null, rating: null, breakdown: null };

  if (onResult) onResult({ rrr, breakEven, ...disc, form });

  const handleSave = async () => {
    if (rrr == null || !onSave) return;
    setSaving(true);
    await onSave({
      pair: form.pair, direction: form.direction,
      entry: parseFloat(form.entry), sl: parseFloat(form.sl), tp: parseFloat(form.tp),
      rrr, risk_percent: parseFloat(form.riskPercent) || null,
      discipline_score: disc.score, notes: form.notes || null,
    });
    setSaving(false);
    setForm(defaultState);
  };

  const inp = `w-full bg-[#0a0e13] border border-[#21262d] rounded-lg px-4 py-3 text-[#e6edf3] text-sm font-mono placeholder-[#484f58] focus:outline-none focus:border-[#D4AF5A] transition-colors`;
  const lbl = `block text-xs text-[#8b949e] mb-1.5 uppercase tracking-wider font-semibold`;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={lbl}>Pair</label>
          <select value={form.pair} onChange={set('pair')} className={inp + ' cursor-pointer'}>
            <option>XAUUSD</option><option>EURUSD</option><option>GBPUSD</option><option>USDJPY</option>
          </select>
        </div>
        <div>
          <label className={lbl}>Direction</label>
          <div className="flex gap-2 h-[46px]">
            {['BUY','SELL'].map(d => (
              <button key={d} type="button" onClick={() => setForm(p => ({ ...p, direction: d }))}
                className={`flex-1 rounded-lg text-sm font-bold tracking-widest border transition-all ${
                  form.direction === d
                    ? d === 'BUY' ? 'bg-[#22c55e]/20 border-[#22c55e] text-[#22c55e]'
                                  : 'bg-[#ef4444]/20 border-[#ef4444] text-[#ef4444]'
                    : 'bg-[#0a0e13] border-[#21262d] text-[#484f58]'
                }`}>{d}</button>
            ))}
          </div>
        </div>
      </div>
      <div>
        <label className={lbl}>Entry Price</label>
        <input type="number" step="0.01" placeholder="e.g. 1924.50" value={form.entry} onChange={set('entry')} className={inp} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={lbl}>Stop Loss</label>
          <input type="number" step="0.01" placeholder="e.g. 1910.00" value={form.sl} onChange={set('sl')} className={inp} />
        </div>
        <div>
          <label className={lbl}>Take Profit</label>
          <input type="number" step="0.01" placeholder="e.g. 1954.50" value={form.tp} onChange={set('tp')} className={inp} />
        </div>
      </div>
      <div>
        <label className={lbl}>Risk %</label>
        <input type="number" step="0.1" min="0.1" max="100" placeholder="1" value={form.riskPercent} onChange={set('riskPercent')} className={inp} />
      </div>
      <div>
        <label className={lbl}>Notes (optional)</label>
        <textarea rows={2} placeholder="Setup reasoning..." value={form.notes} onChange={set('notes')} className={inp + ' resize-none'} />
      </div>
      {onSave && (
        <button type="button" onClick={handleSave} disabled={rrr == null || saving}
          className={`w-full py-3 rounded-lg text-sm font-bold tracking-widest uppercase transition-all ${
            rrr != null ? 'bg-[#D4AF5A] text-[#0d1117] hover:bg-[#e8c96a]' : 'bg-[#21262d] text-[#484f58] cursor-not-allowed'
          }`}>
          {saving ? 'Saving…' : 'Log Trade →'}
        </button>
      )}
    </div>
  );
}
