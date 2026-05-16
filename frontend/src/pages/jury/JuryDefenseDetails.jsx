import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../../services/api'
import EvaluationStatusBadge from '../../components/jury/EvaluationStatusBadge'
import ReportStatusBadge from '../../components/jury/ReportStatusBadge'
import JuryReportViewer from './JuryReportViewer'

function formatDate(value) {
  return value ? new Date(`${value}T00:00:00`).toLocaleDateString('fr-FR') : 'À planifier'
}

function formatTime(value) {
  return value ? value.slice(0, 5) : '—'
}

export default function JuryDefenseDetails() {
  const { id } = useParams()
  const [defense, setDefense] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/jury/defenses/${id}`)
      .then(({ data }) => setDefense(data))
      .catch((err) => setError(err.response?.data?.message || 'Impossible de charger la soutenance.'))
  }, [id])

  if (error) {
    return <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>
  }

  if (!defense) {
    return <div className="rounded-3xl bg-white p-6 shadow-sm">Chargement de la soutenance...</div>
  }

  return (
    <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-indigo-600">Module jury</p>
            <h2 className="text-3xl font-bold tracking-tight">Détails de la soutenance</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/jury/defenses" className="rounded-2xl bg-slate-100 px-4 py-3 font-semibold text-slate-700">
              Retour à la liste
            </Link>
            <Link
              to={`/jury/defenses/${defense.id}/evaluation`}
              className="rounded-2xl bg-indigo-600 px-4 py-3 font-semibold text-white"
            >
              Accéder à l’évaluation
            </Link>
          </div>
        </div>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">{defense.studentName}</p>
              <h3 className="mt-1 text-2xl font-semibold text-slate-900">{defense.projectTitle}</h3>
              <p className="mt-3 text-slate-600">Encadrant : {defense.supervisorName}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <ReportStatusBadge status={defense.reportStatus} />
              <EvaluationStatusBadge status={defense.evaluationStatus} />
            </div>
          </div>

          <dl className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <dt className="text-sm text-slate-500">Date</dt>
              <dd className="mt-2 font-semibold text-slate-900">{formatDate(defense.date)}</dd>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <dt className="text-sm text-slate-500">Heure</dt>
              <dd className="mt-2 font-semibold text-slate-900">{formatTime(defense.time)}</dd>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <dt className="text-sm text-slate-500">Salle</dt>
              <dd className="mt-2 font-semibold text-slate-900">{defense.room || 'Salle non définie'}</dd>
            </div>
          </dl>
        </article>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-xl font-semibold">Rapport</h3>
            {defense.reportStatus === 'AVAILABLE' && (
              <Link
                to={`/jury/defenses/${defense.id}/report`}
                className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Ouvrir le rapport seul
              </Link>
            )}
          </div>

          {defense.reportStatus === 'AVAILABLE' ? (
            <JuryReportViewer report={defense.report} reportStatus={defense.reportStatus} />
          ) : (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
              Rapport non encore disponible
            </div>
          )}
        </section>
    </section>
  )
}
