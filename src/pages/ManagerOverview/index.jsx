import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './style.css'

const navItems = [
  { icon: '🏠', label: 'Overview' },
  { icon: '👨‍🎓', label: 'Students' },
  { icon: '👨‍🏫', label: 'Teachers' },
  { icon: '👨‍💼', label: 'Assistants' },
  { icon: '📌', label: 'Assign Tasks' },
  { icon: '📊', label: 'Reports' },
]
const monthlyPerf     = [72, 75, 78, 80, 83, 87]
const months          = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

function LineGraph({ data, color, height = 80 }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const w = 260, h = height
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / (max - min || 1)) * (h - 16) - 4
    return `${x},${y}`
  })
  const area = `0,${h} ${pts.join(' ')} ${w},${h}`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mo-graph-svg" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#grad-${color.replace('#','')})`} />
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => {
        const [x, y] = pts[i].split(',')
        return <circle key={i} cx={x} cy={y} r="4" fill={color} stroke="#fff" strokeWidth="2" />
      })}
    </svg>
  )
}

function DonutChart({ value, color }) {
  const r = 36, cx = 44, cy = 44
  const circ = 2 * Math.PI * r
  const dash = (value / 100) * circ
  return (
    <svg width="88" height="88" viewBox="0 0 88 88">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`} />
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize="13" fontWeight="800" fill={color}>{value}%</text>
    </svg>
  )
}

function BarGraph({ data, labels, color }) {
  const max = Math.max(...data)
  const w = 260, h = 80
  const bw = 28, gap = (w - data.length * bw) / (data.length + 1)
  return (
    <svg viewBox={`0 0 ${w} ${h + 20}`} className="mo-graph-svg">
      {data.map((v, i) => {
        const bh = ((v / max) * (h - 10))
        const x = gap + i * (bw + gap)
        const y = h - bh
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={bh} rx="5"
              fill={color} opacity={0.7 + (i / data.length) * 0.3} />
            <text x={x + bw / 2} y={h + 14} textAnchor="middle" fontSize="9" fill="#94a3b8">{labels[i]}</text>
          </g>
        )
      })}
    </svg>
  )
}

const features = [
  { icon: '👨‍🎓', title: 'Manage Students',      desc: 'Add, edit, view student records',       color: '#0891b2', bg: '#e0f2fe' },
  { icon: '👨‍🏫', title: 'Manage Teachers',      desc: 'Teacher profiles and assignments',       color: '#7c3aed', bg: '#ede9fe' },
  { icon: '👨‍💼', title: 'Manage Assistants',    desc: 'Assistant roles and monitoring',         color: '#0d9488', bg: '#ccfbf1' },
  { icon: '📌',   title: 'Assign Tasks',         desc: 'Delegate tasks to staff members',        color: '#d97706', bg: '#fef3c7' },
  { icon: '✅',   title: 'Approve Academic Data',desc: 'Review and approve submitted data',      color: '#16a34a', bg: '#dcfce7' },
  { icon: '📊',   title: 'View All Reports',     desc: 'Student & teacher performance',          color: '#64748b', bg: '#f1f5f9', locked: true },
]

export default function ManagerOverview() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeNav, setActiveNav] = useState('Overview')
  const navigate = useNavigate()
  return (
    <div className="mo-page">

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="mo-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar Drawer */}
      <aside className={`mo-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="mo-sidebar-header">
          <div className="mo-sidebar-brand">
            <span className="mo-sidebar-emblem">🏢</span>
            <div>
              <div className="mo-sidebar-role">Manager</div>
              <div className="mo-sidebar-name">Hidaya Academy</div>
            </div>
          </div>
          <button className="mo-sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>
        <nav className="mo-sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.label}
              className={`mo-sidebar-item ${activeNav === item.label ? 'active' : ''}`}
              onClick={() => { setActiveNav(item.label); setSidebarOpen(false) }}
            >
              <span className="mo-sidebar-item-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <button className="mo-sidebar-back" onClick={() => navigate('/')}>← Back to Home</button>
      </aside>

      <div className="mo-wrap">

        {/* Header */}
        <div className="mo-header">
          <div className="mo-header-left">
            <button className="mo-hamburger" onClick={() => setSidebarOpen(true)}>
              <span /><span /><span />
            </button>
            <div className="mo-header-icon">🏢</div>
            <div>
              <h1>Manager Dashboard</h1>
              <p>Manage students, staff and academic data</p>
            </div>
          </div>
          <div className="mo-header-date">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Stat Cards */}
        <div className="mo-stats-grid">
          <div className="mo-stat" style={{ '--c': '#0891b2', '--bg': '#e0f2fe' }}>
            <div className="mo-stat-top">
              <div className="mo-stat-icon-box">👨‍🎓</div>
              <div className="mo-stat-trend">↑ +12 this term</div>
            </div>
            <div className="mo-stat-value">248</div>
            <div className="mo-stat-label">Total Students</div>
            <LineGraph data={[200,215,220,230,240,248]} color="#0891b2" />
            <div className="mo-stat-months">
              {months.map(m => <span key={m}>{m}</span>)}
            </div>
          </div>

          <div className="mo-stat" style={{ '--c': '#7c3aed', '--bg': '#ede9fe' }}>
            <div className="mo-stat-top">
              <div className="mo-stat-icon-box">👨‍🏫</div>
            </div>
            <div className="mo-stat-value">18</div>
            <div className="mo-stat-label">Teachers</div>
            <BarGraph data={[3,4,3,2,4,2]} labels={months} color="#7c3aed" />
          </div>

          <div className="mo-stat" style={{ '--c': '#0d9488', '--bg': '#ccfbf1' }}>
            <div className="mo-stat-top">
              <div className="mo-stat-icon-box">👨‍💼</div>
            </div>
            <div className="mo-stat-value">6</div>
            <div className="mo-stat-label">Assistants</div>
            <BarGraph data={[1,2,1,1,2,1]} labels={months} color="#0d9488" />
          </div>

          <div className="mo-stat" style={{ '--c': '#d97706', '--bg': '#fef3c7' }}>
            <div className="mo-stat-top">
              <div className="mo-stat-icon-box">📈</div>
              <div className="mo-stat-trend">↑ +2%</div>
            </div>
            <div className="mo-stat-value">83%</div>
            <div className="mo-stat-label">Avg Performance</div>
            <LineGraph data={monthlyPerf} color="#d97706" />
            <div className="mo-stat-months">
              {months.map(m => <span key={m}>{m}</span>)}
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="mo-charts-row">
          <div className="mo-chart-card">
            <div className="mo-chart-header">
              <div>
                <div className="mo-chart-title">Student Enrollment Trend</div>
                <div className="mo-chart-sub">Jan – Jun 2026</div>
              </div>
              <span className="mo-chart-badge">+18 students</span>
            </div>
            <LineGraph data={monthlyStudents} color="#0891b2" height={100} />
            <div className="mo-chart-labels">
              {months.map(m => <span key={m}>{m}</span>)}
            </div>
          </div>

          <div className="mo-chart-card">
            <div className="mo-chart-header">
              <div>
                <div className="mo-chart-title">Performance Overview</div>
                <div className="mo-chart-sub">Attendance · Tasks · Grades</div>
              </div>
            </div>
            <div className="mo-donuts-row">
              <div className="mo-donut-item">
                <DonutChart value={94} color="#0891b2" />
                <div className="mo-donut-label">Attendance</div>
              </div>
              <div className="mo-donut-item">
                <DonutChart value={87} color="#7c3aed" />
                <div className="mo-donut-label">Tasks Done</div>
              </div>
              <div className="mo-donut-item">
                <DonutChart value={83} color="#d97706" />
                <div className="mo-donut-label">Avg Grade</div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mo-section-label">Quick Actions</div>
        <div className="mo-features-grid">
          {features.map(f => (
            <div key={f.title} className="mo-feature-card" style={{ '--fc': f.color, '--fbg': f.bg }}>
              <div className="mo-feature-icon-wrap">
                <span>{f.icon}</span>
              </div>
              <div className="mo-feature-body">
                <div className="mo-feature-title">{f.title}</div>
                <div className="mo-feature-desc">{f.desc}</div>
              </div>
              {f.locked
                ? <span className="mo-locked-badge">🔒</span>
                : <span className="mo-feature-arrow">→</span>
              }
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mo-footer">
          <span>🔒 Submitted data is READ-ONLY — no edits after submission</span>
        </div>

      </div>
    </div>
  )
}
