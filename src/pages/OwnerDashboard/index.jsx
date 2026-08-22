import { useState, useRef, useEffect, useCallback } from 'react'
import Sidebar from '../../components/Sidebar'
import { useLang } from '../../context/LangContext'
import { zakatAPI, reportsAPI } from '../../api/index.js'
import './style.css'

// â”€â”€ Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const manager = {
  id:'M001', name:'Mr. Hassan', img:'https://i.pravatar.cc/80?img=52',
  branch:'Main Campus', assistants:2, teachers:4, att:94, tasks:91, score:92,
  email:'hassan@hidaya.edu', phone:'+1 555-0401', experience:'6 years',
}

const assistants = [
  { id:'A001', name:'Khalid Omar',  role:'Senior Assistant', img:'https://i.pravatar.cc/80?img=51', att:'96%', tasks:'92%', rating:4.5, dept:'Academic Affairs', email:'khalid@hidaya.edu', phone:'+1 555-0301', experience:'4 years', status:'Active' },
  { id:'A002', name:'Noor Fatima',  role:'Junior Assistant', img:'https://i.pravatar.cc/80?img=48', att:'98%', tasks:'95%', rating:4.8, dept:'Student Affairs',  email:'noor@hidaya.edu',  phone:'+1 555-0302', experience:'1 year',  status:'Active' },
]

const teachers = [
  { id:'T001', name:'Mr. Ali',    subject:'Mathematics', img:'https://i.pravatar.cc/80?img=13', att:95, tasks:87, score:90, status:'Active',   email:'ali@hidaya.edu',    phone:'+1 555-0201', experience:'8 years',  dept:'Mathematics', classes:['Grade 7A','Grade 8B','Grade 9A'], currentTopic:'Quadratic Equations' },
  { id:'T002', name:'Ms. Sara',   subject:'Science',     img:'https://i.pravatar.cc/80?img=44', att:100,tasks:100,score:98, status:'Active',   email:'sara@hidaya.edu',   phone:'+1 555-0202', experience:'5 years',  dept:'Sciences',    classes:['Grade 8A','Grade 9B'],          currentTopic:'Cell Division' },
  { id:'T003', name:'Mr. Omar',   subject:'English',     img:'https://i.pravatar.cc/80?img=59', att:88, tasks:55, score:72, status:'On Leave', email:'omar@hidaya.edu',   phone:'+1 555-0203', experience:'14 years', dept:'Languages',   classes:['Grade 7B','Grade 8A'],          currentTopic:'Argumentative Essay' },
  { id:'T004', name:'Ms. Fatima', subject:'History',     img:'https://i.pravatar.cc/80?img=47', att:92, tasks:100,score:94, status:'Active',   email:'fatima@hidaya.edu', phone:'+1 555-0204', experience:'9 years',  dept:'Humanities',  classes:['Grade 9A','Grade 9B'],          currentTopic:'Ottoman Empire' },
]

const students = [
  { id:'S001', name:'Ali Hassan',    grade:'Grade 8', avg:'87%', rank:1, att:'94%', status:'Active', img:'https://i.pravatar.cc/80?img=12', age:14, gender:'Male',   email:'ali.hassan@hidaya.edu',    phone:'+1 555-0101', subjects:[{n:'Math',s:90},{n:'Science',s:85},{n:'English',s:88},{n:'Arabic',s:92},{n:'History',s:80}] },
  { id:'S002', name:'Sara Ahmed',    grade:'Grade 8', avg:'82%', rank:2, att:'98%', status:'Active', img:'https://i.pravatar.cc/80?img=45', age:13, gender:'Female', email:'sara.ahmed@hidaya.edu',    phone:'+1 555-0102', subjects:[{n:'Math',s:78},{n:'Science',s:84},{n:'English',s:88},{n:'Arabic',s:80},{n:'History',s:82}] },
  { id:'S003', name:'Omar Khalid',   grade:'Grade 9', avg:'79%', rank:3, att:'88%', status:'Active', img:'https://i.pravatar.cc/80?img=33', age:15, gender:'Male',   email:'omar.khalid@hidaya.edu',   phone:'+1 555-0103', subjects:[{n:'Math',s:75},{n:'Science',s:80},{n:'English',s:82},{n:'Arabic',s:78},{n:'History',s:79}] },
  { id:'S004', name:'Fatima Noor',   grade:'Grade 9', avg:'91%', rank:1, att:'97%', status:'Active', img:'https://i.pravatar.cc/80?img=47', age:15, gender:'Female', email:'fatima.noor@hidaya.edu',   phone:'+1 555-0104', subjects:[{n:'Math',s:95},{n:'Science',s:92},{n:'English',s:89},{n:'Arabic',s:94},{n:'History',s:88}] },
  { id:'S005', name:'Yusuf Ibrahim', grade:'Grade 7', avg:'74%', rank:4, att:'85%', status:'Active', img:'https://i.pravatar.cc/80?img=68', age:12, gender:'Male',   email:'yusuf.ibrahim@hidaya.edu', phone:'+1 555-0105', subjects:[{n:'Math',s:70},{n:'Science',s:75},{n:'English',s:78},{n:'Arabic',s:72},{n:'History',s:74}] },
]

const months = ['Jan','Feb','Mar','Apr','May','Jun']
const perfData    = [72,75,78,80,83,87]
const attData     = [88,90,91,92,93,94]
const enrollData  = [210,218,225,230,240,248]
const taskData    = [78,80,82,85,88,91]

