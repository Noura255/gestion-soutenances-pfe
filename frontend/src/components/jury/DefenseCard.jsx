import { Link } from 'react-router-dom'
import EvaluationStatusBadge from './EvaluationStatusBadge'
import ReportStatusBadge from './ReportStatusBadge'

function formatDate(value) {
  return value ? new Date(`${value}T00:00:00`).toLocaleDateString('fr-FR') : 'À planifier'
}

function formatTime(value) {
  return value ? value.slice(0, 5) : '—'
}

export default function DefenseCard({ defense }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{defense.studentName}</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">{defense.projectTitle}</h3>
          <p className="mt-2 text-sm text-slate-600">
            {formatDate(defense.date)} · {formatTime(defense.time)} · {defense.room || 'Salle non définie'}
          </p>
          <p className="mt-1 text-sm text-slate-500">Encadrant : {defense.supervisorName}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <ReportStatusBadge status={defense.reportStatus} />
          <EvaluationStatusBadge status={defense.evaluationStatus} />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          to={`/jury/defenses/${defense.id}`}
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Voir détails
        </Link>
        <Link
          to={`/jury/defenses/${defense.id}/evaluation`}
          className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
        >
          Évaluer
        </Link>
      </div>
    </article>
  )
}
