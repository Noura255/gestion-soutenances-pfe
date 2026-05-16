import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../../services/api'
import DefenseCard from '../../components/jury/DefenseCard'
import JuryChatbot from './JuryChatbot'

const statCards = [
  { key: 'upcomingDefenses', label: 'Prochaines soutenances', tone: 'text-indigo-600' },
  { key: 'availableReports', label: 'Rapports disponibles', tone: 'text-emerald-600' },
  { key: 'unavailableReports', label: 'Rapports non disponibles', tone: 'text-rose-600' },
  { key: 'pendingEvaluations', label: 'Évaluations à compléter', tone: 'text-amber-600' },
]

export default function JuryDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/jury/dashboard')
      .then(({ data }) => setDashboard(data))
      .catch((err) => setError(err.response?.data?.message || 'Impossible de charger le dashboard jury.'))
  }, [])

  if (error) {
    return <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>
  }

  if (!dashboard) {
    return <div className="rounded-3xl bg-white p-6 shadow-sm">Chargement du dashboard jury...</div>
  }

  return (
    <>
      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-indigo-600">Module jury</p>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard jury</h2>
          </div>
          <Link
            to="/jury/defenses"
            className="rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-700"
          >
            Voir toutes les soutenances
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <article key={card.key} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{card.label}</p>
              <p className={`mt-3 text-3xl font-bold ${card.tone}`}>
                {card.key === 'upcomingDefenses' ? dashboard.upcomingDefenses.length : dashboard[card.key]}
              </p>
            </article>
          ))}
        </div>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Évaluations déjà envoyées</p>
          <p className="mt-3 text-4xl font-bold text-emerald-600">{dashboard.submittedEvaluations}</p>
        </article>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-xl font-semibold">Accès rapide aux prochaines soutenances</h3>
            <span className="text-sm text-slate-500">{dashboard.upcomingDefenses.length} à venir</span>
          </div>
          {dashboard.upcomingDefenses.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
              Aucune soutenance à venir pour le moment.
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {dashboard.upcomingDefenses.map((defense) => (
                <DefenseCard key={defense.id} defense={defense} />
              ))}
            </div>
          )}
        </section>
      </section>
      <JuryChatbot />
    </>
  )
}
