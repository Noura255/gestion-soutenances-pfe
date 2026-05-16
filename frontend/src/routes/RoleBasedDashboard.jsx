import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const roleToPath = {
  STUDENT: '/student/dashboard',
  SUPERVISOR: '/supervisor/dashboard',
  JURY: '/jury/dashboard',
  ADMINISTRATION: '/administration/dashboard',
  ADMIN: '/admin/dashboard',
}

export default function RoleBasedDashboard() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="grid min-h-screen place-items-center text-slate-500">Chargement...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Navigate to={roleToPath[user.role] || '/login'} replace />
}
