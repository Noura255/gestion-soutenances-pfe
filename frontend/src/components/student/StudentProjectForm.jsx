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
  const [errors, setErrors] = useState({})
  const [showPreview, setShowPreview] = useState(false)

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
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  function validateForm() {
    const newErrors = {}
    
    if (!form.title.trim()) {
      newErrors.title = 'Le titre est obligatoire'
    } else if (form.title.length < 10) {
      newErrors.title = 'Le titre doit contenir au moins 10 caractères'
    }
    
    if (form.summary && form.summary.length > 500) {
      newErrors.summary = 'Le résumé ne doit pas dépasser 500 caractères'
    }
    
    if (!form.academicYear.trim()) {
      newErrors.academicYear = "L'année universitaire est obligatoire"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function submit(event) {
    event.preventDefault()
    
    if (!validateForm()) {
      setMessage('❌ Veuillez corriger les erreurs avant de continuer.')
      return
    }
    
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
      setMessage('✅ Sujet enregistré avec succès.')
      onSaved?.()
    } catch (error) {
      setMessage(error.response?.data?.message || "❌ Impossible d'enregistrer le sujet.")
    } finally {
      setSaving(false)
    }
  }

  const wordCount = form.summary.split(/\s+/).filter(Boolean).length
  const charCount = form.summary.length
  const membersArray = form.groupMembers.split(',').map(m => m.trim()).filter(Boolean)

  return (
    <div className="space-y-6">
      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-600">Dépôt du sujet</p>
            <h3 className="text-xl font-semibold">Projet PFE / Master</h3>
          </div>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50"
          >
            {showPreview ? '✏️ Éditer' : '👁️ Prévisualiser'}
          </button>
        </div>

        {!showPreview ? (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <input
                name="title"
                value={form.title}
                onChange={update}
                placeholder="Titre du projet *"
                className={`w-full rounded-2xl border px-4 py-3 ${errors.title ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                required
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              <p className="mt-1 text-xs text-slate-500">{form.title.length} caractères</p>
            </div>

            <div>
              <textarea
                name="summary"
                value={form.summary}
                onChange={update}
                placeholder="Résumé du projet (optionnel)"
                rows="5"
                className={`w-full rounded-2xl border px-4 py-3 ${errors.summary ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
              />
              {errors.summary && <p className="mt-1 text-sm text-red-600">{errors.summary}</p>}
              <p className="mt-1 text-xs text-slate-500">{wordCount} mots • {charCount}/500 caractères</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <input
                  name="keywords"
                  value={form.keywords}
                  onChange={update}
                  placeholder="Mots-clés (séparés par des virgules)"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3"
                />
                <p className="mt-1 text-xs text-slate-500">Ex: IA, Machine Learning, Python</p>
              </div>
              <div>
                <input
                  name="academicYear"
                  value={form.academicYear}
                  onChange={update}
                  placeholder="Année universitaire *"
                  className={`w-full rounded-2xl border px-4 py-3 ${errors.academicYear ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                  required
                />
                {errors.academicYear && <p className="mt-1 text-sm text-red-600">{errors.academicYear}</p>}
                <p className="mt-1 text-xs text-slate-500">Ex: 2024-2025</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <select
                name="projectType"
                value={form.projectType}
                onChange={update}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3"
              >
                <option value="PFE">PFE (Projet de Fin d'Études)</option>
                <option value="MASTER">MASTER</option>
              </select>
              <div>
                <input
                  name="groupMembers"
                  value={form.groupMembers}
                  onChange={update}
                  placeholder="Membres du groupe (séparés par des virgules)"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3"
                />
                <p className="mt-1 text-xs text-slate-500">{membersArray.length} membre(s)</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white transition-all hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {saving ? '💾 Enregistrement...' : '💾 Enregistrer le sujet'}
              </button>
              {message && (
                <div className={`rounded-full px-4 py-2 text-sm font-medium ${message.includes('✅') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                  {message}
                </div>
              )}
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Titre</p>
              <p className="mt-2 text-lg font-bold text-slate-900">{form.title || 'Non renseigné'}</p>
            </div>

            {form.summary && (
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Résumé</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{form.summary}</p>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Type</p>
                <p className="mt-2 font-semibold text-slate-900">{form.projectType}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Année</p>
                <p className="mt-2 font-semibold text-slate-900">{form.academicYear || 'Non renseignée'}</p>
              </div>
            </div>

            {form.keywords && (
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mots-clés</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.keywords.split(',').map((keyword, idx) => (
                    <span key={idx} className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">
                      {keyword.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {membersArray.length > 0 && (
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Membres du groupe</p>
                <div className="mt-2 space-y-2">
                  {membersArray.map((member, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                        {idx + 1}
                      </div>
                      <span className="text-sm font-medium text-slate-900">{member}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </article>

      {/* Conseils */}
      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-indigo-600">💡 Conseils</p>
        <div className="mt-4 space-y-2 text-sm text-slate-600">
          <p>• Choisis un titre clair et descriptif pour ton projet</p>
          <p>• Le résumé doit expliquer l'objectif et la portée du projet</p>
          <p>• Les mots-clés aident à catégoriser ton projet</p>
          <p>• Tu peux modifier ces informations à tout moment</p>
        </div>
      </article>
    </div>
  )
}

