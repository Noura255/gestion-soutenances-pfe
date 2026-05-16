import { useEffect, useState } from 'react'
import api from '../../services/api'
import RoomForm from '../../components/administration/RoomForm'

export default function RoomManagement() {
  const [rooms, setRooms]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [modal, setModal]       = useState(null) // null | 'create' | room object
  const [saving, setSaving]     = useState(false)
  const [success, setSuccess]   = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const load = () => {
    setLoading(true)
    api.get('/administration/rooms')
      .then(r => setRooms(r.data))
      .catch(() => setError('Impossible de charger les salles.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (data) => {
    setSaving(true)
    try {
      if (modal?.id) {
        await api.put(`/administration/rooms/${modal.id}`, data)
        setSuccess('Salle modifiée avec succès.')
      } else {
        await api.post('/administration/rooms', data)
        setSuccess('Salle créée avec succès.')
      }
      setModal(null)
      load()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/administration/rooms/${id}`)
      setSuccess('Salle supprimée.')
      setDeleteId(null)
      load()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de supprimer cette salle.')
      setDeleteId(null)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-48 text-gray-400">Chargement…</div>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des salles</h2>
          <p className="text-sm text-gray-500 mt-0.5">{rooms.length} salle(s) enregistrée(s)</p>
        </div>
        <button onClick={() => setModal('create')}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
          + Nouvelle salle
        </button>
      </div>

      {error   && <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 text-sm">{error}</div>}
      {success && <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-green-700 text-sm">{success}</div>}

      {/* Modal formulaire */}
      {modal !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {modal === 'create' ? 'Nouvelle salle' : 'Modifier la salle'}
            </h3>
            <RoomForm
              initial={modal === 'create' ? null : modal}
              onSubmit={handleSubmit}
              onCancel={() => setModal(null)}
              loading={saving}
            />
          </div>
        </div>
      )}

      {/* Modal confirmation suppression */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <p className="text-gray-700 mb-4">Confirmer la suppression de cette salle ?</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Annuler</button>
              <button onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700">Supprimer</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.length === 0 ? (
          <p className="text-gray-400 col-span-3 text-center py-8">Aucune salle enregistrée.</p>
        ) : rooms.map(r => (
          <div key={r.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{r.name}</h3>
                <p className="text-sm text-gray-500">{r.building}</p>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                r.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {r.available ? 'Disponible' : 'Indisponible'}
              </span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Capacité : <span className="font-medium">{r.capacity}</span></p>
              {r.equipment && <p>Équipement : <span className="font-medium">{r.equipment}</span></p>}
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setModal(r)}
                className="flex-1 px-3 py-1.5 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50">
                Modifier
              </button>
              <button onClick={() => setDeleteId(r.id)}
                className="flex-1 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
