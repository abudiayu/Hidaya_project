import { useNavigate } from 'react-router-dom'
import './style.css'

const staffRoles = [
  {
    id: 'teacher',
    label: 'Teacher',
    desc: 'Attendance, topics & results',
    color: '#c9a84c',
    bg: 'rgba(201,168,76,0.1)',
    border: 'rgba(201,168,76,0.25)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="7" r="4"/>
        <path d="M5.5 21a8.38 8.38 0 0 1 13 0"/>
        <path d="M17 11l3-1.5v5"/>
        <line x1="17" y1="14.5" x2="20" y2="14.5"/>
      </svg>
    ),
  },
  {
    id: 'assistant',
    label: 'Assistant',
    desc: 'Calendar & task monitoring',
    color: '#4caf8c',
    bg: 'rgba(76,175,140,0.1)',
    border: 'rgba(76,175,140,0.25)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
        <line x1="8" y1="14" x2="10" y2="14"/>
        <line x1="14" y1="14" x2="16" y2="14"/>
      </svg>
    ),
  },
  {
    id: 'manager',
    label: 'Manager',
    desc: 'Manage students & staff',
    color: '#5b8dd9',
    bg: 'rgba(91,141,217,0.1)',
    border: 'rgba(91,141,217,0.25)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    id: 'owner',
    label: 'Owner',
    desc: 'Full system analytics',
    color: '#9b6dff',
    bg: 'rgba(155,109,255,0.1)',
    border: 'rgba(155,109,255,0.25)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="6"/>
        <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
      </svg>
    ),
  },
]

export default function RoleSelectPage() {
  const navigate = useNavigate()

  return (
    <div className="rs-page">
      <div className="rs-bg" />
      <div className="rs-ornament rs-orn-tl">❋</div>
      <div className="rs-ornament rs-orn-br">❋</div>

      <div className="rs-scroll-wrap">
        <button className="rs-back" onClick={() => navigate('/')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back
        </button>

        <div className="rs-card">
          {/* Header */}
          <div className="rs-header">
            <div className="rs-emblem-wrap">
              <img src="https://png.pngtree.com/png-vector/20230130/ourmid/pngtree-education-logo-and-school-badge-design-template-png-image_6576036.png" alt="Hidaya Logo" className="rs-logo-img" />
            </div>
            <div className="rs-arabic">هداية</div>
            <h1 className="rs-title">Hidaya Islamic Academy</h1>
            <p className="rs-sub">Select your role to continue</p>
          </div>

          {/* Staff section */}
          <div className="rs-section">
            <div className="rs-section-label">
              <span className="rs-label-dot" />
              Staff Login
            </div>
            <div className="rs-staff-grid">
              {staffRoles.map((role) => (
                <button
                  key={role.id}
                  className="rs-role-tile"
                  style={{ '--tc': role.color, '--tbg': role.bg, '--tb': role.border }}
                  onClick={() => navigate(`/login/${role.id}`)}
                >
                  <div className="rs-tile-icon-wrap">
                    {role.icon}
                  </div>
                  <div className="rs-tile-body">
                    <div className="rs-tile-label">{role.label}</div>
                    <div className="rs-tile-desc">{role.desc}</div>
                  </div>
                  <svg className="rs-tile-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="rs-divider">
            <span /><span className="rs-div-text">or</span><span />
          </div>

          {/* Parent section */}
          <div className="rs-section">
            <div className="rs-section-label">
              <span className="rs-label-dot rs-dot-parent" />
              Parent Login
            </div>
            <button className="rs-parent-btn" onClick={() => navigate('/parent-portal')}>
              <div className="rs-parent-left">
                <div className="rs-parent-icon-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <div>
                  <div className="rs-parent-label">Parent / Guardian</div>
                  <div className="rs-parent-desc">View your child's grades & performance</div>
                </div>
              </div>
              <svg className="rs-parent-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>

          {/* Footer */}
          <div className="rs-footer-note">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" style={{color:'#c9a84c'}}>
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span>Secure role-based access</span>
          </div>
        </div>
      </div>
    </div>
  )
}
