import { useEffect, useState } from 'react'
import api from '../../services/api'

export default function GlobalNotifications() {
  const [roles, setRoles] = useState([])
  const [notifications, setNotifications] = useState([])
  const [form, setForm] = useState({ title: '', message: '', targetRole: '' })
  const [message, setMessage] = useState('')

  async function load() {
    const [rolesResponse, notificationsResponse] = await Promise.all([
      api.get('/admin/roles'),
      api.get('/admin/notifications'),
    ])
    setRoles(rolesResponse.data)
    setNotifications(notificationsResponse.data)
  }

  useEffect(() => {
    load()
  }, [])

  async function submit(event) {
    event.preventDefault()
    await api.post('/admin/notifications', {
      title: form.title,
      message: form.message,
      targetRole: form.targetRole || null,
    })
    setForm({ title: '', message: '', targetRole: '' })
    setMessage('Annonce envoyée.')
    await load()
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-indigo-600">Administration</p>
        <h2 className="text-3xl font-bold tracking-tight">Notifications globales</h2>
      </div>

      {message && <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-700">{message}</p>}

      <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <label>
            <span className="text-sm font-medium text-slate-700">Titre</span>
            <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" required />
          </label>
          <label>
            <span className="text-sm font-medium text-slate-700">Cible</span>
            <select value={form.targetRole} onChange={(event) => setForm({ ...form, targetRole: event.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3">
              <option value="">Tous les utilisateurs</option>
              {roles.map((role) => <option key={role}>{role}</option>)}
            </select>
          </label>
          <label className="md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Message</span>
            <textarea value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} className="mt-2 min-h-32 w-full rounded-2xl border border-slate-200 px-4 py-3" required />
          </label>
        </div>
        <button className="mt-5 rounded-2xl bg-indigo-600 px-5 py-3 font-semibold text-white">Envoyer l'annonce</button>
      </form>

      <div className="space-y-3">
        {notifications.map((notification) => (
          <article key={notification.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-semibold">{notification.title}</h3>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{notification.targetRole || 'TOUS'}</span>
            </div>
            <p className="mt-3 text-slate-700">{notification.message}</p>
            <p className="mt-3 text-xs text-slate-500">{new Date(notification.createdAt).toLocaleString('fr-FR')}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
