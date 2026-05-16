import { useEffect, useState } from 'react'
import api from '../../services/api'

const StatCard = ({ label, value, color, icon }) => (
  <div className={`rounded-2xl border p-6 bg-white shadow-sm flex items-center gap-4`}>
    <div className={`text-3xl ${color}`}>{icon}</div>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value ?? '—'}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  </div>
)

export default function AdministrationDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/administration/dashboard')
      .then(r => setData(r.data))
      .catch(() => setError('Impossible de charger le dashboard.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-48 text-gray-400">Chargement…</div>
  )
  if (error) return (
    <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-red-700">{error}</div>
  )

  const stats = [
    { label: 'Projets déposés',          value: data.totalProjectsSubmitted, color: 'text-indigo-500', icon: '📁' },
    { label: 'Projets sans jury',         value: data.projectsWithoutJury,    color: 'text-orange-500', icon: '👥' },
    { label: 'Soutenances non planifiées',value: data.defensesNotScheduled,   color: 'text-yellow-500', icon: '📅' },
    { label: 'Salles disponibles',        value: data.availableRooms,         color: 'text-green-500',  icon: '🏛️' },
    { label: 'Conflits détectés',         value: data.conflictsDetected,      color: data.conflictsDetected > 0 ? 'text-red-500' : 'text-green-500', icon: '⚠️' },
    { label: 'Rapports visibles',         value: data.reportsVisible,         color: 'text-purple-500', icon: '✅' },
    { label: 'Rapports non visibles',     value: data.reportsNotVisible,      color: 'text-gray-500',   icon: '🔒' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-indigo-600">Module Administration</p>
        <h2 className="mt-1 text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">Vue d'ensemble du système de gestion des soutenances.</p>
      </div>

      {data.conflictsDetected > 0 && (
        <div className="rounded-xl bg-red-50 border border-red-300 p-4 flex items-center gap-3">
          <span className="text-red-500 text-xl">⚠️</span>
          <p className="text-sm text-red-700 font-medium">
            {data.conflictsDetected} conflit(s) de planning détecté(s). Consultez la page Planning pour les résoudre.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>
    </div>
  )
}
