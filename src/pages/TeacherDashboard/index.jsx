import { useState, useEffect, useCallback } from 'react'
import Sidebar from '../../components/Sidebar'
import DashboardCard from '../../components/DashboardCard'
import { useFileStore } from '../../context/FileStore'
import { useTeacherStore } from '../../context/TeacherStore'
import { useAuth } from '../../context/AuthStore'
import { useLang } from '../../context/LangContext'
import { studentsAPI, resultsAPI } from '../../api/index.js'
import './style.css'

export default function TeacherDashboard() {
  const [active, setActive] = useState('overview')
  const [mobileOpen, setMobileOpen] = useState(false)
  const { t } = useLang()

  const sidebarItems = [
    { id: 'overview',   icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>, label: t('overview') },
    { id: 'calendar',   icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="14" x2="8.01" y2="14"/><line x1="12" y1="14" x2="12.01" y2="14"/><line x1="16" y1="14" x2="16.01" y2="14"/></svg>, label: t('myCalendar') },
    { id: 'attendance', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>, label: t('attendance') },
    { id: 'topics',     icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>, label: t('dailyTopics') },
    { id: 'results',    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>, label: t('results') },
    { id: 'view',       icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>, label: t('viewSubmitted') },
    { id: 'files',      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>, label: t('receivedFiles') },
  ]
  const { files, updateStatus } = useFileStore()
  const myFiles = files.filter(f => f.target?.id?.startsWith('T'))
  const { addTopic, submitResults, confirmAttendance, isAttendanceConfirmed, topics, studentResults,
          sem1Data, setSem1Data, sem2Data, setSem2Data, sem1Submitted, setSem1Submitted, sem2Submitted, setSem2Submitted } = useTeacherStore()
  const { currentUser } = useAuth()

  // Use logged-in teacher data, fallback to Mr. Ali for demo
  const teacher = currentUser?.role === 'teacher' ? currentUser : { id: 'T001', name: 'Mr. Ali', subject: 'Mathematics', img: 'https://i.pravatar.cc/80?img=13' }
  const TEACHER_SUBJECT = teacher.subject || teacher.profile?.subject || 'Mathematics'
  const teacherDbId = teacher.profile?.id || null  // numeric DB id from teachers table

  const [attendance, setAttendance] = useState({})
  const [attendanceLocked, setAttendanceLocked] = useState(false)
  const [topic, setTopic] = useState({ title: '', desc: '' })
  const [topicLocked, setTopicLocked] = useState(false)

  // ── Live students + subjects from DB ──────────────────────────────────────
  const [dbStudents,  setDbStudents]  = useState([])  // [{ id, full_name, student_code, grade }]
  const [dbSubjects,  setDbSubjects]  = useState([])  // [{ id, name }]
  const [resultsLoading, setResultsLoading] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [savedMsg, setSavedMsg] = useState('')

  // Pick the subject matching the teacher's subject name
  const teacherSubjectObj = dbSubjects.find(s => s.name.toLowerCase() === TEACHER_SUBJECT.toLowerCase()) || dbSubjects[0] || null

  // Load students and subjects once
  useEffect(() => {
    studentsAPI.getAll().then(d => setDbStudents((d||[]).filter(s => s.status === 'Active'))).catch(() => {})
    resultsAPI.getSubjects().then(setDbSubjects).catch(() => {})
  }, [])

  // ── Marks state: keyed by student DB id ───────────────────────────────────
  // shape: { [studentId]: { assignment:'', class_work:'', mid_exam:'', final_exam:'' } }
  const emptyRow = () => ({ assignment:'', class_work:'', mid_exam:'', final_exam:'' })
  const [sem1Marks, setSem1Marks] = useState({})  // { [studentId]: row }
  const [sem2Marks, setSem2Marks] = useState({})
  const [sem1Locked, setSem1Locked] = useState(false)
  const [sem2Locked, setSem2Locked] = useState(false)
  const [submitSaving, setSubmitSaving] = useState(false)
  // Keep caSubmitted for the overview "submitted work" section
  const caSubmitted = sem1Locked || sem2Locked

  // Load existing results from DB when students/subject are ready
  useEffect(() => {
    if (!dbStudents.length || !teacherSubjectObj) return
    const loadResults = async () => {
      setResultsLoading(true)
      try {
        const all = await resultsAPI.getAll()
        const s1 = {}, s2 = {}
        let s1has = false, s2has = false
        for (const r of all) {
          if (String(r.subject_id) !== String(teacherSubjectObj.id)) continue
          const row = { assignment: r.assignment ?? '', class_work: r.class_work ?? '', mid_exam: r.mid_exam ?? '', final_exam: r.final_exam ?? '' }
          if (r.semester === 'sem1') { s1[r.student_id] = row; s1has = true }
          if (r.semester === 'sem2') { s2[r.student_id] = row; s2has = true }
        }
        setSem1Marks(s1); setSem2Marks(s2)
        if (s1has) setSem1Locked(true)
        if (s2has) setSem2Locked(true)
      } catch {}
      setResultsLoading(false)
    }
    loadResults()
  }, [dbStudents, teacherSubjectObj?.id])

  // ── Totals / grade helpers ─────────────────────────────────────────────────
  const semTotal = (row) => {
    if (!row) return null
    const vals = [row.assignment, row.class_work, row.mid_exam, row.final_exam]
    const filled = vals.filter(v => v !== '' && v !== null && !isNaN(Number(v)))
    if (!filled.length) return null
    return filled.reduce((a, b) => a + Number(b), 0)
  }

  const gradeLabel = (avg) => {
    if (avg === null || avg === undefined) return '—'
    if (avg >= 90) return 'A+'; if (avg >= 85) return 'A'
    if (avg >= 80) return 'A-'; if (avg >= 75) return 'B+'
    if (avg >= 70) return 'B';  if (avg >= 65) return 'B-'
    if (avg >= 60) return 'C';  return 'F'
  }

  const gradeColor = (avg) => {
    if (avg === null || avg === undefined) return '#94a3b8'
    if (avg >= 80) return '#16a34a'
    if (avg >= 65) return '#0891b2'
    if (avg >= 50) return '#d97706'
    return '#dc2626'
  }

  const finalAvg = (s) => {
    const t1 = semTotal(sem1Marks[s.id])
    const t2 = semTotal(sem2Marks[s.id])
    if (t1 === null || t2 === null) return null
    return Math.round((t1 + t2) / 2)
  }

  // Mark columns config
  const MARK_COLS = [
    { key:'assignment',  label:'Assignment', max:10 },
    { key:'class_work',  label:'Class Work', max:10 },
    { key:'mid_exam',    label:'Mid Exam',   max:30 },
    { key:'final_exam',  label:'Final Exam', max:50 },
  ]

  // Semester system
  const [activeSem, setActiveSem] = useState('sem1')

  // Backward-compat name list for attendance/view sections (uses DB names when loaded, fallback to demo)
  const students = dbStudents.length > 0
    ? dbStudents.map(s => s.full_name)
    : ['Ali Hassan', 'Sara Ahmed', 'Omar Khalid', 'Fatima Noor', 'Yusuf Ibrahim']

  const renderContent = () => {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const todayConfirmed = isAttendanceConfirmed(teacher.id, todayStr)
    const todayPeriods = ['8:00','9:00','10:00','11:00','12:00']
    const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const dow = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1))
    const weekDays = Array.from({ length: 5 }, (_, i) => {
      const d = new Date(monday); d.setDate(monday.getDate() + i); return d
    })

    switch (active) {
      case 'overview': {
        const todayTopics = topics.filter(t => t.teacherId === teacher.id && t.date === todayStr)
        const recentResults = studentResults.find(r => r.subject === TEACHER_SUBJECT)
        const newFiles = myFiles.filter(f => f.status === 'pending')

        // Alerts
        const alerts = []
        if (!todayConfirmed) alerts.push({ type: 'warn', msg: t('confirmAttendance') })
        if (newFiles.length) alerts.push({ type: 'info', msg: `${newFiles.length} ${newFiles.length > 1 ? t('newFilesPlural') : t('newFiles')}` })
        if (!topicLocked) alerts.push({ type: 'warn', msg: t('dailyTopics') })

        return (
          <div className="dash-content page-enter">

            {/* Header */}
            <div className="ov2-header">
              <div className="ov2-header-left">
                <img src={teacher.img} alt={teacher.name} className="ov2-avatar" />
                <div>
                  <h2 className="ov2-name">Welcome, {teacher.name}</h2>
                  <p className="ov2-meta">{teacher.subject} &middot; {teacher.id} &middot; {today.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</p>
                </div>
              </div>
              <div className="ov2-quick-actions">
                <button className="ov2-qa-btn ov2-qa-primary" onClick={() => setActive('calendar')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  Calendar
                </button>
                <button className="ov2-qa-btn" onClick={() => setActive('topics')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                  Add Topic
                </button>
                <button className="ov2-qa-btn" onClick={() => setActive('files')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                  Files {newFiles.length > 0 && <span className="ov2-badge">{newFiles.length}</span>}
                </button>
              </div>
            </div>

            {/* Alerts */}
            {alerts.length > 0 && (
              <div className="ov2-alerts">
                {alerts.map((a, i) => (
                  <div key={i} className={`ov2-alert ov2-alert-${a.type}`}>
                    {a.type === 'warn'
                      ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                      : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    }
                    {a.msg}
                  </div>
                ))}
              </div>
            )}

            <div className="ov2-grid">

              {/* ── Today Snapshot ── */}
              <div className="ov2-card ov2-today-card">
                <div className="ov2-card-head">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span>Today's Classes</span>
                  <span className="ov2-card-badge">{todayPeriods.length} periods</span>
                </div>
                <div className="ov2-today-periods">
                  {todayPeriods.map(t => (
                    <div key={t} className="ov2-period-row">
                      <span className="ov2-period-time">{t}</span>
                      <span className="ov2-period-subj">{TEACHER_SUBJECT}</span>
                    </div>
                  ))}
                </div>
                <div className="ov2-att-status">
                  {todayConfirmed ? (
                    <div className="ov2-confirmed">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><polyline points="20 6 9 17 4 12"/></svg>
                      Attendance Confirmed
                    </div>
                  ) : (
                    <button className="ov2-confirm-btn" onClick={() => confirmAttendance({ teacherId: teacher.id, teacherName: teacher.name, subject: TEACHER_SUBJECT, date: todayStr })}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
                      Confirm Attendance
                    </button>
                  )}
                </div>
              </div>

              {/* ── Mini Calendar ── */}
              <div className="ov2-card ov2-cal-card">
                <div className="ov2-card-head">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <span>This Week</span>
                </div>
                <div className="ov2-mini-week">
                  {weekDays.map((d, i) => {
                    const dStr = d.toISOString().split('T')[0]
                    const isToday = dStr === todayStr
                    const conf = isAttendanceConfirmed(teacher.id, dStr)
                    return (
                      <div key={dStr} className={`ov2-mini-day ${isToday ? 'ov2-mini-today' : ''} ${conf ? 'ov2-mini-confirmed' : ''}`}>
                        <span className="ov2-mini-name">{['Mon','Tue','Wed','Thu','Fri'][i]}</span>
                        <span className="ov2-mini-num">{d.getDate()}</span>
                        <span className="ov2-mini-count">5</span>
                        {conf && (
                          <svg className="ov2-mini-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="10" height="10"><polyline points="20 6 9 17 4 12"/></svg>
                        )}
                      </div>
                    )
                  })}
                </div>
                <button className="ov2-link-btn" onClick={() => setActive('calendar')}>
                  Open Full Calendar
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>

              {/* ── Daily Topics ── */}
              <div className="ov2-card">
                <div className="ov2-card-head">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                  <span>Today's Topic</span>
                  {topicLocked && <span className="ov2-card-badge ov2-badge-green">Submitted</span>}
                </div>
                {todayTopics.length > 0 ? (
                  <div className="ov2-topic-preview">
                    <div className="ov2-topic-title">{todayTopics[0].title}</div>
                    <div className="ov2-topic-desc">{todayTopics[0].desc?.slice(0, 80)}{todayTopics[0].desc?.length > 80 ? '...' : ''}</div>
                    <div className="ov2-topic-time">{todayTopics[0].submittedAt}</div>
                  </div>
                ) : topicLocked ? (
                  <div className="ov2-topic-preview">
                    <div className="ov2-topic-title">{topic.title}</div>
                    <div className="ov2-topic-desc">{topic.desc?.slice(0, 80)}</div>
                  </div>
                ) : (
                  <p className="ov2-empty">No topic submitted yet today.</p>
                )}
                <button className="ov2-link-btn" onClick={() => setActive('topics')}>
                  {topicLocked ? 'View Topic' : 'Add Topic'}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>

              {/* ── Attendance Summary ── */}
              <div className="ov2-card">
                <div className="ov2-card-head">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
                  <span>Attendance (This Week)</span>
                </div>
                <div className="ov2-att-week">
                  {weekDays.map((d, i) => {
                    const dStr = d.toISOString().split('T')[0]
                    const conf = isAttendanceConfirmed(teacher.id, dStr)
                    const isPast = d <= today
                    return (
                      <div key={dStr} className="ov2-att-day-row">
                        <span className="ov2-att-day-name">{['Mon','Tue','Wed','Thu','Fri'][i]}, {monthNames[d.getMonth()]} {d.getDate()}</span>
                        <span className={`ov2-att-pill ${conf ? 'ov2-att-confirmed' : isPast ? 'ov2-att-missed' : 'ov2-att-upcoming'}`}>
                          {conf
                            ? <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="10" height="10"><polyline points="20 6 9 17 4 12"/></svg> Confirmed</>
                            : isPast ? 'Not confirmed' : 'Upcoming'
                          }
                        </span>
                      </div>
                    )
                  })}
                </div>
                <button className="ov2-link-btn" onClick={() => setActive('attendance')}>
                  Mark Attendance
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>

              {/* ── Results Overview ── */}
              <div className="ov2-card">
                <div className="ov2-card-head">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                  <span>Results</span>
                  {caSubmitted && <span className="ov2-card-badge ov2-badge-green">Submitted</span>}
                </div>
                {recentResults ? (
                  <div className="ov2-results-preview">
                    <div className="ov2-results-subject">{recentResults.subject}</div>
                    <div className="ov2-results-meta">{recentResults.students?.length} students &middot; Submitted {recentResults.submittedAt}</div>
                    <div className="ov2-results-scores">
                      {recentResults.students?.slice(0,3).map(s => (
                        <div key={s.name} className="ov2-score-row">
                          <span>{s.name}</span>
                          <span className="ov2-score-val">{s.ca}/50</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="ov2-empty">No results submitted yet.</p>
                )}
                <button className="ov2-link-btn" onClick={() => setActive('results')}>
                  Manage Results
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>

              {/* ── Submitted Work ── */}
              <div className="ov2-card">
                <div className="ov2-card-head">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  <span>Submitted Work</span>
                </div>
                <div className="ov2-submitted-list">
                  {attendanceLocked && (
                    <div className="ov2-sub-row">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
                      <span>Attendance marked for today</span>
                    </div>
                  )}
                  {topicLocked && (
                    <div className="ov2-sub-row">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                      <span>Topic submitted: <strong>{topic.title}</strong></span>
                    </div>
                  )}
                  {caSubmitted && (
                    <div className="ov2-sub-row">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                      <span>CA results submitted for {TEACHER_SUBJECT}</span>
                    </div>
                  )}
                  {!attendanceLocked && !topicLocked && !caSubmitted && (
                    <p className="ov2-empty">Nothing submitted yet today.</p>
                  )}
                </div>
                <button className="ov2-link-btn" onClick={() => setActive('view')}>
                  View All Submitted
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>

              {/* ── Received Files ── */}
              <div className="ov2-card">
                <div className="ov2-card-head">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                  <span>Received Files</span>
                  {newFiles.length > 0 && <span className="ov2-card-badge ov2-badge-blue">{newFiles.length} new</span>}
                </div>
                {myFiles.length > 0 ? (
                  <div className="ov2-file-preview">
                    <div className="ov2-file-row">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      <div>
                        <div className="ov2-file-name">{myFiles[0].file?.name || 'File'}</div>
                        <div className="ov2-file-meta">From Manager &middot; <span className={`ov2-file-status ov2-fs-${myFiles[0].status}`}>{myFiles[0].status}</span></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="ov2-empty">No files received yet.</p>
                )}
                <button className="ov2-link-btn" onClick={() => setActive('files')}>
                  Open Files
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>

            </div>
          </div>
        )
      }

      case 'calendar': {
        const today = new Date()
        const todayStr = today.toISOString().split('T')[0]
        // Build week: Mon–Fri of current week
        const dayOfWeek = today.getDay() // 0=Sun
        const monday = new Date(today)
        monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
        const weekDays = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(monday)
          d.setDate(monday.getDate() + i)
          return d
        })
        const TEACHER_ID = teacher.id
        const TEACHER_NAME = teacher.name
        const CAL_SUBJECT = teacher.subject || 'Mathematics'
        const todayConfirmed = isAttendanceConfirmed(TEACHER_ID, todayStr)
        const dayNames = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
        const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
        return (
          <div className="dash-content page-enter">
            <div className="tc-header">
              <div className="tc-teacher-identity">
                <img src={teacher.img} alt={teacher.name} className="tc-teacher-avatar" />
                <div>
                  <h2 className="tc-title">My Calendar</h2>
                  <p className="tc-sub">{teacher.name} · {teacher.subject} · <span className="tc-id-tag">{teacher.id}</span></p>
                </div>
              </div>
              <div className="tc-week-label">
                {monthNames[monday.getMonth()]} {monday.getDate()} &ndash; {monthNames[new Date(monday.getTime()+6*86400000).getMonth()]} {new Date(monday.getTime()+6*86400000).getDate()}, {today.getFullYear()}
              </div>
            </div>

            {/* Confirmation status banner */}
            {todayConfirmed && (
              <div className="tc-confirmed-banner">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>
                Attendance confirmed for today &mdash; {new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}
              </div>
            )}

            {/* Weekly grid */}
            <div className="tc-week-grid">
              {weekDays.map((d, i) => {
                const dStr = d.toISOString().split('T')[0]
                const isToday = dStr === todayStr
                const isWeekend = i >= 5
                const confirmed = isAttendanceConfirmed(TEACHER_ID, dStr)
                return (
                  <div
                    key={dStr}
                    className={`tc-day-card ${isToday ? 'tc-today' : ''} ${isWeekend ? 'tc-weekend' : ''} ${confirmed ? 'tc-confirmed' : ''}`}
                  >
                    <div className="tc-day-head">
                      <span className="tc-day-name">{dayNames[i]}</span>
                      <span className="tc-day-num">{d.getDate()}</span>
                    </div>

                    {/* Schedule slots for this teacher */}
                    <div className="tc-day-slots">
                      {isWeekend ? (
                        <span className="tc-no-class">No class</span>
                      ) : (
                        ['8:00','9:00','10:00','11:00','12:00'].map((t, si) => (
                          <div key={t} className="tc-slot">
                            <span className="tc-slot-time">{t}</span>
                            <span className="tc-slot-subj">{CAL_SUBJECT}</span>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Confirm button — today only */}
                    {isToday && (
                      <div className="tc-today-action">
                        {confirmed ? (
                          <div className="tc-confirmed-badge">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
                            Confirmed
                          </div>
                        ) : (
                          <button
                            className="tc-confirm-btn tc-confirm-today"
                            onClick={() => confirmAttendance({
                              teacherId: TEACHER_ID,
                              teacherName: TEACHER_NAME,
                              subject: CAL_SUBJECT,
                              date: dStr,
                            })}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12"><polyline points="20 6 9 17 4 12"/></svg>
                            Confirm Today
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Personal schedule summary */}
            <div className="tc-schedule-summary">
              <div className="tc-summary-title">This Week's Schedule</div>
              <div className="tc-summary-list">
                {weekDays.slice(0,5).map((d, i) => {
                  const dStr = d.toISOString().split('T')[0]
                  const isToday = dStr === todayStr
                  const confirmed = isAttendanceConfirmed(TEACHER_ID, dStr)
                  return (
                    <div key={dStr} className={`tc-summary-row ${confirmed ? 'confirmed' : ''} ${isToday ? 'tc-sum-today' : ''}`}>
                      <span className="tc-sum-day">{dayNames[i]}, {monthNames[d.getMonth()]} {d.getDate()}</span>
                      <span className="tc-sum-subj">{CAL_SUBJECT} · 5 periods</span>
                      {confirmed
                        ? <span className="tc-sum-status confirmed">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12"><polyline points="20 6 9 17 4 12"/></svg>
                            Confirmed
                          </span>
                        : isToday
                          ? <button
                              className="tc-sum-confirm-btn"
                              onClick={() => confirmAttendance({
                                teacherId: TEACHER_ID,
                                teacherName: TEACHER_NAME,
                                subject: CAL_SUBJECT,
                                date: dStr,
                              })}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="11" height="11"><polyline points="20 6 9 17 4 12"/></svg>
                              Confirm
                            </button>
                          : <span className="tc-sum-status pending">Pending</span>
                      }
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )
      }

      case 'attendance':
        return (
          <div className="dash-content page-enter">
            <h2 className="section-heading">📋 Mark Attendance</h2>
            <p className="section-sub">Today: {new Date().toDateString()}</p>
            {attendanceLocked && <div className="locked-banner">🔒 Attendance submitted — locked for today</div>}
            <div className="attendance-list">
              {students.map((s) => (
                <div key={s} className="attendance-row">
                  <span className="student-name">{s}</span>
                  <div className="att-buttons">
                    {['Present', 'Absent', 'Late'].map((status) => (
                      <button
                        key={status}
                        disabled={attendanceLocked}
                        className={`att-btn att-${status.toLowerCase()} ${attendance[s] === status ? 'selected' : ''}`}
                        onClick={() => setAttendance({ ...attendance, [s]: status })}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {!attendanceLocked && (
              <button className="submit-btn" onClick={() => {
                setAttendanceLocked(true)
                confirmAttendance({
                  teacherId: 'T001',
                  teacherName: 'Mr. Ali',
                  subject: 'Mathematics',
                  date: new Date().toISOString().split('T')[0],
                })
              }}>
                Submit Attendance
              </button>
            )}
          </div>
        )

      case 'topics':
        return (
          <div className="dash-content page-enter">
            <h2 className="section-heading">{t('dailyTopicSubmission')}</h2>
            {topicLocked && <div className="locked-banner">{t('topicSubmittedLocked')}</div>}
            <div className="form-card">
              <div className="form-group">
                <label>Lesson Topic</label>
                <input
                  type="text"
                  placeholder="e.g. Introduction to Algebra"
                  value={topic.title}
                  disabled={topicLocked}
                  onChange={(e) => setTopic({ ...topic, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Describe what was covered in today's lesson..."
                  value={topic.desc}
                  disabled={topicLocked}
                  rows={4}
                  onChange={(e) => setTopic({ ...topic, desc: e.target.value })}
                />
              </div>
              {!topicLocked && (
                <button className="submit-btn" onClick={() => {
                  if (topic.title) {
                    addTopic({
                      teacherId: 'T001',
                      teacherName: 'Mr. Ali',
                      subject: 'Math',
                      date: new Date().toISOString().split('T')[0],
                      title: topic.title,
                      desc: topic.desc,
                      submittedAt: new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}),
                    })
                  }
                  setTopicLocked(true)
                }}>
                  Submit Topic
                </button>
              )}
            </div>
          </div>
        )

      case 'results': {
        // ── submit all marks for one semester to the DB ──────────────────────
        const handleSubmitSemester = async (sem) => {
          if (!teacherSubjectObj) return;
          const marks = sem === 'sem1' ? sem1Marks : sem2Marks;
          const setLocked = sem === 'sem1' ? setSem1Locked : setSem2Locked;
          setSubmitSaving(true); setSaveError('');
          try {
            for (const stu of dbStudents) {
              const row = marks[stu.id] || {};
              if (!row.assignment && !row.class_work && !row.mid_exam && !row.final_exam) continue;
              await resultsAPI.save({
                student_id: stu.id,
                subject_id: teacherSubjectObj.id,
                semester:   sem,
                assignment:  Number(row.assignment  || 0),
                class_work:  Number(row.class_work  || 0),
                mid_exam:    Number(row.mid_exam    || 0),
                final_exam:  Number(row.final_exam  || 0),
              });
            }
            setLocked(true);
            setSavedMsg((sem === 'sem1' ? 'Semester 1' : 'Semester 2') + ' marks saved ✓');
            setTimeout(() => setSavedMsg(''), 3000);
          } catch (e) {
            setSaveError(e.message || 'Failed to save marks');
          } finally { setSubmitSaving(false); }
        };

        // ── update a single cell ─────────────────────────────────────────────
        const updateMark = (sem, studentId, key, rawVal, max) => {
          const v = rawVal === '' ? '' : Math.min(max, Math.max(0, Number(rawVal)));
          const setter = sem === 'sem1' ? setSem1Marks : setSem2Marks;
          setter(prev => ({
            ...prev,
            [studentId]: { ...(prev[studentId] || {}), [key]: rawVal === '' ? '' : v }
          }));
        };

        // ── render a semester table ──────────────────────────────────────────
        const renderSemTable = (sem) => {
          const locked  = sem === 'sem1' ? sem1Locked  : sem2Locked;
          const marks   = sem === 'sem1' ? sem1Marks   : sem2Marks;
          const label   = sem === 'sem1' ? 'Semester 1' : 'Semester 2';
          return (
            <>
              {locked && (
                <div className="locked-banner">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  {label} marks saved — read-only
                </div>
              )}
              {resultsLoading ? (
                <div style={{textAlign:'center',padding:32,color:'#94a3b8'}}>
                  <svg className="login-spin" viewBox="0 0 24 24" fill="none" stroke="#1a73e8" strokeWidth="2.5" strokeLinecap="round" width="28" height="28" style={{display:'block',margin:'0 auto 8px'}}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                  Loading marks from database…
                </div>
              ) : (
                <div className="marks-table-wrap">
                  <div className="marks-head">
                    <div className="marks-col-name">Student</div>
                    {MARK_COLS.map(c => (
                      <div key={c.key} className="marks-col-input">
                        {c.max}<span className="marks-col-sub">{c.label}</span>
                      </div>
                    ))}
                    <div className="marks-col-total">Total</div>
                    <div className="marks-col-grade">Grade</div>
                  </div>
                  {dbStudents.length === 0 && (
                    <div style={{textAlign:'center',padding:24,color:'#94a3b8',fontSize:13}}>
                      No students in database. Add students from Payment Status.
                    </div>
                  )}
                  {dbStudents.map(stu => {
                    const row   = marks[stu.id] || {};
                    const total = semTotal(row);
                    return (
                      <div key={stu.id} className="marks-row">
                        <div className="marks-col-name marks-student">
                          <div>{stu.full_name}</div>
                          <div style={{fontSize:11,color:'#94a3b8'}}>{stu.student_code} · {stu.grade}</div>
                        </div>
                        {MARK_COLS.map(c => (
                          <div key={c.key} className="marks-col-input">
                            {locked ? (
                              <span style={{ color: row[c.key] !== '' ? gradeColor(Number(row[c.key]) / c.max * 100) : '#94a3b8', fontWeight: 600 }}>
                                {row[c.key] !== '' && row[c.key] !== undefined ? row[c.key] : '—'}
                              </span>
                            ) : (
                              <input
                                type="number" min="0" max={c.max}
                                placeholder="—"
                                value={row[c.key] ?? ''}
                                onChange={e => updateMark(sem, stu.id, c.key, e.target.value, c.max)}
                                className="sem-input"
                                style={row[c.key] !== '' && row[c.key] !== undefined
                                  ? { color: gradeColor(Number(row[c.key]) / c.max * 100), fontWeight: 700 } : {}}
                              />
                            )}
                          </div>
                        ))}
                        <div className="marks-col-total">
                          <span style={{ color: gradeColor(total), fontWeight: 800 }}>{total ?? '—'}</span>
                        </div>
                        <div className="marks-col-grade">
                          <span className="sem-grade-badge" style={{ background: gradeColor(total) + '18', color: gradeColor(total) }}>
                            {gradeLabel(total)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {!locked && !resultsLoading && (
                <div className="gr-submit-row">
                  <div className="gr-submit-note">Once submitted, {label} marks cannot be edited.</div>
                  <button className="submit-btn" onClick={() => handleSubmitSemester(sem)} disabled={submitSaving}>
                    {submitSaving ? 'Saving…' : 'Submit ' + label + ' Marks'}
                  </button>
                </div>
              )}
            </>
          );
        };

        return (
          <div className="dash-content page-enter">
            <div className="gr-header">
              <div>
                <h2 className="section-heading">Student Results — {TEACHER_SUBJECT}</h2>
                <p className="section-sub">Assignment /10 · Class Work /10 · Mid Exam /30 · Final Exam /50 · Total /100</p>
              </div>
            </div>

            {saveError && (
              <div style={{background:'#fee2e2',border:'1px solid #fca5a5',borderRadius:8,padding:'10px 16px',marginBottom:16,fontSize:13,color:'#991b1b'}}>{saveError}</div>
            )}
            {savedMsg && (
              <div style={{background:'#f0fdf4',border:'1px solid #86efac',borderRadius:8,padding:'10px 16px',marginBottom:16,fontSize:13,color:'#15803d',fontWeight:600}}>{savedMsg}</div>
            )}
            {!teacherSubjectObj && !resultsLoading && dbSubjects.length > 0 && (
              <div style={{background:'#fff7ed',border:'1px solid #fdba74',borderRadius:8,padding:'10px 16px',marginBottom:16,fontSize:13,color:'#9a3412'}}>
                Subject "{TEACHER_SUBJECT}" not found in DB. Contact admin.
              </div>
            )}

            {/* Semester tabs */}
            <div className="sem-tabs">
              {[{ key:'sem1', label:'Semester 1' }, { key:'sem2', label:'Semester 2' }, { key:'final', label:'Final Result' }].map(tab => (
                <button key={tab.key} className={`sem-tab ${activeSem === tab.key ? 'sem-tab-active' : ''}`} onClick={() => setActiveSem(tab.key)}>
                  {tab.label}
                  {tab.key === 'sem1'  && sem1Locked && <span className="sem-tab-dot" />}
                  {tab.key === 'sem2'  && sem2Locked && <span className="sem-tab-dot" />}
                  {tab.key === 'final' && sem1Locked && sem2Locked && <span className="sem-tab-dot" />}
                </button>
              ))}
            </div>

            {activeSem === 'sem1' && renderSemTable('sem1')}
            {activeSem === 'sem2' && renderSemTable('sem2')}

            {/* Final Result */}
            {activeSem === 'final' && (
              <div className="sem-final-wrap">
                {(!sem1Locked || !sem2Locked) && (
                  <div className="sem-final-notice">
                    {!sem1Locked && !sem2Locked ? 'Submit both semesters to see final results.'
                      : !sem1Locked ? 'Submit Semester 1 to see final results.'
                      : 'Submit Semester 2 to see final results.'}
                  </div>
                )}
                {sem1Locked && sem2Locked && (
                  <>
                    <div className="final-summary-header">
                      <span>{TEACHER_SUBJECT} — Final Results</span>
                      <span className="final-summary-sub">AVG = (Semester 1 + Semester 2) ÷ 2</span>
                    </div>
                    <div className="marks-table-wrap">
                      <div className="marks-head final-marks-head">
                        <div className="marks-col-name">Student</div>
                        <div className="marks-col-total">Sem 1<span className="marks-col-sub">/100</span></div>
                        <div className="marks-col-total">Sem 2<span className="marks-col-sub">/100</span></div>
                        <div className="marks-col-total marks-col-avg">AVG<span className="marks-col-sub">/100</span></div>
                        <div className="marks-col-grade">Grade</div>
                      </div>
                      {dbStudents.map(stu => {
                        const t1  = semTotal(sem1Marks[stu.id]);
                        const t2  = semTotal(sem2Marks[stu.id]);
                        const avg = (t1 !== null && t2 !== null) ? Math.round((t1 + t2) / 2) : null;
                        return (
                          <div key={stu.id} className="marks-row final-marks-row">
                            <div className="marks-col-name marks-student">
                              <div>{stu.full_name}</div>
                              <div style={{fontSize:11,color:'#94a3b8'}}>{stu.student_code}</div>
                            </div>
                            <div className="marks-col-total"><span style={{ color: gradeColor(t1), fontWeight: 600 }}>{t1 ?? '—'}</span></div>
                            <div className="marks-col-total"><span style={{ color: gradeColor(t2), fontWeight: 600 }}>{t2 ?? '—'}</span></div>
                            <div className="marks-col-total marks-col-avg"><span style={{ color: gradeColor(avg), fontWeight: 800, fontSize:'1.05rem' }}>{avg ?? '—'}</span></div>
                            <div className="marks-col-grade">
                              <span className="sem-grade-badge" style={{ background: gradeColor(avg) + '22', color: gradeColor(avg), fontSize:'0.85rem' }}>{gradeLabel(avg)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        );
      }

            case 'view':
        return (
          <div className="dash-content page-enter">
            <h2 className="section-heading">{t('viewSubmitted')}</h2>
            <div className="readonly-notice">{t('readOnly')}</div>
            <div className="view-sections">
              <div className="view-block">
                <h3>Attendance Records</h3>
                {Object.keys(attendance).length === 0
                  ? <p className="empty-msg">No attendance submitted yet.</p>
                  : students.map((s) => (
                    <div key={s} className="view-row">
                      <span>{s}</span>
                      <span className={`att-badge att-${(attendance[s] || 'not marked').toLowerCase()}`}>
                        {attendance[s] || 'Not Marked'}
                      </span>
                    </div>
                  ))
                }
              </div>
              <div className="view-block">
                <h3>Today's Topic</h3>
                {!topicLocked
                  ? <p className="empty-msg">No topic submitted yet.</p>
                  : <div className="view-topic"><strong>{topic.title}</strong><p>{topic.desc}</p></div>
                }
              </div>
            </div>
          </div>
        )

      case 'files':
        return (
          <div className="dash-content page-enter">
            <div className="rf-header">
              <h2 className="section-heading">📎 Received Files</h2>
              <span className="rf-count-badge">{myFiles.length} file{myFiles.length !== 1 ? 's' : ''}</span>
            </div>
            {myFiles.length === 0 ? (
              <div className="rf-empty">
                <div className="rf-empty-icon">📭</div>
                <div className="rf-empty-title">No files received yet</div>
                <div className="rf-empty-sub">Files sent by the Manager will appear here</div>
              </div>
            ) : (
              <div className="rf-list">
                {myFiles.map(f => (
                  <div key={f.id} className={`rf-card rf-${f.status}`}>
                    <div className="rf-card-left">
                      <div className="rf-file-icon">📄</div>
                      <div className="rf-file-info">
                        <div className="rf-file-name">{f.file?.name || 'Unnamed file'}</div>
                        <div className="rf-file-meta">
                          From: <strong>Manager</strong> ·
                          {f.permission === 'view' ? ' 👁️ View Only' : ' ⬇️ Download Allowed'} ·
                          <span className={`rf-status rf-status-${f.status}`}>
                            {f.status === 'pending' ? ' ⏳ Pending' : f.status === 'accepted' ? ' ✅ Accepted' : ' ❌ Rejected'}
                          </span>
                        </div>
                        {f.message && <div className="rf-message">"{f.message}"</div>}
                      </div>
                    </div>
                    <div className="rf-card-right">
                      {f.status === 'pending' && (
                        <div className="rf-actions">
                          <button className="rf-accept" onClick={() => updateStatus(f.id, 'accepted')}>✓ Accept</button>
                          <button className="rf-reject" onClick={() => updateStatus(f.id, 'rejected')}>✕ Reject</button>
                        </div>
                      )}
                      {f.status === 'accepted' && f.permission === 'download' && (
                        <button className="rf-download">⬇️ Download</button>
                      )}
                      {f.status === 'accepted' && f.permission === 'view' && (
                        <span className="rf-view-only">👁️ View Only</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      default: return null
    }
  }

  return (
    <div className="dashboard-layout">
      <Sidebar role="teacher" items={sidebarItems} active={active} onSelect={setActive} />
      <main className="dashboard-main">{renderContent()}</main>
    </div>
  )
}

