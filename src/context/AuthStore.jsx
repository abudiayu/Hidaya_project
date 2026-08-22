import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI, saveToken, clearToken, getToken } from '../api/index.js'

const AuthContext = createContext({
  currentUser: null,
  loading: true,
  login: async () => ({ success: false }),
  logout: () => {},
})

// ── Credential hints shown on the login page (matches real DB) ───────────────
export const TEACHER_ACCOUNTS = [
  { id: 'T001', loginId: 't01', password: 'pass01', name: 'Mr. Ali',    subject: 'Mathematics', img: 'https://i.pravatar.cc/80?img=13' },
  { id: 'T002', loginId: 't02', password: 'pass02', name: 'Ms. Sara',   subject: 'Science',     img: 'https://i.pravatar.cc/80?img=44' },
  { id: 'T003', loginId: 't03', password: 'pass03', name: 'Mr. Omar',   subject: 'English',     img: 'https://i.pravatar.cc/80?img=59' },
  { id: 'T004', loginId: 't04', password: 'pass04', name: 'Ms. Fatima', subject: 'History',     img: 'https://i.pravatar.cc/80?img=47' },
]

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session from token saved in localStorage
  useEffect(() => {
    const restore = async () => {
      const token = getToken()
      if (!token) { setLoading(false); return }
      try {
        const user = await authAPI.me()
        setCurrentUser(user)
      } catch {
        // Token expired or invalid — clear it
        clearToken()
      } finally {
        setLoading(false)
      }
    }
    restore()
  }, [])

  /**
   * login(loginId, password, role)
   *
   * Always calls the real backend. No demo fallback for wrong credentials.
   * Returns { success: true, user } on success or { success: false, message } on failure.
   */
  const login = async (loginId, password, role) => {
    try {
      const data = await authAPI.login({ login_id: loginId, password, role })
      saveToken(data.token)
      setCurrentUser(data.user)
      return { success: true, user: data.user }
    } catch (err) {
      // Distinguish between a backend auth error vs backend completely unreachable
      const isNetworkError = (
        err.message === 'Failed to fetch' ||
        err.message.includes('NetworkError') ||
        err.message.includes('net::ERR') ||
        err.message.includes('ECONNREFUSED')
      )

      if (isNetworkError) {
        // Backend is offline — show a clear message, do NOT auto-login
        console.warn('[Auth] Backend unreachable:', err.message)
        return {
          success: false,
          message: 'Cannot reach the server. Make sure the backend is running on port 5000.',
        }
      }

      // Backend returned 401/403 — real wrong credentials
      return {
        success: false,
        message: err.message || 'Invalid ID or password.',
      }
    }
  }

  const logout = () => {
    clearToken()
    setCurrentUser(null)
  }

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
