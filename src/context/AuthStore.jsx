import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { authAPI, saveToken, clearToken, getToken } from '../api/index.js'

const AuthContext = createContext({
  currentUser: null,
  loading: true,
  login: async () => ({ success: false }),
  logout: () => {},
})

// ── Decode JWT payload without verifying signature (client-side only) ─────────
function decodeTokenPayload(token) {
  try {
    const base64 = token.split('.')[1]
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'))
    const payload = JSON.parse(json)
    if (payload.exp && payload.exp * 1000 < Date.now()) return null
    return payload
  } catch { return null }
}

// ── Persist teacher profile in localStorage so page refresh keeps it ─────────
const PROFILE_KEY = 'hidaya_profile'
const saveProfile  = (p) => { try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)) } catch {} }
const loadProfile  = ()  => { try { const s = localStorage.getItem(PROFILE_KEY); return s ? JSON.parse(s) : null } catch { return null } }
const clearProfile = ()  => { try { localStorage.removeItem(PROFILE_KEY) } catch {} }

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading]         = useState(true)
  const bgVerifyDone = useRef(false)

  useEffect(() => {
    const token = getToken()
    if (!token) { setLoading(false); return }

    const payload = decodeTokenPayload(token)
    if (payload) {
      // Restore from JWT + any cached profile immediately (no flicker on reload)
      const cachedProfile = loadProfile()
      setCurrentUser({
        id:        payload.id,
        login_id:  payload.login_id,
        email:     payload.email,
        role:      payload.role,
        full_name: payload.full_name,
        avatar_url: payload.avatar_url || null,
        profile:   cachedProfile || undefined,
      })
      setLoading(false)

      // Background: fetch full user + profile from server and update state
      if (!bgVerifyDone.current) {
        bgVerifyDone.current = true
        authAPI.me().then(user => {
          if (user.profile) saveProfile(user.profile)
          setCurrentUser(user)
        }).catch(() => {
          clearToken()
          clearProfile()
          setCurrentUser(null)
        })
      }
      return
    }

    clearToken()
    clearProfile()
    setLoading(false)
  }, [])

  const login = async (loginId, password, role) => {
    try {
      const data = await authAPI.login({ login_id: loginId, password, role })
      saveToken(data.token)
      const payload = decodeTokenPayload(data.token)
      const user = {
        ...(payload ? {
          id: payload.id, login_id: payload.login_id,
          email: payload.email, role: payload.role, full_name: payload.full_name,
        } : {}),
        ...data.user,
      }
      if (user.profile) saveProfile(user.profile)
      setCurrentUser(user)
      return { success: true, user }
    } catch (err) {
      const isNet = err.message === 'Failed to fetch' || err.message?.includes('NetworkError') || err.message?.includes('net::ERR')
      return { success: false, message: isNet ? 'Cannot reach the server.' : err.message || 'Invalid ID or password.' }
    }
  }

  const logout = () => {
    clearToken()
    clearProfile()
    setCurrentUser(null)
  }

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
