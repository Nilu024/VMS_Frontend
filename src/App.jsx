import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/hooks/useAuth'
import { ToastContextProvider } from '@/hooks/ToastContext'
import ProtectedRoute from '@/components/ProtectedRoute'

// Pages
import LoginPage from '@/pages/LoginPage'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import RoleCreation from '@/pages/admin/RoleCreation'
import AdminVisitorDetails from '@/pages/admin/AdminVisitorDetails'
import SecurityCheckin from '@/pages/security/SecurityCheckin'
import SecurityCheckout from '@/pages/security/SecurityCheckout'
import SecurityReport from '@/pages/security/SecurityReport'
import ManagerVisitorForm from '@/pages/manager/ManagerVisitorForm'
import ManagerHistory from '@/pages/manager/ManagerHistory'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastContextProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
              
              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/roles" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <RoleCreation />
                </ProtectedRoute>
              } />
              <Route path="/admin/visitors" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminVisitorDetails />
                </ProtectedRoute>
              } />

              {/* Security Routes */}
              <Route path="/security/checkin" element={
                <ProtectedRoute allowedRoles={['security', 'admin']}>
                  <SecurityCheckin />
                </ProtectedRoute>
              } />
              <Route path="/security/checkout" element={
                <ProtectedRoute allowedRoles={['security', 'admin']}>
                  <SecurityCheckout />
                </ProtectedRoute>
              } />
              <Route path="/security/report" element={
                <ProtectedRoute allowedRoles={['security', 'admin']}>
                  <SecurityReport />
                </ProtectedRoute>
              } />

              {/* Manager Routes */}
              <Route path="/manager/visitors" element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <ManagerVisitorForm />
                </ProtectedRoute>
              } />
              <Route path="/manager/history" element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <ManagerHistory />
                </ProtectedRoute>
              } />

              {/* HR Routes (same pages as manager) */}
              <Route path="/hr/visitors" element={
                <ProtectedRoute allowedRoles={['hr']}>
                  <ManagerVisitorForm />
                </ProtectedRoute>
              } />
              <Route path="/hr/history" element={
                <ProtectedRoute allowedRoles={['hr']}>
                  <ManagerHistory />
                </ProtectedRoute>
              } />

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastContextProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
