export const fmt = {
  rrr: (v) => (v == null ? '—' : v.toFixed(2)),
  percent: (v) => (v == null ? '—' : `${v.toFixed(2)}%`),
  price: (v) => (v == null ? '—' : Number(v).toLocaleString('en-US', { minimumFractionDigits: 2 })),
  rMultiple: (v) => {
    if (v == null) return '—';
    return `${v >= 0 ? '+' : ''}${v.toFixed(2)}R`;
  },
  score: (v) => (v == null ? '—' : Math.round(v).toString()),
  date: (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  },
};
