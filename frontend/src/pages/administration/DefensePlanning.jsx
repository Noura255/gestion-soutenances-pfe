import { useEffect, useState } from 'react'
import api from '../../services/api'
import DefenseForm from '../../components/administration/DefenseForm'
import ProjectStatusBadge from '../../components/administration/ProjectStatusBadge'

export default function DefensePlanning() {
  const [defenses, setDefenses] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [modal, setModal]       = useState(null) // null | 'create' | defense object
  const [success, setSuccess]   = useState(null)

  const load = () => {
    setLoading(true)
    api.get('/administration/defenses')
      .then(r => setDefenses(r.data))
      .catch(() => setError('Impossible de charger les soutenances.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSuccess = () => {
    setModal(null)
    setSuccess('Soutenance planifiée avec succès.')
    load()
    setTimeout(() => setSuccess(null), 3000)
  }

  if (loading) return <div className="flex items-center justify-center h-48 text-gray-400">Chargement…</div>
  if (error)   return <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-red-700">{error}</div>

  const stats = {
    total:     defenses.length,
    scheduled: defenses.filter(d => d.status === 'SCHEDULED').length,
    published: defenses.filter(d => d.status === 'PUBLISHED').length,
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Planning des soutenances</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {stats.total} soutenance(s) — {stats.scheduled} planifiée(s) — {stats.published} publiée(s)
          </p>
        </div>
        <button onClick={() => setModal('create')}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
          + Planifier une soutenance
        </button>
      </div>

      {success && <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-green-700 text-sm">{success}</div>}

      {/* Modal formulaire */}
      {modal !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {modal === 'create' ? 'Planifier une soutenance' : 'Modifier la soutenance'}
            </h3>
            <DefenseForm
              initial={modal === 'create' ? null : modal}
              onSuccess={handleSuccess}
              onCancel={() => setModal(null)}
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Projet', 'Étudiant', 'Date', 'Horaire', 'Salle', 'Statut', 'Action'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {defenses.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Aucune soutenance planifiée.</td></tr>
            ) : defenses.map(d => (
              <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{d.projectTitle}</td>
                <td className="px-4 py-3 text-gray-600">{d.studentName}</td>
                <td className="px-4 py-3 text-gray-600">{d.defenseDate || '—'}</td>
                <td className="px-4 py-3 text-gray-600">
                  {d.startTime && d.endTime ? `${d.startTime} → ${d.endTime}` : '—'}
                </td>
                <td className="px-4 py-3 text-gray-600">{d.room?.name || '—'}</td>
                <td className="px-4 py-3"><ProjectStatusBadge status={d.status} /></td>
                <td className="px-4 py-3">
                  {d.status !== 'PUBLISHED' && d.status !== 'COMPLETED' && (
                    <button onClick={() => setModal(d)}
                      className="px-3 py-1.5 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50">
                      Modifier
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
