import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useEffect, useState } from 'react'
import api from '../../services/api'

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/users', label: 'Utilisateurs' },
  { to: '/admin/import-users', label: 'Import utilisateurs' },
  { to: '/admin/login-history', label: 'Connexions' },
  { to: '/admin/settings', label: 'Paramètres' },
  { to: '/admin/notifications', label: 'Notifications' },
  { to: '/admin/academic-structure', label: 'Structure académique' },
  { to: '/admin/chatbot', label: 'Chatbot admin' },
  { to: '/admin/logs', label: 'Logs système' },
]

const supervisorLinks = [
  { to: '/supervisor/dashboard', label: 'Dashboard' },
  { to: '/supervisor/students', label: 'Mes Étudiants' },
]

const studentLinks = [
  { to: '/student/dashboard', label: 'Dashboard' },
  { to: '/student/project', label: 'Sujet' },
  { to: '/student/report', label: 'Rapport' },
  { to: '/student/defense', label: 'Soutenance' },
  { to: '/student/chatbot', label: 'Chatbot étudiant' },
]

const juryLinks = [
  { 
    section: 'Navigation principale',
    links: [
      { to: '/jury/dashboard', label: 'Dashboard' },
      { to: '/jury/defenses', label: 'Soutenances' },
    ]
  },
  { 
    section: 'Évaluations',
    links: [
      { to: '/jury/evaluations/pending', label: 'En attente', badge: 'pendingEvaluations' },
      { to: '/jury/evaluations/drafts', label: 'Mes brouillons', badge: 'draftEvaluations' },
    ]
  },
  { 
    section: 'Rapports',
    links: [
      { to: '/jury/reports/available', label: 'Disponibles', badge: 'availableReports' },
      { to: '/jury/reports/unavailable', label: 'En attente' },
      { to: '/jury/reports/all', label: 'Tous les rapports' },
    ]
  },
  { 
    section: 'Aide',
    links: [
      { to: '/jury/chatbot', label: 'Chatbot jury' },
    ]
  },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const [badges, setBadges] = useState({})
  
  const links = user?.role === 'ADMIN'
    ? adminLinks
    : user?.role === 'SUPERVISOR'
      ? supervisorLinks
      : user?.role === 'STUDENT'
        ? studentLinks
        : user?.role === 'JURY'
          ? juryLinks
          : []

  useEffect(() => {
    if (user?.role === 'JURY') {
      // Charger les badges pour le jury
      api.get('/jury/dashboard')
        .then(({ data }) => {
          setBadges({
            pendingEvaluations: data.pendingEvaluations,
            draftEvaluations: data.pendingEvaluations - (data.submittedEvaluations || 0),
            availableReports: data.availableReports,
            notifications: 0,
          })
        })
        .catch(() => {})
    }
  }, [user])

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">SG Soutenance</p>
            <h1 className="text-lg font-semibold text-slate-900">Gestion PFE / Master</h1>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-right">
              <p className="font-medium">{user?.firstName} {user?.lastName}</p>
              <p className="text-slate-500">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="rounded-full bg-slate-900 px-4 py-2 font-medium text-white transition hover:bg-slate-700"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-6 md:grid-cols-[250px_1fr]">
        <aside className="rounded-3xl border border-slate-200 bg-white shadow-sm" style={{ maxHeight: 'calc(100vh - 140px)', overflowY: 'auto' }}>
          <nav className="p-4 space-y-6">
            {links.length === 0 && <p className="text-sm text-slate-500">Module prêt à être développé.</p>}
            
            {user?.role === 'JURY' ? (
              // Sidebar structurée pour le jury
              links.map((section, sectionIndex) => (
                <div key={sectionIndex} className="space-y-2">
                  <h3 className="px-2 py-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                    {section.section}
                  </h3>
                  <div className="space-y-1">
                    {section.links.map((link) => (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) =>
                          `flex items-center justify-between rounded-2xl px-4 py-2.5 text-sm font-medium transition ${
                            isActive ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                          }`
                        }
                      >
                        <span>{link.label}</span>
                        {link.badge && badges[link.badge] > 0 && (
                          <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-rose-500 px-2 text-xs font-bold text-white">
                            {badges[link.badge]}
                          </span>
                        )}
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              // Sidebar simple pour admin et student
              links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      isActive ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))
            )}
          </nav>
        </aside>
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
