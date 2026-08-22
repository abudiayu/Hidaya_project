import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './style.css'

const mockStudents = {
  'S001': {
    name: 'Ali Hassan', grade: 'Grade 8', rank: 2, total: 32,
    img: 'https://i.pravatar.cc/120?img=12',
    attendance: '94%', status: 'Active',
    subjects: [
      { name: 'Mathematics', score: 87, grade: 'A' },
      { name: 'Science',     score: 91, grade: 'A+' },
      { name: 'English',     score: 78, grade: 'B+' },
      { name: 'Arabic',      score: 85, grade: 'A-' },
      { name: 'History',     score: 82, grade: 'A-' },
    ],
    history: [
      { term: 'Term 1 2025', avg: '79%', rank: 4 },
      { term: 'Term 2 2025', avg: '83%', rank: 3 },
      { term: 'Term 1 2026', avg: '87%', rank: 2 },
    ],
  },
  'S002': {
    name: 'Sara Ahmed', grade: 'Grade 8', rank: 1, total: 32,
    img: 'https://i.pravatar.cc/120?img=45',
    attendance: '98%', status: 'Active',
    subjects: [
      { name: 'Mathematics', score: 95, grade: 'A+' },
      { name: 'Science',     score: 88, grade: 'A' },
      { name: 'English',     score: 92, grade: 'A+' },
      { name: 'Arabic',      score: 90, grade: 'A+' },
      { name: 'History',     score: 85, grade: 'A' },
    ],
    history: [
      { term: 'Term 1 2025', avg: '85%', rank: 2 },
      { term: 'Term 2 2025', avg: '89%', rank: 1 },
      { term: 'Term 1 2026', avg: '90%', rank: 1 },
    ],
  },
}

