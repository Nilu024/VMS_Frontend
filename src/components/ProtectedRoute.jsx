import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import Layout from '@/components/layout/Layout'
import { Loader2 } from 'lucide-react'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their dashboard
    const routes = {
      admin: '/admin/dashboard',
      security: '/security/checkin',
      manager: '/manager/visitors',
      hr: '/hr/visitors',
    }
    return <Navigate to={routes[user.role] || '/login'} replace />
  }

  return <Layout>{children}</Layout>
}
