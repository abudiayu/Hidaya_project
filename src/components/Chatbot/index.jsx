import { useState, useRef, useEffect } from 'react'
import './style.css'

// ── Knowledge base ──────────────────────────────────────────────
const KB = [
  {
    keys: ['what is hidaya', 'about hidaya', 'tell me about', 'who are you', 'school info'],
    answer: `Hidaya Islamic Academy is a modern Islamic school established in 2000. We combine rigorous academic education with deep-rooted Islamic values — preparing students to be confident, knowledgeable, and God-conscious individuals. 🕌`,
  },
  {
    keys: ['register', 'enroll', 'admission', 'join', 'how to apply'],
    answer: `To register at Hidaya Academy:\n1. Visit our campus or click "Join Us" on the home page.\n2. Fill in the registration form with student details.\n3. Submit required documents (birth certificate, previous school records).\n4. Pay the registration fee.\n5. You will receive a confirmation within 3 working days. 📋`,
  },
  {
    keys: ['payment', 'fee', 'tuition', 'cost', 'price', 'how much', 'etb'],
    answer: `School fees vary by grade level:\n• Grade 7: 1,200 ETB/term\n• Grade 8: 1,500 ETB/term\n• Grade 9: 1,800 ETB/term\n\nPayment can be made at the school office or through the Manager Portal. Receipts are issued immediately. 💳`,
  },
  {
    keys: ['manager', 'manager role', 'what does manager do', 'manager dashboard'],
    answer: `The Manager oversees the entire school system:\n• Monitors teacher attendance & performance\n• Manages student records and results\n• Tracks payment status\n• Assigns tasks to assistants\n• Views reports and analytics\n\nManagers log in via the Staff Login button. 👨‍💼`,
  },
  {
    keys: ['teacher', 'teacher role', 'what does teacher do'],
    answer: `Teachers at Hidaya Academy can:\n• Mark daily student attendance\n• Submit lesson topics each day\n• Enter student marks (Semester 1, 2 & Final)\n• View their weekly calendar\n• Receive files from the manager\n\nAll submitted data is locked after submission to ensure integrity. 📚`,
  },
  {
    keys: ['assistant', 'assistant role'],
    answer: `Assistants support the academic management by:\n• Monitoring teacher schedules\n• Managing timetables\n• Coordinating tasks between staff\n• Compiling reports for the manager 📅`,
  },
  {
    keys: ['parent', 'parent portal', 'parent access'],
    answer: `Parents can access the Parent Portal to:\n• View their child's grades and rank\n• Check attendance history\n• See performance trends per term\n• Track payment status\n\nClick "Parent Portal" in the top navigation to log in. 👨‍👩‍👧`,
  },
  {
    keys: ['deadline', 'date', 'semester', 'term', 'schedule', 'calendar'],
    answer: `Academic Calendar:\n• Semester 1: September – January\n• Semester 2: February – June\n• Final Exams: May–June\n• Registration Deadline: 2 weeks before term start\n• Results Published: Within 1 week of exams 📆`,
  },
  {
    keys: ['grade', 'result', 'marks', 'score', 'exam'],
    answer: `Grading System:\n• Assignment: 10 marks\n• Class Work: 10 marks\n• Mid Exam: 30 marks\n• Final Exam: 50 marks\n• Total: 100 marks\n\nGrades: A+ (≥90), A (≥85), A- (≥80), B+ (≥75), B (≥70), B- (≥65), C (≥60), F (<60) 📊`,
  },
  {
    keys: ['rating', 'feedback', 'review', 'performance'],
    answer: `Staff performance is rated based on:\n• Attendance rate\n• Task completion percentage\n• Daily topic submissions\n• Student result quality\n\nRatings are visible to the Manager and Owner dashboards. ⭐`,
  },
  {
    keys: ['subject', 'curriculum', 'course', 'what do you teach'],
    answer: `Hidaya Academy offers 6 core subjects:\n1. Islamic Studies (Quran, Hadith, Fiqh & Seerah)\n2. Mathematics\n3. Sciences (Physics, Chemistry & Biology)\n4. Arabic Language\n5. Social Studies\n6. ICT & Technology 📖`,
  },
  {
    keys: ['contact', 'phone', 'email', 'address', 'location', 'where'],
    answer: `Contact Hidaya Islamic Academy:\n📍 Main Campus, Addis Ababa, Ethiopia\n📞 +251 911 000 000\n📧 info@hidaya.edu.et\n\nOr click "Contact Manager" on the home page to send a message directly. 📬`,
  },
  {
    keys: ['login', 'staff login', 'how to login', 'password', 'access'],
    answer: `Staff Login:\n1. Click "Staff Login" in the top navigation.\n2. Select your role (Teacher, Manager, Assistant, Owner).\n3. Enter your credentials.\n4. You will be directed to your role-specific dashboard. 🔐`,
  },
  {
    keys: ['hello', 'hi', 'hey', 'salam', 'greetings', 'good morning', 'good afternoon'],
    answer: `Assalamu Alaikum! 👋 Welcome to Hidaya Islamic Academy.\n\nHow can I help you today? You can ask me about:\n• Registration & Admission\n• School fees & Payment\n• Subjects & Curriculum\n• Staff roles & Dashboards\n• Academic calendar`,
  },
  {
    keys: ['thank', 'thanks', 'jazakallah', 'shukran'],
    answer: `Wa Iyyakum! 😊 You're welcome. Is there anything else I can help you with?`,
  },
  {
    keys: ['bye', 'goodbye', 'see you', 'exit'],
    answer: `Ma'a Salama! 🌙 Feel free to come back anytime. May Allah bless your journey with us at Hidaya Academy.`,
  },
]

