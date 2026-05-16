import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const roleToPath = {
  STUDENT: '/student/dashboard',
  SUPERVISOR: '/supervisor/dashboard',
  JURY: '/jury/dashboard',
  ADMINISTRATION: '/administration/dashboard',
  ADMIN: '/admin/dashboard',
}

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: 'admin@sgsoutenance.com', password: 'admin123' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) {
    return <Navigate to={roleToPath[user.role]} replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const profile = await login(form.email, form.password)
      navigate(roleToPath[profile.role], { replace: true })
    } catch (err) {
      if (!err.response) {
        setError('Backend inaccessible. Lancez “Full App” dans IntelliJ ou vérifiez que le backend écoute sur le port 8080.')
      } else {
        setError(err.response?.data?.message || 'Connexion impossible.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,_#c7d2fe,_transparent_35%),linear-gradient(135deg,_#020617,_#1e293b)] px-4">
      <div className="w-full max-w-md rounded-[2rem] border border-white/20 bg-white/95 p-8 shadow-2xl shadow-slate-950/30">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-indigo-500">SG Soutenance</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">Connexion</h1>
        <p className="mt-2 text-sm text-slate-500">Accédez à l'espace correspondant à votre rôle.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Mot de passe</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
          </label>
          {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
          <button
            disabled={submitting}
            className="w-full rounded-2xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {submitting ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
