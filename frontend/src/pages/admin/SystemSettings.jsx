import { useEffect, useState } from 'react'
import api from '../../services/api'
import { downloadFromApi } from '../../services/download'

export default function SystemSettings() {
  const [form, setForm] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    api.get('/admin/settings').then(({ data }) => setForm(data))
  }, [])

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function submit(event) {
    event.preventDefault()
    const payload = {
      activeAcademicYear: form.activeAcademicYear,
      maxReportPdfSizeMb: Number(form.maxReportPdfSizeMb),
      registrationsEnabled: form.registrationsEnabled,
      supportEmail: form.supportEmail,
    }
    const { data } = await api.put('/admin/settings', payload)
    setForm(data)
    setMessage('Paramètres enregistrés.')
  }

  if (!form) {
    return <div className="rounded-3xl bg-white p-6 shadow-sm">Chargement des paramètres...</div>
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-indigo-600">Administration</p>
        <h2 className="text-3xl font-bold tracking-tight">Paramètres système</h2>
      </div>

      {message && <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-700">{message}</p>}

      <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <label>
            <span className="text-sm font-medium text-slate-700">Année universitaire active</span>
            <input value={form.activeAcademicYear} onChange={(event) => update('activeAcademicYear', event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" />
          </label>
          <label>
            <span className="text-sm font-medium text-slate-700">Taille maximale rapports PDF (Mo)</span>
            <input type="number" min="1" value={form.maxReportPdfSizeMb} onChange={(event) => update('maxReportPdfSizeMb', event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" />
          </label>
          <label>
            <span className="text-sm font-medium text-slate-700">Email support</span>
            <input type="email" value={form.supportEmail} onChange={(event) => update('supportEmail', event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" />
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 md:mt-7">
            <input type="checkbox" checked={form.registrationsEnabled} onChange={(event) => update('registrationsEnabled', event.target.checked)} />
            <span className="text-sm font-medium text-slate-700">Inscriptions activées</span>
          </label>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button className="rounded-2xl bg-indigo-600 px-5 py-3 font-semibold text-white">Enregistrer</button>
          <button type="button" onClick={() => downloadFromApi('/admin/backup', 'sg-soutenance-backup.json')} className="rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white">
            Télécharger la sauvegarde JSON
          </button>
        </div>
      </form>
    </section>
  )
}
