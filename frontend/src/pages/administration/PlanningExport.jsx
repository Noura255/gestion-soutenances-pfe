import { useState } from 'react'
import AlertMessage from '../../components/administration/AlertMessage'
import ConflictAlert from '../../components/administration/ConflictAlert'
import api from '../../services/api'

const exportsConfig = [
  { type: 'csv', label: 'Exporter en CSV', accent: 'bg-slate-900 hover:bg-slate-700', filename: 'planning-soutenances.csv' },
  { type: 'excel', label: 'Exporter en Excel', accent: 'bg-emerald-600 hover:bg-emerald-700', filename: 'planning-soutenances.xlsx' },
  { type: 'pdf', label: 'Exporter en PDF', accent: 'bg-rose-600 hover:bg-rose-700', filename: 'planning-soutenances.pdf' },
]

export default function PlanningExport() {
  const [publishing, setPublishing] = useState(false)
  const [publishResult, setPublishResult] = useState(null)
  const [downloading, setDownloading] = useState(null)
  const [error, setError] = useState(null)
  const [conflicts, setConflicts] = useState([])

  const publish = async () => {
    setPublishing(true)
    setError(null)
    setConflicts([])
    try {
      const { data } = await api.put('/administration/defenses/publish')
      setPublishResult(data.published)
    } catch (err) {
      if (err.response?.status === 409) {
        setConflicts(err.response.data.conflicts || [])
      }
      setError(err.response?.data?.message || 'La publication a échoué.')
    } finally {
      setPublishing(false)
    }
  }

  const exportPlanning = async ({ type, filename }) => {
    setDownloading(type)
    setError(null)
    try {
      const { data } = await api.get(`/administration/export/planning/${type}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([data]))
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      setError(`Erreur lors de l'export ${type.toUpperCase()}.`)
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-indigo-600">Publication & export</p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Planning final</h2>
        <p className="mt-2 text-sm text-slate-500">Publier d’abord, exporter ensuite.</p>
      </div>

      {error && <AlertMessage tone="error">{error}</AlertMessage>}
      {publishResult !== null && (
        <AlertMessage tone="success">{publishResult} soutenance(s) publiée(s) avec succès.</AlertMessage>
      )}
      <ConflictAlert conflicts={conflicts} onClose={() => setConflicts([])} />

      <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-indigo-600">Étape 1</p>
          <h3 className="mt-1 text-xl font-semibold text-slate-950">Publier le planning</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Seules les soutenances planifiées, avec salle et jury valides, passent de SCHEDULED à PUBLISHED.
          </p>
          <button
            type="button"
            onClick={publish}
            disabled={publishing}
            className="mt-5 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {publishing ? 'Publication…' : 'Publier le planning'}
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-indigo-600">Étape 2</p>
          <h3 className="mt-1 text-xl font-semibold text-slate-950">Exporter</h3>
          <div className="mt-5 grid gap-3">
            {exportsConfig.map(config => (
              <button
                key={config.type}
                type="button"
                onClick={() => exportPlanning(config)}
                disabled={downloading === config.type}
                className={`rounded-2xl px-4 py-3 text-sm font-medium text-white disabled:opacity-50 ${config.accent}`}
              >
                {downloading === config.type ? 'Génération…' : config.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <AlertMessage tone="info">
        Les exports contiennent l’étudiant, le projet, l’encadrant, le jury, la salle, le bâtiment, la date, les horaires et le statut.
      </AlertMessage>
    </div>
  )
}
