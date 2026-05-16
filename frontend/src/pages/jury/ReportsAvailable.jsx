import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

export default function ReportsAvailable() {
  const [defenses, setDefenses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/jury/defenses')
      .then(({ data }) => {
        const available = data.filter(d => d.reportStatus === 'AVAILABLE')
        setDefenses(available)
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
        <p className="text-sm font-medium text-emerald-600">Rapports</p>
        <h2 className="text-3xl font-bold tracking-tight">Rapports disponibles</h2>
        <p className="mt-2 text-slate-600">
          {defenses.length} rapport(s) accessible(s)
        </p>
      </div>

      {defenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-12 text-center">
          <svg className="h-16 w-16 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-4 text-xl font-semibold text-slate-900">Aucun rapport disponible</p>
          <p className="mt-2 text-slate-600">Les rapports rendus visibles par les encadrants apparaîtront ici.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {defenses.map((defense) => (
            <article key={defense.id} className="rounded-3xl border-2 border-emerald-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                      Disponible
                    </span>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold text-slate-900">{defense.projectTitle}</h3>
                  <p className="mt-1 text-slate-600">Étudiant : {defense.studentName}</p>
                  <p className="mt-1 text-sm text-slate-500">Encadrant : {defense.supervisorName}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Soutenance : {defense.date ? new Date(defense.date).toLocaleDateString('fr-FR') : 'À planifier'}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Link
                    to={`/jury/defenses/${defense.id}/report`}
                    className="rounded-2xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
                  >
                    Consulter le rapport
                  </Link>
                  <Link
                    to={`/jury/defenses/${defense.id}`}
                    className="rounded-2xl bg-slate-100 px-6 py-3 text-center font-semibold text-slate-700 transition hover:bg-slate-200"
                  >
                    Voir la soutenance
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
