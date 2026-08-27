import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../../context/LangContext'
import HidayaLogo from "../../assets/HidayaLogo.png";
import './style.css'

const SECTIONS = ['about', 'academics', 'services', 'announcements', 'contact']

export default function Navbar() {
  const navigate = useNavigate()
  const { lang, t, setLang } = useLang()
  const [scrolled, setScrolled]   = useState(false)
  const [open, setOpen]           = useState(false)
  const [active, setActive]       = useState('')

  const navLinks = [
    { id: 'home',          label: t('Home') || 'Home' },
    { id: 'about',         label: t('about') },
    { id: 'academics',     label: t('academics') },
    { id: 'services',      label: t('services') },
    { id: 'announcements', label: t('announcements') },
    { id: 'contact',       label: t('contact') },
  ]

  // Smooth scroll handler
  const scrollTo = useCallback((id, e) => {
    if (e) e.preventDefault()
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setActive('')
      setOpen(false)
      return
    }
    const el = document.getElementById(id)
    if (el) {
      const offset = 70
      const top = el.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top, behavior: 'smooth' })
    }
    setOpen(false)
  }, [])

  // Scroll + active section tracking
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20)
      // Find which section is in view
      let current = ''
      for (const id of SECTIONS) {
        const el = document.getElementById(id)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 90) current = id
        }
      }
      setActive(current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const LangToggle = ({ mobile }) => (
    <div className={`lang-toggle ${mobile ? 'lang-toggle-mobile' : ''}`}>
      <button className={`lang-btn ${lang === 'en' ? 'lang-active' : ''}`} onClick={() => setLang('en')}>EN</button>
      <button className={`lang-btn ${lang === 'am' ? 'lang-active' : ''}`} onClick={() => setLang('am')}>አማ</button>
    </div>
  )

  return (
    <>
      <nav className={`navbar${scrolled ? ' navbar-scrolled' : ''}`}>
        <div className="navbar-brand" onClick={() => navigate('/')}>
          <img src={HidayaLogo} alt="Hidaya Logo" className="brand-logo-img" />
          <div className="brand-text">
            <span className="brand-arabic">ሂዳያ</span>
            <span className="brand-name">Hidaya Academy</span>
          </div>
        </div>

        <div className="navbar-links">
          {navLinks.map(l => (
            <a
              key={l.id}
              href={`#${l.id}`}
              className={active === l.id ? 'nav-link-active' : ''}
              onClick={e => scrollTo(l.id, e)}
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="navbar-actions">
          <LangToggle />
          <button className="btn-outline" onClick={() => navigate('/parent-portal')}>{t('parentPortal')}</button>
          <button className="btn-primary" onClick={() => navigate('/role-select')}>{t('staffLogin')}</button>
        </div>

        <button
          className={`nav-hamburger${open ? ' nav-ham-open' : ''}`}
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span className="nav-ham-line" />
          <span className="nav-ham-line" />
          <span className="nav-ham-line" />
        </button>
      </nav>

      {open && <div className="nav-overlay" onClick={() => setOpen(false)} />}

      <div className={`nav-drawer${open ? ' nav-drawer-open' : ''}`}>
        <div className="nav-drawer-header">
          <div className="nav-drawer-brand">
            <img src="https://png.pngtree.com/png-vector/20230130/ourmid/pngtree-education-logo-and-school-badge-design-template-png-image_6576036.png" alt="Hidaya Logo" className="nav-drawer-logo-img"
              onError={e => { e.target.src = '/HidayaLogo.png' }}
            />
            <div>
              <div className="nav-drawer-arabic">&#1607;&#1583;&#1575;&#1610;&#1577;</div>
              <div className="nav-drawer-name">Hidaya Islamic Academy</div>
            </div>
          </div>
          <button className="nav-drawer-close" onClick={() => setOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="16" height="16">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <nav className="nav-drawer-links">
          {navLinks.map(l => (
            <a
              key={l.id}
              href={`#${l.id}`}
              className={`nav-drawer-item${active === l.id ? ' nav-drawer-active' : ''}`}
              onClick={e => scrollTo(l.id, e)}
            >
              {l.label}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </a>
          ))}
        </nav>

        <div className="nav-drawer-sep">{t('portalAccess')}</div>

        <div className="nav-drawer-actions">
          <button className="nav-drawer-outline" onClick={() => { setOpen(false); navigate('/parent-portal') }}>
            {t('parentPortal')}
          </button>
          <button className="nav-drawer-primary" onClick={() => { setOpen(false); navigate('/role-select') }}>
            {t('staffLogin')}
          </button>
        </div>

        <LangToggle mobile />
      </div>
    </>
  )
}
