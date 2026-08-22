import { useState, useRef } from 'react'
import Sidebar from '../../components/Sidebar'
import { useFileStore } from '../../context/FileStore'
import { useTeacherStore } from '../../context/TeacherStore'
import TeacherProfile from '../../components/TeacherProfile'
import { useLang } from '../../context/LangContext'
import "./style.css"

const teachers = [
  { name: 'Mr. Ali',    subject: 'Math',    tasks: 8, done: 7, att: 95, img: 'https://i.pravatar.cc/80?img=13',
    id:'T001', age:34, gender:'Male', phone:'+1 555-0201', email:'ali@hidaya.edu', experience:'8 years', department:'Mathematics', attendance:'95%', tasksCompleted:'87%', rating:4.7, status:'Active',
    branch:'Main Campus', currentTopic:'Quadratic Equations — Chapter 5',
    classes:['Grade 7A','Grade 8B','Grade 9A'],
    subjects:[{name:'Algebra',score:92},{name:'Geometry',score:88},{name:'Calculus',score:85}],
    history:[{term:'Term 1 2025',attendance:'93%',tasks:'82%'},{term:'Term 2 2025',attendance:'94%',tasks:'85%'},{term:'Term 1 2026',attendance:'95%',tasks:'87%'}] },
  { name: 'Ms. Sara',   subject: 'Science', tasks: 6, done: 6, att: 100, img: 'https://i.pravatar.cc/80?img=44',
    id:'T002', age:29, gender:'Female', phone:'+1 555-0202', email:'sara@hidaya.edu', experience:'5 years', department:'Sciences', attendance:'100%', tasksCompleted:'100%', rating:4.9, status:'Active',
    branch:'Main Campus', currentTopic:'Cell Division — Mitosis & Meiosis',
    classes:['Grade 8A','Grade 9B'],
    subjects:[{name:'Biology',score:96},{name:'Chemistry',score:94},{name:'Physics',score:90}],
    history:[{term:'Term 1 2025',attendance:'98%',tasks:'96%'},{term:'Term 2 2025',attendance:'100%',tasks:'98%'},{term:'Term 1 2026',attendance:'100%',tasks:'100%'}] },
  { name: 'Mr. Omar',   subject: 'English', tasks: 9, done: 5, att: 88, img: 'https://i.pravatar.cc/80?img=59',
    id:'T003', age:41, gender:'Male', phone:'+1 555-0203', email:'omar@hidaya.edu', experience:'14 years', department:'Languages', attendance:'88%', tasksCompleted:'55%', rating:3.8, status:'On Leave',
    branch:'North Branch', currentTopic:'Essay Writing — Argumentative Style',
    classes:['Grade 7B','Grade 8A'],
    subjects:[{name:'Grammar',score:80},{name:'Literature',score:75},{name:'Writing',score:72}],
    history:[{term:'Term 1 2025',attendance:'90%',tasks:'70%'},{term:'Term 2 2025',attendance:'89%',tasks:'62%'},{term:'Term 1 2026',attendance:'88%',tasks:'55%'}] },
  { name: 'Ms. Fatima', subject: 'History', tasks: 7, done: 7, att: 92, img: 'https://i.pravatar.cc/80?img=47',
    id:'T004', age:36, gender:'Female', phone:'+1 555-0204', email:'fatima@hidaya.edu', experience:'9 years', department:'Humanities', attendance:'92%', tasksCompleted:'100%', rating:4.6, status:'Active',
    branch:'Main Campus', currentTopic:'The Ottoman Empire — Rise and Fall',
    classes:['Grade 9A','Grade 9B'],
    subjects:[{name:'World History',score:90},{name:'Islamic History',score:95},{name:'Geography',score:88}],
    history:[{term:'Term 1 2025',attendance:'90%',tasks:'95%'},{term:'Term 2 2025',attendance:'91%',tasks:'98%'},{term:'Term 1 2026',attendance:'92%',tasks:'100%'}] },
]

const schedule = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const periods  = ['8:00', '9:00', '10:00', '11:00', '12:00']
const timetableData = {
  'Mr. Ali':    { color: '#7c3aed', bg: '#ede9fe' },
  'Ms. Sara':   { color: '#0891b2', bg: '#e0f2fe' },
  'Mr. Omar':   { color: '#d97706', bg: '#fef3c7' },
  'Ms. Fatima': { color: '#16a34a', bg: '#dcfce7' },
}
const subjectMap = [
  ['Math','Science','English','History','PE'],
  ['Arabic','Math','Science','PE','History'],
  ['English','History','Math','Science','Arabic'],
  ['PE','Arabic','History','Math','Science'],
  ['Science','English','PE','Arabic','Math'],
]
const teacherMap = [
  ['Mr. Ali','Ms. Sara','Mr. Omar','Ms. Fatima','Mr. Ali'],
  ['Ms. Fatima','Mr. Ali','Ms. Sara','Mr. Omar','Ms. Sara'],
  ['Mr. Omar','Ms. Fatima','Mr. Ali','Ms. Sara','Ms. Fatima'],
  ['Ms. Sara','Mr. Omar','Ms. Fatima','Mr. Ali','Mr. Omar'],
  ['Mr. Ali','Ms. Sara','Mr. Omar','Ms. Fatima','Mr. Ali'],
]

// Default grade & class per slot (5 periods × 5 days)
const defaultClassMap = [
  [{grade:'8',cls:'A'},{grade:'8',cls:'B'},{grade:'9',cls:'A'},{grade:'7',cls:'C'},{grade:'8',cls:'A'}],
  [{grade:'7',cls:'B'},{grade:'9',cls:'A'},{grade:'8',cls:'C'},{grade:'9',cls:'B'},{grade:'7',cls:'A'}],
  [{grade:'9',cls:'B'},{grade:'7',cls:'A'},{grade:'8',cls:'A'},{grade:'8',cls:'C'},{grade:'9',cls:'A'}],
  [{grade:'8',cls:'C'},{grade:'9',cls:'B'},{grade:'7',cls:'A'},{grade:'8',cls:'B'},{grade:'7',cls:'C'}],
  [{grade:'7',cls:'A'},{grade:'8',cls:'A'},{grade:'9',cls:'C'},{grade:'7',cls:'B'},{grade:'8',cls:'B'}],
]

