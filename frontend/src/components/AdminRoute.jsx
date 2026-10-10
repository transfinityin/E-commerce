import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { isSuperAdmin } from '../lib/admin'

export default function AdminRoute() {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (!isSuperAdmin(user)) return <Navigate to="/" replace />
  return <Outlet />
}
