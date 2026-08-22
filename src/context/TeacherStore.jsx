import { createContext, useContext, useState } from 'react'

const defaultCtx = {
  topics: [],
  feedback: [],
  actions: [],
  studentResults: [],
  confirmedAttendance: new Map(),
  sem1Data: {}, sem2Data: {}, sem1Submitted: false, sem2Submitted: false,
  setSem1Data: () => {}, setSem2Data: () => {}, setSem1Submitted: () => {}, setSem2Submitted: () => {},
  addTopic: () => {},
  addFeedback: () => {},
  logAction: () => {},
  submitResults: () => {},
  confirmAttendance: () => {},
  isAttendanceConfirmed: () => false,
}

const TeacherStoreContext = createContext(defaultCtx)

const seedTopics = [
  { id: 1, teacherId: 'T001', teacherName: 'Mr. Ali',    subject: 'Math',    date: '2026-04-17', title: 'Quadratic Equations',  desc: 'Introduced the quadratic formula.',     submittedAt: '08:45 AM' },
  { id: 2, teacherId: 'T001', teacherName: 'Mr. Ali',    subject: 'Math',    date: '2026-04-16', title: 'Factoring Polynomials', desc: 'Covered factoring by grouping.',         submittedAt: '09:10 AM' },
  { id: 3, teacherId: 'T002', teacherName: 'Ms. Sara',   subject: 'Science', date: '2026-04-17', title: 'Cell Division Mitosis', desc: 'Explained the 4 phases of mitosis.',    submittedAt: '08:30 AM' },
  { id: 4, teacherId: 'T002', teacherName: 'Ms. Sara',   subject: 'Science', date: '2026-04-16', title: 'DNA Structure',         desc: 'Covered the double helix model.',        submittedAt: '08:55 AM' },
  { id: 5, teacherId: 'T003', teacherName: 'Mr. Omar',   subject: 'English', date: '2026-04-15', title: 'Argumentative Essay',   desc: 'Introduced argumentative essays.',       submittedAt: '10:00 AM' },
  { id: 6, teacherId: 'T004', teacherName: 'Ms. Fatima', subject: 'History', date: '2026-04-17', title: 'Ottoman Empire Rise',   desc: 'Discussed the Ottoman Empire founding.', submittedAt: '09:20 AM' },
  { id: 7, teacherId: 'T004', teacherName: 'Ms. Fatima', subject: 'History', date: '2026-04-16', title: 'Byzantine Empire Fall', desc: 'Covered the fall of Constantinople.',    submittedAt: '09:05 AM' },
]

export function TeacherStoreProvider({ children }) {
  const [topics, setTopics] = useState(seedTopics)
  const [feedback, setFeedback] = useState([])
  const [actions, setActions] = useState([])
  const [studentResults, setStudentResults] = useState([])
  const [confirmedAttendance, setConfirmedAttendance] = useState(new Map())
  // Semester results (Math teacher)
  const [sem1Data, setSem1Data] = useState({})
  const [sem2Data, setSem2Data] = useState({})
  const [sem1Submitted, setSem1Submitted] = useState(false)
  const [sem2Submitted, setSem2Submitted] = useState(false)

  const addTopic = (topic) =>
    setTopics(prev => [{ ...topic, id: Date.now() }, ...prev])

  const addFeedback = (entry) => {
    const item = { ...entry, id: Date.now(), date: new Date().toLocaleDateString() }
    setFeedback(prev => [item, ...prev])
    setActions(prev => [{ ...item, type: 'feedback', date: new Date().toLocaleString() }, ...prev])
  }

  const logAction = (entry) =>
    setActions(prev => [{ ...entry, id: Date.now(), date: new Date().toLocaleString() }, ...prev])

  const submitResults = (results) =>
    setStudentResults(prev => [...prev.filter(r => r.subject !== results.subject), results])

  const confirmAttendance = (entry) => {
    const key = entry.teacherId + '|' + entry.date
    setConfirmedAttendance(prev =>
      new Map([...prev, [key, {
        ...entry,
        confirmedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]])
    )
  }

  const isAttendanceConfirmed = (teacherId, date) =>
    confirmedAttendance.has(teacherId + '|' + date)

  return (
    <TeacherStoreContext.Provider value={{
      topics, feedback, actions, studentResults, confirmedAttendance,
      sem1Data, setSem1Data, sem2Data, setSem2Data, sem1Submitted, setSem1Submitted, sem2Submitted, setSem2Submitted,
      addTopic, addFeedback, logAction, submitResults, confirmAttendance, isAttendanceConfirmed,
    }}>
      {children}
    </TeacherStoreContext.Provider>
  )
}

export const useTeacherStore = () => useContext(TeacherStoreContext)
