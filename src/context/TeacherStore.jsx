import { createContext, useContext, useState } from 'react'
import { topicsAPI, attendanceAPI } from '../api/index.js'

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

export function TeacherStoreProvider({ children }) {
  const [topics, setTopics] = useState([])
  const [feedback, setFeedback] = useState([])
  const [actions, setActions] = useState([])
  const [studentResults, setStudentResults] = useState([])
  const [confirmedAttendance, setConfirmedAttendance] = useState(new Map())
  const [sem1Data, setSem1Data] = useState({})
  const [sem2Data, setSem2Data] = useState({})
  const [sem1Submitted, setSem1Submitted] = useState(false)
  const [sem2Submitted, setSem2Submitted] = useState(false)

  // Saves topic to backend AND updates local state
  const addTopic = async (topic) => {
    const local = { ...topic, id: Date.now() }
    setTopics(prev => [local, ...prev])
    try {
      await topicsAPI.create({
        teacher_id:   topic.teacherDbId || null,
        subject:      topic.subject,
        date:         topic.date,
        title:        topic.title,
        description:  topic.desc || '',
        submitted_at: topic.submittedAt || null,
      })
    } catch (e) {
      console.warn('[TeacherStore] Failed to save topic to DB:', e.message)
    }
  }

  const addFeedback = (entry) => {
    const item = { ...entry, id: Date.now(), date: new Date().toLocaleDateString() }
    setFeedback(prev => [item, ...prev])
    setActions(prev => [{ ...item, type: 'feedback', date: new Date().toLocaleString() }, ...prev])
  }

  const logAction = (entry) =>
    setActions(prev => [{ ...entry, id: Date.now(), date: new Date().toLocaleString() }, ...prev])

  const submitResults = (results) =>
    setStudentResults(prev => [...prev.filter(r => r.subject !== results.subject), results])

  // Saves attendance to backend AND updates local Map
  const confirmAttendance = async (entry) => {
    const key = entry.teacherId + '|' + entry.date
    const confirmedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setConfirmedAttendance(prev =>
      new Map([...prev, [key, { ...entry, confirmedAt }]])
    )
    // Save student attendance records to backend
    if (entry.records && Array.isArray(entry.records)) {
      try {
        await attendanceAPI.save({ records: entry.records })
      } catch (e) {
        console.warn('[TeacherStore] Failed to save attendance to DB:', e.message)
      }
    }
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
