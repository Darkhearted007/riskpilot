export default function TabBar({ active, setActive }) {
  const tabs = [
    { id: 'calc',      icon: '◈', label: 'Calculator' },
    { id: 'journal',   icon: '📝', label: 'Journal' },
    { id: 'dashboard', icon: '▦', label: 'Dashboard' },
  ];
  return (
    <nav style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', background: 'var(--surface)', borderTop: '1px solid var(--border)', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, maxWidth: 520, margin: '0 auto' }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: active === 'calc' ? '0%' : active === 'journal' ? '33.33%' : '66.66%',
        width: '33.33%',
        height: 2,
        background: 'var(--gold)',
        boxShadow: '0 0 8px var(--gold-glow)',
        transition: 'left 0.3s cubic-bezier(0.16,1,0.3,1)'
      }} />
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => setActive(t.id)}
          style={{ padding: '13px 8px 11px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, fontFamily: 'var(--font-body)', color: active === t.id ? 'var(--gold)' : 'var(--text-muted)', transition: 'color 0.2s' }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>{t.icon}</span>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em' }}>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
