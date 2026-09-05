import { createContext, useContext, useState, useEffect, useRef } from 'react'
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

// ── Decode JWT payload without verifying signature (client-side only) ─────────
// This lets us read the user fields from a stored token instantly,
// without a network round-trip. The backend still verifies on every API call.
function decodeTokenPayload(token) {
  try {
    const base64 = token.split('.')[1]
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'))
    const payload = JSON.parse(json)
    // Reject if expired
    if (payload.exp && payload.exp * 1000 < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const bgVerifyDone = useRef(false)

  useEffect(() => {
    const token = getToken()

    if (!token) {
      // No token — not logged in, done immediately
      setLoading(false)
      return
    }

    // ── Fast path: decode token locally, restore session in <1ms ────────────
    const payload = decodeTokenPayload(token)
    if (payload) {
      // Token is valid and not expired — restore user from payload instantly
      setCurrentUser({
        id:        payload.id,
        login_id:  payload.login_id,
        email:     payload.email,
        role:      payload.role,
        full_name: payload.full_name,
      })
      setLoading(false)

      // ── Background verification: silently refresh user data from server ───
      // Does NOT block the UI. If it fails (token revoked), logs out quietly.
      if (!bgVerifyDone.current) {
        bgVerifyDone.current = true
        authAPI.me().then(user => {
          setCurrentUser(user)
        }).catch(() => {
          // Token is invalid on the server — clear and force re-login
          clearToken()
          setCurrentUser(null)
        })
      }
      return
    }

    // ── Token exists but is malformed or expired ─────────────────────────────
    clearToken()
    setLoading(false)
  }, [])

  /**
   * login(loginId, password, role)
   * Returns { success: true, user } or { success: false, message }
   */
  const login = async (loginId, password, role) => {
    try {
      const data = await authAPI.login({ login_id: loginId, password, role })

      // Save token first
      saveToken(data.token)

      // Decode immediately from token for instant state (no second request)
      const payload = decodeTokenPayload(data.token)
      const user = payload ? {
        id:        payload.id,
        login_id:  payload.login_id,
        email:     payload.email,
        role:      payload.role,
        full_name: payload.full_name,
        // Merge any extra fields the server returned
        ...data.user,
      } : data.user

      setCurrentUser(user)
      return { success: true, user }

    } catch (err) {
      const isNetworkError = (
        err.message === 'Failed to fetch' ||
        err.message.includes('NetworkError') ||
        err.message.includes('net::ERR') ||
        err.message.includes('ECONNREFUSED')
      )

      if (isNetworkError) {
        return {
          success: false,
          message: 'Cannot reach the server. Make sure the backend is running.',
        }
      }

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
