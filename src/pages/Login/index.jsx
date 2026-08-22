import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthStore'
import { useLang } from '../../context/LangContext'
import './style.css'

const roleConfig = {
  teacher: {
    label: 'Teacher',
    color: '#c9a84c',
    redirect: '/dashboard/teacher',
    desc: 'Access attendance, topics & results',
    hint: 't01 / pass01  ·  t02 / pass02  ·  t03 / pass03  ·  t04 / pass04',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="7" r="4"/>
        <path d="M5.5 21a8.38 8.38 0 0 1 13 0"/>
        <path d="M17 11l3-1.5v5"/><line x1="17" y1="14.5" x2="20" y2="14.5"/>
      </svg>
    ),
  },
  assistant: {
    label: 'Assistant',
    color: '#4caf8c',
    redirect: '/dashboard/assistant',
    desc: 'Manage calendar & monitor tasks',
    hint: 'a01 / pass01  ·  a02 / pass02',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
        <line x1="8" y1="14" x2="10" y2="14"/><line x1="14" y1="14" x2="16" y2="14"/>
      </svg>
    ),
  },
  manager: {
    label: 'Manager',
    color: '#5b8dd9',
    redirect: '/dashboard/manager',
    desc: 'Manage students, staff & data',
    hint: 'mgr01 / manager123',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  owner: {
    label: 'Owner',
    color: '#9b6dff',
    redirect: '/dashboard/owner',
    desc: 'Full system analytics & control',
    hint: 'owner01 / owner123',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="6"/>
        <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
      </svg>
    ),
  },
}

export default function LoginPage() {
  const { role } = useParams()
  const navigate  = useNavigate()
  const { t }     = useLang()
  const { login } = useAuth()

  const config = roleConfig[role] || roleConfig.teacher

  const [form,     setForm]     = useState({ id: '', password: '' })
  const [loading,  setLoading]  = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [error,    setError]    = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.id.trim() || !form.password) {
      setError('Please enter your ID and password.')
      return
    }

    setLoading(true)
    const result = await login(form.id.trim(), form.password, role)
    setLoading(false)

    if (result.success) {
      navigate(config.redirect)
    } else {
      setError(result.message || 'Invalid credentials. Please try again.')
    }
  }

  const isServerError = error.includes('Cannot reach') || error.includes('server')

  return (
    <div className="login-page page-enter">
      <div className="login-bg-pattern" />
      <div className="login-ornament login-ornament-tl">❋</div>
      <div className="login-ornament login-ornament-br">❋</div>

      <button className="login-back-btn" onClick={() => navigate('/role-select')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Back
      </button>

      <div className="login-container">
        {/* ── Left panel ── */}
        <div className="login-left">
          <div className="login-left-pattern" />
          <div className="login-left-content">
            <div className="login-emblem-wrap">
              <span className="login-emblem">☪</span>
            </div>
            <div className="login-arabic">هداية</div>
            <div className="login-academy-name">Hidaya Islamic Academy</div>
            <div className="login-role-badge" style={{ '--rc': config.color }}>
              <span className="login-role-icon-svg" style={{ color: config.color }}>
                {config.icon}
              </span>
              <span>{config.label} Portal</span>
            </div>
            <p className="login-role-desc">{config.desc}</p>
            <div className="login-hadith">
              "Knowledge is the life of the mind"
            </div>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="login-right">
          <div className="login-form-header">
            <div className="login-form-icon" style={{ '--rc': config.color }}>
              <span style={{ color: config.color }}>{config.icon}</span>
            </div>
            <h2 style={{ color: config.color }}>{config.label} Login</h2>
            <p>{t('enterCredentials')}</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {/* ID field */}
            <div className="login-form-group">
              <label>{t('staffId')}</label>
              <div className="login-input-wrap">
                <span className="login-input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder={`Enter your ${config.label.toLowerCase()} ID`}
                  value={form.id}
                  onChange={(e) => setForm({ ...form, id: e.target.value })}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div className="login-form-group">
              <label>Password</label>
              <div className="login-input-wrap">
                <span className="login-input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete="current-password"
                  required
                />
                <button type="button" className="login-toggle-pass" onClick={() => setShowPass(!showPass)}>
                  {showPass ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="login-submit-btn"
              style={{ background: `linear-gradient(135deg, ${config.color}, ${config.color}cc)` }}
              disabled={loading}
            >
              {loading ? (
                <span className="login-spinner-wrap">
                  <svg className="login-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="16" height="16">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                  {t('signingIn')}
                </span>
              ) : (
                <span className="login-submit-inner">
                  {t('signInAs')} {config.label}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </span>
              )}
            </button>
          </form>

          {/* Credential hint — dev only, never shown in production */}
          {import.meta.env.DEV && (
            <div className="login-demo-note">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" style={{ color: config.color }}>
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span><strong>{config.hint}</strong></span>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className={`login-error ${isServerError ? 'login-error-server' : ''}`}>
              {isServerError && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              )}
              {error}
              {isServerError && (
                <div style={{ marginTop: 4, fontSize: 11, opacity: 0.8 }}>
                  Run <code>npm run dev</code> inside <code>Hidaya-backend/</code>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
