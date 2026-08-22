import { useNavigate } from 'react-router-dom'
import './style.css'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="nf-page">
      {/* Background pattern */}
      <div className="nf-bg" />

      <div className="nf-content">
        {/* Islamic ornament */}
        <div className="nf-ornament">☪</div>

        {/* 404 number */}
        <div className="nf-code">404</div>

        {/* Arabic text */}
        <div className="nf-arabic">الصفحة غير موجودة</div>

        {/* English message */}
        <h1 className="nf-title">Page Not Found</h1>
        <p className="nf-sub">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Actions */}
        <div className="nf-actions">
          <button className="nf-btn nf-btn-primary" onClick={() => navigate(-1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Go Back
          </button>
          <button className="nf-btn nf-btn-secondary" onClick={() => navigate('/')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Go Home
          </button>
        </div>

        {/* Quick links */}
        <div className="nf-links">
          <span className="nf-links-label">Quick links:</span>
          <button onClick={() => navigate('/role-select')} className="nf-link">Login</button>
          <span className="nf-dot">·</span>
          <button onClick={() => navigate('/dashboard/teacher')} className="nf-link">Teacher</button>
          <span className="nf-dot">·</span>
          <button onClick={() => navigate('/dashboard/manager')} className="nf-link">Manager</button>
          <span className="nf-dot">·</span>
          <button onClick={() => navigate('/dashboard/owner')} className="nf-link">Owner</button>
        </div>
      </div>
    </div>
  )
}
