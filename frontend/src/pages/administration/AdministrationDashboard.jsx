import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AlertMessage from '../../components/administration/AlertMessage'
import StatCard from '../../components/administration/StatCard'
import api from '../../services/api'

const quickActions = [
  { to: '/administration/jury-assignment', label: 'Affecter un jury', description: 'Associer les membres JURY à un projet.' },
  { to: '/administration/planning', label: 'Planifier une soutenance', description: 'Créer ou ajuster un créneau.' },
  { to: '/administration/rooms', label: 'Ajouter une salle', description: 'Gérer les capacités et disponibilités.' },
  { to: '/administration/exports', label: 'Publier le planning', description: 'Valider le planning final.' },
]

export default function AdministrationDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/administration/dashboard')
      .then(({ data: payload }) => setData(payload))
      .catch(() => setError('Impossible de charger le dashboard administration.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="grid h-48 place-items-center text-slate-400">Chargement…</div>
  if (error) return <AlertMessage tone="error">{error}</AlertMessage>

  const cards = [
    { label: 'Projets déposés', value: data.totalProjects, accent: 'indigo', icon: '◫' },
    { label: 'Projets sans jury', value: data.projectsWithoutJury, accent: 'amber', icon: '♟' },
    { label: 'Projets avec jury', value: data.projectsWithJury, accent: 'emerald', icon: '✓' },
    { label: 'Soutenances non planifiées', value: data.unscheduledDefenses, accent: 'slate', icon: '◷' },
    { label: 'Soutenances planifiées', value: data.scheduledDefenses, accent: 'sky', icon: '◉' },
    { label: 'Soutenances publiées', value: data.publishedDefenses, accent: 'emerald', icon: '↗' },
    { label: 'Salles disponibles', value: data.availableRooms, accent: 'violet', icon: '⌂' },
    { label: 'Rapports visibles', value: data.visibleReports, accent: 'indigo', icon: '▤' },
    { label: 'Rapports non visibles', value: data.nonVisibleReports, accent: 'slate', icon: '◌' },
    { label: 'Conflits détectés', value: data.conflictsCount, accent: data.conflictsCount ? 'rose' : 'emerald', icon: '!' },
  ]

  return (
    <div className="space-y-7">
      <div>
        <p className="text-sm font-medium text-indigo-600">Vue d’ensemble</p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Dashboard administration</h2>
        <p className="mt-2 text-sm text-slate-500">Le centre nerveux du cycle de soutenance pédagogique.</p>
      </div>

      {data.conflictsCount > 0 && (
        <AlertMessage tone="warning">
          {data.conflictsCount} conflit(s) doivent être résolus avant la publication finale du planning.
        </AlertMessage>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(card => <StatCard key={card.label} {...card} />)}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">Actions rapides</h3>
          <p className="mt-1 text-sm text-slate-500">Les quatre gestes qui font avancer le planning.</p>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {quickActions.map(action => (
            <Link
              key={action.to}
              to={action.to}
              className="rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50"
            >
              <p className="font-semibold text-slate-950">{action.label}</p>
              <p className="mt-1 text-sm text-slate-500">{action.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