const SUGGESTIONS = [
  'How to register?',
  'Payment info',
  'What subjects are taught?',
  'Manager role',
  'Academic calendar',
  'Contact info',
]

function getBotReply(input) {
  const lower = input.toLowerCase().trim()
  for (const entry of KB) {
    if (entry.keys.some(k => lower.includes(k))) return entry.answer
  }
  return `I'm not sure about that yet. 🤔 You can try asking about:\n• Registration\n• School fees\n• Subjects\n• Staff roles\n• Contact info\n\nOr contact us directly at info@hidaya.edu.et`
}

export default function Chatbot() {
  const [open, setOpen]       = useState(false)
  const [messages, setMessages] = useState([
    { from: 'bot', text: `Assalamu Alaikum! 👋 I'm Hidaya Assistant.\n\nAsk me anything about Hidaya Islamic Academy — registration, fees, subjects, staff roles, and more!` }
  ])
  const [input, setInput]     = useState('')
  const [typing, setTyping]   = useState(false)
  const bottomRef             = useRef(null)
  const inputRef              = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300)
  }, [open])

  const send = (text) => {
    const msg = text || input.trim()
    if (!msg) return
    setInput('')
    setMessages(prev => [...prev, { from: 'user', text: msg }])
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMessages(prev => [...prev, { from: 'bot', text: getBotReply(msg) }])
    }, 900 + Math.random() * 400)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <>
      {/* Floating button */}
      <button
        className={`cb-fab ${open ? 'cb-fab-open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Open chat assistant"
      >
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="22" height="22">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
        {!open && <span className="cb-fab-dot" />}
      </button>

      {/* Chat window */}
      <div className={`cb-window ${open ? 'cb-window-open' : ''}`}>
        {/* Header */}
        <div className="cb-header">
          <div className="cb-header-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div>
            <div className="cb-header-name">Hidaya Assistant</div>
            <div className="cb-header-status">
              <span className="cb-online-dot" /> Online
            </div>
          </div>
          <button className="cb-header-close" onClick={() => setOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="14" height="14">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="cb-messages">
          {messages.map((m, i) => (
            <div key={i} className={`cb-msg-wrap ${m.from === 'user' ? 'cb-msg-user' : 'cb-msg-bot'}`}>
              {m.from === 'bot' && (
                <div className="cb-bot-avatar">H</div>
              )}
              <div className={`cb-bubble ${m.from === 'user' ? 'cb-bubble-user' : 'cb-bubble-bot'}`}>
                {m.text.split('\n').map((line, li) => (
                  <span key={li}>{line}{li < m.text.split('\n').length - 1 && <br />}</span>
                ))}
              </div>
            </div>
          ))}
          {typing && (
            <div className="cb-msg-wrap cb-msg-bot">
              <div className="cb-bot-avatar">H</div>
              <div className="cb-bubble cb-bubble-bot cb-typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        <div className="cb-suggestions">
          {SUGGESTIONS.map(s => (
            <button key={s} className="cb-suggestion" onClick={() => send(s)}>{s}</button>
          ))}
        </div>

        {/* Input */}
        <div className="cb-input-row">
          <input
            ref={inputRef}
            className="cb-input"
            placeholder="Ask me anything…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
          />
          <button
            className={`cb-send ${input.trim() ? 'cb-send-active' : ''}`}
            onClick={() => send()}
            disabled={!input.trim()}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  )
}
