import './style.css'

export default function StatCard({ icon, label, value, trend, color = '#1a73e8' }) {
  return (
    <div className="stat-card" style={{ '--stat-color': color }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
      {trend && <div className="stat-trend">↑ {trend}</div>}
    </div>
  )
}
