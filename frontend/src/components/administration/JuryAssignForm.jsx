import { useState, useEffect } from 'react'
import api from '../../services/api'

export default function JuryAssignForm({ projectId, projectTitle, onSuccess, onCancel }) {
  const [members, setMembers] = useState([])
  const [form, setForm] = useState({ presidentId: '', examiner1Id: '', examiner2Id: '', guestId: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/administration/jury/eligible-members')
      .then(r => setMembers(r.data))
      .catch(() => setError('Impossible de charger les membres éligibles.'))
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const payload = {
        presidentId: Number(form.presidentId),
        examiner1Id: Number(form.examiner1Id),
        examiner2Id: Number(form.examiner2Id),
        guestId: form.guestId ? Number(form.guestId) : null,
      }
      const res = await api.post(`/administration/projects/${projectId}/assign-jury`, payload)
      onSuccess(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'affectation.')
    } finally {
      setLoading(false)
    }
  }

  const MemberSelect = ({ label, field, required }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && ' *'}</label>
      <select value={form[field]} onChange={e => set(field, e.target.value)}
        required={required}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
        <option value="">-- Sélectionner --</option>
        {members.map(m => (
          <option key={m.id} value={m.id}>
            {m.firstName} {m.lastName} ({m.role})
          </option>
        ))}
      </select>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-500">Projet : <span className="font-medium text-gray-800">{projectTitle}</span></p>
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</p>}
      <MemberSelect label="Président du jury" field="presidentId" required />
      <MemberSelect label="Examinateur 1" field="examiner1Id" required />
      <MemberSelect label="Examinateur 2" field="examiner2Id" required />
      <MemberSelect label="Invité (optionnel)" field="guestId" required={false} />
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
          Annuler
        </button>
        <button type="submit" disabled={loading}
          className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
          {loading ? 'Affectation…' : 'Affecter le jury'}
        </button>
      </div>
    </form>
  )
}
