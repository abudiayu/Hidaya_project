import './style.css'

export default function DashboardCard({ icon, title, description, badge, locked, color = '#1a73e8' }) {
  return (
    <div className="dash-card" style={{ '--card-color': color }}>
      <div className="dash-card-icon">{icon}</div>
      <div className="dash-card-body">
        <div className="dash-card-title">{title}</div>
        {description && <div className="dash-card-desc">{description}</div>}
      </div>
      <div className="dash-card-footer">
        {badge && <span className="dash-card-badge">{badge}</span>}
        {locked && <span className="dash-card-locked">🔒 Read-Only</span>}
      </div>
    </div>
  )
}
