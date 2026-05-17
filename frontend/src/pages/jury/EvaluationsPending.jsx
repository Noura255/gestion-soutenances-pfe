import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

export default function EvaluationsPending() {
  const [defenses, setDefenses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/jury/defenses')
      .then(({ data }) => {
        // Filtrer uniquement les évaluations en attente (NOT_STARTED ou DRAFT)
        const pending = data.filter(d => d.evaluationStatus !== 'SUBMITTED')
        setDefenses(pending)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-3xl bg-white p-12">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
          <p className="mt-4 text-slate-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-rose-600">Évaluations</p>
        <h2 className="text-3xl font-bold tracking-tight">Évaluations en attente</h2>
        <p className="mt-2 text-slate-600">
          {defenses.length} évaluation(s) à compléter
        </p>
      </div>

      {defenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-12 text-center">
          <svg className="h-16 w-16 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="mt-4 text-xl font-semibold text-slate-900">Toutes les évaluations sont complétées !</p>
          <p className="mt-2 text-slate-600">Vous avez terminé toutes vos évaluations.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {defenses.map((defense) => (
            <article key={defense.id} className="rounded-3xl border-2 border-rose-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <svg className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                      defense.evaluationStatus === 'DRAFT' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {defense.evaluationStatus === 'DRAFT' ? 'Brouillon' : 'Non commencée'}
                    </span>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold text-slate-900">{defense.projectTitle}</h3>
                  <p className="mt-1 text-slate-600">Étudiant : {defense.studentName}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Soutenance : {defense.date ? new Date(defense.date).toLocaleDateString('fr-FR') : 'À planifier'}
                  </p>
                </div>
                <Link
                  to={`/jury/defenses/${defense.id}/evaluation`}
                  className="rounded-2xl bg-rose-600 px-6 py-3 font-semibold text-white transition hover:bg-rose-700"
                >
                  {defense.evaluationStatus === 'DRAFT' ? 'Continuer' : 'Commencer'}
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
