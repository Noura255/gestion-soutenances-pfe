import { useEffect, useState } from 'react'
import api from '../../services/api'

const blankForm = {
  title: '',
  summary: '',
  keywords: '',
  projectType: 'PFE',
  academicYear: '',
  groupMembers: '',
}

export default function StudentProjectForm({ onSaved }) {
  const [form, setForm] = useState(blankForm)
  const [projectId, setProjectId] = useState(null)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/student/project').then(({ data }) => {
      setProjectId(data.id)
      setForm({
        title: data.title || '',
        summary: data.summary || '',
        keywords: data.keywords || '',
        projectType: data.projectType || 'PFE',
        academicYear: data.academicYear || '',
        groupMembers: (data.groupMembers || []).join(', '),
      })
    }).catch(() => {})
  }, [])

  function update(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    const payload = {
      ...form,
      groupMembers: form.groupMembers.split(',').map((value) => value.trim()).filter(Boolean),
    }
    try {
      const { data } = projectId
        ? await api.put(`/student/project/${projectId}`, payload)
        : await api.post('/student/project', payload)
      setProjectId(data.id)
      setMessage('Sujet enregistré avec succès.')
      onSaved?.()
    } catch (error) {
      setMessage(error.response?.data?.message || "Impossible d'enregistrer le sujet.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <p className="text-sm font-medium text-indigo-600">Dépôt du sujet</p>
        <h3 className="text-xl font-semibold">Projet PFE / Master</h3>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <input name="title" value={form.title} onChange={update} placeholder="Titre" className="w-full rounded-2xl border border-slate-200 px-4 py-3" required />
        <textarea name="summary" value={form.summary} onChange={update} placeholder="Résumé" rows="4" className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
        <div className="grid gap-4 md:grid-cols-2">
          <input name="keywords" value={form.keywords} onChange={update} placeholder="Mots-clés" className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
          <input name="academicYear" value={form.academicYear} onChange={update} placeholder="Année universitaire" className="w-full rounded-2xl border border-slate-200 px-4 py-3" required />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <select name="projectType" value={form.projectType} onChange={update} className="w-full rounded-2xl border border-slate-200 px-4 py-3">
            <option value="PFE">PFE</option>
            <option value="MASTER">MASTER</option>
          </select>
          <input name="groupMembers" value={form.groupMembers} onChange={update} placeholder="Membres du groupe, séparés par des virgules" className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button disabled={saving} className="rounded-full bg-indigo-600 px-5 py-3 font-semibold text-white disabled:bg-slate-300">
            {saving ? 'Enregistrement...' : 'Enregistrer le sujet'}
          </button>
          {message && <p className="text-sm text-slate-600">{message}</p>}
        </div>
      </form>
    </article>
  )
}

