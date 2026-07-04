import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import ProtectedRoute from './components/layout/ProtectedRoute'

// Auth pages
import Login    from './features/auth/Login'
import Register from './features/auth/Register'

// App pages
import Dashboard  from './features/dashboard/Dashboard'
import Loans      from './features/loans/Loans'
import Settlement from './features/settlement/Settlement'
import Letters    from './features/letters/Letters'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes — wrapped in AppShell via ProtectedRoute */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/loans"
              element={
                <ProtectedRoute>
                  <Loans />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settlement"
              element={
                <ProtectedRoute>
                  <Settlement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/letters"
              element={
                <ProtectedRoute>
                  <Letters />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
