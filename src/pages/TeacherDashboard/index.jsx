import { useState, useEffect, useCallback, useRef } from 'react'
import Sidebar from '../../components/Sidebar'
import { useFileStore } from '../../context/FileStore'
import { useTeacherStore } from '../../context/TeacherStore'
import { useAuth } from '../../context/AuthStore'
import { useLang } from '../../context/LangContext'
import { teachersAPI, resultsAPI } from '../../api/index.js'
import './style.css'

// ── Day-order helper ──────────────────────────────────────────────────────────
const DAY_ORDER = { Mon:1, Tue:2, Wed:3, Thu:4, Fri:5 }

// ── Grade helpers ─────────────────────────────────────────────────────────────
const gradeColor = (v) => {
  if (v == null) return '#94a3b8'
  if (v >= 80) return '#16a34a'; if (v >= 65) return '#0891b2'
  if (v >= 50) return '#d97706'; return '#dc2626'
}
const gradeLabel = (v) => {
  if (v == null) return '—'
  if (v >= 90) return 'A+'; if (v >= 85) return 'A'; if (v >= 80) return 'A-'
  if (v >= 75) return 'B+'; if (v >= 70) return 'B'; if (v >= 65) return 'B-'
  if (v >= 60) return 'C'; return 'F'
}

export default function TeacherDashboard() {
  const [active, setActive] = useState('overview')
  const { t } = useLang()
  const { files, updateStatus } = useFileStore()
  const { confirmAttendance, isAttendanceConfirmed } = useTeacherStore()
  const { currentUser } = useAuth()

  // ── Derive teacher identity from authenticated user ───────────────────────
  // profile is attached by the auth/me endpoint and cached in AuthStore
  const profile    = currentUser?.profile || {}
  const teacherDbId = profile.id || null          // numeric DB id in teachers table
  const teacherName = profile.full_name || currentUser?.full_name || 'Teacher'
  const teacherCode = profile.teacher_code || currentUser?.login_id || ''
  const teacherSubj = profile.subject || '—'
  const teacherDept = profile.department || ''
  const teacherBranch = profile.branch || ''
  const teacherRating = profile.rating || 0
  const teacherClasses = profile.classes || []
  const avatarUrl  = profile.avatar_url || currentUser?.avatar_url || null
  const teacherImg = avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(teacherName)}&background=0d9488&color=fff&size=128`

  // ── Server-loaded data ────────────────────────────────────────────────────
  const [myStudents,   setMyStudents]   = useState([])
  const [myTimetable,  setMyTimetable]  = useState([])
  const [myTopicsDB,   setMyTopicsDB]   = useState([])
  const [mySubjects,   setMySubjects]   = useState([])
  const [dataReady,    setDataReady]    = useState(false)
  const [profileLoading, setProfileLoading] = useState(true)

  // ── Results state ─────────────────────────────────────────────────────────
  const [sem1Marks,  setSem1Marks]  = useState({})
  const [sem2Marks,  setSem2Marks]  = useState({})
  const [sem1Locked, setSem1Locked] = useState(false)
  const [sem2Locked, setSem2Locked] = useState(false)
  const [activeSem,  setActiveSem]  = useState('sem1')
  const [resLoading, setResLoading] = useState(false)
  const [resSaving,  setResSaving]  = useState(false)
  const [resError,   setResError]   = useState('')
  const [resOk,      setResOk]      = useState('')

  // ── Attendance state ──────────────────────────────────────────────────────
  const [attMarks,   setAttMarks]   = useState({})  // { [studentId]: 'Present'|'Absent'|'Late' }
  const [attLocked,  setAttLocked]  = useState(false)
  const [attSaving,  setAttSaving]  = useState(false)

  // ── Topic state ───────────────────────────────────────────────────────────
  const [topicForm,  setTopicForm]  = useState({ title: '', desc: '' })
  const [topicLocked,setTopicLocked]= useState(false)
  const [topicSaving,setTopicSaving]= useState(false)

  // Mark columns
  const MARK_COLS = [
    { key: 'assignment', label: 'Assignment', max: 10 },
    { key: 'class_work', label: 'Class Work', max: 10 },
    { key: 'mid_exam',   label: 'Mid Exam',   max: 30 },
    { key: 'final_exam', label: 'Final Exam', max: 50 },
  ]

  const semTotal = (row) => {
    if (!row) return null
    const vals = [row.assignment, row.class_work, row.mid_exam, row.final_exam]
    const filled = vals.filter(v => v !== '' && v != null && !isNaN(Number(v)))
    return filled.length ? filled.reduce((a, b) => a + Number(b), 0) : null
  }

  // ── Load all teacher-specific data ────────────────────────────────────────
  const loadAllData = useCallback(async () => {
    if (!currentUser || currentUser.role !== 'teacher') return
    setProfileLoading(true)
    try {
      const [stuData, ttData, topData, subjData] = await Promise.all([
        teachersAPI.myStudents().catch(() => []),
        teachersAPI.myTimetable().catch(() => []),
        teachersAPI.myTopics().catch(() => []),
        resultsAPI.getSubjects().catch(() => []),
      ])
      setMyStudents(stuData || [])
      setMyTimetable(ttData || [])
      setMyTopicsDB(topData || [])
      setMySubjects(subjData || [])
      setDataReady(true)
    } finally {
      setProfileLoading(false)
    }
  }, [currentUser?.id])

  useEffect(() => { loadAllData() }, [loadAllData])

  // ── Load results once students + subjects are ready ───────────────────────
  const subjObj = mySubjects.find(s => s.name?.toLowerCase() === teacherSubj.toLowerCase()) || mySubjects[0] || null

  useEffect(() => {
    if (!myStudents.length || !subjObj) return
    const load = async () => {
      setResLoading(true)
      try {
        const all = await resultsAPI.getAll()
        const s1 = {}, s2 = {}
        let s1has = false, s2has = false
        for (const r of (all || [])) {
          if (String(r.subject_id) !== String(subjObj.id)) continue
          const row = { assignment: r.assignment ?? '', class_work: r.class_work ?? '', mid_exam: r.mid_exam ?? '', final_exam: r.final_exam ?? '' }
          if (r.semester === 'sem1') { s1[r.student_id] = row; s1has = true }
          if (r.semester === 'sem2') { s2[r.student_id] = row; s2has = true }
        }
        setSem1Marks(s1); setSem2Marks(s2)
        if (s1has) setSem1Locked(true)
        if (s2has) setSem2Locked(true)
      } catch {}
      setResLoading(false)
    }
    load()
  }, [myStudents.length, subjObj?.id])

  // ── Today helpers ─────────────────────────────────────────────────────────
  const todayDate = new Date()
  const todayStr  = todayDate.toISOString().split('T')[0]
  const todayDayName = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][todayDate.getDay()]
  const monthNames   = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  const todaySlots = myTimetable
    .filter(s => s.day_name === todayDayName)
    .sort((a, b) => a.period.localeCompare(b.period))

  const todayTopics = myTopicsDB.filter(tp => tp.date === todayStr)
  const todayConfirmed = isAttendanceConfirmed(String(teacherDbId || teacherCode), todayStr)

  // Week days Mon–Fri
  const dow = todayDate.getDay()
  const monday = new Date(todayDate)
  monday.setDate(todayDate.getDate() - (dow === 0 ? 6 : dow - 1))
  const weekDays = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday); d.setDate(monday.getDate() + i); return d
  })

  // Timetable grouped by day
  const timetableByDay = {}
  for (const slot of myTimetable) {
    if (!timetableByDay[slot.day_name]) timetableByDay[slot.day_name] = []
    timetableByDay[slot.day_name].push(slot)
  }

  // ── Attendance submit ─────────────────────────────────────────────────────
  const handleSubmitAttendance = async () => {
    if (!myStudents.length) return
    const records = myStudents.map(s => ({
      entity_type: 'student', entity_id: s.id,
      date: todayStr, status: attMarks[s.id] || 'Present',
    }))
    setAttSaving(true)
    try {
      await teachersAPI.saveAttendance({ records })
      confirmAttendance({ teacherId: String(teacherDbId || teacherCode), teacherName, subject: teacherSubj, date: todayStr, records })
      setAttLocked(true)
    } catch (e) { alert('Attendance save failed: ' + e.message) }
    setAttSaving(false)
  }

  // ── Topic submit ──────────────────────────────────────────────────────────
  const handleSubmitTopic = async () => {
    if (!topicForm.title.trim()) return
    setTopicSaving(true)
    try {
      const now = new Date().toTimeString().slice(0, 5)
      const saved = await teachersAPI.submitTopic({
        subject: teacherSubj, date: todayStr,
        title: topicForm.title, description: topicForm.desc, submitted_at: now,
      })
      setMyTopicsDB(prev => [saved, ...prev])
      setTopicLocked(true)
    } catch (e) { alert('Topic save failed: ' + e.message) }
    setTopicSaving(false)
  }

  // ── Results submit ────────────────────────────────────────────────────────
  const handleSubmitResults = async (sem) => {
    if (!subjObj) return
    const marks = sem === 'sem1' ? sem1Marks : sem2Marks
    const setLocked = sem === 'sem1' ? setSem1Locked : setSem2Locked
    setResSaving(true); setResError(''); setResOk('')
    try {
      for (const stu of myStudents) {
        const row = marks[stu.id] || {}
        if (!row.assignment && !row.class_work && !row.mid_exam && !row.final_exam) continue
        await resultsAPI.save({
          student_id: stu.id, subject_id: subjObj.id, semester: sem,
          assignment: Number(row.assignment || 0), class_work: Number(row.class_work || 0),
          mid_exam: Number(row.mid_exam || 0), final_exam: Number(row.final_exam || 0),
        })
      }
      setLocked(true)
      setResOk((sem === 'sem1' ? 'Semester 1' : 'Semester 2') + ' marks saved ✓')
      setTimeout(() => setResOk(''), 3000)
    } catch (e) { setResError(e.message || 'Save failed') }
    setResSaving(false)
  }

  const updateMark = (sem, studentId, key, rawVal, max) => {
    const v = rawVal === '' ? '' : Math.min(max, Math.max(0, Number(rawVal)))
    const setter = sem === 'sem1' ? setSem1Marks : setSem2Marks
    setter(prev => ({ ...prev, [studentId]: { ...(prev[studentId] || {}), [key]: rawVal === '' ? '' : v } }))
  }

  // ── Sidebar ───────────────────────────────────────────────────────────────
  const sidebarItems = [
    { id:'overview',   icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>, label: t('overview') },
    { id:'calendar',   icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, label: t('myCalendar') },
    { id:'attendance', icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>, label: t('attendance') },
    { id:'topics',     icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>, label: t('dailyTopics') },
    { id:'results',    icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>, label: t('results') },
    { id:'view',       icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>, label: t('viewSubmitted') },
    { id:'files',      icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>, label: t('receivedFiles') },
  ]

  const myFiles = files.filter(f => f.target?.id?.startsWith('T'))
  const newFiles = myFiles.filter(f => f.status === 'pending')

  // ── Loading splash ────────────────────────────────────────────────────────
  if (profileLoading && !dataReady) {
    return (
      <div className="dashboard-layout">
        <Sidebar role="teacher" items={sidebarItems} active={active} onSelect={setActive} />
        <main className="dashboard-main">
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'60vh',gap:16,color:'#64748b'}}>
            <svg className="login-spin" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" width="40" height="40">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            <span style={{fontSize:14,fontWeight:600}}>Loading your dashboard…</span>
          </div>
        </main>
      </div>
    )
  }

  // ── Render sections ───────────────────────────────────────────────────────
  const renderContent = () => {
    switch (active) {

      // ════════════════════════════════════════════════════════════════
      case 'overview': {
        const caSubmitted = sem1Locked || sem2Locked
        return (
          <div className="dash-content page-enter">

            {/* ── Header ── */}
            <div className="ov2-header">
              <div className="ov2-header-left">
                <img src={teacherImg} alt={teacherName} className="ov2-avatar"
                  onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(teacherName)}&background=0d9488&color=fff&size=128` }} />
                <div>
                  <h2 className="ov2-name">Welcome, {teacherName}</h2>
                  <p className="ov2-meta">
                    {teacherSubj}{teacherDept ? ` · ${teacherDept}` : ''}{teacherBranch ? ` · ${teacherBranch}` : ''}
                    {teacherCode ? ` · ${teacherCode}` : ''}
                    {' · '}{todayDate.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}
                  </p>
                  {teacherClasses.length > 0 && (
                    <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:6}}>
                      {teacherClasses.map(c => (
                        <span key={c} style={{fontSize:11,fontWeight:700,padding:'2px 10px',background:'#ccfbf1',color:'#0d9488',borderRadius:20}}>{c}</span>
                      ))}
                    </div>
                  )}
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

            <div className="ov2-grid">

              {/* ── Today's Classes ── */}
              <div className="ov2-card ov2-today-card">
                <div className="ov2-card-head">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span>Today's Classes</span>
                  {todaySlots.length > 0 && <span className="ov2-card-badge">{todaySlots.length} period{todaySlots.length !== 1 ? 's' : ''}</span>}
                </div>
                {todaySlots.length === 0 ? (
                  <p className="ov2-empty">No classes scheduled for today.</p>
                ) : (
                  <div className="ov2-today-periods">
                    {todaySlots.map(s => (
                      <div key={s.period} className="ov2-period-row">
                        <span className="ov2-period-time">{s.period}</span>
                        <span className="ov2-period-subj">{s.subject}</span>
                        {s.grade && <span className="ov2-period-grade">{s.grade}{s.class_name ? s.class_name : ''}</span>}
                      </div>
                    ))}
                  </div>
                )}
                <div className="ov2-att-status">
                  {todayConfirmed ? (
                    <div className="ov2-confirmed">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><polyline points="20 6 9 17 4 12"/></svg>
                      Attendance Confirmed
                    </div>
                  ) : (
                    <button className="ov2-confirm-btn" onClick={() => setActive('attendance')}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
                      Mark Attendance
                    </button>
                  )}
                </div>
              </div>

              {/* ── This Week ── */}
              <div className="ov2-card ov2-cal-card">
                <div className="ov2-card-head">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <span>This Week</span>
                </div>
                <div className="ov2-mini-week">
                  {weekDays.map((d, i) => {
                    const dStr = d.toISOString().split('T')[0]
                    const dn   = ['Mon','Tue','Wed','Thu','Fri'][i]
                    const slots = (timetableByDay[dn] || []).length
                    const isToday = dStr === todayStr
                    const conf = isAttendanceConfirmed(String(teacherDbId || teacherCode), dStr)
                    return (
                      <div key={dStr} className={`ov2-mini-day ${isToday ? 'ov2-mini-today' : ''} ${conf ? 'ov2-mini-confirmed' : ''}`}>
                        <span className="ov2-mini-name">{dn}</span>
                        <span className="ov2-mini-num">{d.getDate()}</span>
                        <span className="ov2-mini-count">{slots > 0 ? `${slots}p` : '—'}</span>
                        {conf && <svg className="ov2-mini-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="10" height="10"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                    )
                  })}
                </div>
                <button className="ov2-link-btn" onClick={() => setActive('calendar')}>
                  Open Full Calendar
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>

              {/* ── Today's Topic ── */}
              <div className="ov2-card">
                <div className="ov2-card-head">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                  <span>Today's Topic</span>
                  {todayTopics.length > 0 && <span className="ov2-card-badge ov2-badge-green">Submitted</span>}
                </div>
                {todayTopics.length > 0 ? (
                  <div className="ov2-topic-preview">
                    <div className="ov2-topic-title">{todayTopics[0].title}</div>
                    <div className="ov2-topic-desc">{(todayTopics[0].description || '').slice(0, 90)}{(todayTopics[0].description || '').length > 90 ? '…' : ''}</div>
                    <div className="ov2-topic-time">{todayTopics[0].submitted_at || ''}</div>
                  </div>
                ) : (
                  <p className="ov2-empty">No topic submitted yet today.</p>
                )}
                <button className="ov2-link-btn" onClick={() => setActive('topics')}>
                  {todayTopics.length > 0 ? 'View Topics' : 'Add Topic'}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>

              {/* ── Attendance (This Week) ── */}
              <div className="ov2-card">
                <div className="ov2-card-head">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
                  <span>Attendance (This Week)</span>
                </div>
                <div className="ov2-att-week">
                  {weekDays.map((d, i) => {
                    const dStr = d.toISOString().split('T')[0]
                    const conf = isAttendanceConfirmed(String(teacherDbId || teacherCode), dStr)
                    const isPast = d <= todayDate
                    return (
                      <div key={dStr} className="ov2-att-day-row">
                        <span className="ov2-att-day-name">{['Mon','Tue','Wed','Thu','Fri'][i]}, {monthNames[d.getMonth()]} {d.getDate()}</span>
                        <span className={`ov2-att-pill ${conf ? 'ov2-att-confirmed' : isPast ? 'ov2-att-missed' : 'ov2-att-upcoming'}`}>
                          {conf ? <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="10" height="10"><polyline points="20 6 9 17 4 12"/></svg> Confirmed</> : isPast ? 'Not confirmed' : 'Upcoming'}
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

              {/* ── Results ── */}
              <div className="ov2-card">
                <div className="ov2-card-head">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                  <span>Results — {teacherSubj}</span>
                  {caSubmitted && <span className="ov2-card-badge ov2-badge-green">Submitted</span>}
                </div>
                <div style={{fontSize:13,color:'#64748b',padding:'8px 0'}}>
                  {myStudents.length} student{myStudents.length !== 1 ? 's' : ''} assigned ·{' '}
                  {sem1Locked ? '✓ Sem 1' : '○ Sem 1'} · {sem2Locked ? '✓ Sem 2' : '○ Sem 2'}
                </div>
                {!caSubmitted && <p className="ov2-empty">No results submitted yet.</p>}
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
                  {attLocked && <div className="ov2-sub-row"><svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg><span>Attendance submitted for today</span></div>}
                  {todayTopics.length > 0 && <div className="ov2-sub-row"><svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg><span>Topic: <strong>{todayTopics[0].title}</strong></span></div>}
                  {caSubmitted && <div className="ov2-sub-row"><svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg><span>Results submitted for {teacherSubj}</span></div>}
                  {!attLocked && todayTopics.length === 0 && !caSubmitted && <p className="ov2-empty">Nothing submitted yet today.</p>}
                </div>
                <button className="ov2-link-btn" onClick={() => setActive('view')}>View All <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12"><polyline points="9 18 15 12 9 6"/></svg></button>
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
                        <div className="ov2-file-meta">From Manager · <span className={`ov2-file-status ov2-fs-${myFiles[0].status}`}>{myFiles[0].status}</span></div>
                      </div>
                    </div>
                  </div>
                ) : <p className="ov2-empty">No files received yet.</p>}
                <button className="ov2-link-btn" onClick={() => setActive('files')}>Open Files <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12"><polyline points="9 18 15 12 9 6"/></svg></button>
              </div>

            </div>
          </div>
        )
      }

      // ════════════════════════════════════════════════════════════════
      case 'calendar': {
        const dow2 = todayDate.getDay()
        const mon2 = new Date(todayDate); mon2.setDate(todayDate.getDate() - (dow2 === 0 ? 6 : dow2 - 1))
        const fullWeek = Array.from({ length: 7 }, (_, i) => { const d = new Date(mon2); d.setDate(mon2.getDate() + i); return d })
        return (
          <div className="dash-content page-enter">
            <div className="tc-header">
              <div className="tc-teacher-identity">
                <img src={teacherImg} alt={teacherName} className="tc-teacher-avatar"
                  onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(teacherName)}&background=0d9488&color=fff&size=128` }} />
                <div>
                  <h2 className="tc-title">My Calendar</h2>
                  <p className="tc-sub">{teacherName} · {teacherSubj} · <span className="tc-id-tag">{teacherCode}</span></p>
                </div>
              </div>
              <div className="tc-week-label">
                {monthNames[mon2.getMonth()]} {mon2.getDate()} – {monthNames[new Date(mon2.getTime()+6*86400000).getMonth()]} {new Date(mon2.getTime()+6*86400000).getDate()}, {todayDate.getFullYear()}
              </div>
            </div>

            {todayConfirmed && (
              <div className="tc-confirmed-banner">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>
                Attendance confirmed for today — {todayDate.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}
              </div>
            )}

            <div className="tc-week-grid">
              {fullWeek.map((d, i) => {
                const dStr = d.toISOString().split('T')[0]
                const dn   = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]
                const isToday   = dStr === todayStr
                const isWeekend = i >= 5
                const confirmed = isAttendanceConfirmed(String(teacherDbId || teacherCode), dStr)
                const daySlots  = timetableByDay[dn] || []
                return (
                  <div key={dStr} className={`tc-day-card ${isToday?'tc-today':''} ${isWeekend?'tc-weekend':''} ${confirmed?'tc-confirmed':''}`}>
                    <div className="tc-day-head">
                      <span className="tc-day-name">{dn}</span>
                      <span className="tc-day-num">{d.getDate()}</span>
                    </div>
                    <div className="tc-day-slots">
                      {isWeekend ? <span className="tc-no-class">No class</span>
                        : daySlots.length === 0 ? <span className="tc-no-class">No schedule</span>
                        : daySlots.map(s => (
                          <div key={s.period} className="tc-slot">
                            <span className="tc-slot-time">{s.period}</span>
                            <span className="tc-slot-subj">{s.subject}</span>
                          </div>
                        ))
                      }
                    </div>
                    {isToday && !isWeekend && (
                      <div className="tc-today-action">
                        {confirmed ? (
                          <div className="tc-confirmed-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg> Confirmed</div>
                        ) : (
                          <button className="tc-confirm-btn tc-confirm-today" onClick={() => setActive('attendance')}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12"><polyline points="20 6 9 17 4 12"/></svg>
                            Mark Attendance
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="tc-schedule-summary">
              <div className="tc-summary-title">This Week's Schedule</div>
              <div className="tc-summary-list">
                {weekDays.map((d, i) => {
                  const dStr = d.toISOString().split('T')[0]
                  const dn   = ['Mon','Tue','Wed','Thu','Fri'][i]
                  const isToday = dStr === todayStr
                  const confirmed = isAttendanceConfirmed(String(teacherDbId || teacherCode), dStr)
                  const daySlots = timetableByDay[dn] || []
                  return (
                    <div key={dStr} className={`tc-summary-row ${confirmed?'confirmed':''} ${isToday?'tc-sum-today':''}`}>
                      <span className="tc-sum-day">{dn}, {monthNames[d.getMonth()]} {d.getDate()}</span>
                      <span className="tc-sum-subj">{daySlots.length > 0 ? `${teacherSubj} · ${daySlots.length} period${daySlots.length !== 1?'s':''}` : 'No classes'}</span>
                      {confirmed
                        ? <span className="tc-sum-status confirmed"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12"><polyline points="20 6 9 17 4 12"/></svg> Confirmed</span>
                        : isToday
                          ? <button className="tc-sum-confirm-btn" onClick={() => setActive('attendance')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="11" height="11"><polyline points="20 6 9 17 4 12"/></svg> Mark</button>
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

      // ════════════════════════════════════════════════════════════════
      case 'attendance':
        return (
          <div className="dash-content page-enter">
            <h2 className="section-heading">📋 Mark Attendance</h2>
            <p className="section-sub">
              {teacherName} · {teacherSubj} · Today: {todayDate.toDateString()}
              {teacherClasses.length > 0 && ` · Classes: ${teacherClasses.join(', ')}`}
            </p>
            {attLocked && <div className="locked-banner">🔒 Attendance submitted — locked for today</div>}
            {myStudents.length === 0 ? (
              <div style={{textAlign:'center',padding:48,color:'#94a3b8'}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="40" height="40" style={{display:'block',margin:'0 auto 12px',color:'#cbd5e1'}}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                <p style={{fontWeight:600,fontSize:14}}>No students found for your assigned classes.</p>
              </div>
            ) : (
              <>
                <div className="attendance-list">
                  {myStudents.map(s => (
                    <div key={s.id} className="attendance-row">
                      <div style={{display:'flex',flexDirection:'column'}}>
                        <span className="student-name">{s.full_name}</span>
                        <span style={{fontSize:11,color:'#94a3b8'}}>{s.student_code} · {s.grade}</span>
                      </div>
                      <div className="att-buttons">
                        {['Present','Absent','Late'].map(status => (
                          <button key={status} disabled={attLocked}
                            className={`att-btn att-${status.toLowerCase()} ${attMarks[s.id] === status ? 'selected' : ''}`}
                            onClick={() => setAttMarks(p => ({ ...p, [s.id]: status }))}>
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {!attLocked && (
                  <button className="submit-btn" onClick={handleSubmitAttendance} disabled={attSaving}>
                    {attSaving ? 'Saving…' : 'Submit Attendance'}
                  </button>
                )}
              </>
            )}
          </div>
        )

      // ════════════════════════════════════════════════════════════════
      case 'topics':
        return (
          <div className="dash-content page-enter">
            <h2 className="section-heading">{t('dailyTopicSubmission')}</h2>
            <p className="section-sub">{teacherName} · {teacherSubj} · {todayDate.toDateString()}</p>

            {/* Today's submitted topics */}
            {todayTopics.length > 0 && (
              <div style={{marginBottom:20}}>
                {todayTopics.map(tp => (
                  <div key={tp.id} style={{background:'#f0fdf4',border:'1px solid #86efac',borderRadius:10,padding:'12px 16px',marginBottom:10}}>
                    <div style={{fontWeight:700,fontSize:14,color:'#15803d'}}>{tp.title}</div>
                    <div style={{fontSize:12,color:'#64748b',marginTop:4}}>{tp.description}</div>
                    <div style={{fontSize:11,color:'#94a3b8',marginTop:4}}>{tp.subject} · {tp.date} {tp.submitted_at ? `· ${tp.submitted_at}` : ''}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Submit form */}
            {!topicLocked ? (
              <div className="form-card">
                <div className="form-group">
                  <label>Lesson Topic</label>
                  <input type="text" placeholder="e.g. Introduction to Algebra"
                    value={topicForm.title} onChange={e => setTopicForm(p => ({ ...p, title: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea placeholder="Describe what was covered today…" rows={4}
                    value={topicForm.desc} onChange={e => setTopicForm(p => ({ ...p, desc: e.target.value }))} />
                </div>
                <button className="submit-btn" onClick={handleSubmitTopic} disabled={topicSaving || !topicForm.title.trim()}>
                  {topicSaving ? 'Saving…' : 'Submit Topic'}
                </button>
              </div>
            ) : (
              <div className="locked-banner">{t('topicSubmittedLocked')}</div>
            )}

            {/* Recent topics history */}
            {myTopicsDB.filter(tp => tp.date !== todayStr).length > 0 && (
              <div style={{marginTop:28}}>
                <div style={{fontSize:12,fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:12}}>Previous Topics</div>
                {myTopicsDB.filter(tp => tp.date !== todayStr).slice(0, 10).map(tp => (
                  <div key={tp.id} style={{background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:10,padding:'10px 14px',marginBottom:8}}>
                    <div style={{fontWeight:600,fontSize:13,color:'#334155'}}>{tp.title}</div>
                    <div style={{fontSize:12,color:'#94a3b8',marginTop:3}}>{tp.subject} · {tp.date}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      // ════════════════════════════════════════════════════════════════
      case 'results': {
        const renderSemTable = (sem) => {
          const locked = sem === 'sem1' ? sem1Locked : sem2Locked
          const marks  = sem === 'sem1' ? sem1Marks  : sem2Marks
          const label  = sem === 'sem1' ? 'Semester 1' : 'Semester 2'
          return (
            <>
              {locked && (
                <div className="locked-banner">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  {label} marks saved — read-only
                </div>
              )}
              {resLoading ? (
                <div style={{textAlign:'center',padding:32,color:'#94a3b8'}}>
                  <svg className="login-spin" viewBox="0 0 24 24" fill="none" stroke="#1a73e8" strokeWidth="2.5" strokeLinecap="round" width="28" height="28" style={{display:'block',margin:'0 auto 8px'}}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                  Loading…
                </div>
              ) : myStudents.length === 0 ? (
                <div style={{textAlign:'center',padding:32,color:'#94a3b8',fontSize:13}}>No students in your assigned classes.</div>
              ) : (
                <div className="marks-table-wrap">
                  <div className="marks-head">
                    <div className="marks-col-name">Student</div>
                    {MARK_COLS.map(c => <div key={c.key} className="marks-col-input">{c.max}<span className="marks-col-sub">{c.label}</span></div>)}
                    <div className="marks-col-total">Total</div>
                    <div className="marks-col-grade">Grade</div>
                  </div>
                  {myStudents.map(stu => {
                    const row   = marks[stu.id] || {}
                    const total = semTotal(row)
                    return (
                      <div key={stu.id} className="marks-row">
                        <div className="marks-col-name marks-student">
                          <div>{stu.full_name}</div>
                          <div style={{fontSize:11,color:'#94a3b8'}}>{stu.student_code} · {stu.grade}</div>
                        </div>
                        {MARK_COLS.map(c => (
                          <div key={c.key} className="marks-col-input">
                            {locked ? (
                              <span style={{color: row[c.key] !== '' ? gradeColor(Number(row[c.key]) / c.max * 100) : '#94a3b8', fontWeight:600}}>
                                {row[c.key] !== '' && row[c.key] != null ? row[c.key] : '—'}
                              </span>
                            ) : (
                              <input type="number" min="0" max={c.max} placeholder="—"
                                value={row[c.key] ?? ''}
                                onChange={e => updateMark(sem, stu.id, c.key, e.target.value, c.max)}
                                className="sem-input"
                                style={row[c.key] !== '' && row[c.key] != null ? {color:gradeColor(Number(row[c.key])/c.max*100),fontWeight:700} : {}} />
                            )}
                          </div>
                        ))}
                        <div className="marks-col-total"><span style={{color:gradeColor(total),fontWeight:800}}>{total ?? '—'}</span></div>
                        <div className="marks-col-grade"><span className="sem-grade-badge" style={{background:gradeColor(total)+'18',color:gradeColor(total)}}>{gradeLabel(total)}</span></div>
                      </div>
                    )
                  })}
                </div>
              )}
              {!locked && !resLoading && myStudents.length > 0 && (
                <div className="gr-submit-row">
                  <div className="gr-submit-note">Once submitted, {label} marks cannot be edited.</div>
                  <button className="submit-btn" onClick={() => handleSubmitResults(sem)} disabled={resSaving}>
                    {resSaving ? 'Saving…' : `Submit ${label} Marks`}
                  </button>
                </div>
              )}
            </>
          )
        }

        return (
          <div className="dash-content page-enter">
            <div className="gr-header">
              <div>
                <h2 className="section-heading">Student Results — {teacherSubj}</h2>
                <p className="section-sub">
                  {myStudents.length} student{myStudents.length !== 1?'s':''} ·
                  Assignment /10 · Class Work /10 · Mid /30 · Final /50 · Total /100
                </p>
              </div>
            </div>

            {resError && <div style={{background:'#fee2e2',border:'1px solid #fca5a5',borderRadius:8,padding:'10px 16px',marginBottom:16,fontSize:13,color:'#991b1b'}}>{resError}</div>}
            {resOk    && <div style={{background:'#f0fdf4',border:'1px solid #86efac',borderRadius:8,padding:'10px 16px',marginBottom:16,fontSize:13,color:'#15803d',fontWeight:600}}>{resOk}</div>}

            {!subjObj && !resLoading && (
              <div style={{background:'#fff7ed',border:'1px solid #fdba74',borderRadius:8,padding:'10px 16px',marginBottom:16,fontSize:13,color:'#9a3412'}}>
                Subject "{teacherSubj}" not found in DB. Contact admin.
              </div>
            )}

            <div className="sem-tabs">
              {[{key:'sem1',label:'Semester 1'},{key:'sem2',label:'Semester 2'},{key:'final',label:'Final Result'}].map(tab => (
                <button key={tab.key} className={`sem-tab ${activeSem===tab.key?'sem-tab-active':''}`} onClick={() => setActiveSem(tab.key)}>
                  {tab.label}
                  {tab.key==='sem1' && sem1Locked && <span className="sem-tab-dot"/>}
                  {tab.key==='sem2' && sem2Locked && <span className="sem-tab-dot"/>}
                  {tab.key==='final' && sem1Locked && sem2Locked && <span className="sem-tab-dot"/>}
                </button>
              ))}
            </div>

            {activeSem === 'sem1' && renderSemTable('sem1')}
            {activeSem === 'sem2' && renderSemTable('sem2')}
            {activeSem === 'final' && (
              <div className="sem-final-wrap">
                {(!sem1Locked || !sem2Locked) && (
                  <div className="sem-final-notice">{!sem1Locked&&!sem2Locked?'Submit both semesters to see final results.':!sem1Locked?'Submit Semester 1 first.':'Submit Semester 2 first.'}</div>
                )}
                {sem1Locked && sem2Locked && (
                  <>
                    <div className="final-summary-header"><span>{teacherSubj} — Final Results</span><span className="final-summary-sub">AVG = (Sem1 + Sem2) ÷ 2</span></div>
                    <div className="marks-table-wrap">
                      <div className="marks-head final-marks-head">
                        <div className="marks-col-name">Student</div>
                        <div className="marks-col-total">Sem 1<span className="marks-col-sub">/100</span></div>
                        <div className="marks-col-total">Sem 2<span className="marks-col-sub">/100</span></div>
                        <div className="marks-col-total marks-col-avg">AVG<span className="marks-col-sub">/100</span></div>
                        <div className="marks-col-grade">Grade</div>
                      </div>
                      {myStudents.map(stu => {
                        const t1 = semTotal(sem1Marks[stu.id])
                        const t2 = semTotal(sem2Marks[stu.id])
                        const avg = (t1 != null && t2 != null) ? Math.round((t1+t2)/2) : null
                        return (
                          <div key={stu.id} className="marks-row final-marks-row">
                            <div className="marks-col-name marks-student"><div>{stu.full_name}</div><div style={{fontSize:11,color:'#94a3b8'}}>{stu.student_code}</div></div>
                            <div className="marks-col-total"><span style={{color:gradeColor(t1),fontWeight:600}}>{t1??'—'}</span></div>
                            <div className="marks-col-total"><span style={{color:gradeColor(t2),fontWeight:600}}>{t2??'—'}</span></div>
                            <div className="marks-col-total marks-col-avg"><span style={{color:gradeColor(avg),fontWeight:800,fontSize:'1.05rem'}}>{avg??'—'}</span></div>
                            <div className="marks-col-grade"><span className="sem-grade-badge" style={{background:gradeColor(avg)+'22',color:gradeColor(avg)}}>{gradeLabel(avg)}</span></div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )
      }

      // ════════════════════════════════════════════════════════════════
      case 'view':
        return (
          <div className="dash-content page-enter">
            <h2 className="section-heading">{t('viewSubmitted')}</h2>
            <div className="readonly-notice">{t('readOnly')}</div>
            <div className="view-sections">
              <div className="view-block">
                <h3>Attendance ({todayDate.toDateString()})</h3>
                {Object.keys(attMarks).length === 0 ? (
                  <p className="empty-msg">No attendance submitted yet.</p>
                ) : myStudents.map(s => (
                  <div key={s.id} className="view-row">
                    <span>{s.full_name}</span>
                    <span className={`att-badge att-${(attMarks[s.id]||'not marked').toLowerCase()}`}>{attMarks[s.id]||'Not Marked'}</span>
                  </div>
                ))}
              </div>
              <div className="view-block">
                <h3>Topics Submitted ({myTopicsDB.length})</h3>
                {myTopicsDB.length === 0 ? <p className="empty-msg">No topics submitted yet.</p>
                  : myTopicsDB.slice(0, 5).map(tp => (
                    <div key={tp.id} className="view-topic">
                      <strong>{tp.title}</strong>
                      <span style={{fontSize:11,color:'#94a3b8',marginLeft:8}}>{tp.date}</span>
                      {tp.description && <p>{tp.description}</p>}
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )

      // ════════════════════════════════════════════════════════════════
      case 'files':
        return (
          <div className="dash-content page-enter">
            <div className="rf-header">
              <h2 className="section-heading">📎 Received Files</h2>
              <span className="rf-count-badge">{myFiles.length} file{myFiles.length!==1?'s':''}</span>
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
                        <div className="rf-file-name">{f.file?.name||'Unnamed file'}</div>
                        <div className="rf-file-meta">
                          From: <strong>Manager</strong> · {f.permission==='view'?'👁️ View Only':'⬇️ Download Allowed'} ·
                          <span className={`rf-status rf-status-${f.status}`}>{f.status==='pending'?' ⏳ Pending':f.status==='accepted'?' ✅ Accepted':' ❌ Rejected'}</span>
                        </div>
                        {f.message && <div className="rf-message">"{f.message}"</div>}
                      </div>
                    </div>
                    <div className="rf-card-right">
                      {f.status==='pending' && (
                        <div className="rf-actions">
                          <button className="rf-accept" onClick={() => updateStatus(f.id,'accepted')}>✓ Accept</button>
                          <button className="rf-reject" onClick={() => updateStatus(f.id,'rejected')}>✕ Reject</button>
                        </div>
                      )}
                      {f.status==='accepted' && f.permission==='download' && <button className="rf-download">⬇️ Download</button>}
                      {f.status==='accepted' && f.permission==='view' && <span className="rf-view-only">👁️ View Only</span>}
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
