import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../../services/api'
import EvaluationStatusBadge from '../../components/jury/EvaluationStatusBadge'
import ReportStatusBadge from '../../components/jury/ReportStatusBadge'

function formatDate(value) {
  return value ? new Date(`${value}T00:00:00`).toLocaleDateString('fr-FR') : 'À planifier'
}

function formatTime(value) {
  return value ? value.slice(0, 5) : '—'
}

export default function JuryDefenses() {
  const [defenses, setDefenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/jury/defenses')
      .then(({ data }) => setDefenses(data))
      .catch((err) => setError(err.response?.data?.message || 'Impossible de charger les soutenances.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="rounded-3xl bg-white p-6 shadow-sm">Chargement des soutenances...</div>
  }

  if (error) {
    return <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>
  }

  return (
    <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-indigo-600">Module jury</p>
            <h2 className="text-3xl font-bold tracking-tight">Mes soutenances</h2>
          </div>
          <Link to="/jury/dashboard" className="rounded-2xl bg-slate-100 px-4 py-3 font-semibold text-slate-700">
            Retour au dashboard
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-4">Étudiant/Groupe</th>
                  <th className="px-4 py-4">Titre projet</th>
                  <th className="px-4 py-4">Encadrant</th>
                  <th className="px-4 py-4">Date</th>
                  <th className="px-4 py-4">Heure</th>
                  <th className="px-4 py-4">Salle</th>
                  <th className="px-4 py-4">Statut rapport</th>
                  <th className="px-4 py-4">Statut évaluation</th>
                  <th className="px-4 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {defenses.map((defense) => (
                  <tr key={defense.id} className="align-top text-sm text-slate-700">
                    <td className="px-4 py-4 font-medium text-slate-900">{defense.studentName}</td>
                    <td className="px-4 py-4">{defense.projectTitle}</td>
                    <td className="px-4 py-4">{defense.supervisorName}</td>
                    <td className="px-4 py-4">{formatDate(defense.date)}</td>
                    <td className="px-4 py-4">{formatTime(defense.time)}</td>
                    <td className="px-4 py-4">{defense.room || '—'}</td>
                    <td className="px-4 py-4">
                      <ReportStatusBadge status={defense.reportStatus} />
                    </td>
                    <td className="px-4 py-4">
                      <EvaluationStatusBadge status={defense.evaluationStatus} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex min-w-[180px] flex-wrap gap-2">
                        <Link
                          to={`/jury/defenses/${defense.id}`}
                          className="rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
                        >
                          Voir détails
                        </Link>
                        <Link
                          to={`/jury/defenses/${defense.id}/evaluation`}
                          className="rounded-full bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700"
                        >
                          Évaluer
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {defenses.length === 0 && (
            <div className="p-6 text-slate-500">Aucune soutenance ne vous est affectée.</div>
          )}
        </div>
    </section>
  )
}