const allStudents = [
  { id:'S001', name:'Ali Hassan',    grade:'Grade 8', avg:'87%', rank:1, attendance:'94%', status:'Active',
    img:'https://i.pravatar.cc/120?img=12', age:14, gender:'Male',   phone:'+1 555-0101', email:'ali.hassan@hidaya.edu',
    subjects:[{name:'Mathematics',score:90,grade:'A'},{name:'Science',score:85,grade:'A-'},{name:'English',score:88,grade:'A'},{name:'Arabic',score:92,grade:'A+'},{name:'History',score:80,grade:'B+'}],
    history:[{term:'Term 1 2025',avg:'80%',rank:3},{term:'Term 2 2025',avg:'84%',rank:2},{term:'Term 1 2026',avg:'87%',rank:1}] },
  { id:'S002', name:'Sara Ahmed',    grade:'Grade 8', avg:'82%', rank:2, attendance:'98%', status:'Active',
    img:'https://i.pravatar.cc/120?img=45', age:13, gender:'Female', phone:'+1 555-0102', email:'sara.ahmed@hidaya.edu',
    subjects:[{name:'Mathematics',score:78,grade:'B+'},{name:'Science',score:84,grade:'A-'},{name:'English',score:88,grade:'A'},{name:'Arabic',score:80,grade:'B+'},{name:'History',score:82,grade:'A-'}],
    history:[{term:'Term 1 2025',avg:'76%',rank:4},{term:'Term 2 2025',avg:'79%',rank:3},{term:'Term 1 2026',avg:'82%',rank:2}] },
  { id:'S003', name:'Omar Khalid',   grade:'Grade 9', avg:'79%', rank:3, attendance:'88%', status:'Active',
    img:'https://i.pravatar.cc/120?img=33', age:15, gender:'Male',   phone:'+1 555-0103', email:'omar.khalid@hidaya.edu',
    subjects:[{name:'Mathematics',score:75,grade:'B'},{name:'Science',score:80,grade:'B+'},{name:'English',score:82,grade:'A-'},{name:'Arabic',score:78,grade:'B+'},{name:'History',score:79,grade:'B+'}],
    history:[{term:'Term 1 2025',avg:'72%',rank:5},{term:'Term 2 2025',avg:'76%',rank:4},{term:'Term 1 2026',avg:'79%',rank:3}] },
  { id:'S004', name:'Fatima Noor',   grade:'Grade 9', avg:'91%', rank:1, attendance:'97%', status:'Active',
    img:'https://i.pravatar.cc/120?img=47', age:15, gender:'Female', phone:'+1 555-0104', email:'fatima.noor@hidaya.edu',
    subjects:[{name:'Mathematics',score:95,grade:'A+'},{name:'Science',score:92,grade:'A+'},{name:'English',score:89,grade:'A'},{name:'Arabic',score:94,grade:'A+'},{name:'History',score:88,grade:'A'}],
    history:[{term:'Term 1 2025',avg:'85%',rank:2},{term:'Term 2 2025',avg:'88%',rank:1},{term:'Term 1 2026',avg:'91%',rank:1}] },
  { id:'S005', name:'Yusuf Ibrahim', grade:'Grade 7', avg:'74%', rank:4, attendance:'85%', status:'Active',
    img:'https://i.pravatar.cc/120?img=68', age:12, gender:'Male',   phone:'+1 555-0105', email:'yusuf.ibrahim@hidaya.edu',
    subjects:[{name:'Mathematics',score:70,grade:'B-'},{name:'Science',score:75,grade:'B'},{name:'English',score:78,grade:'B+'},{name:'Arabic',score:72,grade:'B'},{name:'History',score:74,grade:'B'}],
    history:[{term:'Term 1 2025',avg:'68%',rank:6},{term:'Term 2 2025',avg:'71%',rank:5},{term:'Term 1 2026',avg:'74%',rank:4}] },
  { id:'S006', name:'Aisha Malik',   grade:'Grade 7', avg:'88%', rank:1, attendance:'96%', status:'Active',
    img:'https://i.pravatar.cc/120?img=49', age:12, gender:'Female', phone:'+1 555-0106', email:'aisha.malik@hidaya.edu',
    subjects:[{name:'Mathematics',score:90,grade:'A'},{name:'Science',score:87,grade:'A'},{name:'English',score:91,grade:'A+'},{name:'Arabic',score:88,grade:'A'},{name:'History',score:85,grade:'A'}],
    history:[{term:'Term 1 2025',avg:'82%',rank:2},{term:'Term 2 2025',avg:'85%',rank:1},{term:'Term 1 2026',avg:'88%',rank:1}] },
]

