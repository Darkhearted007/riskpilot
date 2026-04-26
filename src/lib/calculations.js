export function calculateRRR(entry, sl, tp, direction) {
  const e = parseFloat(entry);
  const s = parseFloat(sl);
  const t = parseFloat(tp);
  if (isNaN(e) || isNaN(s) || isNaN(t)) return null;
  let rrr;
  if (direction === 'BUY') {
    const reward = t - e, risk = e - s;
    if (risk <= 0) return null;
    rrr = reward / risk;
  } else if (direction === 'SELL') {
    const reward = e - t, risk = s - e;
    if (risk <= 0) return null;
    rrr = reward / risk;
  } else return null;
  return Math.round(rrr * 100) / 100;
}

export function calculateBreakEven(rrr) {
  if (!rrr || rrr <= 0) return null;
  return Math.round((1 / (1 + rrr)) * 10000) / 100;
}

export function pipDistance(a, b) {
  return Math.abs(parseFloat(a) - parseFloat(b));
}

export function dollarRisk(accountSize, riskPercent) {
  return (parseFloat(accountSize) * parseFloat(riskPercent)) / 100;
}
