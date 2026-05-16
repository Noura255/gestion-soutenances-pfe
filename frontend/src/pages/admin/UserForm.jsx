import { useEffect, useState } from 'react'

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'STUDENT',
  department: '',
  phone: '',
}

export default function UserForm({ user, roles, onSubmit, onCancel }) {
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: '',
        role: user.role,
        department: user.department || '',
        phone: user.phone || '',
      })
    } else {
      setForm(emptyForm)
    }
  }, [user])

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function submit(event) {
    event.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-xl font-semibold">{user ? 'Modifier utilisateur' : 'Créer utilisateur'}</h3>
        {user && <button type="button" onClick={onCancel} className="text-sm font-medium text-slate-500">Annuler</button>}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          ['firstName', 'Prénom'],
          ['lastName', 'Nom'],
          ['email', 'Email'],
          ['department', 'Département'],
          ['phone', 'Téléphone'],
        ].map(([field, label]) => (
          <label key={field} className="block">
            <span className="text-sm font-medium text-slate-700">{label}</span>
            <input
              type={field === 'email' ? 'email' : 'text'}
              value={form[field]}
              onChange={(event) => update(field, event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              required={['firstName', 'lastName', 'email'].includes(field)}
            />
          </label>
        ))}

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Rôle</span>
          <select
            value={form.role}
            onChange={(event) => update('role', event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          >
            {roles.map((role) => <option key={role}>{role}</option>)}
          </select>
        </label>

        <label className="block md:col-span-2">
          <span className="text-sm font-medium text-slate-700">{user ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe initial'}</span>
          <input
            type="password"
            value={form.password}
            onChange={(event) => update('password', event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            required={!user}
          />
        </label>
      </div>

      <button className="mt-5 rounded-2xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-500">
        {user ? 'Enregistrer' : 'Créer'}
      </button>
    </form>
  )
}