export default function ParentPortal() {
  const navigate = useNavigate()
  const [studentId, setStudentId] = useState('')
  const [student, setStudent] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSearch = () => {
    if (!studentId.trim()) return
    setLoading(true)
    setTimeout(() => {
      const found = mockStudents[studentId.toUpperCase()]
      setLoading(false)
      if (found) { setStudent(found); setError('') }
      else { setStudent(null); setError(`No student found with ID "${studentId}"`) }
    }, 600)
  }

  const avg = student ? Math.round(student.subjects.reduce((a,s)=>a+s.score,0)/student.subjects.length) : 0

  return (
    <div className="pp-page">
      {/* Header */}
      <header className="pp-header">
        <button className="pp-back" onClick={() => navigate('/')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to Home
        </button>
        <div className="pp-logo">
          <img src="https://png.pngtree.com/png-vector/20230130/ourmid/pngtree-education-logo-and-school-badge-design-template-png-image_6576036.png" alt="Hidaya Logo" className="pp-logo-img" />
          <div>
            <div className="pp-logo-arabic">هداية</div>
            <div className="pp-logo-name">Hidaya Parent Portal</div>
          </div>
        </div>
      </header>

      <div className="pp-body">
        {/* Hero Search Card */}
        <div className="pp-search-hero">
          <div className="pp-search-hero-pattern" />
          <div className="pp-hero-ornament pp-hero-orn-l">❋</div>
          <div className="pp-hero-ornament pp-hero-orn-r">❋</div>
          <div className="pp-search-hero-inner">

            {/* Icon */}
            <div className="pp-search-icon-wrap">
              <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Parent left */}
                <circle cx="20" cy="16" r="8" stroke="#c9a84c" strokeWidth="2.2" strokeLinecap="round"/>
                <path d="M6 44c0-7.7 6.3-14 14-14s14 6.3 14 44" stroke="#c9a84c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                {/* Parent right */}
                <circle cx="44" cy="18" r="6" stroke="#e8c96a" strokeWidth="2" strokeLinecap="round"/>
                <path d="M34 44c0-5.5 4.5-10 10-10s10 4.5 10 10" stroke="#e8c96a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                {/* Child */}
                <circle cx="32" cy="38" r="5" fill="rgba(201,168,76,0.2)" stroke="#c9a84c" strokeWidth="2"/>
                {/* Star accent */}
                <path d="M32 6l1.2 3.6H37l-3 2.2 1.1 3.6L32 13l-3.1 2.4 1.1-3.6-3-2.2h3.8z" fill="#c9a84c" opacity="0.7"/>
              </svg>
            </div>

            <div className="pp-hero-badge">☪ Parent Portal</div>
            <h1>View Your Child's Progress</h1>
            <p>Enter your child's Student ID to access their academic records</p>

            <div className="pp-search-row">
              <div className="pp-search-input-wrap">
                <svg className="pp-search-prefix-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="text"
                  placeholder="Enter Student ID (e.g. S001)"
                  value={studentId}
                  onChange={e => setStudentId(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
                {studentId && (
                  <button className="pp-search-clear" onClick={() => { setStudentId(''); setStudent(null); setError('') }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="12" height="12">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                )}
              </div>
              <button className="pp-search-btn" onClick={handleSearch} disabled={loading}>
                {loading ? (
                  <svg className="pp-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="18" height="18">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    Search
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="pp-error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <div className="pp-demo-hint">
              Try demo IDs:
              <button className="pp-demo-chip" onClick={() => setStudentId('S001')}>S001</button>
              <button className="pp-demo-chip" onClick={() => setStudentId('S002')}>S002</button>
            </div>
          </div>
        </div>

        {/* Student Results */}
        {student && (
          <div className="pp-results page-enter">

            {/* Profile Card */}
            <div className="pp-profile-card">
              <div className="pp-profile-bg-pattern" />
              <div className="pp-profile-top">
                <div className="pp-avatar-wrap">
                  <img src={student.img} alt={student.name} className="pp-avatar" />
                  <span className="pp-status-dot" />
                </div>
                <div className="pp-profile-info">
                  <h2>{student.name}</h2>
                  <div className="pp-profile-meta">
                    <span className="pp-grade-chip">{student.grade}</span>
                    <span className="pp-active-chip">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="10" height="10"><polyline points="20 6 9 17 4 12"/></svg>
                      Active
                    </span>
                  </div>
                </div>
              </div>
              <div className="pp-profile-stats">
                <div className="pp-pstat" style={{'--pc':'#0891b2','--pbg':'rgba(8,145,178,0.08)'}}>
                  <div className="pp-pstat-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
                  </div>
                  <div className="pp-pstat-val">#{student.rank}</div>
                  <div className="pp-pstat-lbl">of {student.total} students</div>
                </div>
                <div className="pp-pstat" style={{'--pc':'#16a34a','--pbg':'rgba(22,163,74,0.08)'}}>
                  <div className="pp-pstat-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </div>
                  <div className="pp-pstat-val">{student.attendance}</div>
                  <div className="pp-pstat-lbl">Attendance</div>
                </div>
                <div className="pp-pstat" style={{'--pc':'#d97706','--pbg':'rgba(217,119,6,0.08)'}}>
                  <div className="pp-pstat-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  </div>
                  <div className="pp-pstat-val">{avg}%</div>
                  <div className="pp-pstat-lbl">Avg Score</div>
                </div>
              </div>
            </div>

            {/* Grades + History */}
            <div className="pp-grid">
              {/* Grades */}
              <div className="pp-card">
                <div className="pp-card-title">
                  <span className="pp-card-title-icon" style={{'--ti':'#0891b2'}}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  </span>
                  Current Grades
                </div>
                <div className="pp-grades">
                  {student.subjects.map(s => (
                    <div key={s.name} className="pp-grade-row">
                      <span className="pp-subj">{s.name}</span>
                      <div className="pp-bar-wrap">
                        <div className="pp-bar" style={{width:`${s.score}%`}} />
                      </div>
                      <span className="pp-score">{s.score}%</span>
                      <span className={`pp-badge pp-badge-${s.grade.replace('+','p').replace('-','m')}`}>{s.grade}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* History */}
              <div className="pp-card">
                <div className="pp-card-title">
                  <span className="pp-card-title-icon" style={{'--ti':'#7c3aed'}}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                  </span>
                  Performance History
                </div>
                <div className="pp-history">
                  {student.history.map((h, i) => (
                    <div key={h.term} className="pp-hist-row">
                      <div className="pp-hist-num">{i + 1}</div>
                      <div className="pp-hist-info">
                        <div className="pp-hist-term">{h.term}</div>
                        <div className="pp-hist-bar-wrap">
                          <div className="pp-hist-bar" style={{width:h.avg}} />
                        </div>
                      </div>
                      <div className="pp-hist-right">
                        <div className="pp-hist-avg">{h.avg}</div>
                        <div className="pp-hist-rank">Rank #{h.rank}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Donut */}
                <div className="pp-donut-wrap">
                  <div className="pp-donut-ring">
                    <svg width="110" height="110" viewBox="0 0 110 110">
                      <circle cx="55" cy="55" r="42" fill="none" stroke="rgba(8,145,178,0.1)" strokeWidth="12"/>
                      <circle cx="55" cy="55" r="42" fill="none" stroke="url(#donutGrad)" strokeWidth="12"
                        strokeDasharray={`${(avg/100)*263.9} 263.9`} strokeLinecap="round"
                        transform="rotate(-90 55 55)"/>
                      <defs>
                        <linearGradient id="donutGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#0891b2"/>
                          <stop offset="100%" stopColor="#06b6d4"/>
                        </linearGradient>
                      </defs>
                      <text x="55" y="50" textAnchor="middle" fontSize="18" fontWeight="800" fill="#0891b2">{avg}%</text>
                      <text x="55" y="66" textAnchor="middle" fontSize="8" fill="#94a3b8" fontWeight="600">AVERAGE</text>
                    </svg>
                  </div>
                  <div className="pp-donut-label">Overall Performance</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="pp-footer">
        <span>☪ Hidaya Islamic Academy — Parent Portal</span>
        <span>© 2026 All rights reserved</span>
      </footer>
    </div>
  )
}
