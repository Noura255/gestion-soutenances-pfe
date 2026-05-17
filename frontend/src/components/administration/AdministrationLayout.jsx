import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const links = [
  { to: '/administration/dashboard', label: 'Dashboard' },
  { to: '/administration/projects', label: 'Projets' },
  { to: '/administration/jury-assignment', label: 'Affectation des jurys' },
  { to: '/administration/rooms', label: 'Salles' },
  { to: '/administration/planning', label: 'Planning des soutenances' },
  { to: '/administration/reports', label: 'Rapports visibles' },
  { to: '/administration/exports', label: 'Export planning' },
  { to: '/administration/chatbot', label: 'Chatbot' },
]

export default function AdministrationLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">SG Soutenance</p>
            <h1 className="text-lg font-semibold text-slate-900">Administration pédagogique</h1>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-right">
              <p className="font-medium">{user?.firstName} {user?.lastName}</p>
              <p className="text-slate-500">{user?.role}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-full bg-slate-900 px-4 py-2 font-medium text-white transition hover:bg-slate-700"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] gap-6 px-6 py-6 md:grid-cols-[250px_1fr]">
        <aside className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <nav className="space-y-2">
            {links.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
