import { useState, useEffect } from 'react'
import api from '../../services/api'
import ConflictAlert from './ConflictAlert'

const EMPTY = { projectId: '', defenseDate: '', startTime: '', endTime: '', roomId: '' }

export default function DefenseForm({ initial, onSuccess, onCancel }) {
  const [form, setForm] = useState(EMPTY)
  const [projects, setProjects] = useState([])
  const [rooms, setRooms] = useState([])
  const [conflicts, setConflicts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([
      api.get('/administration/projects'),
      api.get('/administration/rooms'),
    ]).then(([p, r]) => {
      setProjects(p.data)
      setRooms(r.data.filter(r => r.available))
    }).catch(() => setError('Impossible de charger les données.'))
  }, [])

  useEffect(() => {
    if (initial) {
      setForm({
        projectId:   initial.projectId   ?? '',
        defenseDate: initial.defenseDate ?? '',
        startTime:   initial.startTime   ?? '',
        endTime:     initial.endTime     ?? '',
        roomId:      initial.room?.id    ?? '',
      })
    }
  }, [initial])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setConflicts([])
    try {
      const payload = {
        projectId:   Number(form.projectId),
        defenseDate: form.defenseDate,
        startTime:   form.startTime,
        endTime:     form.endTime,
        roomId:      Number(form.roomId),
      }
      let res
      if (initial?.id) {
        res = await api.put(`/administration/defenses/${initial.id}`, payload)
      } else {
        res = await api.post('/administration/defenses/schedule', payload)
      }
      onSuccess(res.data)
    } catch (err) {
      if (err.response?.status === 409) {
        setConflicts(err.response.data.conflicts || [])
      } else {
        setError(err.response?.data?.message || 'Erreur lors de la planification.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</p>}
      <ConflictAlert conflicts={conflicts} onClose={() => setConflicts([])} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Projet *</label>
        <select required value={form.projectId} onChange={e => set('projectId', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">-- Sélectionner un projet --</option>
          {projects.map(p => (
            <option key={p.projectId} value={p.projectId}>{p.title} — {p.studentName}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
          <input required type="date" value={form.defenseDate} onChange={e => set('defenseDate', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Heure début *</label>
          <input required type="time" value={form.startTime} onChange={e => set('startTime', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Heure fin *</label>
          <input required type="time" value={form.endTime} onChange={e => set('endTime', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Salle *</label>
        <select required value={form.roomId} onChange={e => set('roomId', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">-- Sélectionner une salle --</option>
          {rooms.map(r => (
            <option key={r.id} value={r.id}>{r.name} — {r.building} (cap. {r.capacity})</option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
          Annuler
        </button>
        <button type="submit" disabled={loading}
          className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
          {loading ? 'Planification…' : initial?.id ? 'Modifier' : 'Planifier'}
        </button>
      </div>
    </form>
  )
}
