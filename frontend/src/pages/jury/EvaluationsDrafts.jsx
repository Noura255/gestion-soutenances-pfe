import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

export default function EvaluationsDrafts() {
  const [defenses, setDefenses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/jury/defenses')
      .then(({ data }) => {
        const drafts = data.filter(d => d.evaluationStatus === 'DRAFT')
        setDefenses(drafts)
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
        <p className="text-sm font-medium text-amber-600">Évaluations</p>
        <h2 className="text-3xl font-bold tracking-tight">Mes brouillons</h2>
        <p className="mt-2 text-slate-600">
          {defenses.length} brouillon(s) en cours
        </p>
      </div>

      {defenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-12 text-center">
          <svg className="h-16 w-16 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <p className="mt-4 text-xl font-semibold text-slate-900">Aucun brouillon</p>
          <p className="mt-2 text-slate-600">Vous n'avez pas de brouillon d'évaluation en cours.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {defenses.map((defense) => (
            <article key={defense.id} className="rounded-3xl border-2 border-amber-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                      Brouillon
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
                  className="rounded-2xl bg-amber-600 px-6 py-3 font-semibold text-white transition hover:bg-amber-700"
                >
                  Continuer
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
