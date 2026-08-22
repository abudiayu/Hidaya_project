import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../../context/LangContext'
import './style.css'

const roleColors = {
  teacher:   '#0891b2',
  assistant: '#7c3aed',
  manager:   '#16a34a',
  owner:     '#d97706',
}

const roleLabels = {
  en: { teacher: 'Teacher', assistant: 'Assistant', manager: 'Manager', owner: 'Owner' },
  am: { teacher: 'አስተማሪ', assistant: 'ረዳት', manager: 'አስተዳዳሪ', owner: 'ባለቤት' },
}

export default function Sidebar({ role, items, active, onSelect }) {
  const navigate = useNavigate()
  const { lang, t, setLang } = useLang()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const color = roleColors[role] || '#16a34a'

  const handleSelect = (id) => {
    onSelect(id)
    setOpen(false)
    setSearch('')
  }

  const filtered = search
    ? items.filter(i => i.label.toLowerCase().includes(search.toLowerCase()))
    : items

  // Auto-navigate when search narrows to exactly 1 result
  const handleSearch = (val) => {
    setSearch(val)
    if (val) {
      const matches = items.filter(i => i.label.toLowerCase().includes(val.toLowerCase()))
      if (matches.length === 1) {
        onSelect(matches[0].id)
        setSearch('')
      }
    }
  }

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className={`sb-toggle ${open ? 'sb-toggle-open' : ''}`}
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
        style={{ borderColor: color, color }}
      >
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="18" height="18">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="18" height="18">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        )}
      </button>

      {/* Overlay */}
      <div className={`sb-overlay ${open ? 'sb-overlay-visible' : ''}`} onClick={() => setOpen(false)} />

      {/* Sidebar */}
      <aside className={`sb-sidebar ${open ? 'sb-sidebar-open' : ''}`} style={{ '--sc': color }}>

        {/* Desktop header — role name + page name */}
        <div className="sb-header">
          <div className="sb-dot" style={{ background: color }} />
          <div>
            <div className="sb-role" style={{ color }}>{roleLabels[lang]?.[role] || role}</div>
            <div className="sb-sub">{t('dashboard')}</div>
          </div>
          <button className="sb-close" onClick={() => setOpen(false)} aria-label="Close">✕</button>
        </div>
        <div className="sb-page-name">
          {items.find(i => i.id === active)?.label || ''}
        </div>

        {/* Search bar — mobile only */}
        <div className="sb-search-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" className="sb-search-icon">
            <circle cx="11" cy="11" r="8"/> Home<line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="sb-search-input"
            type="text"
            placeholder={t('english') === 'English' ? 'Search...' : 'ፈልግ...'}
            value={search}
            onChange={e => handleSearch(e.target.value)}
          />
        </div>

        {/* Nav items — icon only with tooltip */}
        <nav className="sb-nav">
          {filtered.map((item) => {
            const isActive = active === item.id
            return (
              <button
                key={item.id}
                className={`sb-item ${isActive ? 'sb-active' : ''}`}
                style={isActive ? { '--ac': color } : {}}
                onClick={() => handleSelect(item.id)}
                title={item.label}
                aria-label={item.label}
              >
                <span className="sb-icon">{item.icon}</span>
                <span className="sb-label">{item.label}</span>
                <span className="sb-tooltip">{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Footer: lang + back */}
        <div className="sb-footer">
          <div className="sb-lang-row">
            <button
              className={`sb-lang-dot ${lang === 'en' ? 'sb-lang-dot-active' : ''}`}
              style={lang === 'en' ? { background: color } : {}}
              onClick={() => setLang('en')}
              title="English"
            >EN</button>
            <button
              className={`sb-lang-dot ${lang === 'am' ? 'sb-lang-dot-active' : ''}`}
              style={lang === 'am' ? { background: color } : {}}
              onClick={() => setLang('am')}
              title="አማርኛ"
            >አማ</button>
          </div>
          <button className="sb-back-icon" onClick={() => navigate('/')} title={t('backToHome')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        </div>
      </aside>
    </>
  )
}
