import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/auth/Login'
import AdminDashboard from './pages/admin/AdminDashboard'
import UserManagement from './pages/admin/UserManagement'
import AuditLogs from './pages/admin/AuditLogs'
import ImportUsers from './pages/admin/ImportUsers'
import LoginHistory from './pages/admin/LoginHistory'
import SystemSettings from './pages/admin/SystemSettings'
import GlobalNotifications from './pages/admin/GlobalNotifications'
import AcademicStructureManagement from './pages/admin/AcademicStructureManagement'
import AdminChatbot from './pages/admin/AdminChatbot'
import StudentDashboard from './pages/student/StudentDashboard'
import StudentProjectPage from './pages/student/StudentProjectPage'
import StudentReportPage from './pages/student/StudentReportPage'
import StudentDefensePage from './pages/student/StudentDefensePage'
import StudentChatbotPage from './pages/student/StudentChatbotPage'
import SupervisorDashboard from './pages/supervisor/SupervisorDashboard'
import JuryDashboard from './pages/jury/JuryDashboard'
import JuryDefenses from './pages/jury/JuryDefenses'
import JuryDefenseDetails from './pages/jury/JuryDefenseDetails'
import JuryEvaluationForm from './pages/jury/JuryEvaluationForm'
import JuryReportViewer from './pages/jury/JuryReportViewer'
import AdministrationDashboard from './pages/administration/AdministrationDashboard'
import Layout from './components/common/Layout'
import ProtectedRoute from './routes/ProtectedRoute'
import RoleBasedDashboard from './routes/RoleBasedDashboard'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<RoleBasedDashboard />} />

      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route element={<Layout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/import-users" element={<ImportUsers />} />
          <Route path="/admin/login-history" element={<LoginHistory />} />
          <Route path="/admin/settings" element={<SystemSettings />} />
          <Route path="/admin/notifications" element={<GlobalNotifications />} />
          <Route path="/admin/academic-structure" element={<AcademicStructureManagement />} />
          <Route path="/admin/chatbot" element={<AdminChatbot />} />
          <Route path="/admin/logs" element={<AuditLogs />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
        <Route element={<Layout />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/project" element={<StudentProjectPage />} />
          <Route path="/student/report" element={<StudentReportPage />} />
          <Route path="/student/defense" element={<StudentDefensePage />} />
          <Route path="/student/chatbot" element={<StudentChatbotPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['SUPERVISOR']} />}>
        <Route element={<Layout />}>
          <Route path="/supervisor/dashboard" element={<SupervisorDashboard />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['JURY']} />}>
        <Route element={<Layout />}>
          <Route path="/jury/dashboard" element={<JuryDashboard />} />
          <Route path="/jury/defenses" element={<JuryDefenses />} />
          <Route path="/jury/defenses/:id" element={<JuryDefenseDetails />} />
          <Route path="/jury/defenses/:id/report" element={<JuryReportViewer />} />
          <Route path="/jury/defenses/:id/evaluation" element={<JuryEvaluationForm />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['ADMINISTRATION']} />}>
        <Route element={<Layout />}>
          <Route path="/administration/dashboard" element={<AdministrationDashboard />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
