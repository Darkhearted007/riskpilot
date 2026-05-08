export default function TabBar({ active, setActive }) {
  const tabs = [
    { id: 'calc',      icon: '◈',  label: 'Calculator' },
    { id: 'journal',   icon: '📝', label: 'Journal'    },
    { id: 'dashboard', icon: '▦',  label: 'Dashboard'  },
    { id: 'analytics', icon: '📊', label: 'Analytics'  },
  ];
  const idx = tabs.findIndex(t => t.id === active);
  return (
    <nav className="tab-bar">
      <div className="tab-indicator" style={{
        position: 'absolute',
        top: 0,
        left: `${(idx < 0 ? 0 : idx) * 25}%`,
        width: '25%',
        height: 2,
        background: 'var(--gold)',
        boxShadow: '0 0 12px var(--gold)',
        transition: 'left 0.3s cubic-bezier(0.16,1,0.3,1)'
      }} />
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => setActive(t.id)}
          className={`tab-btn ${active === t.id ? 'active' : ''}`}
        >
          <span>{t.icon}</span>
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
