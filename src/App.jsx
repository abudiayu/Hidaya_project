import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import { FileStoreProvider } from './context/FileStore'
import { TeacherStoreProvider } from './context/TeacherStore'
import { AuthProvider } from './context/AuthStore'
import { LangProvider } from './context/LangContext'
import HomePage from './pages/Home'
import RoleSelectPage from './pages/RoleSelect'
import LoginPage from './pages/Login'
import TeacherDashboard from './pages/TeacherDashboard'
import AssistantDashboard from './pages/AssistantDashboard'
import ManagerDashboard from './pages/ManagerDashboard'
import OwnerDashboard from './pages/OwnerDashboard'
import ParentPortal from './pages/ParentPortal'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <FileStoreProvider>
          <TeacherStoreProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/"                    element={<HomePage />} />
                <Route path="/role-select"          element={<RoleSelectPage />} />
                <Route path="/login/:role"          element={<LoginPage />} />
                <Route path="/dashboard/teacher"   element={<TeacherDashboard />} />
                <Route path="/dashboard/assistant" element={<AssistantDashboard />} />
                <Route path="/dashboard/manager"   element={<ManagerDashboard />} />
                <Route path="/dashboard/owner"     element={<OwnerDashboard />} />
                <Route path="/parent-portal"       element={<ParentPortal />} />
                {/* 404 — must be last */}
                <Route path="*"                    element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TeacherStoreProvider>
        </FileStoreProvider>
      </AuthProvider>
    </LangProvider>
  )
}
