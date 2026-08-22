import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Sidebar from '../../components/Sidebar'
import { useFileStore } from '../../context/FileStore'
import TeacherProfile from '../../components/TeacherProfile'
import { useLang } from '../../context/LangContext'
import { useTeacherStore } from '../../context/TeacherStore'
import { usersAPI, settingsAPI, paymentsAPI, studentsAPI, teachersAPI, assistantsAPI, reportsAPI } from '../../api/index.js'
import './style.css'

// ── Fallback shapes while loading ─────────────────────────────────────────────
const EMPTY_STUDENTS   = []
const EMPTY_TEACHERS   = []
const EMPTY_ASSISTANTS = []

function AttachModal({ target, onClose, onSend }) {
  const fileRef = useRef()
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState('')
  const [permission, setPermission] = useState('view')
  const [sent, setSent] = useState(false)

  const handleSend = () => {
    if (!file) return
    onSend({ file, message, permission, target, status: 'pending', id: Date.now() })
    setSent(true)
    setTimeout(onClose, 1800)
  }

  return (
    <div className="af-overlay" onClick={onClose}>
      <div className="af-modal" onClick={e => e.stopPropagation()}>
        {sent ? (
          <div className="af-sent">
            <div className="af-sent-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="52" height="52">
                <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
              </svg>
            </div>
            <div className="af-sent-title">File Sent!</div>
            <div className="af-sent-sub">Pending acceptance by {target.name}</div>
          </div>
        ) : (
          <>
            <div className="af-modal-header">
              <div className="af-modal-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                </svg>
              </div>
              <div>
                <div className="af-modal-title">Attach File</div>
                <div className="af-modal-sub">Sending to <strong>{target.name}</strong> · {target.role || target.subject}</div>
              </div>
              <button className="af-close" onClick={onClose}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="af-modal-body">
              {/* File Upload */}
              <div className="af-field">
                <label>Select File</label>
                <div
                  className={`af-dropzone ${file ? 'has-file' : ''}`}
                  onClick={() => fileRef.current.click()}
                >
                  {file ? (
                    <div className="af-file-info">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="28" height="28" style={{color:'#7c3aed',flexShrink:0}}>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                      </svg>
                      <div>
                        <div className="af-file-name">{file.name}</div>
                        <div className="af-file-size">{(file.size / 1024).toFixed(1)} KB</div>
                      </div>
                      <button className="af-file-remove" onClick={e => { e.stopPropagation(); setFile(null) }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="12" height="12"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  ) : (
                    <div className="af-dropzone-empty">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36" style={{color:'#a78bfa'}}>
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                      </svg>
                      <span>Click to browse or drop file here</span>
                      <span className="af-dropzone-hint">PDF, DOCX, XLSX, PNG, JPG</span>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" style={{display:'none'}} onChange={e => setFile(e.target.files[0])} />
              </div>

              <div className="af-field">
                <label>Message (optional)</label>
                <textarea
                  placeholder="Add a note for the receiver..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="af-field">
                <label>Permission</label>
                <div className="af-perm-row">
                  <button className={`af-perm-btn ${permission === 'view' ? 'active' : ''}`} onClick={() => setPermission('view')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    View Only
                  </button>
                  <button className={`af-perm-btn ${permission === 'download' ? 'active' : ''}`} onClick={() => setPermission('download')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Download Allowed
                  </button>
                </div>
              </div>

              <div className="af-modal-actions">
                <button className="af-cancel" onClick={onClose}>Cancel</button>
                <button className="af-send" onClick={handleSend} disabled={!file}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  Send File
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function PendingFilesPanel({ files, onAction }) {
  if (!files.length) return null
  return (
    <div className="af-pending-panel">
      <div className="af-pending-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        Pending File Requests
      </div>
      {files.map(f => (
        <div key={f.id} className={`af-pending-item ${f.status}`}>
          <div className="af-pending-left">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="24" height="24" style={{color:'#7c3aed',flexShrink:0}}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            <div>
              <div className="af-pending-name">{f.file.name}</div>
              <div className="af-pending-meta">
                To: <strong>{f.target.name}</strong> · {f.permission === 'view' ? 'View Only' : 'Download'} ·
                <span className={`af-status-chip af-status-${f.status}`}> {f.status === 'pending' ? 'Pending' : f.status === 'accepted' ? 'Accepted' : 'Rejected'}</span>
              </div>
              {f.message && <div className="af-pending-msg">"{f.message}"</div>}
            </div>
          </div>
          {f.status === 'pending' && (
            <div className="af-pending-actions">
              <button className="af-accept" onClick={() => onAction(f.id, 'accepted')}>Accept</button>
              <button className="af-reject" onClick={() => onAction(f.id, 'rejected')}>Reject</button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function Stars({ rating }) {
  return (
    <div className="teacher-rating">
      <span className="rating-stars">{Array.from({length:5},(_,i)=>i<Math.floor(rating)?'★':'☆').join('')}</span>
      <span className="rating-val">{rating} / 5.0</span>
    </div>
  )
}

function StudentModal({ student, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e=>e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div className="modal-profile">
          <img src={student.img} alt={student.name} className="modal-avatar" style={{borderColor:'#0891b2'}} />
          <div className="modal-profile-info">
            <h2>{student.name}</h2>
            <div className="modal-meta-row">
              <span className="modal-id-tag">{student.id}</span>
              <span className="modal-grade-tag">{student.grade}</span>
              <span className={`modal-status ${student.status==='Active'?'active':''}`}>{student.status}</span>
            </div>
            <div className="modal-contact">
              <span>{student.email}</span>
              <span>{student.phone}</span>
              <span>Age {student.age} · {student.gender}</span>
            </div>
          </div>
        </div>
        <div className="modal-stats-row">
          <div className="modal-stat-box" style={{'--mc':'#0891b2'}}><div className="modal-stat-val">{student.avg}</div><div className="modal-stat-lbl">Avg Score</div></div>
          <div className="modal-stat-box" style={{'--mc':'#d97706'}}><div className="modal-stat-val">#{student.rank}</div><div className="modal-stat-lbl">Class Rank</div></div>
          <div className="modal-stat-box" style={{'--mc':'#16a34a'}}><div className="modal-stat-val">{student.attendance}</div><div className="modal-stat-lbl">Attendance</div></div>
        </div>
        <div className="modal-section">
          <div className="modal-section-title">Subject Grades</div>
          <div className="modal-subjects">
            {student.subjects.map(s=>(
              <div key={s.name} className="modal-subject-row">
                <span className="modal-subj-name">{s.name}</span>
                <div className="modal-bar-wrap"><div className="modal-bar" style={{width:`${s.score}%`}} /></div>
                <span className="modal-subj-score">{s.score}%</span>
                <span className={`modal-grade-badge grade-${s.grade.replace('+','p').replace('-','m')}`}>{s.grade}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-section">
          <div className="modal-section-title">Performance History</div>
          <div className="modal-history">
            {student.history.map(h=>(
              <div key={h.term} className="modal-history-row">
                <span className="modal-hist-term">{h.term}</span>
                <span className="modal-hist-avg">{h.avg}</span>
                <span className="modal-hist-rank">Rank #{h.rank}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function TeacherModal({ teacher, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e=>e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div className="modal-profile">
          <img src={teacher.img} alt={teacher.name} className="modal-avatar" style={{borderColor:'#1a73e8'}} />
          <div className="modal-profile-info">
            <h2>{teacher.name}</h2>
            <div className="modal-meta-row">
              <span className="modal-id-tag">{teacher.id}</span>
              <span className="modal-grade-tag" style={{background:'#dbeafe',color:'#1e40af'}}>{teacher.subject}</span>
              <span className={`modal-status ${teacher.status==='Active'?'active':''}`}>{teacher.status}</span>
            </div>
            <div className="modal-contact">
              <span>{teacher.email}</span>
              <span>{teacher.phone}</span>
              <span>Age {teacher.age} · {teacher.gender} · {teacher.experience}</span>
              <span>{teacher.department}</span>
            </div>
            <Stars rating={teacher.rating} />
          </div>
        </div>
        <div className="modal-stats-row">
          <div className="modal-stat-box" style={{'--mc':'#1a73e8'}}><div className="modal-stat-val">{teacher.attendance}</div><div className="modal-stat-lbl">Attendance</div></div>
          <div className="modal-stat-box" style={{'--mc':'#00c896'}}><div className="modal-stat-val">{teacher.tasksCompleted}</div><div className="modal-stat-lbl">Tasks Done</div></div>
          <div className="modal-stat-box" style={{'--mc':'#d97706'}}><div className="modal-stat-val">{teacher.classes.length}</div><div className="modal-stat-lbl">Classes</div></div>
        </div>
        <div className="modal-section">
          <div className="modal-section-title">Assigned Classes</div>
          <div className="teacher-classes">{teacher.classes.map(c=><span key={c} className="teacher-class-chip">{c}</span>)}</div>
        </div>
        <div className="modal-section">
          <div className="modal-section-title">Subject Performance</div>
          <div className="modal-subjects">
            {teacher.subjects.map(s=>(
              <div key={s.name} className="modal-subject-row">
                <span className="modal-subj-name">{s.name}</span>
                <div className="modal-bar-wrap"><div className="modal-bar" style={{width:`${s.score}%`,background:'linear-gradient(90deg,#1a73e8,#60a5fa)'}} /></div>
                <span className="modal-subj-score">{s.score}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-section">
          <div className="modal-section-title">Term History</div>
          <div className="modal-history">
            {teacher.history.map(h=>(
              <div key={h.term} className="modal-history-row">
                <span className="modal-hist-term">{h.term}</span>
                <span className="modal-hist-avg" style={{color:'#1a73e8'}}>Att: {h.attendance}</span>
                <span className="modal-hist-rank">Tasks: {h.tasks}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function AssistantModal({ assistant, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e=>e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div className="modal-profile">
          <img src={assistant.img} alt={assistant.name} className="modal-avatar" style={{borderColor:'#7c3aed'}} />
          <div className="modal-profile-info">
            <h2>{assistant.name}</h2>
            <div className="modal-meta-row">
              <span className="modal-id-tag">{assistant.id}</span>
              <span className="modal-grade-tag" style={{background:'#ede9fe',color:'#7c3aed'}}>{assistant.role}</span>
              <span className="modal-status active">{assistant.status}</span>
            </div>
            <div className="modal-contact">
              <span>{assistant.email}</span>
              <span>{assistant.phone}</span>
              <span>Age {assistant.age} · {assistant.gender} · {assistant.experience}</span>
              <span>{assistant.department}</span>
            </div>
            <Stars rating={assistant.rating} />
          </div>
        </div>
        <div className="modal-stats-row">
          <div className="modal-stat-box" style={{'--mc':'#7c3aed'}}><div className="modal-stat-val">{assistant.attendance}</div><div className="modal-stat-lbl">Attendance</div></div>
          <div className="modal-stat-box" style={{'--mc':'#00c896'}}><div className="modal-stat-val">{assistant.tasksCompleted}</div><div className="modal-stat-lbl">Tasks Done</div></div>
          <div className="modal-stat-box" style={{'--mc':'#d97706'}}><div className="modal-stat-val">{assistant.responsibilities.length}</div><div className="modal-stat-lbl">Duties</div></div>
        </div>
        <div className="modal-section">
          <div className="modal-section-title">Responsibilities</div>
          <div className="teacher-classes">{assistant.responsibilities.map(r=><span key={r} className="asst-duty-chip">{r}</span>)}</div>
        </div>
        <div className="modal-section">
          <div className="modal-section-title">Term History</div>
          <div className="modal-history">
            {assistant.history.map(h=>(
              <div key={h.term} className="modal-history-row">
                <span className="modal-hist-term">{h.term}</span>
                <span className="modal-hist-avg" style={{color:'#7c3aed'}}>Att: {h.attendance}</span>
                <span className="modal-hist-rank">Tasks: {h.tasks}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Field component defined OUTSIDE PaymentStatusPanel to prevent focus loss on re-render
function PsField({ label, am, name, type = 'text', placeholder, form, errors, setForm, setErrors, children }) {
  return (
    <div className="ps-field">
      <label className="ps-label">{am} <span className="ps-label-en">/ {label}</span></label>
      {children || (
        <input
          type={type}
          className={`ps-input ${errors[name] ? 'ps-input-err' : ''}`}
          placeholder={placeholder}
          value={form[name]}
          onChange={e => { setForm(p => ({ ...p, [name]: e.target.value })); setErrors(p => ({ ...p, [name]: '' })) }}
        />
      )}
      {errors[name] && <div className="ps-err">{errors[name]}</div>}
    </div>
  )
}

function PaymentStatusPanel({ onStudentRegistered }) {
  const [payments,    setPayments]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [loadError,   setLoadError]   = useState('')
  const [search,      setSearch]      = useState('')
  const [filter,      setFilter]      = useState('all')
  const [showModal,   setShowModal]   = useState(false)
  const [success,     setSuccess]     = useState(false)
  const [submitting,  setSubmitting]  = useState(false)
  const [allStudents, setAllStudents] = useState([])
  const [modalMode,   setModalMode]   = useState('existing') // 'existing' | 'new'

  // Payment form (for existing student)
  const EMPTY_PAY = { student_id:'', amount:'', isPaid:'false' }
  const [form,   setForm]   = useState(EMPTY_PAY)
  const [errors, setErrors] = useState({})

  // New student form
  const EMPTY_STU = { full_name:'', full_name_am:'', student_code:'', grade:'KG 1', age:'', gender:'Male', phone:'', email:'', national_id:'', photo:null, photoPreview:null, amount:'', isPaid:'false' }
  const [newStuForm,   setNewStuForm]   = useState(EMPTY_STU)
  const [newStuErrors, setNewStuErrors] = useState({})

  const loadPayments = useCallback(async () => {
    setLoading(true); setLoadError('')
    try {
      const data = await paymentsAPI.getAll()
      setPayments(data.map(p => ({
        _id:      p.student_code || ('S' + String(p.student_id).padStart(3,'0')),
        dbId:     p.id,
        name:     p.full_name || '',
        am:       p.full_name_am || p.full_name || '',
        age:      p.age || '—',
        grade:    p.grade,
        phone:    p.phone || '—',
        amount:   Number(p.amount),
        isPaid:   Boolean(p.is_paid),
        paidDate: p.paid_date || null,
        avatar:   p.avatar_url || null,
      })))
    } catch (e) {
      setLoadError('Could not load payments — is the backend running?')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { loadPayments() }, [loadPayments])
  useEffect(() => { studentsAPI.getAll().then(setAllStudents).catch(() => {}) }, [])

  const getAvatar = (s) => {
    if (s?.avatar) return s.avatar
    const n = Number(String(s?._id||'').replace(/\D/g,'')) || 1
    return `https://i.pravatar.cc/80?img=${(n % 70) + 1}`
  }
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'}) : '—'
  const fmtAmt  = (a) => a ? `${Number(a).toLocaleString()} ETB` : '—'

  const filtered = useMemo(() => payments.filter(s => {
    const q = search.trim().toLowerCase()
    const matchQ = !q || s.name.toLowerCase().includes(q) || s.am.includes(q) || s._id.toLowerCase().includes(q)
    const matchF = filter === 'all' || (filter === 'paid' && s.isPaid) || (filter === 'notPaid' && !s.isPaid)
    return matchQ && matchF
  }), [payments, search, filter])

  const stats = useMemo(() => ({
    total:     payments.length,
    paid:      payments.filter(s => s.isPaid).length,
    notPaid:   payments.filter(s => !s.isPaid).length,
    collected: payments.filter(s => s.isPaid).reduce((a,s) => a + s.amount, 0),
  }), [payments])

  // Toggle paid/unpaid via real backend
  const togglePaid = async (dbId) => {
    try {
      const updated = await paymentsAPI.toggle(dbId)
      setPayments(prev => prev.map(p =>
        p.dbId === dbId
          ? { ...p, isPaid: Boolean(updated.is_paid), paidDate: updated.paid_date || null }
          : p
      ))
    } catch (e) { alert('Update failed: ' + e.message) }
  }

  const closeModal = () => {
    setShowModal(false); setForm(EMPTY_PAY); setNewStuForm(EMPTY_STU)
    setErrors({}); setNewStuErrors({}); setModalMode('existing')
  }

  const validate = () => {
    const e = {}
    if (!form.student_id)                                                         e.student_id = 'Select a student'
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)   e.amount = 'Valid amount required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateNew = () => {
    const e = {}
    if (!newStuForm.full_name.trim())   e.full_name    = 'Full name is required'
    if (!newStuForm.student_code.trim()) e.student_code = 'Student code is required'
    if (!newStuForm.grade.trim())        e.grade        = 'Grade is required'
    if (!newStuForm.amount || isNaN(Number(newStuForm.amount)) || Number(newStuForm.amount) <= 0)
                                         e.amount       = 'Valid amount required'
    setNewStuErrors(e)
    return Object.keys(e).length === 0
  }

  // Submit payment for existing student
  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    try {
      await paymentsAPI.create({
        student_id: Number(form.student_id),
        amount:     Number(form.amount),
        is_paid:    form.isPaid === 'true',
        term:       'Term 1 2026',
      })
      setForm(EMPTY_PAY); setErrors({})
      setSuccess(true)
      await loadPayments()
      setTimeout(() => { setSuccess(false); closeModal() }, 1800)
    } catch (e) {
      setErrors({ student_id: e.message })
    } finally { setSubmitting(false) }
  }

  // Register new student + create their payment
  const handleSubmitNew = async () => {
    if (!validateNew()) return
    setSubmitting(true)
    try {
      // 1. Create the student
      const newStudent = await studentsAPI.create({
        student_code: newStuForm.student_code.trim(),
        full_name:    newStuForm.full_name.trim(),
        full_name_am: newStuForm.full_name_am.trim() || null,
        grade:        newStuForm.grade,
        age:          newStuForm.age ? Number(newStuForm.age) : null,
        gender:       newStuForm.gender || null,
        phone:        newStuForm.phone.trim() || null,
        email:        newStuForm.email.trim() || null,
        national_id:  newStuForm.national_id.trim() || null,
        avatar_url:   newStuForm.photo || null,
        status:       'Active',
      })
      // 2. Create their payment record
      await paymentsAPI.create({
        student_id: newStudent.id,
        amount:     Number(newStuForm.amount),
        is_paid:    newStuForm.isPaid === 'true',
        term:       'Term 1 2026',
      })
      // 3. Refresh lists
      setAllStudents(prev => [...prev, newStudent])
      setNewStuForm(EMPTY_STU); setNewStuErrors({})
      setSuccess(true)
      await loadPayments()
      if (onStudentRegistered) onStudentRegistered() // refresh parent student list
      setTimeout(() => { setSuccess(false); closeModal() }, 1800)
    } catch (e) {
      setNewStuErrors({ full_name: e.message || 'Failed to register student' })
    } finally { setSubmitting(false) }
  }

  return (
    <div className="ps-wrap">
      {/* Error banner */}
      {loadError && (
        <div style={{background:'#fee2e2',border:'1px solid #fca5a5',borderRadius:8,padding:'10px 16px',marginBottom:16,fontSize:13,color:'#991b1b'}}>
          {loadError}
        </div>
      )}
      {/* Stats row */}
      <div className="ps-stats">
        <div className="ps-stat"><div className="ps-stat-val">{loading ? '…' : stats.total}</div><div className="ps-stat-lbl">ጠቅላላ / Total</div></div>
        <div className="ps-stat ps-stat-green"><div className="ps-stat-val">{loading ? '…' : stats.paid}</div><div className="ps-stat-lbl">ከፍለዋል / Paid</div></div>
        <div className="ps-stat ps-stat-red"><div className="ps-stat-val">{loading ? '…' : stats.notPaid}</div><div className="ps-stat-lbl">አልከፈሉም / Unpaid</div></div>
        <div className="ps-stat ps-stat-blue"><div className="ps-stat-val">{loading ? '…' : `${stats.collected.toLocaleString()} ETB`}</div><div className="ps-stat-lbl">የተሰበሰበ / Collected</div></div>
      </div>

      {/* Toolbar */}
      <div className="ps-toolbar">
        <div className="ps-search-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input className="ps-search" placeholder="ስም ፈልግ / Search…" value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <select className="ps-filter" value={filter} onChange={e=>setFilter(e.target.value)}>
          <option value="all">ሁሉም / All</option>
          <option value="paid">ከፍለዋል / Paid</option>
          <option value="notPaid">አልከፈሉም / Not Paid</option>
        </select>
        <button className="ps-add-btn" onClick={()=>setShowModal(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          አዲስ ተማሪ / Add Student
        </button>
      </div>

      {/* Table */}
      <div className="ps-table-wrap">
        <table className="ps-table">
          <thead>
            <tr>
              <th>ስም / Name</th>
              <th>እድሜ / Age</th>
              <th>ደረጃ / Grade</th>
              <th>የወላጅ ስልክ / Phone</th>
              <th>መጠን / Amount</th>
              <th>የክፍያ ሁኔታ / Status</th>
              <th>ቀን / Date</th>
              <th>እርምጃ / Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={8} className="ps-empty" style={{padding:32,textAlign:'center'}}>
                <svg style={{display:'block',margin:'0 auto 8px',animation:'loginSpin 0.8s linear infinite'}} viewBox="0 0 24 24" fill="none" stroke="#1a73e8" strokeWidth="2.5" strokeLinecap="round" width="28" height="28">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                Loading from database…
              </td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={8} className="ps-empty">ምንም ተማሪ አልተገኘም / No students found</td></tr>
            )}
            {!loading && filtered.map((s, ri) => (
              <tr key={s.dbId || s._id} className={ri % 2 === 1 ? 'ps-tr-alt' : ''}>
                <td className="ps-td-name">
                  <img src={getAvatar(s)} alt={s.name} className="ps-avatar" />
                  <div>
                    <div className="ps-name">{s.name}</div>
                    <div className="ps-id">{s._id}</div>
                  </div>
                </td>
                <td className="ps-td-center">{s.age}</td>
                <td className="ps-td-center">{s.grade}</td>
                <td className="ps-td-phone">{s.phone}</td>
                <td className="ps-td-center ps-amount">{fmtAmt(s.amount)}</td>
                <td className="ps-td-center">
                  <span className={`ps-badge ${s.isPaid ? 'ps-badge-paid' : 'ps-badge-unpaid'}`}>
                    {s.isPaid ? '✓ ከፍለዋል / Paid' : '✗ አልከፈሉም / Not Paid'}
                  </span>
                </td>
                <td className="ps-td-center ps-date">{fmtDate(s.paidDate)}</td>
                <td className="ps-td-center">
                  <button className={`ps-toggle-btn ${s.isPaid ? 'ps-toggle-unpaid' : 'ps-toggle-paid'}`} onClick={() => togglePaid(s.dbId)}>
                    {s.isPaid ? 'Mark Unpaid' : 'Mark Paid'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Student / Payment Modal */}
      {showModal && (
        <div className="ps-overlay" onClick={closeModal}>
          <div className="ps-modal" style={{maxWidth:520,width:'94%'}} onClick={e=>e.stopPropagation()}>
            {success ? (
              <div className="ps-success">
                <div className="ps-success-icon">✓</div>
                <div className="ps-success-title">ተማሪ ተመዝግቧል!</div>
                <div className="ps-success-sub">Student registered successfully</div>
              </div>
            ) : (
              <>
                {/* Modal header */}
                <div className="ps-modal-header">
                  <div>
                    <div className="ps-modal-title">አዲስ ተማሪ / New Student</div>
                    <div className="ps-modal-sub">Register a student and record their payment</div>
                  </div>
                  <button className="ps-modal-close" onClick={closeModal}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>

                {/* Mode toggle */}
                <div style={{display:'flex',gap:0,margin:'0 0 18px',border:'1.5px solid #e2e8f0',borderRadius:10,overflow:'hidden'}}>
                  <button
                    onClick={() => setModalMode('existing')}
                    style={{flex:1,padding:'10px',fontSize:13,fontWeight:700,border:'none',cursor:'pointer',
                      background: modalMode==='existing' ? '#1a73e8' : '#f8fafc',
                      color:      modalMode==='existing' ? '#fff' : '#64748b',
                      transition:'all 0.15s'}}>
                    📋 Existing Student
                  </button>
                  <button
                    onClick={() => setModalMode('new')}
                    style={{flex:1,padding:'10px',fontSize:13,fontWeight:700,border:'none',cursor:'pointer',
                      background: modalMode==='new' ? '#16a34a' : '#f8fafc',
                      color:      modalMode==='new' ? '#fff' : '#64748b',
                      borderLeft:'1.5px solid #e2e8f0',
                      transition:'all 0.15s'}}>
                    ➕ New Student
                  </button>
                </div>

                <div className="ps-modal-body">
                  {/* ── Mode 1: existing student dropdown ── */}
                  {modalMode === 'existing' && (
                    <div className="ps-form-grid">
                      <PsField label="Student" am="ተማሪ" name="student_id" form={form} errors={errors} setForm={setForm} setErrors={setErrors}>
                        <select
                          className={`ps-input ${errors.student_id ? 'ps-input-err' : ''}`}
                          value={form.student_id}
                          onChange={e => {
                            const sid = e.target.value
                            const stu = allStudents.find(s => String(s.id) === sid)
                            const amtMap = { 'KG 1':800, 'KG 2':800, 'KG 3':800 }
                            setForm(p => ({ ...p, student_id:sid, amount: stu ? String(amtMap[stu.grade]||1500) : p.amount }))
                            setErrors(p => ({ ...p, student_id:'' }))
                          }}>
                          <option value="">— Select student —</option>
                          {allStudents.map(s => (
                            <option key={s.id} value={s.id}>{s.student_code} · {s.full_name} ({s.grade})</option>
                          ))}
                        </select>
                      </PsField>
                      <PsField label="Amount (ETB)" am="መጠን" name="amount" type="number" placeholder="e.g. 1500" form={form} errors={errors} setForm={setForm} setErrors={setErrors} />
                      <PsField label="Payment Status" am="የክፍያ ሁኔታ" name="isPaid" form={form} errors={errors} setForm={setForm} setErrors={setErrors}>
                        <select className="ps-input" value={form.isPaid} onChange={e=>setForm(p=>({...p,isPaid:e.target.value}))}>
                          <option value="false">✗ አልከፈሉም / Not Paid</option>
                          <option value="true">✓ ከፍለዋል / Paid</option>
                        </select>
                      </PsField>
                    </div>
                  )}

                  {/* ── Mode 2: register brand new student ── */}
                  {modalMode === 'new' && (
                    <div className="ps-form-grid">
                      {/* Student info fields */}
                      <PsField label="Full Name (English)" am="ሙሉ ስም" name="full_name" placeholder="e.g. Ali Hassan" form={newStuForm} errors={newStuErrors}
                        setForm={setNewStuForm} setErrors={setNewStuErrors} />
                      <PsField label="Full Name (Amharic)" am="ሙሉ ስም (አማርኛ)" name="full_name_am" placeholder="e.g. አሊ ሃሰን" form={newStuForm} errors={newStuErrors}
                        setForm={setNewStuForm} setErrors={setNewStuErrors} />
                      <PsField label="Student Code" am="የተማሪ ኮድ" name="student_code" placeholder="e.g. S011" form={newStuForm} errors={newStuErrors}
                        setForm={setNewStuForm} setErrors={setNewStuErrors} />
                      <PsField label="Grade" am="ደረጃ" name="grade" form={newStuForm} errors={newStuErrors} setForm={setNewStuForm} setErrors={setNewStuErrors}>
                        <select className={`ps-input ${newStuErrors.grade?'ps-input-err':''}`} value={newStuForm.grade}
                          onChange={e => {
                            const g = e.target.value
                            const amtMap = {'KG 1':800,'KG 2':800,'KG 3':800}
                            setNewStuForm(p=>({...p, grade:g, amount:String(amtMap[g]||800)}))
                            setNewStuErrors(p=>({...p,grade:''}))
                          }}>
                          <option value="KG 1">KG 1</option>
                          <option value="KG 2">KG 2</option>
                          <option value="KG 3">KG 3</option>
                        </select>
                      </PsField>
                      <PsField label="Age" am="እድሜ" name="age" type="number" placeholder="e.g. 14" form={newStuForm} errors={newStuErrors}
                        setForm={setNewStuForm} setErrors={setNewStuErrors} />
                      <PsField label="Gender" am="ጾታ" name="gender" form={newStuForm} errors={newStuErrors} setForm={setNewStuForm} setErrors={setNewStuErrors}>
                        <select className="ps-input" value={newStuForm.gender}
                          onChange={e=>setNewStuForm(p=>({...p,gender:e.target.value}))}>
                          <option value="Male">Male / ወንድ</option>
                          <option value="Female">Female / ሴት</option>
                        </select>
                      </PsField>
                      <PsField label="Phone" am="ስልክ" name="phone" placeholder="+251911…" form={newStuForm} errors={newStuErrors}
                        setForm={setNewStuForm} setErrors={setNewStuErrors} />
                      <PsField label="Email (optional)" am="ኢሜይል" name="email" placeholder="student@email.com" form={newStuForm} errors={newStuErrors}
                        setForm={setNewStuForm} setErrors={setNewStuErrors} />
                      <PsField label="National ID" am="የብሔራዊ መታወቂያ ቁጥር" name="national_id" placeholder="e.g. ETH-123456789" form={newStuForm} errors={newStuErrors}
                        setForm={setNewStuForm} setErrors={setNewStuErrors} />
                      {/* Photo upload */}
                      <div style={{gridColumn:'1/-1'}}>
                        <label style={{display:'block',fontSize:12,fontWeight:600,color:'#374151',marginBottom:6}}>
                          ፎቶ / Student Photo <span style={{color:'#9ca3af',fontWeight:400}}>(optional)</span>
                        </label>
                        <div style={{display:'flex',alignItems:'center',gap:14}}>
                          {/* Preview circle */}
                          <div style={{
                            width:72,height:72,borderRadius:'50%',border:'2px dashed #d1d5db',
                            background:'#f9fafb',display:'flex',alignItems:'center',justifyContent:'center',
                            overflow:'hidden',flexShrink:0
                          }}>
                            {newStuForm.photoPreview
                              ? <img src={newStuForm.photoPreview} alt="preview" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                              : <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" width="28" height="28"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                            }
                          </div>
                          <div style={{flex:1}}>
                            <label style={{
                              display:'inline-flex',alignItems:'center',gap:6,
                              padding:'8px 14px',borderRadius:7,border:'1.5px solid #d1d5db',
                              background:'#fff',cursor:'pointer',fontSize:12,fontWeight:600,color:'#374151'
                            }}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                              {newStuForm.photoPreview ? 'Change Photo' : 'Upload Photo'}
                              <input
                                type="file"
                                accept="image/*"
                                style={{display:'none'}}
                                onChange={e => {
                                  const file = e.target.files?.[0]
                                  if (!file) return
                                  const reader = new FileReader()
                                  reader.onload = ev => setNewStuForm(p => ({
                                    ...p,
                                    photo: ev.target.result,
                                    photoPreview: ev.target.result
                                  }))
                                  reader.readAsDataURL(file)
                                }}
                              />
                            </label>
                            {newStuForm.photoPreview && (
                              <button
                                type="button"
                                onClick={() => setNewStuForm(p => ({...p, photo:null, photoPreview:null}))}
                                style={{marginLeft:8,fontSize:11,color:'#ef4444',background:'none',border:'none',cursor:'pointer',textDecoration:'underline'}}>
                                Remove
                              </button>
                            )}
                            <div style={{fontSize:11,color:'#9ca3af',marginTop:4}}>JPG, PNG or WebP · max 2 MB</div>
                          </div>
                        </div>
                      </div>
                      {/* Payment fields */}
                      <div style={{gridColumn:'1/-1',borderTop:'1.5px dashed #e2e8f0',paddingTop:12,marginTop:4}}>
                        <div style={{fontSize:11,fontWeight:700,color:'#16a34a',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:10}}>
                          💳 Payment Details
                        </div>
                        <div className="ps-form-grid" style={{margin:0}}>
                          <PsField label="Amount (ETB)" am="መጠን" name="amount" type="number" placeholder="e.g. 1500" form={newStuForm} errors={newStuErrors}
                            setForm={setNewStuForm} setErrors={setNewStuErrors} />
                          <PsField label="Payment Status" am="የክፍያ ሁኔታ" name="isPaid" form={newStuForm} errors={newStuErrors} setForm={setNewStuForm} setErrors={setNewStuErrors}>
                            <select className="ps-input" value={newStuForm.isPaid}
                              onChange={e=>setNewStuForm(p=>({...p,isPaid:e.target.value}))}>
                              <option value="false">✗ አልከፈሉም / Not Paid</option>
                              <option value="true">✓ ከፍለዋል / Paid</option>
                            </select>
                          </PsField>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="ps-modal-footer">
                  <button className="ps-cancel-btn" onClick={closeModal}>ሰርዝ / Cancel</button>
                  <button
                    className="ps-submit-btn"
                    style={{background: modalMode==='new' ? 'linear-gradient(135deg,#16a34a,#15803d)' : undefined}}
                    onClick={modalMode==='existing' ? handleSubmit : handleSubmitNew}
                    disabled={submitting}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
                    {submitting ? 'Saving…' : modalMode==='new' ? 'Register & Save / ምዝገባ' : 'አስቀምጥ / Save'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ManagerDashboard() {
  const [active, setActive] = useState('overview')
  const [mobileOpen, setMobileOpen] = useState(false)
  const { t } = useLang()
  const { sem1Data, sem2Data, sem1Submitted, sem2Submitted } = useTeacherStore()

  // ── Live data from DB ─────────────────────────────────────────────────────
  const [students,   setStudents]   = useState(EMPTY_STUDENTS)
  const [teachers,   setTeachers]   = useState(EMPTY_TEACHERS)
  const [assistants, setAssistants] = useState(EMPTY_ASSISTANTS)
  const [dataLoading, setDataLoading] = useState(true)

  // Normalizers: DB fields → UI shape
  const normalizeStudent = (s) => {
    const n = Number(String(s.student_code||'').replace(/\D/g,''))||1
    return { ...s, id: s.student_code||('S'+String(s.id).padStart(3,'0')), dbId:s.id,
      name:s.full_name, img:`https://i.pravatar.cc/120?img=${(n%70)+1}`,
      avg:'—', rank:'—', attendance:'—', subjects:[], history:[] }
  }
  const normalizeTeacher = (t) => {
    const n = Number(String(t.teacher_code||'').replace(/\D/g,''))||1
    return { ...t, id:t.teacher_code||('T'+String(t.id).padStart(3,'0')), dbId:t.id,
      name:t.full_name, img:`https://i.pravatar.cc/120?img=${(n%70)+1}`,
      subject:t.subject, department:t.department||'—',
      attendance:t.attendance_pct||'—', tasksCompleted:t.tasks_completed_pct||'—',
      currentTopic:t.current_topic||'—', classes:t.classes||[], subjects:[], history:[] }
  }
  const normalizeAssistant = (a) => {
    const n = Number(String(a.assistant_code||'').replace(/\D/g,''))||1
    return { ...a, id:a.assistant_code||('A'+String(a.id).padStart(3,'0')), dbId:a.id,
      name:a.full_name, img:`https://i.pravatar.cc/120?img=${(n%70)+1}`,
      role:a.role_title||'Assistant', attendance:'—', tasksCompleted:'—',
      responsibilities:a.responsibilities||[], history:[] }
  }

  const reloadStudents = useCallback(async () => {
    try { const d = await studentsAPI.getAll(); setStudents((d||[]).map(normalizeStudent)) } catch {}
  }, [])

  useEffect(() => {
    setDataLoading(true)
    Promise.all([
      studentsAPI.getAll().then(d   => setStudents((d||[]).map(normalizeStudent))).catch(()=>{}),
      teachersAPI.getAll().then(d   => setTeachers((d||[]).map(normalizeTeacher))).catch(()=>{}),
      assistantsAPI.getAll().then(d => setAssistants((d||[]).map(normalizeAssistant))).catch(()=>{}),
    ]).finally(() => setDataLoading(false))
  }, [])

  const sidebarItems = [
    { id: 'overview',       icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>, label: t('overview') },
    { id: 'students',       icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, label: t('students') },
    { id: 'teachers',       icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a8.38 8.38 0 0 1 13 0"/><path d="M17 11l3-1.5v5"/><line x1="17" y1="14.5" x2="20" y2="14.5"/></svg>, label: t('teachers') },
    { id: 'assistants',     icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="14" x2="10" y2="14"/><line x1="14" y1="14" x2="16" y2="14"/></svg>, label: t('assistants') },
    { id: 'tasks',          icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>, label: t('assignTasks') },
    { id: 'results',        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>, label: t('studentResultsLabel') },
    { id: 'payment-status', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>, label: 'Payment Status' },
    { id: 'reports',        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>, label: t('reports') },
    { id: 'settings',       icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>, label: 'Settings' },
  ]
  const [resTerm, setResTerm] = useState('sem1')
  const [resSearch, setResSearch] = useState('')
  const [resExpanded, setResExpanded] = useState({})
  const [xlsSem, setXlsSem] = useState('')
  const [xlsError, setXlsError] = useState('')
  const [xlsLoading, setXlsLoading] = useState(false)
  const [taskForm, setTaskForm] = useState({ assignee:'', task:'', due:'' })
  const [tasks, setTasks] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [profileTeacher, setProfileTeacher] = useState(null)
  const [selectedAssistant, setSelectedAssistant] = useState(null)
  const [attachTarget, setAttachTarget] = useState(null)
  const [roleFilter, setRoleFilter] = useState('all')
  const { files: pendingFiles, sendFile, updateStatus } = useFileStore()

  const handleSendFile = (fileData) => sendFile(fileData)
  const handleFileAction = (id, status) => updateStatus(id, status)
  const [studentSearch, setStudentSearch] = useState('')

  const addTask = () => {
    if (taskForm.assignee && taskForm.task) {
      setTasks([...tasks, { ...taskForm, id: Date.now() }])
      setTaskForm({ assignee:'', task:'', due:'' })
    }
  }

  const renderContent = () => {
    switch (active) {
      case 'overview': return (
        <div className="dash-content page-enter">

          {/* Hero Banner */}
          <div className="ov-hero">
            <div className="ov-hero-orbs">
              <div className="ov-orb ov-orb-1" />
              <div className="ov-orb ov-orb-2" />
              <div className="ov-orb ov-orb-3" />
            </div>
            <div className="ov-hero-content">
              <div className="ov-hero-left">
                <div className="ov-hero-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  Manager Portal
                </div>
                <h1 className="ov-hero-title">Manager Dashboard</h1>
                <p className="ov-hero-sub">Manage students, staff and academic data</p>
                <div className="ov-hero-date">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  {new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}
                </div>
              </div>
              <div className="ov-hero-right">
                <div className="ov-hero-stat"><span>248</span>Students</div>
                <div className="ov-hero-divider" />
                <div className="ov-hero-stat"><span>18</span>Teachers</div>
                <div className="ov-hero-divider" />
                <div className="ov-hero-stat"><span>83%</span>Performance</div>
              </div>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="ov-stats-grid">
            {[
              {
                sc:'#0891b2', g1:'#0891b2', g2:'#06b6d4', label:'Total Students', value:'248', trend:'+12 this term',
                pts:[200,215,220,230,240,248],
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              },
              {
                sc:'#7c3aed', g1:'#7c3aed', g2:'#a78bfa', label:'Teachers', value:'18', trend:null,
                pts:[14,15,16,16,17,18],
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a8.38 8.38 0 0 1 13 0"/><path d="M17 11l3-1.5v5"/><line x1="17" y1="14.5" x2="20" y2="14.5"/></svg>
              },
              {
                sc:'#0d9488', g1:'#0d9488', g2:'#2dd4bf', label:'Assistants', value:'6', trend:null,
                pts:[4,4,5,5,6,6],
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="14" x2="10" y2="14"/><line x1="14" y1="14" x2="16" y2="14"/></svg>
              },
              {
                sc:'#d97706', g1:'#d97706', g2:'#fbbf24', label:'Avg Performance', value:'83%', trend:'+2%',
                pts:[72,75,78,80,83,87],
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              },
            ].map(s => {
              const max = Math.max(...s.pts), min = Math.min(...s.pts)
              return (
                <div key={s.label} className="ov-stat-card" style={{'--sc':s.sc,'--g1':s.g1,'--g2':s.g2}}>
                  <div className="ov-stat-glow" />
                  <div className="ov-stat-top">
                    <div className="ov-stat-icon-box" style={{background:`linear-gradient(135deg,${s.g1},${s.g2})`}}>{s.icon}</div>
                    <div className="ov-stat-info">
                      <div className="ov-stat-value">{s.value}</div>
                      <div className="ov-stat-label">{s.label}</div>
                      {s.trend && <div className="ov-stat-trend">↑ {s.trend}</div>}
                    </div>
                  </div>
                  <div className="ov-stat-footer">
                    <div className="ov-seg-track">
                      {s.pts.map((v,i) => {
                        const pct = Math.round(((v-min)/(max-min||1))*100)
                        return (
                          <div key={i} className="ov-seg-bar" style={{
                            '--sh': s.sc,
                            height: `${14 + pct * 0.22}px`,
                            background: i === s.pts.length-1
                              ? `linear-gradient(180deg,${s.g2},${s.g1})`
                              : `linear-gradient(180deg,${s.sc}55,${s.sc}22)`,
                            animationDelay: `${i * 0.07}s`
                          }}/>
                        )
                      })}
                    </div>
                    <div className="ov-stat-change" style={{color: s.sc}}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="11" height="11"><polyline points="18 15 12 9 6 15"/></svg>
                      {Math.round(((s.pts[s.pts.length-1]-s.pts[0])/s.pts[0])*100)}%
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Action Cards */}
          <div className="ov-section-label">Quick Actions</div>
          <div className="ov-actions-grid">
            {[
              { svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>, title:'Manage Students',      desc:'Add, edit, view student records',       ac:'#0891b2', bg:'#e0f2fe' },
              { svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a8.38 8.38 0 0 1 13 0"/><path d="M17 11l3-1.5v5"/><line x1="17" y1="14.5" x2="20" y2="14.5"/></svg>, title:'Manage Teachers',      desc:'Teacher profiles and assignments',       ac:'#7c3aed', bg:'#ede9fe' },
              { svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="14" x2="10" y2="14"/><line x1="14" y1="14" x2="16" y2="14"/></svg>, title:'Manage Assistants',    desc:'Assistant roles and monitoring',         ac:'#0d9488', bg:'#ccfbf1' },
              { svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>, title:'Assign Tasks',         desc:'Delegate tasks to staff members',        ac:'#d97706', bg:'#fef3c7' },
              { svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>, title:'Approve Academic Data',desc:'Review and approve submitted data',      ac:'#16a34a', bg:'#dcfce7' },
              { svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>, title:'View All Reports',     desc:'Student & teacher performance',          ac:'#64748b', bg:'#f1f5f9', locked:true },
            ].map(c => (
              <div key={c.title} className={`ov-action-card${c.locked?' ov-locked':''}`} style={{'--ac':c.ac,'--abg':c.bg}} onClick={!c.locked ? () => setActive(
                c.title.includes('Student') ? 'students' :
                c.title.includes('Teacher') ? 'teachers' :
                c.title.includes('Assistant') ? 'assistants' :
                c.title.includes('Task') ? 'tasks' :
                c.title.includes('Report') ? 'reports' : active
              ) : undefined}>
                <div className="ov-action-icon-wrap" style={{color:c.ac}}>{c.svg}</div>
                <div className="ov-action-body">
                  <div className="ov-action-title">{c.title}</div>
                  <div className="ov-action-desc">{c.desc}</div>
                </div>
                {c.locked
                  ? <span className="ov-lock-chip">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="10" height="10"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      Read-Only
                    </span>
                  : <svg className="ov-action-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><polyline points="9 18 15 12 9 6"/></svg>
                }
              </div>
            ))}
          </div>
        </div>
      )

      case 'students': return (
        <div className="dash-content page-enter">
          <div className="mgr-list-header">
            <h2 className="mgr-section-title">Student Management</h2>
            <div className="mgr-search-wrap">
              <svg className="mgr-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                className="mgr-search-input"
                type="text"
                placeholder="Search by name, ID or grade..."
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
              />
              {studentSearch && (
                <button className="mgr-search-clear" onClick={() => setStudentSearch('')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="11" height="11"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
            </div>
          </div>
          <div className="mgr-search-meta">
            {(() => {
              const filtered = students.filter(s =>
                s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                s.id.toLowerCase().includes(studentSearch.toLowerCase()) ||
                s.grade.toLowerCase().includes(studentSearch.toLowerCase())
              )
              return (
                <>
                  <span>{filtered.length} student{filtered.length !== 1 ? 's' : ''} found</span>
                  <div className="mgr-list">
                    {filtered.length === 0 ? (
                      <div className="mgr-no-results">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="40" height="40" style={{color:'#94a3b8',display:'block',margin:'0 auto 12px'}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        <p>No students match "<strong>{studentSearch}</strong>"</p>
                      </div>
                    ) : filtered.map(s => (
                      <div key={s.id} className="mgr-list-item">
                        <img src={s.img} alt={s.name} className="mgr-avatar" />
                        <div className="mgr-item-info">
                          <div className="mgr-item-name">{s.name}</div>
                          <div className="mgr-item-meta">{s.id} • {s.grade}</div>
                        </div>
                        <div className="mgr-item-stats">
                          <div className="mgr-item-stat"><span className="mgr-stat-label-sm">Avg</span><span className="mgr-stat-value-sm">{s.avg}</span></div>
                          <div className="mgr-item-stat"><span className="mgr-stat-label-sm">Rank</span><span className="mgr-stat-value-sm rank">#{s.rank}</span></div>
                        </div>
                        <button className="mgr-item-btn" onClick={() => setSelectedStudent(s)}>View</button>
                      </div>
                    ))}
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )

      case 'teachers': return (
        <div className="dash-content page-enter">
          <div className="mgr-list-header">
            <h2 className="mgr-section-title">Teacher Management</h2>
            <div className="af-role-filter">
              {['all','teachers','assistants'].map(r => (
                <button key={r} className={`af-filter-btn ${roleFilter===r?'active':''}`} onClick={() => setRoleFilter(r)}>
                  {r === 'all' ? 'All' : r === 'teachers' ? 'Teachers' : 'Assistants'}
                </button>
              ))}
            </div>
          </div>
          <PendingFilesPanel files={pendingFiles.filter(f=>f.target.id?.startsWith('T'))} onAction={handleFileAction} />
          <div className="mgr-list">
            {teachers.map(t=>(
              <div key={t.id} className="mgr-list-item">
                <img src={t.img} alt={t.name} className="mgr-avatar" />
                <div className="mgr-item-info">
                  <div className="mgr-item-name">{t.name}</div>
                  <div className="mgr-item-meta">{t.id} • {t.subject}</div>
                </div>
                <span className={`mgr-status-badge ${t.status==='Active'?'active':'leave'}`}>{t.status}</span>
                <div className="mgr-item-btns">
                  <button className="mgr-item-btn tp-profile-btn" onClick={()=>setProfileTeacher(t)}>Profile</button>
                  <button className="mgr-item-btn" onClick={()=>setSelectedTeacher(t)}>Manage</button>
                  <button className="af-attach-btn" onClick={()=>setAttachTarget(t)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                    Attach
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )

      case 'assistants': return (
        <div className="dash-content page-enter">
          <div className="mgr-list-header">
            <h2 className="mgr-section-title">Assistant Management</h2>
            <div className="af-role-filter">
              {['all','teachers','assistants'].map(r => (
                <button key={r} className={`af-filter-btn ${roleFilter===r?'active':''}`} onClick={() => setRoleFilter(r)}>
                  {r === 'all' ? 'All' : r === 'teachers' ? 'Teachers' : 'Assistants'}
                </button>
              ))}
            </div>
          </div>
          <PendingFilesPanel files={pendingFiles.filter(f=>f.target.id?.startsWith('A'))} onAction={handleFileAction} />
          <div className="mgr-list">
            {assistants.map(a=>(
              <div key={a.id} className="mgr-list-item">
                <img src={a.img} alt={a.name} className="mgr-avatar" />
                <div className="mgr-item-info">
                  <div className="mgr-item-name">{a.name}</div>
                  <div className="mgr-item-meta">{a.id} • {a.role}</div>
                </div>
                <span className="mgr-status-badge active">{a.status}</span>
                <div className="mgr-item-btns">
                  <button className="mgr-item-btn" onClick={()=>setSelectedAssistant(a)}>Manage</button>
                  <button className="af-attach-btn" onClick={()=>setAttachTarget(a)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                    Attach
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )

      case 'tasks': return (
        <div className="dash-content page-enter">
          <h2 className="mgr-section-title">Assign Tasks</h2>
          <div className="mgr-form-card">
            <div className="mgr-form-group">
              <label>Assign To</label>
              <select value={taskForm.assignee} onChange={e=>setTaskForm({...taskForm,assignee:e.target.value})}>
                <option value="">Select staff member</option>
                <option>Mr. Ali (Teacher)</option>
                <option>Ms. Sara (Teacher)</option>
                <option>Khalid Omar (Assistant)</option>
              </select>
            </div>
            <div className="mgr-form-group">
              <label>Task Description</label>
              <input type="text" placeholder="e.g. Submit weekly report" value={taskForm.task} onChange={e=>setTaskForm({...taskForm,task:e.target.value})} />
            </div>
            <div className="mgr-form-group">
              <label>Due Date</label>
              <input type="date" value={taskForm.due} onChange={e=>setTaskForm({...taskForm,due:e.target.value})} />
            </div>
            <button className="mgr-submit-btn" onClick={addTask}>Assign Task</button>
          </div>
          {tasks.length > 0 && (
            <div className="mgr-tasks-list">
              <h3>Assigned Tasks</h3>
              {tasks.map(t=>(
                <div key={t.id} className="mgr-task-item">
                  <div className="mgr-task-assignee">{t.assignee}</div>
                  <div className="mgr-task-desc">{t.task}</div>
                  {t.due && <div className="mgr-task-due">Due: {t.due}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )

      case 'reports__DELETED': return (
        <div className="dash-content page-enter">
          <h2 className="mgr-section-title">{t('reportsTitle')}</h2>
          <div className="mgr-readonly-notice">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            {t('reportsReadOnly')}
          </div>

          {(() => {
            const percentNumber = (val) => Number(String(val).replace('%', '').trim()) || 0

            const studentAvgScore = Math.round(
              students.reduce((sum, s) => sum + percentNumber(s.avg), 0) / (students.length || 1)
            )
            const teacherTaskAvg = Math.round(
              teachers.reduce((sum, teacher) => sum + percentNumber(teacher.tasksCompleted), 0) / (teachers.length || 1)
            )

            const allPeople = [...students, ...teachers, ...assistants]
            const attendanceAvg = Math.round(
              allPeople.reduce((sum, person) => sum + percentNumber(person.attendance), 0) / (allPeople.length || 1)
            )

            const gradePerformance = students.reduce((acc, student) => {
              const key = student.grade
              if (!acc[key]) acc[key] = { total: 0, count: 0 }
              acc[key].total += percentNumber(student.avg)
              acc[key].count += 1
              return acc
            }, {})

            const topGrade = Object.entries(gradePerformance)
              .map(([grade, data]) => ({ grade, avg: data.total / data.count }))
              .sort((a, b) => b.avg - a.avg)[0]?.grade || 'N/A'

            return (
              <div className="rpt-summary-row">
                {[
                  { svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, label: t('studentPerf'),    value:`${studentAvgScore}/100`, trend:'Strong',    color:'#0891b2' },
                  { svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a8.38 8.38 0 0 1 13 0"/><path d="M17 11l3-1.5v5"/><line x1="17" y1="14.5" x2="20" y2="14.5"/></svg>, label: t('teacherTaskRate'), value:`${teacherTaskAvg}/100`, trend:'On Track', color:'#7c3aed' },
                  { svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>, label: t('attendanceRate'),  value:`${attendanceAvg}/100`, trend:'Healthy', color:'#16a34a' },
                  { svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>, label: t('topClass'),        value: topGrade,               trend:'Top',     color:'#d97706' },
                ].map(s=>(
                  <div key={s.label} className="rpt-summary-card" style={{'--rc':s.color}}>
                    <div className="rpt-summary-icon" style={{color:s.color}}>{s.svg}</div>
                    <div className="rpt-summary-value">{s.value}</div>
                    <div className="rpt-summary-label">{s.label}</div>
                    {s.trend && <div className="rpt-summary-trend">↑ {s.trend}</div>}
                  </div>
                ))}
              </div>
            )
          })()}

          {/* Charts Row */}
          <div className="rpt-charts-row">
            <div className="rpt-chart-card">
              <div className="rpt-chart-header">
                <div>
                  <div className="rpt-chart-title">{t('studentPerfTrend')}</div>
                  <div className="rpt-chart-sub">{t('monthlyAvg')}</div>
                </div>
                <span className="rpt-chart-badge" style={{background:'#e0f2fe',color:'#0891b2'}}>+11pts</span>
              </div>
              <svg viewBox="0 0 400 120" className="rpt-svg" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0891b2" stopOpacity="0.25"/>
                    <stop offset="100%" stopColor="#0891b2" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <polygon points="0,120 0,88 67,80 133,72 200,64 267,52 333,44 400,28 400,120" fill="url(#lg1)"/>
                <polyline points="0,88 67,80 133,72 200,64 267,52 333,44 400,28" fill="none" stroke="#0891b2" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                {[[0,88],[67,80],[133,72],[200,64],[267,52],[333,44],[400,28]].map(([x,y],i)=>(
                  <circle key={i} cx={x} cy={y} r="5" fill="#0891b2" stroke="#fff" strokeWidth="2"/>
                ))}
                {[[t('jan'),72],[t('feb'),75],[t('mar'),78],[t('apr'),80],[t('may'),83],[t('jun'),87]].map(([m,v],i)=>(
                  <text key={m} x={i*80+4} y="115" fontSize="10" fill="#94a3b8">{m} {v}%</text>
                ))}
              </svg>
            </div>

            <div className="rpt-chart-card">
              <div className="rpt-chart-header">
                <div>
                  <div className="rpt-chart-title">{t('teacherTaskCompletion')}</div>
                  <div className="rpt-chart-sub">{t('perTeacher')}</div>
                </div>
                <span className="rpt-chart-badge" style={{background:'#ede9fe',color:'#7c3aed'}}>{t('teachers4')}</span>
              </div>
              <svg viewBox="0 0 400 120" className="rpt-svg">
                <defs>
                  <linearGradient id="lg2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.9"/>
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.7"/>
                  </linearGradient>
                </defs>
                {[['Mr. Ali',87],['Ms. Sara',100],['Mr. Omar',55],['Ms. Fatima',95]].map(([name,val],i)=>{
                  const bh = (val/100)*90
                  const x = i*100+20
                  return (
                    <g key={name}>
                      <rect x={x} y={100-bh} width="60" height={bh} rx="6" fill="url(#lg2)"/>
                      <text x={x+30} y="115" textAnchor="middle" fontSize="9" fill="#94a3b8">{name.split(' ')[1]}</text>
                      <text x={x+30} y={95-bh} textAnchor="middle" fontSize="10" fontWeight="700" fill="#7c3aed">{val}%</text>
                    </g>
                  )
                })}
              </svg>
            </div>
          </div>

          <div className="rpt-charts-row">
            <div className="rpt-chart-card">
              <div className="rpt-chart-header">
                <div>
                  <div className="rpt-chart-title">{t('attendanceBreakdown')}</div>
                  <div className="rpt-chart-sub">{t('studTeachAsst')}</div>
                </div>
              </div>
              <div className="rpt-donuts-row">
                {[
                  { labelKey:'students',   val:94, color:'#16a34a' },
                  { labelKey:'teachers',   val:95, color:'#0891b2' },
                  { labelKey:'assistants', val:97, color:'#7c3aed' },
                ].map(d=>{
                  const r=38, circ=2*Math.PI*r, dash=(d.val/100)*circ
                  return (
                    <div key={d.labelKey} className="rpt-donut-item">
                      <svg width="96" height="96" viewBox="0 0 96 96">
                        <circle cx="48" cy="48" r={r} fill="none" stroke="#e2e8f0" strokeWidth="9"/>
                        <circle cx="48" cy="48" r={r} fill="none" stroke={d.color} strokeWidth="9"
                          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                          transform="rotate(-90 48 48)"/>
                        <text x="48" y="53" textAnchor="middle" fontSize="14" fontWeight="800" fill={d.color}>{d.val}%</text>
                      </svg>
                      <div className="rpt-donut-label">{t(d.labelKey)}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="rpt-chart-card">
              <div className="rpt-chart-header">
                <div>
                  <div className="rpt-chart-title">{t('gradeDistribution')}</div>
                  <div className="rpt-chart-sub">{t('studentsByGrade')}</div>
                </div>
              </div>
              <div className="rpt-hbar-list">
                {[
                  { label:'Grade 7', count:57,  total:248, color:'#f59e0b' },
                  { label:'Grade 8', count:83,  total:248, color:'#0891b2' },
                  { label:'Grade 9', count:72,  total:248, color:'#7c3aed' },
                  { label:'Grade 10',count:36,  total:248, color:'#16a34a' },
                ].map(b=>(
                  <div key={b.label} className="rpt-hbar-row">
                    <span className="rpt-hbar-label">{b.label}</span>
                    <div className="rpt-hbar-track">
                      <div className="rpt-hbar-fill" style={{width:`${(b.count/b.total)*100}%`,background:b.color}}/>
                    </div>
                    <span className="rpt-hbar-val">{b.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )

      case 'reports': return <ManagerReportsSection />

      case 'payment-status': return (
        <div className="dash-content page-enter">
          <div className="mgr-list-header" style={{ marginBottom: 16 }}>
            <div>
              <h2 className="mgr-section-title">የክፍያ ሁኔታ / Payment Status</h2>
              <p className="mgr-section-sub">ተማሪዎችን ያስተዳድሩ · Manage student payments</p>
            </div>
          </div>
          <PaymentStatusPanel onStudentRegistered={reloadStudents} />
        </div>
      )

      case 'results': {
        const SUBJECTS = [
          { key: 'math',      en: 'Math',      am: 'ሒሳብ' },
          { key: 'english',   en: 'English',   am: 'እንግሊዝኛ' },
          { key: 'physics',   en: 'Physics',   am: 'ፊዚክስ' },
          { key: 'chemistry', en: 'Chemistry', am: 'ኬሚስትሪ' },
          { key: 'biology',   en: 'Biology',   am: 'ባዮሎጂ' },
          { key: 'history',   en: 'History',   am: 'ታሪክ' },
        ]
        const MARK_COLS = [
          { label: 'Assign.', max: 10 },
          { label: 'C.Work',  max: 10 },
          { label: 'Mid',     max: 30 },
          { label: 'Final',   max: 50 },
        ]
        const STUDENT_LIST = [
          { name: 'Fatima Noor',    am: 'ፋጢማ ኑር',      img: 'https://i.pravatar.cc/80?img=47' },
          { name: 'Ali Hassan',     am: 'አሊ ሃሰን',       img: 'https://i.pravatar.cc/80?img=12' },
          { name: 'Amina Tesfaye',  am: 'አሚና ተስፋዬ',    img: 'https://i.pravatar.cc/80?img=25' },
          { name: 'Sara Ahmed',     am: 'ሳራ አህመድ',      img: 'https://i.pravatar.cc/80?img=45' },
          { name: 'Dawit Alemu',    am: 'ዳዊት አለሙ',      img: 'https://i.pravatar.cc/80?img=52' },
          { name: 'Hana Bekele',    am: 'ሃና በቀለ',       img: 'https://i.pravatar.cc/80?img=29' },
          { name: 'Omar Khalid',    am: 'ዑመር ካሊድ',     img: 'https://i.pravatar.cc/80?img=33' },
          { name: 'Meron Abate',    am: 'ሜሮን አባተ',      img: 'https://i.pravatar.cc/80?img=48' },
          { name: 'Bilal Mohammed', am: 'ቢላል መሐመድ',    img: 'https://i.pravatar.cc/80?img=57' },
          { name: 'Yusuf Ibrahim',  am: 'ዩሱፍ ኢብራሂም',  img: 'https://i.pravatar.cc/80?img=68' },
        ]
        const seedData = {
          // Rank 1 — top scorer
          'Fatima Noor': {
            sem1: { math:[10,10,29,49], english:[9,10,28,48], physics:[10,9,29,48], chemistry:[9,10,28,47], biology:[10,10,30,50], history:[9,9,27,46] },
            sem2: { math:[10,10,30,50], english:[10,10,29,49], physics:[10,10,30,49], chemistry:[10,10,29,48], biology:[10,10,30,50], history:[10,10,28,48] },
          },
          // Rank 2
          'Amina Tesfaye': {
            sem1: { math:[9,9,27,47], english:[9,9,26,46], physics:[9,9,27,46], chemistry:[9,9,26,45], biology:[9,9,27,46], history:[9,9,26,45] },
            sem2: { math:[10,9,28,48], english:[9,10,27,47], physics:[9,9,28,47], chemistry:[9,9,27,46], biology:[10,9,28,47], history:[9,9,27,46] },
          },
          // Rank 3
          'Ali Hassan': {
            sem1: { math:[8,9,25,44], english:[7,8,22,40], physics:[9,8,27,46], chemistry:[6,9,24,42], biology:[8,7,26,45], history:[9,9,28,47] },
            sem2: { math:[9,9,27,46], english:[8,9,24,43], physics:[9,9,28,47], chemistry:[7,9,25,44], biology:[9,8,27,46], history:[9,10,29,48] },
          },
          // Rank 4
          'Hana Bekele': {
            sem1: { math:[8,8,24,42], english:[8,8,23,41], physics:[8,7,23,41], chemistry:[8,8,22,40], biology:[8,8,24,42], history:[8,8,23,41] },
            sem2: { math:[8,9,25,43], english:[8,8,24,42], physics:[8,8,24,42], chemistry:[8,8,23,41], biology:[8,9,25,43], history:[8,8,24,42] },
          },
          // Rank 5
          'Sara Ahmed': {
            sem1: { math:[7,7,20,38], english:[8,9,24,43], physics:[6,7,21,37], chemistry:[8,8,23,41], biology:[7,9,25,44], history:[8,8,22,40] },
            sem2: { math:[8,8,22,40], english:[9,9,25,44], physics:[7,8,22,39], chemistry:[8,9,24,43], biology:[8,9,26,45], history:[8,9,23,42] },
          },
          // Rank 6
          'Dawit Alemu': {
            sem1: { math:[7,7,19,36], english:[7,7,20,36], physics:[6,7,18,34], chemistry:[7,7,19,35], biology:[7,7,20,36], history:[7,7,19,35] },
            sem2: { math:[7,8,21,38], english:[7,8,21,38], physics:[7,7,19,36], chemistry:[7,7,20,37], biology:[7,8,21,38], history:[7,7,20,37] },
          },
          // Rank 7
          'Meron Abate': {
            sem1: { math:[6,7,18,34], english:[7,6,19,35], physics:[6,6,17,33], chemistry:[6,7,18,34], biology:[6,7,18,34], history:[7,6,19,35] },
            sem2: { math:[7,7,19,36], english:[7,7,20,36], physics:[6,7,18,34], chemistry:[7,6,19,35], biology:[7,7,19,36], history:[7,7,20,36] },
          },
          // Rank 8
          'Omar Khalid': {
            sem1: { math:[6,6,18,34], english:[7,7,20,36], physics:[5,6,17,32], chemistry:[7,6,19,35], biology:[6,7,20,36], history:[7,7,21,38] },
            sem2: { math:[7,7,20,36], english:[7,8,21,38], physics:[6,7,18,34], chemistry:[7,7,20,37], biology:[7,7,21,38], history:[7,8,22,39] },
          },
          // Rank 9
          'Bilal Mohammed': {
            sem1: { math:[5,6,15,29], english:[6,5,16,30], physics:[5,5,14,27], chemistry:[5,6,15,28], biology:[5,5,15,28], history:[6,5,16,30] },
            sem2: { math:[6,6,16,31], english:[6,6,17,32], physics:[5,6,15,29], chemistry:[6,5,16,30], biology:[6,6,16,30], history:[6,6,17,32] },
          },
          // Rank 10 — lowest scorer
          'Yusuf Ibrahim': {
            sem1: { math:[5,6,16,30], english:[6,6,18,33], physics:[5,5,15,28], chemistry:[6,5,17,31], biology:[5,6,16,30], history:[6,6,18,33] },
            sem2: { math:[6,6,17,32], english:[6,7,19,34], physics:[5,6,16,30], chemistry:[6,6,18,33], biology:[6,6,17,31], history:[6,7,19,35] },
          },
        }
        const subjectTotal = (marks) => {
          if (!marks) return null
          const filled = marks.filter(m => m !== null && m !== '' && !isNaN(Number(m)))
          if (!filled.length) return null
          return filled.reduce((a, b) => a + Number(b), 0)
        }
        const semesterAvg = (studentName, sem) => {
          const d = seedData[studentName]?.[sem]
          if (!d) return null
          const totals = SUBJECTS.map(s => subjectTotal(d[s.key])).filter(v => v !== null)
          if (!totals.length) return null
          return Math.round(totals.reduce((a, b) => a + b, 0) / totals.length)
        }
        const finalYearAvg = (studentName) => {
          const s1 = semesterAvg(studentName, 'sem1')
          const s2 = semesterAvg(studentName, 'sem2')
          if (s1 === null || s2 === null) return null
          return Math.round((s1 + s2) / 2)
        }
        const gradeColor = (v) => {
          if (v === null || v === undefined) return '#94a3b8'
          if (v >= 80) return '#16a34a'; if (v >= 65) return '#0891b2'
          if (v >= 50) return '#d97706'; return '#dc2626'
        }
        const gradeLabel = (v) => {
          if (v === null || v === undefined) return '—'
          if (v >= 90) return 'A+'; if (v >= 85) return 'A'; if (v >= 80) return 'A-'
          if (v >= 75) return 'B+'; if (v >= 70) return 'B'; if (v >= 65) return 'B-'
          if (v >= 60) return 'C'; return 'F'
        }
        const SEM_BTNS = [
          { key: 'sem1',  en: 'Semester 1', am: 'ሴሚስተር 1' },
          { key: 'sem2',  en: 'Semester 2', am: 'ሴሚስተር 2' },
          { key: 'final', en: 'Final Year', am: 'የመጨረሻ አመት' },
        ]
        const filtered = STUDENT_LIST.filter(s =>
          s.name.toLowerCase().includes((resSearch || '').toLowerCase()) ||
          s.am.includes(resSearch || '')
        )

        // Pre-compute all 3 rank maps from the FULL list (not filtered)
        const makeRankMap = (sem) => Object.fromEntries(
          [...STUDENT_LIST]
            .map(s => ({ name: s.name, avg: sem === 'final' ? finalYearAvg(s.name) : semesterAvg(s.name, sem) }))
            .sort((a, b) => (b.avg ?? -1) - (a.avg ?? -1))
            .map((s, i) => [s.name, i + 1])
        )
        const rankSem1  = makeRankMap('sem1')
        const rankSem2  = makeRankMap('sem2')
        const rankFinal = makeRankMap('final')

        const rankIcon = (r) => r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : null
        const rankStyle = (r) => r === 1
          ? { bg: '#fef9c3', color: '#854d0e', border: '#fde047' }
          : r === 2
          ? { bg: '#f1f5f9', color: '#334155', border: '#94a3b8' }
          : r === 3
          ? { bg: '#fdf2f8', color: '#86198f', border: '#e879f9' }
          : { bg: 'var(--hover,#f8fafc)', color: 'var(--text-muted,#64748b)', border: 'var(--border,#e2e8f0)' }

        // ── Excel Export ──
        const SUBJECTS_XLS = [
          { key: 'math',      label: 'Math' },
          { key: 'english',   label: 'English' },
          { key: 'physics',   label: 'Physics' },
          { key: 'chemistry', label: 'Chemistry' },
          { key: 'biology',   label: 'Biology' },
          { key: 'history',   label: 'History' },
        ]

        const handleExport = async () => {
          if (!xlsSem) { setXlsError('Please select a semester option first'); return }
          setXlsError('')
          setXlsLoading(true)
          try {
            const XLSX = await import('xlsx')
            const wb = XLSX.utils.book_new()

            const buildSheet = (sem) => {
              // Header: Student | Class | Math | English | Physics | Chemistry | Biology | History | Total AVG
              const header = ['Student Name', 'Class', ...SUBJECTS_XLS.map(s => s.label), 'Total AVG', 'Grade']
              const rows = [header]
              STUDENT_LIST.forEach(student => {
                const d = seedData[student.name]?.[sem] || {}
                const subTotals = SUBJECTS_XLS.map(s => {
                  const marks = d[s.key]
                  if (!marks) return ''
                  const filled = marks.filter(m => m !== null && m !== '')
                  return filled.length ? filled.reduce((a, b) => a + Number(b), 0) : ''
                })
                const numericTotals = subTotals.filter(v => v !== '')
                const avg = numericTotals.length
                  ? Math.round(numericTotals.reduce((a, b) => a + b, 0) / numericTotals.length)
                  : ''
                const gl = avg !== '' ? gradeLabel(avg) : ''
                rows.push([student.name, 'Grade 8', ...subTotals, avg, gl])
              })
              return rows
            }

            if (xlsSem === 'all') {
              const ws1 = XLSX.utils.aoa_to_sheet(buildSheet('sem1'))
              const ws2 = XLSX.utils.aoa_to_sheet(buildSheet('sem2'))
              // Final sheet: Student | Class | Sem1 AVG | Sem2 AVG | Final AVG | Grade
              const finalHeader = ['Student Name', 'Class', 'Semester 1 AVG', 'Semester 2 AVG', 'Final AVG', 'Grade']
              const finalRows = [finalHeader]
              STUDENT_LIST.forEach(student => {
                const s1 = semesterAvg(student.name, 'sem1')
                const s2 = semesterAvg(student.name, 'sem2')
                const fin = finalYearAvg(student.name)
                finalRows.push([student.name, 'Grade 8', s1 ?? '', s2 ?? '', fin ?? '', gradeLabel(fin)])
              })
              const ws3 = XLSX.utils.aoa_to_sheet(finalRows)
              ;[ws1, ws2, ws3].forEach(ws => {
                ws['!cols'] = [{ wch: 22 }, { wch: 10 }, ...Array(7).fill({ wch: 12 })]
              })
              XLSX.utils.book_append_sheet(wb, ws1, 'Semester 1')
              XLSX.utils.book_append_sheet(wb, ws2, 'Semester 2')
              XLSX.utils.book_append_sheet(wb, ws3, 'Final Results')
            } else {
              const rows = buildSheet(xlsSem)
              const ws = XLSX.utils.aoa_to_sheet(rows)
              ws['!cols'] = [{ wch: 22 }, { wch: 10 }, ...Array(7).fill({ wch: 12 })]
              XLSX.utils.book_append_sheet(wb, ws, xlsSem === 'sem1' ? 'Semester 1' : 'Semester 2')
            }

            const filename = xlsSem === 'all'
              ? 'Student_Results_All.xlsx'
              : xlsSem === 'sem1'
                ? 'Student_Results_Sem1.xlsx'
                : 'Student_Results_Sem2.xlsx'
            XLSX.writeFile(wb, filename)
          } catch (e) {
            setXlsError('Export failed. Please try again.')
          } finally {
            setXlsLoading(false)
          }
        }

        return (
          <div className="dash-content page-enter">
            <div className="mgr-list-header" style={{ marginBottom: 16 }}>
              <div>
                <h2 className="mgr-section-title">ውጤቶች / Student Results</h2>
                <p className="mgr-section-sub">እይታ ብቻ · View-only &nbsp;·&nbsp; 6 ርዕሶች / Subjects &nbsp;·&nbsp; Assign /10 · C.Work /10 · Mid /30 · Final /50</p>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="mgr-res-search-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input className="mgr-res-search" placeholder="ስም ፈልግ / Search student…" value={resSearch || ''} onChange={e => setResSearch(e.target.value)} />
                </div>
                {/* Export controls */}
                <div className="xls-export-group">
                  <select
                    className={`xls-sem-select ${xlsError ? 'xls-select-err' : ''}`}
                    value={xlsSem}
                    onChange={e => { setXlsSem(e.target.value); setXlsError('') }}
                  >
                    <option value="">— Select Semester —</option>
                    <option value="sem1">Semester 1</option>
                    <option value="sem2">Semester 2</option>
                    <option value="all">All (Sem 1 + Sem 2 + Final)</option>
                  </select>
                  <button
                    className={`xls-export-btn ${!xlsSem || xlsLoading ? 'xls-btn-disabled' : ''}`}
                    onClick={handleExport}
                    disabled={!xlsSem || xlsLoading}
                  >
                    {xlsLoading ? (
                      <span className="xls-spinner" />
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                    )}
                    {xlsLoading ? 'Generating…' : 'Export Excel'}
                  </button>
                </div>
              </div>
            </div>
            {xlsError && (
              <div className="xls-error-msg">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {xlsError}
              </div>
            )}
            <div className="sr-list">
              {filtered.map((student) => {
                const fin   = finalYearAvg(student.name)
                const s1avg = semesterAvg(student.name, 'sem1')
                const s2avg = semesterAvg(student.name, 'sem2')
                const r1 = rankSem1[student.name]
                const r2 = rankSem2[student.name]
                const rf = rankFinal[student.name]
                const rs = rankStyle(rf)
                const activeKey = resExpanded?.[student.name] || null
                const toggle = (key) => setResExpanded(prev => ({ ...prev, [student.name]: prev?.[student.name] === key ? null : key }))

                return (
                  <div key={student.name} className={`sr-card ${rf <= 3 ? `sr-card-top${rf}` : ''}`}>
                    <div className="sr-row">

                      {/* ── Left: profile + ranks ── */}
                      <div className="sr-profile-block">
                        {/* Final rank medal */}
                        <div className="sr-medal" style={{ background: rs.bg, color: rs.color, border: `2px solid ${rs.border}` }}>
                          {rankIcon(rf) ?? `#${rf}`}
                        </div>
                        <img src={student.img} alt={student.name} className="sr-avatar" />
                        <div className="sr-profile-info">
                          <div className="sr-name-en">{student.name}</div>
                          <div className="sr-name-am">{student.am}</div>
                          {/* Per-semester ranks */}
                          <div className="sr-rank-pills">
                            <span className="sr-rank-pill">
                              <span className="sr-rank-pill-label">ሴሚስተር 1</span>
                              <span className="sr-rank-pill-val" style={{ color: r1 <= 3 ? '#d97706' : 'var(--text-muted,#64748b)' }}>
                                {rankIcon(r1) ?? `#${r1}`}
                              </span>
                            </span>
                            <span className="sr-rank-pill">
                              <span className="sr-rank-pill-label">ሴሚስተር 2</span>
                              <span className="sr-rank-pill-val" style={{ color: r2 <= 3 ? '#d97706' : 'var(--text-muted,#64748b)' }}>
                                {rankIcon(r2) ?? `#${r2}`}
                              </span>
                            </span>
                            <span className="sr-rank-pill sr-rank-pill-final">
                              <span className="sr-rank-pill-label">የመጨረሻ</span>
                              <span className="sr-rank-pill-val" style={{ color: rf <= 3 ? '#d97706' : 'var(--text-muted,#64748b)' }}>
                                {rankIcon(rf) ?? `#${rf}`}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* ── Right: buttons + AVG ── */}
                      <div className="sr-actions">
                        {SEM_BTNS.map(btn => (
                          <button key={btn.key} className={`sr-btn ${activeKey === btn.key ? 'sr-btn-active' : ''}`} onClick={() => toggle(btn.key)}>
                            <span className="sr-btn-am">{btn.am}</span>
                            <span className="sr-btn-en">{btn.en}</span>
                            <span className="sr-btn-avg" style={{ color: gradeColor(btn.key === 'sem1' ? s1avg : btn.key === 'sem2' ? s2avg : fin) }}>
                              {(btn.key === 'sem1' ? s1avg : btn.key === 'sem2' ? s2avg : fin) ?? '—'}
                            </span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="10" height="10" style={{ transform: activeKey === btn.key ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .2s', marginTop: 2 }}><polyline points="6 9 12 15 18 9"/></svg>
                          </button>
                        ))}
                        <span className="sr-final-pill" style={{ background: gradeColor(fin) + '18', color: gradeColor(fin) }}>
                          🏆 {fin ?? '—'} <strong>{gradeLabel(fin)}</strong>
                        </span>
                      </div>
                    </div>
                    {activeKey && (
                      <div className="sr-expand">
                        <div className="sr-expand-title">
                          {SEM_BTNS.find(b => b.key === activeKey)?.am} / {SEM_BTNS.find(b => b.key === activeKey)?.en}
                        </div>
                        {activeKey === 'final' ? (
                          <div className="sr-final-panel">
                            <div className="sr-final-row">
                              {['sem1','sem2'].map((sk) => {
                                const sv = semesterAvg(student.name, sk)
                                return (
                                  <div key={sk} className="sr-final-sem">
                                    <div className="sr-final-sem-label">{sk === 'sem1' ? 'ሴሚስተር 1 / Semester 1' : 'ሴሚስተር 2 / Semester 2'}</div>
                                    <span className="sr-avg-badge sr-avg-total" style={{ background: gradeColor(sv) + '18', color: gradeColor(sv) }}>{sv ?? '—'}</span>
                                  </div>
                                )
                              })}
                              <div className="sr-final-sem">
                                <div className="sr-final-sem-label">የመጨረሻ አማካይ / Final AVG</div>
                                <span className="sr-avg-badge sr-avg-final" style={{ background: gradeColor(fin) + '22', color: gradeColor(fin) }}>{fin ?? '—'} <strong>{gradeLabel(fin)}</strong></span>
                              </div>
                            </div>
                            <div className="sr-subject-table-wrap" style={{ marginTop: 14 }}>
                              <table className="sr-subject-table">
                                <thead>
                                  <tr>
                                    <th className="sr-th-subj">ርዕስ / Subject</th>
                                    <th className="sr-th-avg">Sem 1</th>
                                    <th className="sr-th-avg">Sem 2</th>
                                    <th className="sr-th-avg" style={{ color: 'var(--primary,#6366f1)' }}>AVG</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {SUBJECTS.map((s, si) => {
                                    const t1 = subjectTotal(seedData[student.name]?.sem1?.[s.key])
                                    const t2 = subjectTotal(seedData[student.name]?.sem2?.[s.key])
                                    const avg = t1 !== null && t2 !== null ? Math.round((t1 + t2) / 2) : null
                                    return (
                                      <tr key={s.key} className={si % 2 === 1 ? 'sr-tr-alt' : ''}>
                                        <td className="sr-td-subj"><div className="sr-subj-en">{s.en}</div><div className="sr-subj-am">{s.am}</div></td>
                                        <td className="sr-td-avg"><span style={{ color: gradeColor(t1), fontWeight: 600 }}>{t1 ?? '—'}</span></td>
                                        <td className="sr-td-avg"><span style={{ color: gradeColor(t2), fontWeight: 600 }}>{t2 ?? '—'}</span></td>
                                        <td className="sr-td-avg"><span className="sr-avg-badge" style={{ background: gradeColor(avg) + '18', color: gradeColor(avg) }}>{avg ?? '—'}</span></td>
                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : (
                          <div className="sr-subject-table-wrap">
                            <table className="sr-subject-table">
                              <thead>
                                <tr>
                                  <th className="sr-th-subj">ርዕስ / Subject</th>
                                  {MARK_COLS.map(c => (
                                    <th key={c.label} className="sr-th-col">
                                      <div className="sr-th-max">{c.max}</div>
                                      <div className="sr-th-lbl">{c.label}</div>
                                    </th>
                                  ))}
                                  <th className="sr-th-avg">AVG</th>
                                </tr>
                              </thead>
                              <tbody>
                                {SUBJECTS.map((s, si) => {
                                  const marks = seedData[student.name]?.[activeKey]?.[s.key] || [null,null,null,null]
                                  const total = subjectTotal(marks)
                                  return (
                                    <tr key={s.key} className={si % 2 === 1 ? 'sr-tr-alt' : ''}>
                                      <td className="sr-td-subj"><div className="sr-subj-en">{s.en}</div><div className="sr-subj-am">{s.am}</div></td>
                                      {MARK_COLS.map((c, ci) => (
                                        <td key={ci} className="sr-td-mark">
                                          <span style={{ color: marks[ci] !== null ? gradeColor(Number(marks[ci]) / c.max * 100) : '#94a3b8', fontWeight: 600 }}>
                                            {marks[ci] ?? '—'}
                                          </span>
                                        </td>
                                      ))}
                                      <td className="sr-td-avg">
                                        <span className="sr-avg-badge" style={{ background: gradeColor(total) + '18', color: gradeColor(total) }}>{total ?? '—'}</span>
                                      </td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                              <tfoot>
                                <tr className="sr-tfoot">
                                  <td colSpan={MARK_COLS.length + 1} className="sr-tfoot-label">አማካይ / Semester Average</td>
                                  <td className="sr-td-avg">
                                    <span className="sr-avg-badge sr-avg-total" style={{ background: gradeColor(semesterAvg(student.name, activeKey)) + '22', color: gradeColor(semesterAvg(student.name, activeKey)) }}>
                                      {semesterAvg(student.name, activeKey) ?? '—'}
                                    </span>
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
              {filtered.length === 0 && <div className="sr-empty">ምንም ተማሪ አልተገኘም / No students found</div>}
            </div>
            <div className="mgr-res-legend">
              <span style={{color:'#16a34a'}}>■</span> ≥80 A &nbsp;
              <span style={{color:'#0891b2'}}>■</span> ≥65 B &nbsp;
              <span style={{color:'#d97706'}}>■</span> ≥50 C &nbsp;
              <span style={{color:'#dc2626'}}>■</span> &lt;50 F
            </div>
          </div>
        )
      }

            case 'settings': return <ManagerSettingsSection />

            default: return null
    }
  }

  return (
    <div className="dashboard-layout">
      <Sidebar role="manager" items={sidebarItems} active={active} onSelect={setActive} />
      <main className="dashboard-main">
        {renderContent()}
        {selectedStudent   && <StudentModal   student={selectedStudent}     onClose={()=>setSelectedStudent(null)} />}
        {selectedTeacher   && <TeacherModal   teacher={selectedTeacher}     onClose={()=>setSelectedTeacher(null)} />}
        {selectedAssistant && <AssistantModal assistant={selectedAssistant} onClose={()=>setSelectedAssistant(null)} />}
        {attachTarget && <AttachModal target={attachTarget} onClose={()=>setAttachTarget(null)} onSend={handleSendFile} />}
        {profileTeacher && <TeacherProfile teacher={profileTeacher} role="manager" onClose={()=>setProfileTeacher(null)} />}
      </main>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MANAGER REPORTS SECTION
// — Full dashboard data + Generate Report with comment + document + Send to Owner
// ═══════════════════════════════════════════════════════════════════════════════
function ManagerReportsSection() {
  const fileRef = useRef()
  const [overview,  setOverview]  = useState(null)
  const [teachers,  setTeachers]  = useState([])
  const [grades,    setGrades]    = useState([])
  const [attBreak,  setAttBreak]  = useState([])
  const [reports,   setReports]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [loadErr,    setLoadErr]    = useState('')
  const [toast,      setToast]      = useState({ msg:'', ok:true })
  const [genLoading, setGenLoading] = useState(false)
  const [sendingId,  setSendingId]  = useState(null)
  const [showGenForm, setShowGenForm] = useState(false)
  const [genForm, setGenForm] = useState({
    term:     'Term 1 2026',
    comment:  '',
    document: null,
  })

  const load = useCallback(async () => {
    setLoading(true); setLoadErr('')
    try {
      const [ov, tc, gd, ab, rpts] = await Promise.all([
        reportsAPI.overview(),
        reportsAPI.teacherTasks(),
        reportsAPI.gradeDistribution(),
        reportsAPI.attendanceBreakdown(),
        reportsAPI.list(),
      ])
      setOverview(ov); setTeachers(tc); setGrades(gd); setAttBreak(ab); setReports(rpts)
    } catch (e) {
      setLoadErr(e.message || 'Cannot reach server. Make sure backend is running on port 5000.')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleGenerate = async () => {
    if (!genForm.term.trim()) return
    setGenLoading(true)
    try {
      let body = { term: genForm.term, comment: genForm.comment }
      if (genForm.document) {
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload  = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(genForm.document)
        })
        body.document_name = genForm.document.name
        body.document_type = genForm.document.type
        body.document_data = base64
      }
      const rpt = await reportsAPI.generate(body)
      setReports(prev => [rpt, ...prev])
      setShowGenForm(false)
      setGenForm({ term:'Term 1 2026', comment:'', document:null })
      setToast({ msg:'Report generated ✓', ok:true })
    } catch (e) {
      setToast({ msg: e.message || 'Generate failed', ok:false })
    } finally { setGenLoading(false) }
  }

  const handleSend = async (id) => {
    setSendingId(id)
    try {
      const updated = await reportsAPI.send(id)
      setReports(prev => prev.map(r => r.id === id ? updated : r))
      setToast({ msg:'Report sent to Owner ✓', ok:true })
    } catch (e) {
      setToast({ msg: e.message || 'Send failed', ok:false })
    } finally { setSendingId(null) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this report?')) return
    try {
      await reportsAPI.delete(id)
      setReports(prev => prev.filter(r => r.id !== id))
    } catch (e) {
      setToast({ msg: e.message || 'Delete failed', ok:false })
    }
  }

  const fmt1 = (n) => Number(n || 0).toFixed(1)
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }) : '—'

  // Loading spinner
  if (loading) return (
    <div className="dash-content page-enter" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:300}}>
      <div style={{textAlign:'center',color:'#94a3b8'}}>
        <svg className="login-spin" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" width="36" height="36" style={{display:'block',margin:'0 auto 12px'}}>
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
        Loading reports…
      </div>
    </div>
  )

  // Backend offline / error state
  if (loadErr) return (
    <div className="dash-content page-enter">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap',gap:12}}>
        <div>
          <h2 className="mgr-section-title" style={{marginBottom:4}}>School Reports</h2>
          <p className="mgr-section-sub">Live data from database · Generate &amp; send reports to Owner</p>
        </div>
        <button onClick={() => setShowGenForm(s => !s)}
          style={{display:'flex',alignItems:'center',gap:8,background:'linear-gradient(135deg,#7c3aed,#6d28d9)',color:'#fff',border:'none',borderRadius:10,padding:'10px 18px',fontSize:13,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 14px rgba(124,58,237,0.35)'}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>
          Generate Report
        </button>
      </div>
      {/* Error banner with retry */}
      <div style={{background:'#fff7ed',border:'1.5px solid #fdba74',borderRadius:12,padding:'20px 24px',marginBottom:20,display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,fontSize:14,color:'#9a3412',marginBottom:4}}>⚠ Cannot load report data</div>
          <div style={{fontSize:13,color:'#7c2d12'}}>{loadErr}</div>
          <div style={{fontSize:12,color:'#92400e',marginTop:6}}>Make sure you started the backend: <code style={{background:'rgba(0,0,0,0.06)',borderRadius:4,padding:'1px 6px'}}>npm run dev</code> inside <code style={{background:'rgba(0,0,0,0.06)',borderRadius:4,padding:'1px 6px'}}>Hidaya-backend/</code></div>
        </div>
        <button onClick={load}
          style={{padding:'10px 20px',background:'#d97706',color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:700,cursor:'pointer',flexShrink:0}}>
          ↺ Retry
        </button>
      </div>
      {/* Still show the generate form even when offline */}
      {showGenForm && (
        <div style={{background:'#faf5ff',border:'2px solid #ddd6fe',borderRadius:16,marginBottom:24,overflow:'hidden'}}>
          <div style={{background:'linear-gradient(135deg,#7c3aed,#6d28d9)',padding:'16px 24px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{color:'#fff'}}><div style={{fontWeight:800,fontSize:15}}>New Report Snapshot</div><div style={{fontSize:12,opacity:.8,marginTop:2}}>Enter term &amp; comment — stats captured when backend is available</div></div>
            <button onClick={() => setShowGenForm(false)} style={{background:'rgba(255,255,255,0.15)',border:'none',borderRadius:8,padding:'6px 10px',color:'#fff',cursor:'pointer',fontSize:12}}>✕ Cancel</button>
          </div>
          <div style={{padding:'20px 24px',display:'flex',flexDirection:'column',gap:16}}>
            <div><label style={{display:'block',fontSize:12,fontWeight:700,color:'#7c3aed',marginBottom:5}}>Term / Period</label>
              <input style={{width:'100%',padding:'9px 12px',border:'1.5px solid #ddd6fe',borderRadius:8,fontSize:13,fontFamily:'inherit',outline:'none',boxSizing:'border-box'}} value={genForm.term} onChange={e => setGenForm(p => ({...p,term:e.target.value}))} placeholder="e.g. Term 1 2026" /></div>
            <div><label style={{display:'block',fontSize:12,fontWeight:700,color:'#7c3aed',marginBottom:5}}>💬 Comment for Owner</label>
              <textarea style={{width:'100%',padding:'10px 12px',border:'1.5px solid #ddd6fe',borderRadius:8,fontSize:13,fontFamily:'inherit',outline:'none',resize:'vertical',minHeight:80,boxSizing:'border-box'}} value={genForm.comment} onChange={e => setGenForm(p => ({...p,comment:e.target.value}))} placeholder="Write a message for the owner…" /></div>
            <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
              <button onClick={() => setShowGenForm(false)} style={{padding:'10px 20px',background:'#f1f5f9',color:'#64748b',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer'}}>Cancel</button>
              <button onClick={handleGenerate} disabled={genLoading || !genForm.term.trim()} style={{display:'flex',alignItems:'center',gap:8,padding:'10px 22px',background:'linear-gradient(135deg,#7c3aed,#6d28d9)',color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:700,cursor:'pointer'}}>
                {genLoading ? 'Generating…' : '✓ Generate & Save Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="dash-content page-enter">
      {/* ── Header ── */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap',gap:12}}>
        <div>
          <h2 className="mgr-section-title" style={{marginBottom:4}}>School Reports</h2>
          <p className="mgr-section-sub">Live data from database · Generate &amp; send reports to Owner</p>
        </div>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          {toast.msg && (
            <span style={{fontSize:13,fontWeight:600,color: toast.ok ? '#16a34a' : '#dc2626',
              background: toast.ok ? '#f0fdf4' : '#fef2f2',
              border:`1px solid ${toast.ok ? '#86efac' : '#fca5a5'}`,
              borderRadius:8,padding:'6px 12px'}}>
              {toast.ok ? '✓' : '✗'} {toast.msg}
            </span>
          )}
          <button onClick={() => setShowGenForm(s => !s)}
            style={{display:'flex',alignItems:'center',gap:8,background:'linear-gradient(135deg,#7c3aed,#6d28d9)',color:'#fff',border:'none',borderRadius:10,padding:'10px 18px',fontSize:13,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 14px rgba(124,58,237,0.35)'}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>
            Generate Report
          </button>
        </div>
      </div>

      {/* ── Generate Report Form — full dashboard preview + comment + doc ── */}
      {showGenForm && (
        <div style={{background:'#faf5ff',border:'2px solid #ddd6fe',borderRadius:16,marginBottom:24,overflow:'hidden'}}>
          {/* Form Header */}
          <div style={{background:'linear-gradient(135deg,#7c3aed,#6d28d9)',padding:'16px 24px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{color:'#fff'}}>
              <div style={{fontWeight:800,fontSize:15}}>New Report Snapshot</div>
              <div style={{fontSize:12,opacity:.8,marginTop:2}}>Current dashboard data will be included automatically</div>
            </div>
            <button onClick={() => setShowGenForm(false)} style={{background:'rgba(255,255,255,0.15)',border:'none',borderRadius:8,padding:'6px 10px',color:'#fff',cursor:'pointer',fontSize:12}}>✕ Cancel</button>
          </div>

          <div style={{padding:'20px 24px',display:'flex',flexDirection:'column',gap:16}}>
            {/* Term field */}
            <div style={{display:'flex',gap:14,flexWrap:'wrap'}}>
              <div style={{flex:1,minWidth:180}}>
                <label style={{display:'block',fontSize:12,fontWeight:700,color:'#7c3aed',marginBottom:5}}>Term / Period</label>
                <input style={{width:'100%',padding:'9px 12px',border:'1.5px solid #ddd6fe',borderRadius:8,fontSize:13,fontFamily:'inherit',outline:'none',boxSizing:'border-box'}}
                  value={genForm.term} onChange={e => setGenForm(p => ({...p,term:e.target.value}))} placeholder="e.g. Term 1 2026" />
              </div>
            </div>

            {/* Live data preview inside form */}
            {overview && (
              <div>
                <div style={{fontSize:12,fontWeight:700,color:'#7c3aed',marginBottom:8,textTransform:'uppercase',letterSpacing:'0.05em'}}>
                  📊 Report Data Preview (auto-captured from DB)
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:10}}>
                  {[
                    { label:'Student Avg',   val:`${fmt1(overview.student_avg_score)}/100`, color:'#0891b2' },
                    { label:'Task Rate',     val:`${fmt1(overview.teacher_task_rate)}%`,    color:'#7c3aed' },
                    { label:'Attendance',    val:`${fmt1(overview.attendance_rate)}%`,      color:'#16a34a' },
                    { label:'Top Grade',     val: overview.top_grade||'N/A',               color:'#d97706' },
                    { label:'Students',      val: overview.total_students||0,              color:'#0891b2' },
                    { label:'Teachers',      val: overview.total_teachers||0,              color:'#1a73e8' },
                    { label:'Assistants',    val: overview.total_assistants||0,            color:'#16a34a' },
                    { label:'Fees Collected',val:`${Number(overview.collected||0).toLocaleString()} ETB`, color:'#d97706' },
                  ].map(s => (
                    <div key={s.label} style={{background:'#fff',borderRadius:8,padding:'10px 12px',border:'1px solid #ede9fe'}}>
                      <div style={{fontSize:16,fontWeight:800,color:s.color}}>{s.val}</div>
                      <div style={{fontSize:10,color:'#94a3b8',fontWeight:600,textTransform:'uppercase',marginTop:2}}>{s.label}</div>
                    </div>
                  ))}
                </div>
                {/* Teacher tasks */}
                {teachers.length > 0 && (
                  <div style={{marginTop:12,background:'#fff',borderRadius:8,padding:'12px 14px',border:'1px solid #ede9fe'}}>
                    <div style={{fontSize:11,fontWeight:700,color:'#7c3aed',marginBottom:8,textTransform:'uppercase',letterSpacing:'0.04em'}}>Teacher Task Completion</div>
                    {teachers.map(t => (
                      <div key={t.teacher_code} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6,fontSize:12}}>
                        <span style={{color:'#475569'}}>{t.full_name}</span>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          <div style={{width:80,height:5,background:'#e2e8f0',borderRadius:3}}>
                            <div style={{width:`${t.completion_pct||0}%`,height:'100%',borderRadius:3,background:'#7c3aed'}}/>
                          </div>
                          <span style={{fontWeight:700,color:'#7c3aed',minWidth:32,textAlign:'right'}}>{t.completion_pct||0}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* Grade distribution */}
                {grades.length > 0 && (
                  <div style={{marginTop:8,background:'#fff',borderRadius:8,padding:'12px 14px',border:'1px solid #ede9fe'}}>
                    <div style={{fontSize:11,fontWeight:700,color:'#d97706',marginBottom:8,textTransform:'uppercase',letterSpacing:'0.04em'}}>Grade Distribution</div>
                    <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
                      {grades.map(g => (
                        <div key={g.grade} style={{background:'#fef3c7',borderRadius:6,padding:'5px 10px',fontSize:12,fontWeight:700,color:'#92400e'}}>
                          {g.grade}: <span style={{color:'#d97706'}}>{g.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Comment for owner */}
            <div>
              <label style={{display:'block',fontSize:12,fontWeight:700,color:'#7c3aed',marginBottom:5}}>
                💬 Comment for Owner
              </label>
              <textarea
                style={{width:'100%',padding:'10px 12px',border:'1.5px solid #ddd6fe',borderRadius:8,fontSize:13,fontFamily:'inherit',outline:'none',resize:'vertical',minHeight:80,boxSizing:'border-box'}}
                value={genForm.comment}
                onChange={e => setGenForm(p => ({...p, comment:e.target.value}))}
                placeholder="Write a message or observation for the owner about this term's performance…"
              />
            </div>

            {/* Document attachment */}
            <div>
              <label style={{display:'block',fontSize:12,fontWeight:700,color:'#7c3aed',marginBottom:5}}>
                📎 Attach Document (optional)
              </label>
              <div
                onClick={() => fileRef.current?.click()}
                style={{border:'2px dashed #ddd6fe',borderRadius:8,padding:'14px 16px',cursor:'pointer',background:genForm.document?'#f5f3ff':'#fff',transition:'all 0.2s'}}>
                {genForm.document ? (
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:700,color:'#6d28d9'}}>{genForm.document.name}</div>
                      <div style={{fontSize:11,color:'#94a3b8'}}>{(genForm.document.size/1024).toFixed(1)} KB</div>
                    </div>
                    <button onClick={e=>{e.stopPropagation();setGenForm(p=>({...p,document:null}))}}
                      style={{background:'#fee2e2',border:'none',borderRadius:6,padding:'4px 8px',cursor:'pointer',color:'#dc2626',fontSize:11,fontWeight:700}}>Remove</button>
                  </div>
                ) : (
                  <div style={{display:'flex',alignItems:'center',gap:10,color:'#94a3b8'}}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="24" height="24"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                    <div>
                      <div style={{fontSize:13,fontWeight:600}}>Click to attach a document</div>
                      <div style={{fontSize:11}}>PDF, DOCX, XLSX, PNG, JPG — max 10MB</div>
                    </div>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" style={{display:'none'}}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                onChange={e => setGenForm(p => ({...p, document: e.target.files[0] || null}))} />
            </div>

            {/* Action buttons */}
            <div style={{display:'flex',gap:10,justifyContent:'flex-end',paddingTop:4}}>
              <button onClick={() => setShowGenForm(false)}
                style={{padding:'10px 20px',background:'#f1f5f9',color:'#64748b',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer'}}>
                Cancel
              </button>
              <button onClick={handleGenerate} disabled={genLoading || !genForm.term.trim()}
                style={{display:'flex',alignItems:'center',gap:8,padding:'10px 22px',background:'linear-gradient(135deg,#7c3aed,#6d28d9)',color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 12px rgba(124,58,237,0.3)'}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
                {genLoading ? 'Generating…' : 'Generate & Save Report'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Live Stats Cards ── */}
      {overview && (
        <div className="rpt-summary-row">
          {[
            { label:'Student Avg Score',  value:`${fmt1(overview.student_avg_score)}/100`, color:'#0891b2' },
            { label:'Teacher Task Rate',  value:`${fmt1(overview.teacher_task_rate)}%`,    color:'#7c3aed' },
            { label:'Attendance Rate',    value:`${fmt1(overview.attendance_rate)}%`,      color:'#16a34a' },
            { label:'Top Grade',          value: overview.top_grade || 'N/A',              color:'#d97706' },
            { label:'Total Students',     value: overview.total_students || 0,             color:'#0891b2' },
            { label:'Fees Collected',     value: `${Number(overview.collected||0).toLocaleString()} ETB`, color:'#16a34a' },
          ].map(s => (
            <div key={s.label} className="rpt-summary-card" style={{'--rc': s.color}}>
              <div className="rpt-summary-value" style={{color: s.color}}>{s.value}</div>
              <div className="rpt-summary-label">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Charts ── */}
      {teachers.length > 0 && (
        <div className="rpt-charts-row">
          <div className="rpt-chart-card" style={{flex:1}}>
            <div className="rpt-chart-title">Teacher Task Completion</div>
            <div className="rpt-chart-sub">Per teacher · live from DB</div>
            <div style={{marginTop:14}}>
              {teachers.map(t => (
                <div key={t.teacher_code} style={{marginBottom:12}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:4}}>
                    <span>{t.full_name}</span>
                    <span style={{fontWeight:700,color:'#7c3aed'}}>{t.completion_pct ?? 0}%</span>
                  </div>
                  <div style={{background:'#e2e8f0',borderRadius:6,height:8}}>
                    <div style={{width:`${t.completion_pct ?? 0}%`,height:'100%',borderRadius:6,background:'linear-gradient(90deg,#7c3aed,#a78bfa)'}}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {grades.length > 0 && (
            <div className="rpt-chart-card" style={{flex:1}}>
              <div className="rpt-chart-title">Grade Distribution</div>
              <div className="rpt-chart-sub">Active students per grade</div>
              <div style={{marginTop:14}}>
                {grades.map(g => (
                  <div key={g.grade} style={{marginBottom:12}}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:4}}>
                      <span>{g.grade}</span>
                      <span style={{fontWeight:700,color:'#d97706'}}>{g.count} students</span>
                    </div>
                    <div style={{background:'#e2e8f0',borderRadius:6,height:8}}>
                      <div style={{width:`${Math.min((g.count/10)*100,100)}%`,height:'100%',borderRadius:6,background:'linear-gradient(90deg,#d97706,#fbbf24)'}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {attBreak.length > 0 && (
        <div className="rpt-charts-row">
          <div className="rpt-chart-card" style={{flex:1}}>
            <div className="rpt-chart-title">Attendance Breakdown</div>
            <div className="rpt-chart-sub">By entity type</div>
            <div className="rpt-donuts-row" style={{marginTop:14}}>
              {attBreak.map(a => {
                const r=38, circ=2*Math.PI*r, dash=(a.pct/100)*circ
                const colors = {student:'#16a34a',teacher:'#0891b2',assistant:'#7c3aed'}
                const color  = colors[a.entity_type] || '#64748b'
                return (
                  <div key={a.entity_type} className="rpt-donut-item">
                    <svg width="96" height="96" viewBox="0 0 96 96">
                      <circle cx="48" cy="48" r={r} fill="none" stroke="#e2e8f0" strokeWidth="9"/>
                      <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="9"
                        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                        transform="rotate(-90 48 48)"/>
                      <text x="48" y="44" textAnchor="middle" fontSize="14" fontWeight="800" fill={color}>{a.pct}%</text>
                      <text x="48" y="58" textAnchor="middle" fontSize="9" fill="#94a3b8">Attend.</text>
                    </svg>
                    <div className="rpt-donut-label" style={{textTransform:'capitalize'}}>{a.entity_type}s</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Generated Reports List ── */}
      <div style={{marginTop:24}}>
        <div style={{fontSize:14,fontWeight:800,color:'#1e293b',marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          Generated Reports ({reports.length})
        </div>
        {reports.length === 0 ? (
          <div style={{textAlign:'center',padding:'40px 20px',color:'#94a3b8',background:'#f8fafc',borderRadius:12,border:'1.5px dashed #e2e8f0'}}>
            <div style={{fontSize:32,marginBottom:8}}>📄</div>
            <div style={{fontSize:13}}>No reports generated yet. Click <strong>Generate Report</strong> to create one.</div>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {reports.map(r => (
              <div key={r.id} style={{background:'#fff',border:'1.5px solid #e2e8f0',borderRadius:12,padding:'16px 20px',display:'flex',alignItems:'center',gap:16,flexWrap:'wrap',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
                {/* Status badge */}
                <span style={{padding:'4px 10px',borderRadius:20,fontSize:11,fontWeight:700,
                  background: r.status==='sent' ? '#dcfce7' : '#f1f5f9',
                  color:      r.status==='sent' ? '#15803d' : '#64748b',
                  flexShrink:0}}>
                  {r.status==='sent' ? '✓ Sent to Owner' : '● Draft'}
                </span>
                {/* Info */}
                <div style={{flex:1,minWidth:160}}>
                  <div style={{fontWeight:700,fontSize:14,color:'#1e293b'}}>{r.term}</div>
                  <div style={{fontSize:12,color:'#94a3b8',marginTop:2}}>
                    Generated {fmtDate(r.created_at)}
                    {r.status==='sent' && r.sent_at && ` · Sent ${fmtDate(r.sent_at)}`}
                  </div>
                  {(r.comment || r.notes) && <div style={{fontSize:12,color:'#64748b',marginTop:3,fontStyle:'italic'}}>💬 "{r.comment || r.notes}"</div>}
                  {r.document_name && (
                    <div style={{fontSize:12,color:'#7c3aed',marginTop:3,display:'flex',alignItems:'center',gap:4}}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="11" height="11"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      {r.document_name}
                    </div>
                  )}
                </div>
                {/* Stats */}
                <div style={{display:'flex',gap:16,fontSize:12,color:'#475569',flexShrink:0}}>
                  <span>Avg: <strong style={{color:'#0891b2'}}>{Number(r.student_avg_score||0).toFixed(1)}</strong></span>
                  <span>Tasks: <strong style={{color:'#7c3aed'}}>{Number(r.teacher_task_rate||0).toFixed(1)}%</strong></span>
                  <span>Att: <strong style={{color:'#16a34a'}}>{Number(r.attendance_rate||0).toFixed(1)}%</strong></span>
                  <span>Students: <strong>{r.total_students||0}</strong></span>
                </div>
                {/* Actions */}
                <div style={{display:'flex',gap:8,flexShrink:0}}>
                  {r.status !== 'sent' && (
                    <button
                      onClick={() => handleSend(r.id)}
                      disabled={sendingId === r.id}
                      style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',background:'linear-gradient(135deg,#0891b2,#0e7490)',color:'#fff',border:'none',borderRadius:8,fontSize:12,fontWeight:700,cursor:'pointer'}}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                      {sendingId === r.id ? 'Sending…' : 'Send to Owner'}
                    </button>
                  )}
                  {r.status === 'sent' && (
                    <span style={{padding:'8px 14px',background:'#dcfce7',color:'#15803d',borderRadius:8,fontSize:12,fontWeight:700}}>
                      ✓ Sent
                    </span>
                  )}
                  <button onClick={() => handleDelete(r.id)}
                    style={{padding:'8px 12px',background:'#fee2e2',color:'#dc2626',border:'none',borderRadius:8,fontSize:12,fontWeight:700,cursor:'pointer'}}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MANAGER SETTINGS SECTION
// — View & update system settings, manage all users, reset passwords
// ═══════════════════════════════════════════════════════════════════════════════
function ManagerSettingsSection() {
  const [tab, setTab]             = useState('settings')
  const [settings, setSettings]   = useState([])
  const [users, setUsers]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [editKey, setEditKey]     = useState(null)
  const [editVal, setEditVal]     = useState('')
  const [pwdUserId, setPwdUserId] = useState(null)
  const [newPwd, setNewPwd]       = useState('')
  const [editUser, setEditUser]   = useState(null)
  const [editUserForm, setEditUserForm] = useState({})
  const [msg, setMsg]             = useState('')
  const [err, setErr]             = useState('')

  const showMsg = (m) => { setMsg(m); setErr(''); setTimeout(()=>setMsg(''), 3000) }
  const showErr = (e) => { setErr(e); setMsg(''); setTimeout(()=>setErr(''), 3000) }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [s, u] = await Promise.all([settingsAPI.getAll(), usersAPI.getAll()])
        setSettings(s)
        setUsers(u)
      } catch (e) {
        showErr('Could not load data — is the backend running?')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const saveSetting = async (key) => {
    try {
      const updated = await settingsAPI.update(key, editVal)
      setSettings(prev => prev.map(s => s.key_name === key ? updated : s))
      setEditKey(null)
      showMsg(`"${key}" updated ✓`)
    } catch (e) { showErr(e.message) }
  }

  const saveUser = async () => {
    try {
      const updated = await usersAPI.update(editUser.id, editUserForm)
      setUsers(prev => prev.map(u => u.id === editUser.id ? updated : u))
      setEditUser(null)
      showMsg('User updated ✓')
    } catch (e) { showErr(e.message) }
  }

  const resetPassword = async () => {
    if (!newPwd || newPwd.length < 6) return showErr('Password must be at least 6 characters.')
    try {
      await usersAPI.updatePassword(pwdUserId, { password: newPwd })
      setPwdUserId(null)
      setNewPwd('')
      showMsg('Password reset ✓')
    } catch (e) { showErr(e.message) }
  }

  const deleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return
    try {
      await usersAPI.delete(id)
      setUsers(prev => prev.filter(u => u.id !== id))
      showMsg('User deleted ✓')
    } catch (e) { showErr(e.message) }
  }

  const roleColor = { owner:'#7c3aed', manager:'#1a73e8', assistant:'#0891b2', teacher:'#16a34a' }

  return (
    <div className="dash-content page-enter">
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20,flexWrap:'wrap'}}>
        <h2 style={{fontSize:22,fontWeight:800,color:'#1e293b',margin:0}}>Settings & User Management</h2>
        {msg && <span style={{background:'#dcfce7',color:'#16a34a',padding:'5px 14px',borderRadius:20,fontSize:13,fontWeight:700}}>{msg}</span>}
        {err && <span style={{background:'#fee2e2',color:'#dc2626',padding:'5px 14px',borderRadius:20,fontSize:13,fontWeight:700}}>{err}</span>}
      </div>

      {/* Tab switcher */}
      <div style={{display:'flex',gap:8,marginBottom:20}}>
        {['settings','users'].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:'8px 20px',borderRadius:20,border:'none',cursor:'pointer',fontWeight:700,fontSize:13,
            background:tab===t?'#1a73e8':'#f1f5f9',color:tab===t?'#fff':'#64748b'}}>
            {t==='settings' ? '⚙️ System Settings' : '👥 Manage Users'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{textAlign:'center',padding:60,color:'#94a3b8'}}>Loading…</div>
      ) : tab === 'settings' ? (
        /* ── SETTINGS TAB ── */
        <div style={{background:'#fff',borderRadius:14,border:'1.5px solid #e2e8f0',overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:14}}>
            <thead>
              <tr style={{background:'#f8fafc'}}>
                <th style={{padding:'10px 16px',textAlign:'left',color:'#64748b',fontWeight:700,fontSize:11,textTransform:'uppercase',borderBottom:'1.5px solid #e2e8f0'}}>Key</th>
                <th style={{padding:'10px 16px',textAlign:'left',color:'#64748b',fontWeight:700,fontSize:11,textTransform:'uppercase',borderBottom:'1.5px solid #e2e8f0'}}>Value</th>
                <th style={{padding:'10px 16px',textAlign:'right',color:'#64748b',fontWeight:700,fontSize:11,textTransform:'uppercase',borderBottom:'1.5px solid #e2e8f0'}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {settings.map((s,i) => (
                <tr key={s.key_name} style={{borderBottom:'1px solid #f1f5f9',background:i%2===1?'#fafafa':'#fff'}}>
                  <td style={{padding:'12px 16px',fontWeight:600,color:'#334155'}}>{s.key_name}</td>
                  <td style={{padding:'12px 16px',color:'#475569'}}>
                    {editKey === s.key_name ? (
                      <input value={editVal} onChange={e=>setEditVal(e.target.value)}
                        style={{border:'1.5px solid #1a73e8',borderRadius:8,padding:'6px 10px',fontSize:14,width:'100%',maxWidth:260,outline:'none'}}/>
                    ) : s.value}
                  </td>
                  <td style={{padding:'12px 16px',textAlign:'right'}}>
                    {editKey === s.key_name ? (
                      <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
                        <button onClick={()=>saveSetting(s.key_name)} style={{background:'#16a34a',color:'#fff',border:'none',borderRadius:8,padding:'6px 14px',fontWeight:700,cursor:'pointer',fontSize:12}}>Save</button>
                        <button onClick={()=>setEditKey(null)} style={{background:'#f1f5f9',color:'#64748b',border:'none',borderRadius:8,padding:'6px 10px',fontWeight:600,cursor:'pointer',fontSize:12}}>Cancel</button>
                      </div>
                    ) : (
                      <button onClick={()=>{setEditKey(s.key_name);setEditVal(s.value)}}
                        style={{background:'#e0f2fe',color:'#0891b2',border:'none',borderRadius:8,padding:'6px 14px',fontWeight:700,cursor:'pointer',fontSize:12}}>
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!settings.length && <div style={{textAlign:'center',padding:40,color:'#94a3b8'}}>No settings found. Import schema.sql to seed defaults.</div>}
        </div>
      ) : (
        /* ── USERS TAB ── */
        <div style={{background:'#fff',borderRadius:14,border:'1.5px solid #e2e8f0',overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:14}}>
            <thead>
              <tr style={{background:'#f8fafc'}}>
                {['Login ID','Name','Email','Role','Action'].map(h=>(
                  <th key={h} style={{padding:'10px 14px',textAlign:'left',color:'#64748b',fontWeight:700,fontSize:11,textTransform:'uppercase',borderBottom:'1.5px solid #e2e8f0'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u,i)=>(
                <tr key={u.id} style={{borderBottom:'1px solid #f1f5f9',background:i%2===1?'#fafafa':'#fff'}}>
                  <td style={{padding:'11px 14px',fontWeight:700,color:'#334155',fontFamily:'monospace'}}>{u.login_id}</td>
                  <td style={{padding:'11px 14px',color:'#1e293b',fontWeight:600}}>{u.full_name}</td>
                  <td style={{padding:'11px 14px',color:'#64748b',fontSize:12}}>{u.email||'—'}</td>
                  <td style={{padding:'11px 14px'}}>
                    <span style={{background:roleColor[u.role]+'22',color:roleColor[u.role]||'#64748b',padding:'3px 10px',borderRadius:20,fontSize:12,fontWeight:700,textTransform:'capitalize'}}>{u.role}</span>
                  </td>
                  <td style={{padding:'11px 14px'}}>
                    <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                      <button onClick={()=>{setEditUser(u);setEditUserForm({full_name:u.full_name,email:u.email||'',role:u.role})}}
                        style={{background:'#e0f2fe',color:'#0891b2',border:'none',borderRadius:7,padding:'5px 12px',fontWeight:700,cursor:'pointer',fontSize:12}}>Edit</button>
                      <button onClick={()=>{setPwdUserId(u.id);setNewPwd('')}}
                        style={{background:'#fef3c7',color:'#d97706',border:'none',borderRadius:7,padding:'5px 12px',fontWeight:700,cursor:'pointer',fontSize:12}}>Reset Pwd</button>
                      <button onClick={()=>deleteUser(u.id, u.full_name)}
                        style={{background:'#fee2e2',color:'#dc2626',border:'none',borderRadius:7,padding:'5px 10px',fontWeight:700,cursor:'pointer',fontSize:12}}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!users.length && <div style={{textAlign:'center',padding:40,color:'#94a3b8'}}>No users found.</div>}
        </div>
      )}

      {/* ── Edit User Modal ── */}
      {editUser && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}} onClick={()=>setEditUser(null)}>
          <div style={{background:'#fff',borderRadius:16,padding:28,width:380,boxShadow:'0 24px 60px rgba(0,0,0,.18)'}} onClick={e=>e.stopPropagation()}>
            <h3 style={{margin:'0 0 18px',fontSize:17,fontWeight:800}}>Edit User — {editUser.full_name}</h3>
            {['full_name','email'].map(f=>(
              <div key={f} style={{marginBottom:14}}>
                <label style={{display:'block',fontSize:12,fontWeight:700,color:'#64748b',marginBottom:5,textTransform:'uppercase'}}>{f.replace('_',' ')}</label>
                <input value={editUserForm[f]||''} onChange={e=>setEditUserForm(p=>({...p,[f]:e.target.value}))}
                  style={{width:'100%',border:'1.5px solid #e2e8f0',borderRadius:8,padding:'8px 12px',fontSize:14,outline:'none',boxSizing:'border-box'}}/>
              </div>
            ))}
            <div style={{marginBottom:18}}>
              <label style={{display:'block',fontSize:12,fontWeight:700,color:'#64748b',marginBottom:5,textTransform:'uppercase'}}>Role</label>
              <select value={editUserForm.role||''} onChange={e=>setEditUserForm(p=>({...p,role:e.target.value}))}
                style={{width:'100%',border:'1.5px solid #e2e8f0',borderRadius:8,padding:'8px 12px',fontSize:14,outline:'none'}}>
                {['owner','manager','assistant','teacher'].map(r=><option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
              <button onClick={()=>setEditUser(null)} style={{background:'#f1f5f9',color:'#64748b',border:'none',borderRadius:8,padding:'9px 18px',fontWeight:700,cursor:'pointer'}}>Cancel</button>
              <button onClick={saveUser} style={{background:'#1a73e8',color:'#fff',border:'none',borderRadius:8,padding:'9px 20px',fontWeight:700,cursor:'pointer'}}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reset Password Modal ── */}
      {pwdUserId && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}} onClick={()=>setPwdUserId(null)}>
          <div style={{background:'#fff',borderRadius:16,padding:28,width:340,boxShadow:'0 24px 60px rgba(0,0,0,.18)'}} onClick={e=>e.stopPropagation()}>
            <h3 style={{margin:'0 0 16px',fontSize:17,fontWeight:800}}>Reset Password</h3>
            <label style={{display:'block',fontSize:12,fontWeight:700,color:'#64748b',marginBottom:6,textTransform:'uppercase'}}>New Password</label>
            <input type="password" value={newPwd} onChange={e=>setNewPwd(e.target.value)} placeholder="Min. 6 characters"
              style={{width:'100%',border:'1.5px solid #e2e8f0',borderRadius:8,padding:'9px 12px',fontSize:14,outline:'none',marginBottom:18,boxSizing:'border-box'}}/>
            <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
              <button onClick={()=>setPwdUserId(null)} style={{background:'#f1f5f9',color:'#64748b',border:'none',borderRadius:8,padding:'9px 16px',fontWeight:700,cursor:'pointer'}}>Cancel</button>
              <button onClick={resetPassword} disabled={newPwd.length<6}
                style={{background:newPwd.length>=6?'#d97706':'#fde68a',color:'#fff',border:'none',borderRadius:8,padding:'9px 18px',fontWeight:700,cursor:'pointer'}}>
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
