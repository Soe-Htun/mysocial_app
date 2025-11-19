import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../providers/AuthProvider'

export default function RequireAuth() {
  const location = useLocation()
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        Checking your session...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
