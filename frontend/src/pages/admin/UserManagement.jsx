import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../../services/api'
import { downloadFromApi } from '../../services/download'
import UserForm from './UserForm'

const initialFilters = {
  search: '',
  role: '',
  department: '',
  enabled: '',
}

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [editingUser, setEditingUser] = useState(null)
  const [message, setMessage] = useState('')
  const [filters, setFilters] = useState(initialFilters)

  async function load(activeFilters = filters) {
    const params = Object.fromEntries(Object.entries(activeFilters).filter(([, value]) => value !== ''))
    const [usersResponse, rolesResponse] = await Promise.all([
      api.get('/admin/users', { params }),
      api.get('/admin/roles'),
    ])
    setUsers(usersResponse.data)
    setRoles(rolesResponse.data)
  }

  useEffect(() => {
    load(initialFilters)
  }, [])

  async function saveUser(payload) {
    if (editingUser) {
      await api.put(`/admin/users/${editingUser.id}`, payload)
      setMessage('Utilisateur modifié.')
    } else {
      await api.post('/admin/users', payload)
      setMessage('Utilisateur créé.')
    }
    setEditingUser(null)
    await load()
  }

  async function toggleUser(user) {
    await api.put(`/admin/users/${user.id}/${user.enabled ? 'disable' : 'enable'}`)
    await load()
  }

  async function deleteUser(user) {
    if (!window.confirm(`Supprimer ${user.email} ?`)) return
    await api.delete(`/admin/users/${user.id}`)
    setMessage('Utilisateur supprimé.')
    await load()
  }

  async function resetPassword(user) {
    const newPassword = window.prompt(`Nouveau mot de passe pour ${user.email}`)
    if (!newPassword) return
    await api.put(`/admin/users/${user.id}/reset-password`, { newPassword })
    setMessage('Mot de passe réinitialisé.')
  }

  function updateFilter(field, value) {
    setFilters((current) => ({ ...current, [field]: value }))
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-indigo-600">Administration</p>
          <h2 className="text-3xl font-bold tracking-tight">Gestion utilisateurs</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/import-users" className="rounded-2xl bg-indigo-600 px-4 py-3 font-semibold text-white">Importer</Link>
          <button onClick={() => downloadFromApi('/admin/users/export/csv', 'users.csv')} className="rounded-2xl bg-white px-4 py-3 font-semibold shadow-sm">CSV</button>
          <button onClick={() => downloadFromApi('/admin/users/export/excel', 'users.xlsx')} className="rounded-2xl bg-white px-4 py-3 font-semibold shadow-sm">Excel</button>
          <button onClick={() => downloadFromApi('/admin/users/export/pdf', 'users.pdf')} className="rounded-2xl bg-white px-4 py-3 font-semibold shadow-sm">PDF</button>
        </div>
      </div>

      {message && <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-700">{message}</p>}

      <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-5">
          <input value={filters.search} onChange={(event) => updateFilter('search', event.target.value)} placeholder="Nom ou email" className="rounded-2xl border border-slate-200 px-4 py-3" />
          <select value={filters.role} onChange={(event) => updateFilter('role', event.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3">
            <option value="">Tous les rôles</option>
            {roles.map((role) => <option key={role}>{role}</option>)}
          </select>
          <input value={filters.department} onChange={(event) => updateFilter('department', event.target.value)} placeholder="Département" className="rounded-2xl border border-slate-200 px-4 py-3" />
          <select value={filters.enabled} onChange={(event) => updateFilter('enabled', event.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3">
            <option value="">Tous les statuts</option>
            <option value="true">Actif</option>
            <option value="false">Désactivé</option>
          </select>
          <div className="flex gap-2">
            <button onClick={() => load()} className="flex-1 rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white">Filtrer</button>
            <button onClick={() => { setFilters(initialFilters); load(initialFilters) }} className="rounded-2xl bg-slate-100 px-4 py-3 font-semibold">Reset</button>
          </div>
        </div>
      </article>

      <UserForm user={editingUser} roles={roles} onSubmit={saveUser} onCancel={() => setEditingUser(null)} />

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3">Utilisateur</th>
                <th className="px-4 py-3">Rôle</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Département</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-4">
                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-slate-500">{user.email}</p>
                  </td>
                  <td className="px-4 py-4">{user.role}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                      {user.enabled ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-4 py-4">{user.department || '—'}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => setEditingUser(user)} className="rounded-full bg-slate-100 px-3 py-1 font-medium">Modifier</button>
                      <button onClick={() => toggleUser(user)} className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-800">
                        {user.enabled ? 'Désactiver' : 'Réactiver'}
                      </button>
                      <button onClick={() => resetPassword(user)} className="rounded-full bg-indigo-100 px-3 py-1 font-medium text-indigo-700">Reset MDP</button>
                      <button onClick={() => deleteUser(user)} className="rounded-full bg-rose-100 px-3 py-1 font-medium text-rose-700">Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
