export const SESSIONS = { ASIA: 'Asia', LONDON: 'London', NEW_YORK: 'New York' };

export const SESSION_META = {
  Asia:      { icon:'🌏', hours:'00:00–08:00', description:'Tokyo / Sydney',    volatility:'Low',       goldNote:'Gold typically ranges during Asia. Tighter spreads, lower volume.',          color:'#40C4FF' },
  London:    { icon:'🇬🇧', hours:'08:00–16:00', description:'London / Frankfurt', volatility:'High',      goldNote:'Gold most active. Major moves happen here. Use wider stops.',                color:'#FFB300' },
  'New York':{ icon:'🗽', hours:'16:00–00:00', description:'New York / Chicago', volatility:'Very High', goldNote:'US data releases drive Gold hard. Expect sharp spikes.',                     color:'#FF6D00' },
};

export function detectSession(date) {
  const hour = (date || new Date()).getHours();
  if (hour >= 0  && hour < 8)  return SESSIONS.ASIA;
  if (hour >= 8  && hour < 16) return SESSIONS.LONDON;
  return SESSIONS.NEW_YORK;
}

export function getSessionInfo(date) {
  const session = detectSession(date);
  return { session, ...SESSION_META[session] };
}

export function getAllSessions(date) {
  const current = detectSession(date);
  return Object.keys(SESSION_META).map(session => ({ session, active: session === current, meta: SESSION_META[session] }));
}