function StudentViewModal({ student, onClose }) {
  const avg = Math.round(student.subjects.reduce((a,s)=>a+s.score,0)/student.subjects.length)
  return (
    <div className="svm-overlay" onClick={onClose}>
      <div className="svm-modal" onClick={e=>e.stopPropagation()}>
        <button className="svm-close" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        {/* Header */}
        <div className="svm-header">
          <div className="svm-header-pattern" />
          <div className="svm-header-inner">
            <div className="svm-avatar-wrap">
              <img src={student.img} alt={student.name} className="svm-avatar" />
              <span className="svm-status-dot" />
            </div>
            <div className="svm-identity">
              <h2>{student.name}</h2>
              <div className="svm-chips">
                <span className="svm-chip grade">{student.grade}</span>
                <span className="svm-chip id">{student.id}</span>
                <span className="svm-chip active">✓ {student.status}</span>
              </div>
              <div className="svm-contact">
                <span>📧 {student.email}</span>
                <span>📞 {student.phone}</span>
                <span>🎂 Age {student.age} · {student.gender}</span>
              </div>
            </div>
            <div className="svm-header-stats">
              <div className="svm-hstat" style={{'--hc':'#0891b2'}}>
                <div className="svm-hstat-val">#{student.rank}</div>
                <div className="svm-hstat-lbl">Class Rank</div>
              </div>
              <div className="svm-hstat" style={{'--hc':'#16a34a'}}>
                <div className="svm-hstat-val">{student.attendance}</div>
                <div className="svm-hstat-lbl">Attendance</div>
              </div>
              <div className="svm-hstat" style={{'--hc':'#d97706'}}>
                <div className="svm-hstat-val">{avg}%</div>
                <div className="svm-hstat-lbl">Avg Score</div>
              </div>
            </div>
          </div>
        </div>

        <div className="svm-body">
          <div className="svm-grid">
            {/* Grades */}
            <div className="svm-section">
              <div className="svm-section-title">📊 Subject Grades</div>
              <div className="svm-grades">
                {student.subjects.map(s => (
                  <div key={s.name} className="svm-grade-row">
                    <span className="svm-subj">{s.name}</span>
                    <div className="svm-bar-wrap">
                      <div className="svm-bar" style={{width:`${s.score}%`}} />
                    </div>
                    <span className="svm-score">{s.score}%</span>
                    <span className={`svm-badge svm-${s.grade.replace('+','p').replace('-','m')}`}>{s.grade}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* History + Donut */}
            <div className="svm-section">
              <div className="svm-section-title">📈 Performance History</div>
              <div className="svm-history">
                {student.history.map((h,i) => (
                  <div key={h.term} className="svm-hist-row">
                    <div className="svm-hist-num">{i+1}</div>
                    <div className="svm-hist-info">
                      <div className="svm-hist-term">{h.term}</div>
                      <div className="svm-hist-bar-wrap">
                        <div className="svm-hist-bar" style={{width:h.avg}} />
                      </div>
                    </div>
                    <div className="svm-hist-right">
                      <div className="svm-hist-avg">{h.avg}</div>
                      <div className="svm-hist-rank">Rank #{h.rank}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="svm-donut-wrap">
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#e2e8f0" strokeWidth="10"/>
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#0891b2" strokeWidth="10"
                    strokeDasharray={`${(avg/100)*238.8} 238.8`} strokeLinecap="round"
                    transform="rotate(-90 50 50)"/>
                  <text x="50" y="55" textAnchor="middle" fontSize="16" fontWeight="800" fill="#0891b2">{avg}%</text>
                </svg>
                <div className="svm-donut-label">Overall Average</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

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
                <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="40" height="40"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>
              </div>
            <div className="af-sent-title">File Sent!</div>
            <div className="af-sent-sub">Pending acceptance by {target.name}</div>
          </div>
        ) : (
          <>
            <div className="af-modal-header">
              <div className="af-modal-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
              </div>
              <div>
                <div className="af-modal-title">Attach File</div>
                <div className="af-modal-sub">Sending to <strong>{target.name}</strong></div>
              </div>
              <button className="af-close" onClick={onClose}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="af-modal-body">
              <div className="af-field">
                <label>📁 Select File</label>
                <div className={`af-dropzone ${file ? 'has-file' : ''}`} onClick={() => fileRef.current.click()}>
                  {file ? (
                    <div className="af-file-info">
                      <span className="af-file-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="24" height="24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      </span>
                      <div>
                        <div className="af-file-name">{file.name}</div>
                        <div className="af-file-size">{(file.size/1024).toFixed(1)} KB</div>
                      </div>
                      <button className="af-file-remove" onClick={e=>{e.stopPropagation();setFile(null)}}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="11" height="11"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  ) : (
                    <div className="af-dropzone-empty">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36" style={{color:'#94a3b8'}}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                      <span>Click to browse</span>
                      <span className="af-dropzone-hint">PDF, DOCX, XLSX, PNG, JPG</span>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" style={{display:'none'}} onChange={e=>setFile(e.target.files[0])} />
              </div>
              <div className="af-field">
                <label>💬 Message (optional)</label>
                <textarea placeholder="Add a note..." value={message} onChange={e=>setMessage(e.target.value)} rows={3} />
              </div>
              <div className="af-field">
                <label>🔐 Permission</label>
                <div className="af-perm-row">
                  <button className={`af-perm-btn ${permission==='view'?'active':''}`} onClick={()=>setPermission('view')}>👁️ View Only</button>
                  <button className={`af-perm-btn ${permission==='download'?'active':''}`} onClick={()=>setPermission('download')}>⬇️ Download</button>
                </div>
              </div>
              <div className="af-modal-actions">
                <button className="af-cancel" onClick={onClose}>Cancel</button>
                <button className="af-send" onClick={handleSend} disabled={!file}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
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

export default function AssistantDashboard() {
  const [active, setActive] = useState('overview')
  const [mobileOpen, setMobileOpen] = useState(false)
  const { t } = useLang()

  const sidebarItems = [
    { id: 'overview',    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>, label: t('overview') },
    { id: 'calendar',    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, label: t('calendar') },
    { id: 'tasks',       icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>, label: t('taskMonitoring') },
    { id: 'attendance',  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>, label: t('teacherAttendance') },
    { id: 'performance', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>, label: t('performanceReport') },
    { id: 'students',    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, label: t('students') },
    { id: 'results',     icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>, label: t('studentResults') },
    { id: 'files',       icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>, label: t('receivedFiles') },
  ]
  const [editMode, setEditMode] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  // Mutable timetable state — starts from the static data
  const [liveSubjectMap, setLiveSubjectMap] = useState(subjectMap.map(r => [...r]))
  const [liveTeacherMap, setLiveTeacherMap] = useState(teacherMap.map(r => [...r]))
  const [liveClassMap, setLiveClassMap] = useState(
    defaultClassMap.map(r => r.map(c => ({ ...c })))
  )
  const [slotSubject, setSlotSubject] = useState('')
  const [slotTeacher, setSlotTeacher] = useState('')
  const [slotGrade, setSlotGrade] = useState('')
  const [slotClass, setSlotClass] = useState('')
  const { files, updateStatus, sendFile } = useFileStore()
  const myFiles = files.filter(f => f.target?.id?.startsWith('A'))
  const { studentResults, confirmedAttendance, topics } = useTeacherStore()
  const [profileTeacher, setProfileTeacher] = useState(null)
  const [attachTarget, setAttachTarget] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [studentSearch, setStudentSearch] = useState('')
  const [scheduleSearch, setScheduleSearch] = useState('')

  const renderContent = () => {
    switch (active) {

      case 'overview': {
        const today = new Date()
        const todayStr = today.toISOString().split('T')[0]
        const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

        // Compute live stats from confirmedAttendance map
        const totalTeachers = teachers.length
        const confirmedToday = teachers.filter(t => confirmedAttendance.has(t.id + '|' + todayStr))
        const notConfirmedToday = teachers.filter(t => !confirmedAttendance.has(t.id + '|' + todayStr))
        const attRate = Math.round((confirmedToday.length / totalTeachers) * 100)

        // Task stats
        const totalTasks = teachers.reduce((a, t) => a + t.tasks, 0)
        const doneTasks  = teachers.reduce((a, t) => a + t.done, 0)
        const taskRate   = Math.round((doneTasks / totalTasks) * 100)

        // Today's topics
        const todayTopics = topics.filter(t => t.date === todayStr)
        const teachersWithTopic = new Set(todayTopics.map(t => t.teacherId))
        const missingTopics = teachers.filter(t => !teachersWithTopic.has(t.id))

        // Activity feed — confirmed attendance entries (latest first)
        const feed = [...confirmedAttendance.values()]
          .sort((a, b) => b.date.localeCompare(a.date))
          .slice(0, 6)

        // Pending files
        const pendingFiles = files.filter(f => f.status === 'pending')

        return (
          <div className="dash-content page-enter">

            {/* Header */}
            <div className="aov-header">
              <div>
                <h2 className="aov-title">Assistant Overview</h2>
                <p className="aov-sub">{today.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</p>
              </div>
              <div className="aov-quick-btns">
                <button className="aov-qbtn aov-qbtn-primary" onClick={() => setActive('attendance')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
                  Attendance
                </button>
                <button className="aov-qbtn" onClick={() => setActive('calendar')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  Calendar
                </button>
                <button className="aov-qbtn" onClick={() => setActive('tasks')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                  Tasks
                </button>
                <button className="aov-qbtn" onClick={() => setActive('files')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                  Files {pendingFiles.length > 0 && <span className="aov-dot">{pendingFiles.length}</span>}
                </button>
              </div>
            </div>

            {/* Alerts */}
            {(notConfirmedToday.length > 0 || missingTopics.length > 0 || pendingFiles.length > 0) && (
              <div className="aov-alerts">
                <div className="aov-alerts-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  Pending Actions
                </div>
                {notConfirmedToday.length > 0 && (
                  <div className="aov-alert aov-alert-warn">
                    <strong>{notConfirmedToday.length} teacher{notConfirmedToday.length > 1 ? 's' : ''}</strong> have not confirmed attendance today:&nbsp;
                    {notConfirmedToday.map(t => t.name).join(', ')}
                  </div>
                )}
                {missingTopics.length > 0 && (
                  <div className="aov-alert aov-alert-warn">
                    <strong>{missingTopics.length} teacher{missingTopics.length > 1 ? 's' : ''}</strong> missing daily topic:&nbsp;
                    {missingTopics.map(t => t.name).join(', ')}
                  </div>
                )}
                {pendingFiles.length > 0 && (
                  <div className="aov-alert aov-alert-info">
                    <strong>{pendingFiles.length} file{pendingFiles.length > 1 ? 's' : ''}</strong> pending review
                  </div>
                )}
              </div>
            )}

            {/* Stat row */}
            <div className="aov-stats-row">
              {[
                { label:'Total Teachers', value: totalTeachers, color:'#7c3aed',
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a8.38 8.38 0 0 1 13 0"/></svg> },
                { label:'Confirmed Today', value: confirmedToday.length, color:'#16a34a',
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg> },
                { label:'Not Confirmed', value: notConfirmedToday.length, color:'#dc2626',
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" y1="11" x2="22" y2="16"/><line x1="22" y1="11" x2="17" y2="16"/></svg> },
                { label:'Attendance Rate', value: attRate + '%', color:'#0891b2',
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
                { label:'Task Completion', value: taskRate + '%', color:'#d97706',
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
              ].map(s => (
                <div key={s.label} className="aov-stat-card" style={{'--sc': s.color}}>
                  <div className="aov-stat-icon" style={{color: s.color}}>{s.icon}</div>
                  <div className="aov-stat-value">{s.value}</div>
                  <div className="aov-stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="aov-body-grid">

              {/* Activity Feed */}
              <div className="aov-card aov-feed-card">
                <div className="aov-card-head">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  Activity Feed
                </div>
                {feed.length === 0 && todayTopics.length === 0 ? (
                  <p className="aov-empty">No activity yet today.</p>
                ) : (
                  <div className="aov-feed-list">
                    {feed.map(e => (
                      <div key={e.teacherId + e.date} className="aov-feed-row">
                        <div className="aov-feed-dot aov-dot-green" />
                        <div className="aov-feed-content">
                          <span className="aov-feed-name">{e.teacherName}</span>
                          <span className="aov-feed-action"> confirmed attendance</span>
                          <span className="aov-feed-time">{e.confirmedAt} &middot; {new Date(e.date).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span>
                        </div>
                      </div>
                    ))}
                    {todayTopics.slice(0,3).map(t => (
                      <div key={t.id} className="aov-feed-row">
                        <div className="aov-feed-dot aov-dot-blue" />
                        <div className="aov-feed-content">
                          <span className="aov-feed-name">{t.teacherName}</span>
                          <span className="aov-feed-action"> added topic: </span>
                          <span className="aov-feed-topic">{t.title}</span>
                          <span className="aov-feed-time">{t.submittedAt}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Attendance Status */}
              <div className="aov-card">
                <div className="aov-card-head">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
                  Today's Attendance
                </div>
                <div className="aov-att-bar-wrap">
                  <div className="aov-att-bar-track">
                    <div className="aov-att-bar-fill" style={{width: attRate + '%'}} />
                  </div>
                  <span className="aov-att-bar-pct">{attRate}%</span>
                </div>
                <div className="aov-teacher-list">
                  {teachers.map(t => {
                    const conf = confirmedAttendance.has(t.id + '|' + todayStr)
                    return (
                      <div key={t.id} className="aov-teacher-row">
                        <img src={t.img} alt={t.name} className="aov-teacher-img" />
                        <span className="aov-teacher-name">{t.name}</span>
                        <span className={`aov-att-chip ${conf ? 'aov-chip-green' : 'aov-chip-red'}`}>
                          {conf
                            ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="10" height="10"><polyline points="20 6 9 17 4 12"/></svg>
                            : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="10" height="10"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          }
                          {conf ? 'Confirmed' : 'Pending'}
                        </span>
                      </div>
                    )
                  })}
                </div>
                <button className="aov-link-btn" onClick={() => setActive('attendance')}>
                  View Full Attendance
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="11" height="11"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>

              {/* Task Monitoring */}
              <div className="aov-card">
                <div className="aov-card-head">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                  Task Completion
                </div>
                <div className="aov-task-list">
                  {teachers.map(t => {
                    const pct = Math.round((t.done / t.tasks) * 100)
                    const done = t.done === t.tasks
                    return (
                      <div key={t.id} className="aov-task-row">
                        <span className="aov-task-name">{t.name}</span>
                        <div className="aov-task-bar-wrap">
                          <div className="aov-task-bar" style={{width: pct + '%', background: done ? '#16a34a' : '#7c3aed'}} />
                        </div>
                        <span className="aov-task-pct" style={{color: done ? '#16a34a' : '#7c3aed'}}>{pct}%</span>
                      </div>
                    )
                  })}
                </div>
                <button className="aov-link-btn" onClick={() => setActive('tasks')}>
                  Task Monitoring
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="11" height="11"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>

              {/* Latest Topics */}
              <div className="aov-card">
                <div className="aov-card-head">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                  Latest Topics
                  <span className="aov-head-badge">{todayTopics.length} today</span>
                </div>
                {topics.slice(0,3).map(t => (
                  <div key={t.id} className="aov-topic-row">
                    <div className="aov-topic-teacher">{t.teacherName}</div>
                    <div className="aov-topic-title">{t.title}</div>
                    <div className="aov-topic-meta">{t.subject} &middot; {t.date}</div>
                  </div>
                ))}
                {topics.length === 0 && <p className="aov-empty">No topics submitted yet.</p>}
              </div>

              {/* Received Files */}
              <div className="aov-card">
                <div className="aov-card-head">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                  Received Files
                  {pendingFiles.length > 0 && <span className="aov-head-badge aov-badge-warn">{pendingFiles.length} pending</span>}
                </div>
                {files.slice(0,3).map(f => (
                  <div key={f.id} className="aov-file-row">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <div>
                      <div className="aov-file-name">{f.file?.name || 'File'}</div>
                      <div className="aov-file-meta">
                        <span className={`aov-file-chip aov-fc-${f.status}`}>{f.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {files.length === 0 && <p className="aov-empty">No files yet.</p>}
                <button className="aov-link-btn" onClick={() => setActive('files')}>
                  Review Files
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="11" height="11"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>

            </div>
          </div>
        )
      }

      case 'calendar': return (
        <div className="dash-content page-enter">
          <div className="ast-page-header">
            <h2 className="ast-page-title">📅 Weekly Schedule</h2>
            <div className="ast-cal-actions">
              <span className="ast-page-badge">Week of Apr 14 – 18</span>
              <button className={`ast-edit-btn ${editMode ? 'active' : ''}`} onClick={() => setEditMode(!editMode)}>
                <span className="ast-edit-icon">
                  {editMode
                    ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
                    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  }
                </span>
                <span>{editMode ? 'Done Editing' : 'Edit Schedule'}</span>
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="ast-sched-search-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" style={{color:'#94a3b8',flexShrink:0}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              className="ast-sched-search"
              type="text"
              placeholder="Search teacher attendance (e.g. Mr. Ali)..."
              value={scheduleSearch}
              onChange={e => setScheduleSearch(e.target.value)}
            />
            {scheduleSearch && (
              <button className="ast-sched-clear" onClick={() => setScheduleSearch('')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="12" height="12"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            )}
          </div>
          {scheduleSearch && (
            <div className="ast-sched-search-hint">
              Showing attendance for: <strong>{scheduleSearch}</strong>
              {Object.entries(timetableData).some(([n]) => n.toLowerCase().includes(scheduleSearch.toLowerCase())) ? '' : ' — no match found'}
            </div>
          )}

          {editMode && (
            <div className="ast-edit-banner">
              <div className="ast-edit-banner-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </div>
              <div>
                <div className="ast-edit-banner-title">Edit Mode Active</div>
                <div className="ast-edit-banner-text">Click any time slot to assign a teacher and subject</div>
              </div>
            </div>
          )}
          <div className="ast-timetable-wrap">
            <div className="ast-tt">
              <div className="ast-tt-head">
                <div className="ast-tt-time-col">Time</div>
                {schedule.map(d => <div key={d} className="ast-tt-day">{d}</div>)}
              </div>
              {periods.map((p, pi) => (
                <div key={p} className="ast-tt-row">
                  <div className="ast-tt-time">{p}</div>
                  {schedule.map((d, di) => {
                    const subj = liveSubjectMap[pi][di]
                    const teacher = liveTeacherMap[pi][di]
                    const style = timetableData[teacher] || timetableData['Mr. Ali']
                    const teacherId = Object.keys(timetableData).indexOf(teacher) >= 0
                      ? `T00${Object.keys(timetableData).indexOf(teacher) + 1}` : null
                    const todayStr = new Date().toISOString().split('T')[0]
                    const isConfirmed = teacherId && confirmedAttendance.has(`${teacherId}|${todayStr}`)
                    const isHighlighted = scheduleSearch &&
                      teacher.toLowerCase().includes(scheduleSearch.toLowerCase())
                    const isDimmed = scheduleSearch &&
                      !teacher.toLowerCase().includes(scheduleSearch.toLowerCase())
                    return (
                      <div
                        key={d}
                        className={`ast-tt-slot ${editMode ? 'editable' : ''} ${isHighlighted ? 'att-highlighted' : ''} ${isDimmed ? 'att-dimmed' : ''}`}
                        style={{'--tc':style.color,'--tbg':style.bg}}
                        onClick={() => {
                          if (editMode) {
                            setSlotSubject(liveSubjectMap[pi][di])
                            setSlotTeacher(liveTeacherMap[pi][di])
                            setSlotGrade(liveClassMap[pi][di].grade)
                            setSlotClass(liveClassMap[pi][di].cls)
                            setSelectedSlot({period:p,day:d,pi,di})
                          }
                        }}
                      >
                        <span className="ast-tt-subj">{subj}</span>
                        <span className="ast-tt-teacher">
                          {teacher.split(' ')[1]}
                          {isConfirmed && (
                            <span className="ast-att-confirmed-badge" title="Attendance confirmed">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="9" height="9"><polyline points="20 6 9 17 4 12"/></svg>
                            </span>
                          )}
                        </span>
                        {(liveClassMap[pi][di].grade || liveClassMap[pi][di].cls) && (
                          <span className="ast-tt-class-chip">
                            {liveClassMap[pi][di].grade && `Gr.${liveClassMap[pi][di].grade}`}
                            {liveClassMap[pi][di].grade && liveClassMap[pi][di].cls && <span className="ast-tt-chip-sep">·</span>}
                            {liveClassMap[pi][di].cls && `Cls ${liveClassMap[pi][di].cls}`}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="ast-tt-legend">
            {Object.entries(timetableData).map(([name, s], i) => {
              const tid = `T00${i + 1}`
              const todayStr = new Date().toISOString().split('T')[0]
              const confirmed = confirmedAttendance.has(`${tid}|${todayStr}`)
              return (
                <div key={name} className="ast-legend-item">
                  <span className="ast-legend-dot" style={{background:s.color}} />
                  <span>{name}</span>
                  {confirmed && (
                    <span className="ast-legend-confirmed">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="11" height="11"><polyline points="20 6 9 17 4 12"/></svg>
                      Confirmed
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Attendance Confirmation Log */}
          {confirmedAttendance.size > 0 && (
            <div className="ast-confirm-log">
              <div className="ast-confirm-log-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>
                Attendance Confirmations
                <span className="ast-confirm-log-count">{confirmedAttendance.size}</span>
              </div>
              <div className="ast-confirm-log-list">
                {[...confirmedAttendance.values()].map(entry => (
                  <div key={`${entry.teacherId}|${entry.date}`} className="ast-confirm-log-row">
                    <div className="ast-confirm-log-avatar">
                      {entry.teacherName.split(' ').map(w => w[0]).join('').slice(0,2)}
                    </div>
                    <div className="ast-confirm-log-info">
                      <span className="ast-confirm-log-name">{entry.teacherName}</span>
                      <span className="ast-confirm-log-meta">
                        {entry.subject} · {new Date(entry.date).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}
                      </span>
                    </div>
                    <div className="ast-confirm-log-right">
                      <span className="ast-confirm-log-time">{entry.confirmedAt}</span>
                      <span className="ast-confirm-log-badge">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="11" height="11"><polyline points="20 6 9 17 4 12"/></svg>
                        Confirmed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Edit Modal */}
          {selectedSlot && (
            <div className="ast-modal-overlay" onClick={() => setSelectedSlot(null)}>
              <div className="ast-modal-card" onClick={e => e.stopPropagation()}>
                <div className="ast-modal-header">
                  <div className="ast-modal-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </div>
                  <div>
                    <h3 className="ast-modal-title">Edit Time Slot</h3>
                    <div className="ast-modal-subtitle">
                      {selectedSlot.day} at {selectedSlot.period}
                    </div>
                  </div>
                  <button className="ast-modal-close" onClick={() => setSelectedSlot(null)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>

                <div className="ast-modal-body">
                  <div className="ast-form-group">
                    <label>Subject</label>
                    <select value={slotSubject} onChange={e => setSlotSubject(e.target.value)}>
                      {['Mathematics','Science','English','Arabic','History','PE'].map(s => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="ast-form-group">
                    <label>Assign Teacher</label>
                    <select value={slotTeacher} onChange={e => setSlotTeacher(e.target.value)}>
                      {Object.keys(timetableData).map(t => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="ast-form-row">
                    <div className="ast-form-group">
                      <label>🎓 Grade</label>
                      <select value={slotGrade} onChange={e => setSlotGrade(e.target.value)}>
                        <option value="">— Select —</option>
                        {['1','2','3','4','5','6','7','8','9','10','11','12'].map(g => (
                          <option key={g} value={g}>Grade {g}</option>
                        ))}
                      </select>
                    </div>
                    <div className="ast-form-group">
                      <label>🏫 Class</label>
                      <select value={slotClass} onChange={e => setSlotClass(e.target.value)}>
                        <option value="">— Select —</option>
                        {['A','B','C','D','E'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="ast-modal-actions">
                    <button className="ast-modal-cancel" onClick={() => setSelectedSlot(null)}>
                      Cancel
                    </button>
                    <button className="ast-modal-save" onClick={() => {
                      setLiveSubjectMap(prev => {
                        const next = prev.map(r => [...r])
                        next[pi][di] = slotSubject
                        return next
                      })
                      setLiveTeacherMap(prev => {
                        const next = prev.map(r => [...r])
                        next[pi][di] = slotTeacher
                        return next
                      })
                      setLiveClassMap(prev => {
                        const next = prev.map(r => r.map(c => ({...c})))
                        next[pi][di] = { grade: slotGrade, cls: slotClass }
                        return next
                      })
                      setSelectedSlot(null)
                    }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )

      case 'tasks': return (
        <div className="dash-content page-enter">
          <div className="ast-page-header">
            <h2 className="ast-page-title">✅ Task Monitoring</h2>
            <span className="ast-page-badge">{teachers.filter(t=>t.done===t.tasks).length}/{teachers.length} Complete</span>
          </div>
          <div className="ast-task-list">
            {teachers.map((t, i) => {
              const pct = Math.round((t.done / t.tasks) * 100)
              const complete = t.done === t.tasks
              return (
                <div key={t.name} className="ast-task-card">
                  <img src={t.img} alt={t.name} className="ast-task-avatar" />
                  <div className="ast-task-info">
                    <div className="ast-task-name">{t.name}</div>
                    <div className="ast-task-subject">{t.subject}</div>
                  </div>
                  <div className="ast-task-progress">
                    <div className="ast-task-bar-wrap">
                      <div className="ast-task-bar" style={{width:`${pct}%`, background: complete ? '#16a34a' : '#7c3aed'}} />
                    </div>
                    <div className="ast-task-nums">{t.done}/{t.tasks} tasks</div>
                  </div>
                  <span className={`ast-task-badge ${complete ? 'complete' : 'partial'}`}>
                    {complete ? '✅ Complete' : '⏳ In Progress'}
                  </span>
                  <button className="ast-profile-btn" onClick={() => setProfileTeacher(t)}>👤 Profile</button>
                </div>
              )
            })}
          </div>
        </div>
      )

      case 'attendance': return (
        <div className="dash-content page-enter">
          <div className="ast-page-header">
            <h2 className="ast-page-title">📋 Teacher Attendance</h2>
            <span className="ast-page-badge">Current Term</span>
          </div>
          <div className="ast-att-list">
            {teachers.map(t => {
              const actual = Math.round(t.att * 0.2)
              const color = t.att >= 95 ? '#16a34a' : t.att >= 88 ? '#d97706' : '#dc2626'
              return (
                <div key={t.name} className="ast-att-card">
                  <img src={t.img} alt={t.name} className="ast-task-avatar" />
                  <div className="ast-task-info">
                    <div className="ast-task-name">{t.name}</div>
                    <div className="ast-task-subject">{t.subject}</div>
                  </div>
                  <div className="ast-att-meta">
                    <div className="ast-att-row-item"><span>Scheduled</span><strong>20 days</strong></div>
                    <div className="ast-att-row-item"><span>Attended</span><strong>{actual} days</strong></div>
                  </div>
                  <div className="ast-att-rate-wrap">
                    <svg width="56" height="56" viewBox="0 0 56 56">
                      <circle cx="28" cy="28" r="22" fill="none" stroke="#e2e8f0" strokeWidth="6"/>
                      <circle cx="28" cy="28" r="22" fill="none" stroke={color} strokeWidth="6"
                        strokeDasharray={`${(t.att/100)*138.2} 138.2`} strokeLinecap="round"
                        transform="rotate(-90 28 28)"/>
                      <text x="28" y="32" textAnchor="middle" fontSize="10" fontWeight="800" fill={color}>{t.att}%</text>
                    </svg>
                  </div>
                  <div className="ast-att-btns">
                    <button className="ast-profile-btn" onClick={() => setProfileTeacher(t)}>👤 Manage</button>
                    <button className="ast-attach-btn" onClick={() => setAttachTarget(t)}>📎 Attach</button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )

      case 'performance': return (
        <div className="dash-content page-enter">
          <div className="ast-page-header">
            <h2 className="ast-page-title">📈 Performance Report</h2>
            <span className="ast-readonly-badge">🔒 Read-Only</span>
          </div>
          <div className="ast-perf-list">
            {[...teachers]
              .sort((a,b) => (b.att + (b.done/b.tasks)*100) - (a.att + (a.done/a.tasks)*100))
              .map((t, i) => {
                const score = Math.round((t.att + (t.done/t.tasks)*100) / 2)
                const medals = ['1st','2nd','3rd','4th']
                return (
                  <div key={t.name} className="ast-perf-card">
                    <div className="ast-perf-rank">{medals[i]}</div>
                    <img src={t.img} alt={t.name} className="ast-task-avatar" />
                    <div className="ast-task-info">
                      <div className="ast-task-name">{t.name}</div>
                      <div className="ast-task-subject">{t.subject}</div>
                    </div>
                    <div className="ast-perf-metrics">
                      <div className="ast-perf-metric"><span>Attendance</span><strong style={{color:'#0891b2'}}>{t.att}%</strong></div>
                      <div className="ast-perf-metric"><span>Tasks</span><strong style={{color:'#7c3aed'}}>{t.done}/{t.tasks}</strong></div>
                      <div className="ast-perf-metric"><span>Score</span><strong style={{color:'#d97706'}}>{score}</strong></div>
                    </div>
                    <div className="ast-perf-bar-wrap">
                      <div className="ast-perf-bar" style={{width:`${score}%`}} />
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )

      case 'files': return (
        <div className="dash-content page-enter">
          <div className="ast-page-header">
            <h2 className="ast-page-title">📎 Received Files</h2>
            <span className="ast-page-badge">{myFiles.length} file{myFiles.length !== 1 ? 's' : ''}</span>
          </div>
          {myFiles.length === 0 ? (
            <div className="rf-empty">
              <div className="rf-empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="40" height="40"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
              </div>
              <div className="rf-empty-title">No files received yet</div>
              <div className="rf-empty-sub">Files sent by the Manager will appear here</div>
            </div>
          ) : (
            <div className="rf-list">
              {myFiles.map(f => (
                <div key={f.id} className={`rf-card rf-${f.status}`}>
                  <div className="rf-card-left">
                    <div className="rf-file-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
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
                        <button className="rf-accept" onClick={() => updateStatus(f.id, 'accepted')}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12"><polyline points="20 6 9 17 4 12"/></svg> Accept
                        </button>
                        <button className="rf-reject" onClick={() => updateStatus(f.id, 'rejected')}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="12" height="12"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Reject
                        </button>
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

      case 'students': {
        const filtered = allStudents.filter(s =>
          s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
          s.id.toLowerCase().includes(studentSearch.toLowerCase()) ||
          s.grade.toLowerCase().includes(studentSearch.toLowerCase())
        )
        return (
          <div className="dash-content page-enter">
            <div className="ast-page-header">
              <h2 className="ast-page-title">👨‍🎓 Students</h2>
              <span className="ast-page-badge">{allStudents.length} students</span>
            </div>

            {/* Search */}
            <div className="asl-search-wrap">
              <span className="asl-search-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </span>
              <input
                className="asl-search-input"
                type="text"
                placeholder="Search by name, ID or grade..."
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
              />
              {studentSearch && (
                <button className="asl-search-clear" onClick={() => setStudentSearch('')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="12" height="12"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
            </div>
            <div className="asl-result-count">{filtered.length} student{filtered.length !== 1 ? 's' : ''} found</div>

            {filtered.length === 0 ? (
              <div className="rf-empty">
                <div className="rf-empty-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </div>
                <div className="rf-empty-title">No students match "{studentSearch}"</div>
              </div>
            ) : (
              <div className="asl-list">
                {filtered.map(s => {
                  const avg = Math.round(s.subjects.reduce((a,sub)=>a+sub.score,0)/s.subjects.length)
                  return (
                    <div key={s.id} className="asl-card">
                      <img src={s.img} alt={s.name} className="asl-avatar" />
                      <div className="asl-info">
                        <div className="asl-name">{s.name}</div>
                        <div className="asl-meta">{s.id} · {s.grade}</div>
                      </div>
                      <div className="asl-stats">
                        <div className="asl-stat">
                          <span>Avg</span>
                          <strong style={{color:'#0891b2'}}>{avg}%</strong>
                        </div>
                        <div className="asl-stat">
                          <span>Rank</span>
                          <strong style={{color:'#d97706'}}>#{s.rank}</strong>
                        </div>
                        <div className="asl-stat">
                          <span>Att.</span>
                          <strong style={{color:'#16a34a'}}>{s.attendance}</strong>
                        </div>
                      </div>
                      <button className="asl-view-btn" onClick={() => setSelectedStudent(s)}>
                        👁️ View
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      }

      case 'results': return (
        <div className="dash-content page-enter">
          <div className="ast-page-header">
            <h2 className="ast-page-title">🎓 Student Results</h2>
            <span className="ast-page-badge">{studentResults.length} subject{studentResults.length !== 1 ? 's' : ''} submitted</span>
          </div>

          {studentResults.length === 0 ? (
            <div className="rf-empty">
              <div className="rf-empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              </div>
              <div className="rf-empty-title">No results submitted yet</div>
              <div className="rf-empty-sub">Results will appear here once teachers submit CA marks</div>
            </div>
          ) : (
            studentResults.map(r => (
              <div key={r.subject} className="asr-subject-block">
                <div className="asr-subject-header">
                  <div className="asr-subject-left">
                    <span className="asr-subject-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                    </span>
                    <div>
                      <div className="asr-subject-name">{r.subject}</div>
                      <div className="asr-subject-meta">By {r.teacherName} · Submitted {r.submittedAt}</div>
                    </div>
                  </div>
                  <span className="asr-readonly-chip">🔒 Read-Only</span>
                </div>

                <div className="asr-table">
                  <div className="asr-table-head">
                    <span>Student</span>
                    <span>CA Parts</span>
                    <span>CA /50</span>
                    <span>Exam /50</span>
                    <span>Total /100</span>
                    <span>Grade</span>
                  </div>
                  {r.students.map(s => {
                    const total = s.ca + (s.exam || 0)
                    const grade = total >= 90 ? 'A+' : total >= 80 ? 'A' : total >= 70 ? 'B+' : total >= 60 ? 'B' : total >= 50 ? 'C' : 'F'
                    const gc = total >= 80 ? '#16a34a' : total >= 60 ? '#0891b2' : total >= 50 ? '#d97706' : '#dc2626'
                    return (
                      <div key={s.name} className="asr-table-row">
                        <span className="asr-student-name">{s.name}</span>
                        <div className="asr-parts" data-label="CA Parts">
                          {s.parts.filter(p => p !== null && p !== '').map((p, i) => (
                            <span key={i} className="asr-part-chip">{p}</span>
                          ))}
                        </div>
                        <div className="asr-ca-cell" data-label="CA /50">
                          <span className="asr-ca-val">{s.ca}</span>
                          <div className="asr-ca-bar-wrap">
                            <div className="asr-ca-bar" style={{ width: `${(s.ca/50)*100}%` }} />
                          </div>
                        </div>
                        <span className="asr-exam-cell" data-label="Exam /50">
                          {s.exam !== null ? s.exam : <span className="asr-pending">⏳ Pending</span>}
                        </span>
                        <span className="asr-total-val" data-label="Total" style={{ color: gc }}>{total}</span>
                        <span className="asr-grade-badge" data-label="Grade" style={{ background: `${gc}18`, color: gc }}>{grade}</span>
                      </div>
                    )
                  })}
                </div>

                <div className="asr-summary-row">
                  <div className="asr-summary-stat">
                    <span>Class Avg CA</span>
                    <strong>{Math.round(r.students.reduce((a,s)=>a+s.ca,0)/r.students.length)}/50</strong>
                  </div>
                  <div className="asr-summary-stat">
                    <span>Highest CA</span>
                    <strong>{Math.max(...r.students.map(s=>s.ca))}/50</strong>
                  </div>
                  <div className="asr-summary-stat">
                    <span>Lowest CA</span>
                    <strong>{Math.min(...r.students.map(s=>s.ca))}/50</strong>
                  </div>
                  <div className="asr-summary-stat">
                    <span>Students</span>
                    <strong>{r.students.length}</strong>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )

      default: return null
    }
  }

  return (
    <div className="dashboard-layout">
      <Sidebar role="assistant" items={sidebarItems} active={active} onSelect={setActive} />
      <main className="dashboard-main">
        {renderContent()}
        {profileTeacher && <TeacherProfile teacher={profileTeacher} role="assistant" onClose={() => setProfileTeacher(null)} />}
        {attachTarget && <AttachModal target={attachTarget} onClose={() => setAttachTarget(null)} onSend={(d) => sendFile(d)} />}
        {selectedStudent && <StudentViewModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />}
      </main>
    </div>
  )
}
