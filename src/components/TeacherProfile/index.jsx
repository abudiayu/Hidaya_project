import { useState } from 'react'
import { useTeacherStore } from '../../context/TeacherStore'
import './style.css'

const TABS = ['Profile', 'Daily Topics', 'Performance', 'Feedback', 'Action Log']

export default function TeacherProfile({ teacher, role, onClose }) {
  const isManager = role === 'manager'
  const { topics, feedback, actions, addFeedback, logAction } = useTeacherStore()
  const [tab, setTab] = useState('Profile')
  const [editing, setEditing] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackType, setFeedbackType] = useState('note')
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [editData, setEditData] = useState({
    branch: teacher.branch || 'Main Campus',
    currentTopic: teacher.currentTopic || 'Not set',
    classes: teacher.classes?.join(', ') || '',
  })

  const myTopics = topics.filter(t => t.teacherId === teacher.id)
  const myFeedback = feedback.filter(f => f.teacherId === teacher.id)
  const myActions = actions.filter(a => a.teacherId === teacher.id)

  const stars = (r) => Array.from({ length: 5 }, (_, i) => i < Math.floor(r) ? '★' : '☆').join('')

  const handleSaveEdit = () => {
    logAction({ teacherId: teacher.id, teacherName: teacher.name, by: isManager ? 'Manager' : 'Assistant', type: 'edit', detail: 'Updated teacher profile (branch, topic, classes)' })
    setEditing(false)
  }

  const handleFeedback = () => {
    if (!feedbackText.trim()) return
    addFeedback({ teacherId: teacher.id, teacherName: teacher.name, by: isManager ? 'Manager' : 'Assistant', type: feedbackType, text: feedbackText })
    setFeedbackText('')
    setFeedbackSent(true)
    setTimeout(() => setFeedbackSent(false), 2000)
  }

  return (
    <div className="tp-overlay" onClick={onClose}>
      <div className="tp-modal" onClick={e => e.stopPropagation()}>
        <button className="tp-close" onClick={onClose}>✕</button>

        {/* Header */}
        <div className="tp-header">
          <div className="tp-header-pattern" />
          <div className="tp-header-inner">
            <img src={teacher.img} alt={teacher.name} className="tp-avatar" />
            <div className="tp-identity">
              <h2>{teacher.name}</h2>
              <div className="tp-role-chip">{teacher.subject} Teacher</div>
              <div className="tp-dept">{teacher.department} · {editData.branch}</div>
              <div className="tp-stars">
                <span className="tp-star-icons">{stars(teacher.rating)}</span>
                <span className="tp-rating-val">{teacher.rating} / 5.0</span>
              </div>
            </div>
            <div className="tp-header-stats">
              <div className="tp-hstat" style={{'--hc':'#c9a84c'}}>
                <div className="tp-hstat-val">{teacher.attendance}</div>
                <div className="tp-hstat-lbl">Attendance</div>
              </div>
              <div className="tp-hstat" style={{'--hc':'#a78bfa'}}>
                <div className="tp-hstat-val">{teacher.tasksCompleted}</div>
                <div className="tp-hstat-lbl">Tasks Done</div>
              </div>
              <div className="tp-hstat" style={{'--hc':'#34d399'}}>
                <div className="tp-hstat-val">{myTopics.length}</div>
                <div className="tp-hstat-lbl">Topics Logged</div>
              </div>
            </div>
          </div>
        </div>

        {/* Role banner */}
        <div className={`tp-role-banner ${isManager ? 'manager' : 'assistant'}`}>
          {isManager
            ? <><span>🔑</span> <strong>Manager</strong> — Full control: edit, assign, rate, monitor, feedback</>
            : <><span>👁️</span> <strong>Assistant</strong> — Monitor, track topics, give feedback and reports</>
          }
        </div>

        {/* Tabs */}
        <div className="tp-tabs">
          {TABS.map(t => (
            <button key={t} className={`tp-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'Daily Topics' && myTopics.length > 0 && <span className="tp-tab-badge">{myTopics.length}</span>}
              {t}
            </button>
          ))}
        </div>

        <div className="tp-body">

          {/* ── Profile Tab ── */}
          {tab === 'Profile' && (
            <div className="tp-grid">
              <div className="tp-col">
                <div className="tp-section">
                  <div className="tp-section-title">👤 Identity</div>
                  <div className="tp-info-rows">
                    {[['ID', teacher.id], ['Age', teacher.age], ['Gender', teacher.gender],
                      ['Experience', teacher.experience], ['Email', teacher.email], ['Phone', teacher.phone]].map(([k,v]) => (
                      <div key={k} className="tp-info-row"><span>{k}</span><strong>{v}</strong></div>
                    ))}
                    <div className="tp-info-row">
                      <span>Branch</span>
                      {editing ? <input className="tp-edit-input" value={editData.branch} onChange={e => setEditData({...editData, branch: e.target.value})} /> : <strong>{editData.branch}</strong>}
                    </div>
                    <div className="tp-info-row">
                      <span>Status</span>
                      <span className={`tp-status-chip ${teacher.status === 'Active' ? 'active' : 'leave'}`}>{teacher.status}</span>
                    </div>
                  </div>
                </div>

                <div className="tp-section">
                  <div className="tp-section-title">📖 Current Topic</div>
                  {editing
                    ? <input className="tp-edit-input" value={editData.currentTopic} onChange={e => setEditData({...editData, currentTopic: e.target.value})} />
                    : <div className="tp-topic-card">{editData.currentTopic}</div>
                  }
                </div>

                <div className="tp-section">
                  <div className="tp-section-title">🏫 Assigned Classes</div>
                  {editing
                    ? <input className="tp-edit-input" value={editData.classes} onChange={e => setEditData({...editData, classes: e.target.value})} />
                    : <div className="tp-chips">{(editData.classes||'').split(',').map(c=>c.trim()).filter(Boolean).map(c=><span key={c} className="tp-class-chip">{c}</span>)}</div>
                  }
                </div>
              </div>

              <div className="tp-col">
                <div className="tp-section">
                  <div className="tp-section-title">📚 Subject Performance</div>
                  <div className="tp-subjects">
                    {teacher.subjects?.map(s => (
                      <div key={s.name} className="tp-subj-row">
                        <span className="tp-subj-name">{s.name}</span>
                        <div className="tp-subj-bar-wrap"><div className="tp-subj-bar" style={{width:`${s.score}%`}} /></div>
                        <span className="tp-subj-score">{s.score}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {isManager && (
                  <div className="tp-section">
                    <div className="tp-section-title">🔧 Manager Controls</div>
                    <div className="tp-manager-actions">
                      {editing ? (
                        <>
                          <button className="tp-btn-save" onClick={handleSaveEdit}>💾 Save Changes</button>
                          <button className="tp-btn-cancel" onClick={() => setEditing(false)}>Cancel</button>
                        </>
                      ) : (
                        <button className="tp-btn-edit" onClick={() => setEditing(true)}>✏️ Edit Profile</button>
                      )}
                      <button className="tp-btn-rate" onClick={() => logAction({teacherId:teacher.id,teacherName:teacher.name,by:'Manager',type:'rate',detail:'Rating reviewed'})}>⭐ Update Rating</button>
                      <button className="tp-btn-assign" onClick={() => logAction({teacherId:teacher.id,teacherName:teacher.name,by:'Manager',type:'assign',detail:'Classes reassigned'})}>📌 Reassign Classes</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Daily Topics Tab ── */}
          {tab === 'Daily Topics' && (
            <div>
              <div className="tp-topics-header">
                <div className="tp-topics-count">{myTopics.length} topic{myTopics.length !== 1 ? 's' : ''} submitted</div>
              </div>
              {myTopics.length === 0 ? (
                <div className="tp-empty"><span>📭</span><p>No topics submitted yet</p></div>
              ) : (
                <div className="tp-topics-list">
                  {myTopics.map(t => (
                    <div key={t.id} className="tp-topic-item">
                      <div className="tp-topic-date-col">
                        <div className="tp-topic-date">{t.date}</div>
                        <div className="tp-topic-time">{t.submittedAt}</div>
                      </div>
                      <div className="tp-topic-content">
                        <div className="tp-topic-title">{t.title}</div>
                        <div className="tp-topic-desc">{t.desc}</div>
                        <span className="tp-topic-subj-chip">{t.subject}</span>
                      </div>
                      {isManager && (
                        <button className="tp-topic-review-btn" onClick={() => logAction({teacherId:teacher.id,teacherName:teacher.name,by:'Manager',type:'review',detail:`Reviewed topic: ${t.title}`})}>
                          ✓ Reviewed
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Performance Tab ── */}
          {tab === 'Performance' && (
            <div className="tp-grid">
              <div className="tp-col">
                <div className="tp-section">
                  <div className="tp-section-title">📈 Term History</div>
                  <div className="tp-history">
                    {teacher.history?.map(h => (
                      <div key={h.term} className="tp-hist-row">
                        <span className="tp-hist-term">{h.term}</span>
                        <div className="tp-hist-bars">
                          <div className="tp-hist-bar-row">
                            <span>Att</span>
                            <div className="tp-mini-bar-wrap"><div className="tp-mini-bar att" style={{width:h.attendance}} /></div>
                            <span>{h.attendance}</span>
                          </div>
                          <div className="tp-hist-bar-row">
                            <span>Tasks</span>
                            <div className="tp-mini-bar-wrap"><div className="tp-mini-bar tasks" style={{width:h.tasks}} /></div>
                            <span>{h.tasks}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="tp-col">
                <div className="tp-section">
                  <div className="tp-section-title">⭐ Rating Score</div>
                  <div className="tp-donut-wrap">
                    <svg width="110" height="110" viewBox="0 0 110 110">
                      <circle cx="55" cy="55" r="44" fill="none" stroke="#e2e8f0" strokeWidth="10"/>
                      <circle cx="55" cy="55" r="44" fill="none" stroke="#c9a84c" strokeWidth="10"
                        strokeDasharray={`${(teacher.rating/5)*276.5} 276.5`} strokeLinecap="round"
                        transform="rotate(-90 55 55)"/>
                      <text x="55" y="60" textAnchor="middle" fontSize="18" fontWeight="800" fill="#c9a84c">{teacher.rating}</text>
                    </svg>
                    <div className="tp-donut-label">out of 5.0</div>
                  </div>
                </div>
                <div className="tp-section">
                  <div className="tp-section-title">📊 Topics Submitted</div>
                  <div className="tp-info-rows">
                    <div className="tp-info-row"><span>Total Topics</span><strong>{myTopics.length}</strong></div>
                    <div className="tp-info-row"><span>Latest</span><strong>{myTopics[0]?.date || '—'}</strong></div>
                    <div className="tp-info-row"><span>Last Topic</span><strong>{myTopics[0]?.title || '—'}</strong></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Feedback Tab ── */}
          {tab === 'Feedback' && (
            <div>
              <div className="tp-section" style={{marginBottom:16}}>
                <div className="tp-section-title">✍️ Add Feedback / Report</div>
                <div className="tp-fb-type-row">
                  {['note','warning','praise','report'].map(t => (
                    <button key={t} className={`tp-fb-type-btn ${feedbackType===t?'active':''}`} onClick={() => setFeedbackType(t)}>
                      {t==='note'?'📝 Note':t==='warning'?'⚠️ Warning':t==='praise'?'🌟 Praise':'🚨 Report'}
                    </button>
                  ))}
                </div>
                <textarea className="tp-report-input" placeholder="Write your feedback or report..." value={feedbackText} onChange={e => setFeedbackText(e.target.value)} rows={3} />
                {feedbackSent
                  ? <div className="tp-report-sent">✅ Feedback submitted</div>
                  : <button className="tp-btn-report" onClick={handleFeedback} disabled={!feedbackText.trim()}>📤 Submit</button>
                }
              </div>

              {myFeedback.length === 0
                ? <div className="tp-empty"><span>💬</span><p>No feedback yet</p></div>
                : <div className="tp-fb-list">
                    {myFeedback.map(f => (
                      <div key={f.id} className={`tp-fb-item tp-fb-${f.type}`}>
                        <div className="tp-fb-top">
                          <span className="tp-fb-type-chip">{f.type==='note'?'📝':f.type==='warning'?'⚠️':f.type==='praise'?'🌟':'🚨'} {f.type}</span>
                          <span className="tp-fb-by">by {f.by}</span>
                          <span className="tp-fb-date">{f.date}</span>
                        </div>
                        <div className="tp-fb-text">{f.text}</div>
                      </div>
                    ))}
                  </div>
              }
            </div>
          )}

          {/* ── Action Log Tab ── */}
          {tab === 'Action Log' && (
            <div>
              {myActions.length === 0
                ? <div className="tp-empty"><span>📋</span><p>No actions logged yet</p></div>
                : <div className="tp-action-list">
                    {myActions.map(a => (
                      <div key={a.id} className="tp-action-item">
                        <div className="tp-action-icon">
                          {a.type==='edit'?'✏️':a.type==='rate'?'⭐':a.type==='assign'?'📌':a.type==='review'?'✓':a.type==='feedback'?'💬':'📋'}
                        </div>
                        <div className="tp-action-info">
                          <div className="tp-action-detail">{a.detail}</div>
                          <div className="tp-action-meta">by <strong>{a.by}</strong> · {a.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