// â”€â”€ Detail Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function DetailModal({ person, type, onClose }) {
  return (
    <div className="own-modal-overlay" onClick={onClose}>
      <div className="own-modal-card" onClick={e => e.stopPropagation()}>
        <button className="own-modal-close" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div className="own-modal-profile">
          <img src={person.img} alt={person.name} className="own-modal-avatar" />
          <div>
            <h3 className="own-modal-name">{person.name}</h3>
            <div className="own-modal-tags">
              <span className="own-modal-id">{person.id}</span>
              {type === 'teacher' && <span className="own-modal-tag">{person.subject}</span>}
              {type === 'assistant' && <span className="own-modal-tag">{person.role}</span>}
              {type === 'student' && <span className="own-modal-tag">{person.grade}</span>}
              <span className={`own-modal-status ${person.status === 'Active' ? 'active' : 'leave'}`}>{person.status}</span>
            </div>
            <div className="own-modal-contact">
              <span>{person.email}</span>
              <span>{person.phone}</span>
              {person.age && <span>Age {person.age} &middot; {person.gender}</span>}
              {person.experience && <span>{person.experience} &middot; {person.dept}</span>}
            </div>
          </div>
        </div>
        <div className="own-modal-stats">
          {type === 'teacher' && <>
            <div className="own-modal-stat" style={{'--mc':'#1a73e8'}}><div className="own-ms-val">{person.att}%</div><div className="own-ms-lbl">Attendance</div></div>
            <div className="own-modal-stat" style={{'--mc':'#16a34a'}}><div className="own-ms-val">{person.tasks}%</div><div className="own-ms-lbl">Tasks Done</div></div>
            <div className="own-modal-stat" style={{'--mc':'#d97706'}}><div className="own-ms-val">{person.score}</div><div className="own-ms-lbl">Score</div></div>
          </>}
          {type === 'assistant' && <>
            <div className="own-modal-stat" style={{'--mc':'#7c3aed'}}><div className="own-ms-val">{person.att}</div><div className="own-ms-lbl">Attendance</div></div>
            <div className="own-modal-stat" style={{'--mc':'#16a34a'}}><div className="own-ms-val">{person.tasks}</div><div className="own-ms-lbl">Tasks Done</div></div>
            <div className="own-modal-stat" style={{'--mc':'#d97706'}}><div className="own-ms-val">{person.rating}</div><div className="own-ms-lbl">Rating</div></div>
          </>}
          {type === 'student' && <>
            <div className="own-modal-stat" style={{'--mc':'#0891b2'}}><div className="own-ms-val">{person.avg}</div><div className="own-ms-lbl">Avg Score</div></div>
            <div className="own-modal-stat" style={{'--mc':'#d97706'}}><div className="own-ms-val">#{person.rank}</div><div className="own-ms-lbl">Rank</div></div>
            <div className="own-modal-stat" style={{'--mc':'#16a34a'}}><div className="own-ms-val">{person.att}</div><div className="own-ms-lbl">Attendance</div></div>
          </>}
        </div>
        {type === 'teacher' && (
          <div className="own-modal-section">
            <div className="own-modal-sec-title">Classes &amp; Current Topic</div>
            <div className="own-modal-chips">{person.classes.map(c => <span key={c} className="own-chip-blue">{c}</span>)}</div>
            <div className="own-modal-topic">Current: {person.currentTopic}</div>
          </div>
        )}
        {type === 'student' && (
          <div className="own-modal-section">
            <div className="own-modal-sec-title">Subject Scores</div>
            {person.subjects.map(s => (
              <div key={s.n} className="own-modal-subj-row">
                <span className="own-modal-subj-name">{s.n}</span>
                <div className="own-modal-subj-bar-wrap"><div className="own-modal-subj-bar" style={{width:s.s+'%'}}/></div>
                <span className="own-modal-subj-score">{s.s}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// â”€â”€ Attach File Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function AttachModal({ target, onClose, onSend }) {
  const fileRef = useRef()
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const handleSend = () => {
    if (!file) return
    onSend({ file, message, target })
    setSent(true)
    setTimeout(onClose, 1600)
  }
  return (
    <div className="own-modal-overlay" onClick={onClose}>
      <div className="own-modal-card own-attach-card" onClick={e => e.stopPropagation()}>
        <button className="own-modal-close" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        {sent ? (
          <div className="own-sent-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="48" height="48"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>
            <div className="own-sent-title">File Sent to {target.name}</div>
          </div>
        ) : (
          <>
            <div className="own-attach-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
              <div>
                <div className="own-attach-title">Attach File</div>
                <div className="own-attach-sub">Sending to <strong>{target.name}</strong></div>
              </div>
            </div>
            <div className="own-attach-body">
              <div className="own-attach-drop" onClick={() => fileRef.current.click()}>
                {file ? (
                  <div className="own-attach-file">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="24" height="24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <span>{file.name}</span>
                    <button onClick={e=>{e.stopPropagation();setFile(null)}} className="own-attach-remove">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="11" height="11"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                ) : (
                  <div className="own-attach-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="32" style={{color:'#94a3b8'}}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                    <span>Click to browse file</span>
                  </div>
                )}
                <input ref={fileRef} type="file" style={{display:'none'}} onChange={e=>setFile(e.target.files[0])}/>
              </div>
              <textarea className="own-attach-msg" placeholder="Add a message for the manager (optional)..." value={message} onChange={e=>setMessage(e.target.value)} rows={3}/>
              <div className="own-attach-actions">
                <button className="own-attach-cancel" onClick={onClose}>Cancel</button>
                <button className="own-attach-send" onClick={handleSend} disabled={!file}>
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

// â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function OwnerDashboard() {
  const [active, setActive] = useState('overview')
  const [mobileOpen, setMobileOpen] = useState(false)
  const { t } = useLang()

  const sidebarItems = [
    { id: 'overview',  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>, label: t('overview') },
    { id: 'analytics', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>, label: t('analytics') },
    { id: 'people',    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, label: t('people') },
    { id: 'ranking',   icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>, label: t('schoolRanking') },
    { id: 'strategic', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>, label: t('strategicControl') },
    { id: 'zakat',     icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>, label: 'Zakat' },
    { id: 'reports',   icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>, label: 'Reports' },
  ]
  const [detailPerson, setDetailPerson] = useState(null)
  const [detailType, setDetailType] = useState(null)
  const [attachTarget, setAttachTarget] = useState(null)
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState([])
  const [sentFiles, setSentFiles] = useState([])
  const [peopleTab, setPeopleTab] = useState('teachers')
  const [noteTitle, setNoteTitle] = useState('')
  const [noteText, setNoteText] = useState('')
  const [notes, setNotes] = useState([
    { id:1, title:'Term 1 Review', text:'Overall system performance is on track. Attendance improved by 6% compared to last term. Focus needed on task completion for Mr. Omar.', date:'Apr 20, 2026', status:'good' },
    { id:2, title:'Manager Observation', text:'Mr. Hassan is managing the team effectively. Recommend increasing assistant headcount for next term to support growing student numbers.', date:'Apr 15, 2026', status:'good' },
    { id:3, title:'Attendance Alert', text:'South branch attendance dipped below 80% in week 3. Flagged for review. Manager to submit action plan by end of month.', date:'Apr 10, 2026', status:'warn' },
  ])
  const [noteSaved, setNoteSaved] = useState(false)

  const addNote = () => {
    if (!noteText.trim()) return
    setNotes(prev => [{
      id: Date.now(), title: noteTitle || 'Untitled Note', text: noteText,
      date: new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}),
      status: 'good'
    }, ...prev])
    setNoteTitle(''); setNoteText('')
    setNoteSaved(true)
    setTimeout(() => setNoteSaved(false), 2000)
  }

  const openDetail = (person, type) => { setDetailPerson(person); setDetailType(type) }
  const closeDetail = () => { setDetailPerson(null); setDetailType(null) }
  const handleSendFile = (data) => setSentFiles(prev => [...prev, { ...data, id: Date.now(), sentAt: new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) }])
  const addComment = () => {
    if (!comment.trim()) return
    setComments(prev => [{ id: Date.now(), text: comment, time: new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) }, ...prev])
    setComment('')
  }

  const renderContent = () => {
    switch (active) {

      // â”€â”€ OVERVIEW â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      case 'overview': return (
        <div className="dash-content page-enter">
          <div className="own-header">
            <div>
              <h2 className="own-title">Owner Dashboard</h2>
              <p className="own-sub">System-wide overview &middot; {new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</p>
            </div>
            <div className="own-status-pill"><span className="own-status-dot"/>System Operational</div>
          </div>

          {/* Snapshot */}
          <div className="own-snap-grid">
            {[
              { label:'Manager',    value:1,    sub:'Active',        color:'#7c3aed', icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
              { label:'Assistants', value:2,    sub:'On duty',       color:'#0891b2', icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
              { label:'Teachers',   value:4,    sub:'3 active today',color:'#1a73e8', icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a8.38 8.38 0 0 1 13 0"/></svg> },
              { label:'Students',   value:248,  sub:'+12 this term', color:'#d97706', icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
              { label:'Attendance', value:'94%',sub:'Today',         color:'#16a34a', icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
              { label:'Avg Score',  value:'87%',sub:'This term',     color:'#0891b2', icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
            ].map(s => (
              <div key={s.label} className="own-snap-card" style={{'--sc':s.color}}>
                <div className="own-snap-icon" style={{color:s.color}}>{s.icon}</div>
                <div className="own-snap-value">{s.value}</div>
                <div className="own-snap-label">{s.label}</div>
                <div className="own-snap-sub">{s.sub}</div>
              </div>
            ))}
          </div>

          <div className="own-body-grid">

            {/* Manager Card */}
            <div className="own-card own-mgr-card">
              <div className="own-card-head">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                Manager
              </div>
              <div className="own-mgr-profile">
                <img src={manager.img} alt={manager.name} className="own-mgr-img"/>
                <div className="own-mgr-info">
                  <div className="own-mgr-name">{manager.name}</div>
                  <div className="own-mgr-branch">{manager.branch} &middot; {manager.assistants} assistants &middot; {manager.teachers} teachers</div>
                  <div className="own-mgr-contact">{manager.email}</div>
                </div>
                <div className="own-mgr-actions">
                  <button className="own-mgr-btn own-mgr-btn-attach" onClick={() => setAttachTarget(manager)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                    Attach File
                  </button>
                </div>
              </div>
              <div className="own-mgr-metrics-row">
                {[{label:'Attendance',val:manager.att,color:'#16a34a'},{label:'Tasks',val:manager.tasks,color:'#1a73e8'},{label:'Score',val:manager.score,color:'#7c3aed'}].map(m=>(
                  <div key={m.label} className="own-mgr-metric-box">
                    <div className="own-mgr-metric-val" style={{color:m.color}}>{m.val}%</div>
                    <div className="own-mgr-metric-bar-wrap"><div className="own-mgr-metric-bar" style={{width:m.val+'%',background:m.color}}/></div>
                    <div className="own-mgr-metric-lbl">{m.label}</div>
                  </div>
                ))}
              </div>
              {/* Sent files to manager */}
              {sentFiles.length > 0 && (
                <div className="own-sent-files">
                  <div className="own-sent-files-title">Sent Files</div>
                  {sentFiles.map(f => (
                    <div key={f.id} className="own-sent-file-row">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      <span>{f.file.name}</span>
                      <span className="own-sent-time">{f.sentAt}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Owner Comment Box */}
            <div className="own-card own-comment-card">
              <div className="own-card-head">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Comments to Manager
              </div>
              <div className="own-comment-input-wrap">
                <textarea className="own-comment-input" placeholder="Write a comment or instruction for the manager..." value={comment} onChange={e=>setComment(e.target.value)} rows={3}/>
                <button className="own-comment-send" onClick={addComment} disabled={!comment.trim()}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  Send
                </button>
              </div>
              <div className="own-comments-list">
                {comments.length === 0 && <p className="own-empty">No comments yet.</p>}
                {comments.map(c => (
                  <div key={c.id} className="own-comment-row">
                    <div className="own-comment-bubble">{c.text}</div>
                    <div className="own-comment-time">{c.time}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alerts */}
            <div className="own-card">
              <div className="own-card-head">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Alerts
              </div>
              {[
                { level:'warn',    msg:'Mr. Omar on leave â€” 3 classes unassigned' },
                { level:'warn',    msg:'3 teachers have unconfirmed attendance today' },
                { level:'info',    msg:'New term enrollment up 5% vs last term' },
                { level:'success', msg:'Ms. Sara â€” 100% attendance &amp; tasks this term' },
              ].map((a,i) => (
                <div key={i} className={`own-alert own-alert-${a.level}`}>
                  {a.level==='warn' ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>
                  : a.level==='success' ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>
                  : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/></svg>}
                  <span dangerouslySetInnerHTML={{__html:a.msg}}/>
                </div>
              ))}
            </div>

            {/* Audit Log */}
            <div className="own-card">
              <div className="own-card-head">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                Audit Log
              </div>
              <div className="own-audit-list">
                {[
                  { who:'Mr. Hassan', action:'Approved student results',  time:'09:14 AM', type:'success' },
                  { who:'Khalid',     action:'Updated weekly schedule',   time:'08:52 AM', type:'info'    },
                  { who:'Mr. Ali',    action:'Confirmed attendance',      time:'08:30 AM', type:'success' },
                  { who:'Mr. Hassan', action:'Assigned task to Ms. Sara', time:'08:10 AM', type:'info'    },
                  { who:'Noor',       action:'Student records updated',   time:'07:58 AM', type:'neutral' },
                ].map((e,i) => (
                  <div key={i} className="own-audit-row">
                    <div className={`own-audit-dot own-audit-${e.type}`}/>
                    <div className="own-audit-content">
                      <span className="own-audit-who">{e.who}</span>
                      <span className="own-audit-action"> {e.action}</span>
                    </div>
                    <span className="own-audit-time">{e.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="own-card">
              <div className="own-card-head">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
                Quick Actions
              </div>
              <div className="own-control-grid">
                {[
                  { label:'View People',    color:'#7c3aed', action:()=>setActive('people'),    icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
                  { label:'Analytics',      color:'#d97706', action:()=>setActive('analytics'), icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
                  { label:'Attach to Mgr',  color:'#0891b2', action:()=>setAttachTarget(manager), icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg> },
                  { label:'School Ranking', color:'#16a34a', action:()=>setActive('ranking'),   icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg> },
                ].map(c => (
                  <button key={c.label} className="own-ctrl-btn" style={{'--cc':c.color}} onClick={c.action}>
                    <span className="own-ctrl-icon" style={{color:c.color}}>{c.icon}</span>
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )

      // â”€â”€ ANALYTICS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      case 'analytics': return (
        <div className="dash-content page-enter">
          <div className="own-page-header">
            <h2 className="own-page-title">Academic Performance Trends</h2>
            <p className="own-page-sub">Jan &ndash; Jun 2026 &middot; Hidaya Islamic Academy</p>
          </div>

          {/* Summary KPIs */}
          <div className="an-kpi-row">
            {[
              { label:'Avg Score',    value:'87%', change:'+15pts', color:'#d97706', note:'vs Jan (72%)' },
              { label:'Attendance',   value:'94%', change:'+6pts',  color:'#16a34a', note:'vs Jan (88%)' },
              { label:'Enrollment',   value:'248', change:'+38',    color:'#1a73e8', note:'vs Jan (210)' },
              { label:'Task Rate',    value:'91%', change:'+13pts', color:'#7c3aed', note:'vs Jan (78%)' },
            ].map(k => (
              <div key={k.label} className="an-kpi-card" style={{'--kc':k.color}}>
                <div className="an-kpi-value" style={{color:k.color}}>{k.value}</div>
                <div className="an-kpi-label">{k.label}</div>
                <div className="an-kpi-change">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="10" height="10"><polyline points="18 15 12 9 6 15"/></svg>
                  {k.change}
                </div>
                <div className="an-kpi-note">{k.note}</div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="an-charts-grid">

            {/* Avg Score Bar Chart */}
            <div className="an-chart-card">
              <div className="an-chart-title">Average Score per Month (%)</div>
              <div className="an-chart-sub">Higher is better &middot; Target: 85%</div>
              <div className="an-bar-chart">
                {months.map((m,i) => (
                  <div key={m} className="an-bar-col">
                    <div className="an-bar-val">{perfData[i]}%</div>
                    <div className="an-bar-outer">
                      <div className="an-bar-fill" style={{height:`${perfData[i]}%`, background: perfData[i]>=85?'#16a34a':'#d97706'}}/>
                      {perfData[i] >= 85 && <div className="an-bar-target-line" style={{bottom:'85%'}}/>}
                    </div>
                    <div className="an-bar-label">{m}</div>
                  </div>
                ))}
              </div>
              <div className="an-chart-legend">
                <span className="an-leg-dot" style={{background:'#16a34a'}}/> Above target
                <span className="an-leg-dot" style={{background:'#d97706', marginLeft:12}}/> Below target
              </div>
            </div>

            {/* Attendance Line Chart */}
            <div className="an-chart-card">
              <div className="an-chart-title">Attendance Rate per Month (%)</div>
              <div className="an-chart-sub">Teacher &amp; student combined</div>
              <svg viewBox="0 0 300 120" className="an-svg" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="anGrad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#16a34a" stopOpacity="0.25"/>
                    <stop offset="100%" stopColor="#16a34a" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                {/* Y-axis labels */}
                {[80,85,90,95,100].map((v,i)=>(
                  <text key={v} x="2" y={110-(i*22)} fontSize="7" fill="#94a3b8">{v}%</text>
                ))}
                {/* Grid lines */}
                {[0,1,2,3,4].map(i=>(
                  <line key={i} x1="22" y1={110-(i*22)} x2="298" y2={110-(i*22)} stroke="#e2e8f0" strokeWidth="0.5"/>
                ))}
                {/* Area */}
                <polygon
                  points={`22,110 ${attData.map((v,i)=>`${22+i*55.2},${110-((v-80)/20)*88}`).join(' ')} ${22+5*55.2},110`}
                  fill="url(#anGrad1)"
                />
                {/* Line */}
                <polyline
                  points={attData.map((v,i)=>`${22+i*55.2},${110-((v-80)/20)*88}`).join(' ')}
                  fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                />
                {/* Dots + labels */}
                {attData.map((v,i)=>(
                  <g key={i}>
                    <circle cx={22+i*55.2} cy={110-((v-80)/20)*88} r="4" fill="#16a34a" stroke="#fff" strokeWidth="1.5"/>
                    <text x={22+i*55.2} y={110-((v-80)/20)*88-8} textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#16a34a">{v}%</text>
                    <text x={22+i*55.2} y="118" textAnchor="middle" fontSize="7" fill="#94a3b8">{months[i]}</text>
                  </g>
                ))}
              </svg>
            </div>

            {/* Enrollment Bar */}
            <div className="an-chart-card">
              <div className="an-chart-title">Student Enrollment</div>
              <div className="an-chart-sub">Total students per month</div>
              <div className="an-bar-chart">
                {months.map((m,i) => (
                  <div key={m} className="an-bar-col">
                    <div className="an-bar-val">{enrollData[i]}</div>
                    <div className="an-bar-outer">
                      <div className="an-bar-fill" style={{height:`${(enrollData[i]/260)*100}%`, background:'#1a73e8'}}/>
                    </div>
                    <div className="an-bar-label">{m}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Task Completion Line */}
            <div className="an-chart-card">
              <div className="an-chart-title">Task Completion Rate (%)</div>
              <div className="an-chart-sub">All teachers combined</div>
              <svg viewBox="0 0 300 120" className="an-svg" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="anGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.25"/>
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                {[70,80,90,100].map((v,i)=>(
                  <text key={v} x="2" y={110-(i*29.3)} fontSize="7" fill="#94a3b8">{v}%</text>
                ))}
                {[0,1,2,3].map(i=>(
                  <line key={i} x1="22" y1={110-(i*29.3)} x2="298" y2={110-(i*29.3)} stroke="#e2e8f0" strokeWidth="0.5"/>
                ))}
                <polygon
                  points={`22,110 ${taskData.map((v,i)=>`${22+i*55.2},${110-((v-70)/30)*88}`).join(' ')} ${22+5*55.2},110`}
                  fill="url(#anGrad2)"
                />
                <polyline
                  points={taskData.map((v,i)=>`${22+i*55.2},${110-((v-70)/30)*88}`).join(' ')}
                  fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                />
                {taskData.map((v,i)=>(
                  <g key={i}>
                    <circle cx={22+i*55.2} cy={110-((v-70)/30)*88} r="4" fill="#7c3aed" stroke="#fff" strokeWidth="1.5"/>
                    <text x={22+i*55.2} y={110-((v-70)/30)*88-8} textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#7c3aed">{v}%</text>
                    <text x={22+i*55.2} y="118" textAnchor="middle" fontSize="7" fill="#94a3b8">{months[i]}</text>
                  </g>
                ))}
              </svg>
            </div>

          </div>
        </div>
      )

      // â”€â”€ PEOPLE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      case 'people': return (
        <div className="dash-content page-enter">
          <div className="own-page-header">
            <h2 className="own-page-title">People</h2>
            <div className="own-people-tabs">
              {['teachers','assistants','students'].map(t=>(
                <button key={t} className={`own-tab ${peopleTab===t?'active':''}`} onClick={()=>setPeopleTab(t)}>
                  {t.charAt(0).toUpperCase()+t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {peopleTab === 'teachers' && (
            <div className="own-people-list">
              {teachers.map(t => (
                <div key={t.id} className="own-people-row">
                  <img src={t.img} alt={t.name} className="own-people-img"/>
                  <div className="own-people-info">
                    <div className="own-people-name">{t.name}</div>
                    <div className="own-people-meta">{t.id} &middot; {t.subject} &middot; {t.dept}</div>
                  </div>
                  <div className="own-people-stats">
                    <span className="own-people-stat" style={{color:'#1a73e8'}}>{t.att}% att</span>
                    <span className="own-people-stat" style={{color:'#16a34a'}}>{t.tasks}% tasks</span>
                    <span className={`own-people-status ${t.status==='Active'?'active':'leave'}`}>{t.status}</span>
                  </div>
                  <button className="own-detail-btn" onClick={()=>openDetail(t,'teacher')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    Details
                  </button>
                </div>
              ))}
            </div>
          )}

          {peopleTab === 'assistants' && (
            <div className="own-people-list">
              {assistants.map(a => (
                <div key={a.id} className="own-people-row">
                  <img src={a.img} alt={a.name} className="own-people-img"/>
                  <div className="own-people-info">
                    <div className="own-people-name">{a.name}</div>
                    <div className="own-people-meta">{a.id} &middot; {a.role} &middot; {a.dept}</div>
                  </div>
                  <div className="own-people-stats">
                    <span className="own-people-stat" style={{color:'#7c3aed'}}>{a.att} att</span>
                    <span className="own-people-stat" style={{color:'#16a34a'}}>{a.tasks} tasks</span>
                    <span className="own-people-status active">{a.status}</span>
                  </div>
                  <button className="own-detail-btn" onClick={()=>openDetail(a,'assistant')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    Details
                  </button>
                </div>
              ))}
            </div>
          )}

          {peopleTab === 'students' && (
            <div className="own-people-list">
              {students.map(s => (
                <div key={s.id} className="own-people-row">
                  <img src={s.img} alt={s.name} className="own-people-img"/>
                  <div className="own-people-info">
                    <div className="own-people-name">{s.name}</div>
                    <div className="own-people-meta">{s.id} &middot; {s.grade} &middot; Age {s.age}</div>
                  </div>
                  <div className="own-people-stats">
                    <span className="own-people-stat" style={{color:'#0891b2'}}>{s.avg} avg</span>
                    <span className="own-people-stat" style={{color:'#16a34a'}}>#{s.rank} rank</span>
                    <span className="own-people-status active">{s.status}</span>
                  </div>
                  <button className="own-detail-btn" onClick={()=>openDetail(s,'student')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )

      // â”€â”€ RANKING â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      case 'ranking': return (
        <div className="dash-content page-enter">
          <div className="own-page-header">
            <h2 className="own-page-title">School Ranking</h2>
          </div>
          <div className="ranking-grid">
            {[
              { grade:'Grade 9A', avg:'91%', rank:1, students:32, score:91 },
              { grade:'Grade 8B', avg:'87%', rank:2, students:30, score:87 },
              { grade:'Grade 8A', avg:'84%', rank:3, students:31, score:84 },
              { grade:'Grade 7A', avg:'79%', rank:4, students:28, score:79 },
              { grade:'Grade 7B', avg:'76%', rank:5, students:29, score:76 },
            ].map(r => (
              <div key={r.grade} className={`rank-card rank-${r.rank}`}>
                <div className="rank-medal-num">{r.rank}</div>
                <div className="rank-grade">{r.grade}</div>
                <div className="rank-avg">{r.avg}</div>
                <div className="rank-bar-wrap"><div className="rank-bar" style={{width:r.score+'%', background: r.rank===1?'#d97706':r.rank===2?'#94a3b8':r.rank===3?'#b45309':'#1a73e8'}}/></div>
                <div className="rank-students">{r.students} students</div>
              </div>
            ))}
          </div>
        </div>
      )

      // â”€â”€ STRATEGIC â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      case 'strategic': {
        const insights = [
          { label:'System Growth',        value:87, prev:79, status:'good', note:'Avg score up 8pts vs last term' },
          { label:'Attendance Rate',       value:94, prev:88, status:'good', note:'Consistent improvement across all classes' },
          { label:'Task Completion',       value:91, prev:78, status:'good', note:'Teachers completing more tasks on time' },
          { label:'Manager Performance',   value:92, prev:92, status:'good', note:'Stable â€” no significant change' },
        ]
        const summaries = [
          { status:'good', text:'System performance is improving this week â€” attendance and scores are both trending upward.' },
          { status:'good', text:'Student enrollment grew by 18 this term, indicating strong community trust.' },
          { status:'warn', text:'Mr. Omar is currently on leave â€” 3 classes need coverage review.' },
          { status:'warn', text:'Task completion for English department is below the 80% threshold.' },
        ]
        return (
          <div className="dash-content page-enter">

            {/* Header */}
            <div className="stg-header">
              <div>
                <h2 className="stg-title">Strategic Control</h2>
                <p className="stg-sub">Executive overview &middot; {new Date().toLocaleDateString('en-US',{month:'long',year:'numeric'})}</p>
              </div>
              <div className="stg-year-badge">Term 1 &middot; 2026</div>
            </div>

            {/* Year-over-year comparison */}
            <div className="stg-yoy">
              <div className="stg-yoy-card">
                <div className="stg-yoy-year">2025</div>
                <div className="stg-yoy-stats">
                  {[['Students','229'],['Avg Score','79%'],['Pass Rate','91%'],['Teachers','16']].map(([k,v])=>(
                    <div key={k} className="stg-yoy-stat"><span>{k}</span><strong>{v}</strong></div>
                  ))}
                </div>
              </div>
              <div className="stg-yoy-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="28" height="28"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                <span>Growth</span>
              </div>
              <div className="stg-yoy-card stg-yoy-current">
                <div className="stg-yoy-year">2026 <span className="stg-current-tag">Current</span></div>
                <div className="stg-yoy-stats">
                  {[['Students','248 â†‘'],['Avg Score','87% â†‘'],['Pass Rate','96% â†‘'],['Teachers','18 â†‘']].map(([k,v])=>(
                    <div key={k} className="stg-yoy-stat"><span>{k}</span><strong className="stg-up">{v}</strong></div>
                  ))}
                </div>
              </div>
            </div>

            <div className="stg-body">

              {/* Strategic Insights */}
              <div className="stg-card stg-insights-card">
                <div className="stg-card-head">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  Strategic Insights
                </div>
                <div className="stg-insights-list">
                  {insights.map(ins => {
                    const delta = ins.value - ins.prev
                    return (
                      <div key={ins.label} className={`stg-insight-row stg-ins-${ins.status}`}>
                        <div className="stg-ins-left">
                          <div className="stg-ins-label">{ins.label}</div>
                          <div className="stg-ins-note">{ins.note}</div>
                        </div>
                        <div className="stg-ins-right">
                          <div className="stg-ins-bar-wrap">
                            <div className="stg-ins-bar-prev" style={{width:ins.prev+'%'}}/>
                            <div className="stg-ins-bar-curr" style={{width:ins.value+'%', background: ins.status==='good'?'#16a34a':ins.status==='warn'?'#d97706':'#dc2626'}}/>
                          </div>
                          <div className="stg-ins-values">
                            <span className="stg-ins-val">{ins.value}%</span>
                            <span className={`stg-ins-delta ${delta>=0?'up':'down'}`}>
                              {delta>=0?'+':''}{delta}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* System Summaries */}
              <div className="stg-card">
                <div className="stg-card-head">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  System Summaries
                </div>
                <div className="stg-summaries">
                  {summaries.map((s,i) => (
                    <div key={i} className={`stg-summary-row stg-sum-${s.status}`}>
                      <div className={`stg-sum-bar`} style={{background: s.status==='good'?'#16a34a':'#d97706'}}/>
                      <p>{s.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Manager Strategy View */}
              <div className="stg-card stg-mgr-strat">
                <div className="stg-card-head">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  Manager Strategy View
                </div>
                <div className="stg-mgr-row">
                  <img src={manager.img} alt={manager.name} className="stg-mgr-img"/>
                  <div className="stg-mgr-detail">
                    <div className="stg-mgr-name">{manager.name}</div>
                    <div className="stg-mgr-branch">{manager.branch}</div>
                    <div className="stg-mgr-kpis">
                      {[
                        {label:'Attendance', val:manager.att, color:'#16a34a'},
                        {label:'Tasks',      val:manager.tasks, color:'#1a73e8'},
                        {label:'Score',      val:manager.score, color:'#7c3aed'},
                      ].map(k=>(
                        <div key={k.label} className="stg-kpi">
                          <div className="stg-kpi-label">{k.label}</div>
                          <div className="stg-kpi-bar-wrap">
                            <div className="stg-kpi-bar" style={{width:k.val+'%', background:k.color}}/>
                          </div>
                          <div className="stg-kpi-val" style={{color:k.color}}>{k.val}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={`stg-mgr-status stg-ms-${manager.score>=90?'good':manager.score>=75?'warn':'critical'}`}>
                    {manager.score>=90?'Strong':'Needs Attention'}
                  </div>
                </div>
              </div>

              {/* Owner Strategic Notes */}
              <div className="stg-card stg-notes-card">
                <div className="stg-card-head">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Owner Strategic Notes
                </div>

                {/* Input */}
                <div className="stg-note-form">
                  <input
                    className="stg-note-title-input"
                    placeholder="Note title (optional)"
                    value={noteTitle}
                    onChange={e=>setNoteTitle(e.target.value)}
                  />
                  <textarea
                    className="stg-note-textarea"
                    placeholder="Write your strategic observation, decision, or instruction..."
                    value={noteText}
                    onChange={e=>setNoteText(e.target.value)}
                    rows={4}
                  />
                  <div className="stg-note-form-footer">
                    <div className="stg-note-status-row">
                      <span className="stg-note-status-label">Mark as:</span>
                      {['good','warn','critical'].map(s=>(
                        <button key={s} className={`stg-note-status-btn stg-nsb-${s}`} onClick={()=>{}}>
                          {s==='good'?'Strong':s==='warn'?'Attention':'Critical'}
                        </button>
                      ))}
                    </div>
                    <button className="stg-note-save" onClick={addNote} disabled={!noteText.trim()}>
                      {noteSaved
                        ? <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><polyline points="20 6 9 17 4 12"/></svg> Saved</>
                        : <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Save Note</>
                      }
                    </button>
                  </div>
                </div>

                {/* Notes timeline */}
                <div className="stg-notes-timeline">
                  {notes.map((n,i) => (
                    <div key={n.id} className={`stg-note-item stg-note-${n.status}`}>
                      <div className="stg-note-line">
                        <div className={`stg-note-dot stg-nd-${n.status}`}/>
                        {i < notes.length-1 && <div className="stg-note-connector"/>}
                      </div>
                      <div className="stg-note-content">
                        <div className="stg-note-meta">
                          <span className="stg-note-date">{n.date}</span>
                          <span className={`stg-note-tag stg-nt-${n.status}`}>
                            {n.status==='good'?'Strong':n.status==='warn'?'Attention':'Critical'}
                          </span>
                        </div>
                        {n.title && <div className="stg-note-title">{n.title}</div>}
                        <p className="stg-note-text">{n.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )
      }

      // â”€â”€ ZAKAT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      case 'zakat': return <ZakatSection />

      // â”€â”€ REPORTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      case 'reports': return <ReportsSection />

      default: return null
    }
  }

  return (
    <div className="dashboard-layout">
      <Sidebar role="owner" items={sidebarItems} active={active} onSelect={setActive} />
      <main className="dashboard-main">
        {renderContent()}
        {detailPerson && <DetailModal person={detailPerson} type={detailType} onClose={closeDetail}/>}
        {attachTarget && <AttachModal target={attachTarget} onClose={()=>setAttachTarget(null)} onSend={handleSendFile}/>}
      </main>
    </div>
  )
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ZAKAT SECTION  â€” School Net Income â†’ Islamic Zakat Calculator
// Income = student payment fees (paid) + sponsorships received (all from DB)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function ZakatSection() {
  const [zakat,      setZakat]      = useState(null)
  const [breakdown,  setBreakdown]  = useState(null)
  const [history,    setHistory]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [saving,     setSaving]     = useState(false)
  const [msg,        setMsg]        = useState('')
  // Sponsorship add form
  const [showSponForm,  setShowSponForm]  = useState(false)
  const [sponForm,      setSponForm]      = useState({ donor_name:'', amount:'', description:'', received_date:'' })
  const [sponSaving,    setSponSaving]    = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setFetchError('')
    try {
      const [calc, brk, hist] = await Promise.all([
        zakatAPI.calculate(),
        zakatAPI.incomeBreakdown(),
        zakatAPI.history(),
      ])
      setZakat(calc)
      setBreakdown(brk)
      setHistory(hist)
    } catch (err) {
      console.error('ZakatSection load error:', err)
      setFetchError(err.message || 'Failed to load. Make sure backend is running on port 5000.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    if (!zakat) return
    setSaving(true)
    try {
      await zakatAPI.save({
        annual_income: zakat.annual_income,
        nisab_value:   zakat.nisab_value,
        zakat_amount:  zakat.zakat_amount,
        is_liable:     zakat.is_liable,
      })
      await load()
      setMsg('Record saved âœ“')
      setTimeout(() => setMsg(''), 2500)
    } catch (e) { setMsg(e.message) }
    finally { setSaving(false) }
  }

  const handleAddSponsorship = async () => {
    if (!sponForm.donor_name || !sponForm.amount) return
    setSponSaving(true)
    try {
      await zakatAPI.addSponsorship({
        ...sponForm,
        amount: parseFloat(sponForm.amount),
        received_date: sponForm.received_date || new Date().toISOString().split('T')[0],
      })
      setSponForm({ donor_name:'', amount:'', description:'', received_date:'' })
      setShowSponForm(false)
      await load()
      setMsg('Sponsorship added âœ“')
      setTimeout(() => setMsg(''), 2500)
    } catch (e) { setMsg(e.message) }
    finally { setSponSaving(false) }
  }

  const handleDeleteSponsorship = async (id) => {
    if (!window.confirm('Remove this sponsorship record?')) return
    try {
      await zakatAPI.deleteSponsorship(id)
      await load()
      setMsg('Removed âœ“')
      setTimeout(() => setMsg(''), 2000)
    } catch (e) { setMsg(e.message) }
  }

  const fmt = (n) => Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  if (loading) return (
    <div className="dash-content page-enter" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:300}}>
      <div style={{textAlign:'center',color:'#94a3b8'}}>
        <svg className="login-spin" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" width="36" height="36" style={{display:'block',margin:'0 auto 12px'}}>
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
        Loading Zakat dataâ€¦
      </div>
    </div>
  )

  const sources = zakat?.income_sources || {}

  return (
    <div className="dash-content page-enter">

      {/* â”€â”€ Header â”€â”€ */}
      <div className="zk-header">
        <div className="zk-header-icon">â˜ª</div>
        <div>
          <h2 className="zk-title">Zakat Calculator</h2>
          <p className="zk-sub">School net income (student fees + sponsorships) Â· 2.5% above Nisab</p>
        </div>
        {msg && <div className="zk-msg">{msg}</div>}
      </div>

      {/* â”€â”€ Income Sources Summary â”€â”€ */}
      <div className="zk-sources-grid">
        <div className="zk-source-card" style={{'--sc':'#1a73e8'}}>
          <div className="zk-source-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#1a73e8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          </div>
          <div className="zk-source-value" style={{color:'#1a73e8'}}>{fmt(sources.student_fees)} ETB</div>
          <div className="zk-source-label">Student Fees Collected</div>
          {breakdown?.by_grade?.length > 0 && (
            <div className="zk-source-detail">
              {breakdown.by_grade.map(g => (
                <div key={g.grade} className="zk-grade-row">
                  <span>{g.grade}</span>
                  <span>{g.paid_count}/{g.total_students} paid</span>
                  <span style={{color:'#1a73e8', fontWeight:700}}>{fmt(g.collected)} ETB</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="zk-source-card" style={{'--sc':'#d97706'}}>
          <div className="zk-source-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </div>
          <div className="zk-source-value" style={{color:'#d97706'}}>{fmt(sources.sponsorship)} ETB</div>
          <div className="zk-source-label">Sponsorships Received</div>
          <button className="zk-add-spon-btn" onClick={() => setShowSponForm(s => !s)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="12" height="12"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            {showSponForm ? 'Cancel' : 'Add Sponsorship'}
          </button>
        </div>

        <div className="zk-source-card zk-source-total" style={{'--sc':'#16a34a'}}>
          <div className="zk-source-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div className="zk-source-value" style={{color:'#16a34a'}}>{fmt(sources.total)} ETB</div>
          <div className="zk-source-label">School Net Income</div>
          <div className="zk-source-sub">Student Fees + Sponsorships</div>
        </div>
      </div>

      {/* â”€â”€ Add Sponsorship Form â”€â”€ */}
      {showSponForm && (
        <div className="zk-spon-form">
          <div className="zk-spon-form-title">Add Sponsorship Income</div>
          <div className="zk-spon-form-row">
            <div className="zk-spon-field">
              <label>Donor / Organization</label>
              <input placeholder="e.g. Ahmed Foundation" value={sponForm.donor_name}
                onChange={e => setSponForm(p => ({...p, donor_name: e.target.value}))} />
            </div>
            <div className="zk-spon-field">
              <label>Amount (ETB)</label>
              <input type="number" placeholder="e.g. 10000" value={sponForm.amount}
                onChange={e => setSponForm(p => ({...p, amount: e.target.value}))} />
            </div>
            <div className="zk-spon-field">
              <label>Date Received</label>
              <input type="date" value={sponForm.received_date}
                onChange={e => setSponForm(p => ({...p, received_date: e.target.value}))} />
            </div>
            <div className="zk-spon-field" style={{flex:2}}>
              <label>Description (optional)</label>
              <input placeholder="e.g. Term 1 grant" value={sponForm.description}
                onChange={e => setSponForm(p => ({...p, description: e.target.value}))} />
            </div>
            <button className="zk-btn-save" onClick={handleAddSponsorship} disabled={sponSaving || !sponForm.donor_name || !sponForm.amount}>
              {sponSaving ? 'Savingâ€¦' : 'Add'}
            </button>
          </div>
        </div>
      )}

      {/* â”€â”€ Sponsorship List â”€â”€ */}
      {breakdown?.sponsorships?.length > 0 && (
        <div className="zk-spon-list">
          <div className="zk-spon-list-title">Sponsorship Records</div>
          {breakdown.sponsorships.map(s => (
            <div key={s.id} className="zk-spon-row">
              <div className="zk-spon-donor">
                <svg viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/></svg>
                <span>{s.donor_name}</span>
                {s.description && <span className="zk-spon-desc">{s.description}</span>}
              </div>
              <div className="zk-spon-meta">
                <span>{new Date(s.received_date).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'})}</span>
                <span className="zk-spon-amount">{fmt(s.amount)} ETB</span>
                <button className="zk-spon-del" onClick={() => handleDeleteSponsorship(s.id)} title="Remove">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="12" height="12"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* â”€â”€ Nisab Bar â”€â”€ */}
      <div className="zk-nisab-bar">
        <svg viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span>Nisab threshold (85g gold): <strong>{fmt(zakat?.nisab_value)} ETB</strong></span>
        <span className={`zk-liable-badge ${zakat?.is_liable ? 'liable' : 'not-liable'}`}>
          {zakat?.is_liable ? 'âœ“ Zakat is Obligatory' : 'âœ— Below Nisab â€” Not Obligatory'}
        </span>
      </div>

      {/* â”€â”€ Zakat Results â”€â”€ */}
      {zakat && (
        <div className="zk-results-grid">
          {[
            { label:'School Net Income',  value: fmt(zakat.annual_income)   + ' ETB', color:'#1a73e8', icon:'ðŸ«' },
            { label:'Annual Zakat Due',   value: fmt(zakat.zakat_amount)    + ' ETB', color:'#16a34a', icon:'â˜ª'  },
            { label:'Monthly Zakat',      value: fmt(zakat.monthly_zakat)   + ' ETB', color:'#0891b2', icon:'ðŸ“…' },
            { label:'Net After Zakat',    value: fmt(zakat.net_after_zakat) + ' ETB', color:'#7c3aed', icon:'ðŸ’°' },
          ].map(r => (
            <div key={r.label} className="zk-result-card" style={{'--zc': r.color}}>
              <div className="zk-result-icon" style={{color: r.color}}>{r.icon}</div>
              <div className="zk-result-value" style={{color: r.color}}>{r.value}</div>
              <div className="zk-result-label">{r.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* â”€â”€ Income Breakdown Bar â”€â”€ */}
      {zakat && zakat.is_liable && (
        <div className="zk-breakdown-card">
          <div className="zk-breakdown-title">Net Income Breakdown</div>
          <div className="zk-bar-row">
            <div className="zk-bar-track">
              <div className="zk-bar-zakat" style={{width:'2.5%'}} title="Zakat 2.5%"/>
              <div className="zk-bar-net"   style={{width:'97.5%'}} title="Net 97.5%"/>
            </div>
          </div>
          <div className="zk-bar-legend">
            <span><span className="zk-dot" style={{background:'#16a34a'}}/>Zakat (2.5%) â€” {fmt(zakat.zakat_amount)} ETB</span>
            <span><span className="zk-dot" style={{background:'#dbeafe'}}/>Retained (97.5%) â€” {fmt(zakat.net_after_zakat)} ETB</span>
          </div>
          <div className="zk-save-row">
            <button className="zk-btn-record" onClick={handleSave} disabled={saving}>
              {saving ? 'Savingâ€¦' : 'ðŸ’¾ Save This Calculation'}
            </button>
          </div>
        </div>
      )}

      {/* â”€â”€ History â”€â”€ */}
      {history.length > 0 && (
        <div className="zk-history-card">
          <div className="zk-history-title">Calculation History</div>
          <div className="zk-history-table-wrap">
            <table className="zk-history-table">
              <thead>
                <tr><th>Date</th><th>School Income</th><th>Nisab</th><th>Zakat Due</th><th>Liable</th></tr>
              </thead>
              <tbody>
                {history.map(h => (
                  <tr key={h.id}>
                    <td>{new Date(h.calculated_at).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'})}</td>
                    <td>{fmt(h.annual_income)} ETB</td>
                    <td>{fmt(h.nisab_value)} ETB</td>
                    <td className="zk-td-amount">{fmt(h.zakat_amount)} ETB</td>
                    <td><span className={`zk-liable-badge ${h.is_liable ? 'liable':'not-liable'}`} style={{fontSize:11}}>{h.is_liable ? 'âœ“ Yes':'âœ— No'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// REPORTS SECTION  â€” live data from backend + reports sent by manager
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function ReportsSection() {
  const [overview,     setOverview]     = useState(null)
  const [teachers,     setTeachers]     = useState([])
  const [grades,       setGrades]       = useState([])
  const [attBreak,     setAttBreak]     = useState([])
  const [sentReports,  setSentReports]  = useState([])
  const [loading,      setLoading]      = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [ov, tc, gd, ab, sent] = await Promise.all([
          reportsAPI.overview(),
          reportsAPI.teacherTasks(),
          reportsAPI.gradeDistribution(),
          reportsAPI.attendanceBreakdown(),
          reportsAPI.getSent(),
        ])
        setOverview(ov); setTeachers(tc); setGrades(gd); setAttBreak(ab)
        setSentReports(sent)
      } catch (e) {
        console.error('ReportsSection load:', e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return (
    <div className="dash-content page-enter" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:300}}>
      <div style={{textAlign:'center',color:'#94a3b8'}}>
        <svg className="login-spin" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" width="36" height="36" style={{display:'block',margin:'0 auto 12px'}}>
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
        Loading reportsâ€¦
      </div>
    </div>
  )

  const fmt1   = (n) => Number(n || 0).toFixed(1)
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }) : 'â€”'

  return (
    <div className="dash-content page-enter">
      <div className="own-page-header">
        <h2 className="own-page-title">School Reports</h2>
        <p className="own-page-sub">Live data from database Â· Reports sent by Manager</p>
      </div>

      {/* â”€â”€ Reports Sent by Manager â”€â”€ */}
      {sentReports.length > 0 && (
        <div style={{marginBottom:28}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#0891b2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            <span style={{fontSize:14,fontWeight:800,color:'#1e293b'}}>Reports from Manager ({sentReports.length})</span>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {sentReports.map(r => (
              <div key={r.id} style={{background:'#f0f9ff',border:'1.5px solid #bae6fd',borderRadius:14,padding:'20px 22px',boxShadow:'0 2px 8px rgba(8,145,178,0.08)'}}>
                {/* Header */}
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:12,marginBottom:14}}>
                  <div>
                    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
                      <span style={{padding:'3px 10px',background:'#dcfce7',color:'#15803d',borderRadius:20,fontSize:11,fontWeight:700}}>&#10003; From Manager</span>
                      <span style={{fontSize:17,fontWeight:800,color:'#0c4a6e'}}>{r.term}</span>
                    </div>
                    <div style={{fontSize:12,color:'#64748b'}}>
                      By <strong>{r.generated_by_name || 'Manager'}</strong> &middot; Sent {fmtDate(r.sent_at)}
                    </div>
                  </div>
                  {/* Document download */}
                  {r.document_name && (
                    <a
                      href={reportsAPI.documentUrl(r.id)}
                      download={r.document_name}
                      style={{display:'inline-flex',alignItems:'center',gap:7,padding:'9px 16px',
                        background:'linear-gradient(135deg,#7c3aed,#6d28d9)',color:'#fff',
                        borderRadius:8,fontSize:12,fontWeight:700,textDecoration:'none',
                        boxShadow:'0 3px 10px rgba(124,58,237,0.3)',flexShrink:0}}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      {r.document_name}
                    </a>
                  )}
                </div>
                {/* Manager comment */}
                {(r.comment || r.notes) && (
                  <div style={{background:'#fff',borderRadius:8,padding:'12px 14px',marginBottom:14,
                    border:'1px solid #bae6fd',borderLeft:'4px solid #0891b2'}}>
                    <div style={{fontSize:11,fontWeight:700,color:'#0891b2',marginBottom:4,
                      textTransform:'uppercase',letterSpacing:'0.04em'}}>
                      Manager's Comment
                    </div>
                    <div style={{fontSize:13,color:'#1e293b',lineHeight:1.6}}>{r.comment || r.notes}</div>
                  </div>
                )}
                {/* Stats grid */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))',gap:10}}>
                  {[
                    { label:'Student Avg',  value:`${fmt1(r.student_avg_score)}/100`, color:'#0891b2' },
                    { label:'Task Rate',    value:`${fmt1(r.teacher_task_rate)}%`,    color:'#7c3aed' },
                    { label:'Attendance',   value:`${fmt1(r.attendance_rate)}%`,      color:'#16a34a' },
                    { label:'Top Grade',    value: r.top_grade || 'N/A',               color:'#d97706' },
                    { label:'Students',     value: r.total_students || 0,              color:'#0891b2' },
                    { label:'Teachers',     value: r.total_teachers  || 0,             color:'#1a73e8' },
                    { label:'Assistants',   value: r.total_assistants || 0,            color:'#16a34a' },
                  ].map(s => (
                    <div key={s.label} style={{background:'#fff',borderRadius:10,padding:'11px 13px',border:'1px solid #e0f2fe'}}>
                      <div style={{fontSize:17,fontWeight:800,color:s.color}}>{s.value}</div>
                      <div style={{fontSize:10,fontWeight:600,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.04em',marginTop:2}}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {sentReports.length === 0 && (
        <div style={{background:'#f0f9ff',border:'1.5px dashed #bae6fd',borderRadius:12,padding:'20px 24px',marginBottom:24,display:'flex',alignItems:'center',gap:12}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <div style={{fontSize:13,color:'#64748b'}}>No reports sent by Manager yet. Ask the Manager to generate and send a report.</div>
        </div>
      )}

      {/* â”€â”€ Live Stats â”€â”€ */}
      {overview && (
        <div className="rpt-summary-row">
          {[
            { label:'Student Avg Score',    value: `${fmt1(overview.student_avg_score)}/100`, color:'#0891b2' },
            { label:'Teacher Task Rate',    value: `${fmt1(overview.teacher_task_rate)}%`,    color:'#7c3aed' },
            { label:'Attendance Rate',      value: `${fmt1(overview.attendance_rate)}%`,      color:'#16a34a' },
            { label:'Top Class',            value: overview.top_grade || 'N/A',               color:'#d97706' },
            { label:'Total Students',       value: overview.total_students || 0,              color:'#0891b2' },
            { label:'Teachers',             value: overview.total_teachers  || 0,             color:'#1a73e8' },
            { label:'Assistants',           value: overview.total_assistants|| 0,             color:'#16a34a' },
          ].map(s => (
            <div key={s.label} className="rpt-summary-card" style={{'--rc': s.color}}>
              <div className="rpt-summary-value" style={{color: s.color}}>{s.value}</div>
              <div className="rpt-summary-label">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* â”€â”€ Teacher Task Completion + Grade Distribution â”€â”€ */}
      {teachers.length > 0 && (
        <div className="rpt-charts-row">
          <div className="rpt-chart-card" style={{flex:1}}>
            <div className="rpt-chart-title">Teacher Task Completion</div>
            <div className="rpt-chart-sub">Per teacher Â· from live tasks table</div>
            <div style={{marginTop:16}}>
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
              <div style={{marginTop:16}}>
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

      {/* â”€â”€ Attendance Breakdown â”€â”€ */}
      {attBreak.length > 0 && (
        <div className="rpt-charts-row">
          <div className="rpt-chart-card" style={{flex:1}}>
            <div className="rpt-chart-title">Attendance Breakdown</div>
            <div className="rpt-chart-sub">By entity type</div>
            <div className="rpt-donuts-row" style={{marginTop:16}}>
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
                        transform="rotate(-90 48 48)" style={{transition:'stroke-dasharray 0.6s'}}/>
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

      {(!overview && !loading) && (
        <div style={{textAlign:'center',padding:'60px 20px',color:'#94a3b8'}}>
          <div style={{fontSize:40,marginBottom:12}}>ðŸ“Š</div>
          <div style={{fontSize:15}}>No report data yet. Add students, teachers and tasks to see live reports.</div>
        </div>
      )}
    </div>
  )
}
