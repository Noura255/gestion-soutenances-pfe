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
import SupervisorDashboard from './pages/supervisor/SupervisorDashboard'
import JuryDashboard from './pages/jury/JuryDashboard'
import JuryDefenses from './pages/jury/JuryDefenses'
import JuryDefenseDetails from './pages/jury/JuryDefenseDetails'
import JuryEvaluationForm from './pages/jury/JuryEvaluationForm'
import JuryReportViewer from './pages/jury/JuryReportViewer'
import JuryChatbot from './pages/jury/JuryChatbot'
import EvaluationsPending from './pages/jury/EvaluationsPending'
import EvaluationsDrafts from './pages/jury/EvaluationsDrafts'
import EvaluationsSubmitted from './pages/jury/EvaluationsSubmitted'
import ReportsAvailable from './pages/jury/ReportsAvailable'
import PlaceholderPage from './pages/jury/PlaceholderPage'
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
          
          {/* Évaluations */}
          <Route path="/jury/evaluations/pending" element={<EvaluationsPending />} />
          <Route path="/jury/evaluations/drafts" element={<EvaluationsDrafts />} />
          <Route path="/jury/evaluations/submitted" element={<EvaluationsSubmitted />} />
          <Route path="/jury/evaluations/statistics" element={<PlaceholderPage title="Statistiques des évaluations" subtitle="Analyse de vos évaluations" icon="📊" description="Consultez vos statistiques d'évaluation : moyenne des notes, répartition des décisions, et tendances." />} />
          
          {/* Rapports */}
          <Route path="/jury/reports/available" element={<ReportsAvailable />} />
          <Route path="/jury/reports/unavailable" element={<PlaceholderPage title="Rapports en attente" subtitle="Rapports non encore disponibles" icon="🔒" description="Les rapports qui ne sont pas encore rendus visibles par les encadrants apparaîtront ici." />} />
          <Route path="/jury/reports/all" element={<PlaceholderPage title="Tous les rapports" subtitle="Vue d'ensemble de tous les rapports" icon="📚" description="Accédez à tous les rapports de vos soutenances, disponibles ou en attente." />} />
          
          {/* Calendrier */}
          <Route path="/jury/calendar" element={<PlaceholderPage title="Vue calendrier" subtitle="Calendrier de vos soutenances" icon="📆" description="Visualisez toutes vos soutenances dans un calendrier interactif." />} />
          <Route path="/jury/calendar/upcoming" element={<PlaceholderPage title="Soutenances à venir" subtitle="Vos prochaines soutenances" icon="⏰" description="Liste chronologique de toutes vos soutenances à venir." />} />
          <Route path="/jury/calendar/history" element={<PlaceholderPage title="Historique" subtitle="Soutenances passées" icon="📜" description="Consultez l'historique de toutes vos soutenances passées." />} />
          
          {/* Aide */}
          <Route path="/jury/chatbot" element={<JuryChatbot />} />
          <Route path="/jury/guide" element={<PlaceholderPage title="Guide du jury" subtitle="Documentation pour les membres du jury" icon="📖" description="Consultez le guide complet pour les membres du jury : procédures, critères d'évaluation, et bonnes pratiques." />} />
          <Route path="/jury/faq" element={<PlaceholderPage title="FAQ" subtitle="Questions fréquemment posées" icon="❓" description="Trouvez rapidement des réponses aux questions les plus courantes." />} />
          
          {/* Profil */}
          <Route path="/jury/profile" element={<PlaceholderPage title="Mon profil" subtitle="Informations personnelles" icon="👨‍⚖️" description="Consultez et modifiez vos informations personnelles." />} />
          <Route path="/jury/notifications" element={<PlaceholderPage title="Notifications" subtitle="Vos notifications" icon="🔔" description="Consultez toutes vos notifications : nouvelles soutenances, rapports disponibles, rappels d'évaluation." />} />
          <Route path="/jury/settings" element={<PlaceholderPage title="Paramètres" subtitle="Préférences et configuration" icon="⚙️" description="Configurez vos préférences : notifications, langue, affichage." />} />
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
