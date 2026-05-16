import { Link, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import api from '../../services/api'
import EvaluationReadonlyView from '../../components/jury/EvaluationReadonlyView'
import JuryChatbot from './JuryChatbot'

const emptyForm = {
  notePresentation: '',
  noteReport: '',
  noteTechnical: '',
  noteCommunication: '',
  finalGrade: '',
  remarks: '',
  decision: '',
}

const decisionOptions = [
  { value: 'VALIDATED', label: 'VALIDÉ' },
  { value: 'NEEDS_REVISION', label: 'RÉVISION' },
  { value: 'REJECTED', label: 'REJETÉ' },
]

function toPayloadValue(value) {
  return value === '' ? null : Number(value)
}

function toFormValue(value) {
  return value ?? ''
}

export default function JuryEvaluationForm() {
  const { id } = useParams()
  const [defense, setDefense] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [finalGradeManual, setFinalGradeManual] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    api.get(`/jury/defenses/${id}`)
      .then(({ data }) => {
        setDefense(data)
        if (data.evaluation) {
          setForm({
            notePresentation: toFormValue(data.evaluation.notePresentation),
            noteReport: toFormValue(data.evaluation.noteReport),
            noteTechnical: toFormValue(data.evaluation.noteTechnical),
            noteCommunication: toFormValue(data.evaluation.noteCommunication),
            finalGrade: toFormValue(data.evaluation.finalGrade),
            remarks: data.evaluation.remarks || '',
            decision: data.evaluation.decision || '',
          })
          setFinalGradeManual(data.evaluation.finalGrade !== null)
        }
      })
      .catch((err) => setError(err.response?.data?.message || 'Impossible de charger l’évaluation.'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (finalGradeManual) {
      return
    }

    const grades = [
      form.notePresentation,
      form.noteReport,
      form.noteTechnical,
      form.noteCommunication,
    ]

    if (grades.some((grade) => grade === '')) {
      setForm((current) => (current.finalGrade === '' ? current : { ...current, finalGrade: '' }))
      return
    }

    const average = grades.reduce((sum, grade) => sum + Number(grade), 0) / grades.length
    setForm((current) => ({ ...current, finalGrade: average.toFixed(2) }))
  }, [form.notePresentation, form.noteReport, form.noteTechnical, form.noteCommunication, finalGradeManual])

  const evaluation = defense?.evaluation || null
  const isSubmitted = evaluation?.status === 'SUBMITTED'

  const payload = useMemo(() => ({
    defenseId: Number(id),
    notePresentation: toPayloadValue(form.notePresentation),
    noteReport: toPayloadValue(form.noteReport),
    noteTechnical: toPayloadValue(form.noteTechnical),
    noteCommunication: toPayloadValue(form.noteCommunication),
    finalGrade: toPayloadValue(form.finalGrade),
    remarks: form.remarks,
    decision: form.decision || null,
  }), [form, id])

  function updateField(event) {
    const { name, value } = event.target
    if (name === 'finalGrade') {
      setFinalGradeManual(value !== '')
    }
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function saveDraft() {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const response = evaluation
        ? await api.put(`/jury/evaluations/${evaluation.id}/draft`, payload)
        : await api.post('/jury/evaluations', payload, { params: { status: 'DRAFT' } })
      setDefense((current) => ({
        ...current,
        evaluation: response.data,
        evaluationStatus: response.data.status,
      }))
      setSuccess('Brouillon enregistré avec succès')
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible d’enregistrer le brouillon.')
    } finally {
      setSaving(false)
    }
  }

  async function submitEvaluation() {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const response = evaluation
        ? await api.put(`/jury/evaluations/${evaluation.id}/submit`, payload)
        : await api.post('/jury/evaluations', payload, { params: { status: 'SUBMITTED' } })
      setDefense((current) => ({
        ...current,
        evaluation: response.data,
        evaluationStatus: response.data.status,
      }))
      setSuccess('Évaluation soumise avec succès')
      setShowConfirm(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de soumettre l’évaluation.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="rounded-3xl bg-white p-6 shadow-sm">Chargement de l’évaluation...</div>
  }

  if (error && !defense) {
    return <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>
  }

  return (
    <>
      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-indigo-600">Module jury</p>
            <h2 className="text-3xl font-bold tracking-tight">Évaluation</h2>
            {defense && <p className="mt-2 text-slate-600">{defense.studentName} · {defense.projectTitle}</p>}
          </div>
          <Link to={`/jury/defenses/${id}`} className="rounded-2xl bg-slate-100 px-4 py-3 font-semibold text-slate-700">
            Retour aux détails
          </Link>
        </div>

        {success && !isSubmitted && (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800">
            {success}
          </div>
        )}

        {error && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-700">
            {error}
          </div>
        )}

        {isSubmitted ? (
          <EvaluationReadonlyView evaluation={evaluation} />
        ) : (
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-5 md:grid-cols-2">
              {[
                ['notePresentation', 'Note présentation'],
                ['noteReport', 'Note rapport'],
                ['noteTechnical', 'Note technique'],
                ['noteCommunication', 'Note communication'],
              ].map(([name, label]) => (
                <label key={name} className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">{label}</span>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.01"
                    name={name}
                    value={form[name]}
                    onChange={updateField}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-400"
                  />
                </label>
              ))}

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Note finale</span>
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.01"
                  name="finalGrade"
                  value={form.finalGrade}
                  onChange={updateField}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-400"
                />
                <span className="block text-xs text-slate-500">
                  Calculée automatiquement tant que vous ne la modifiez pas manuellement.
                </span>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Décision</span>
                <select
                  name="decision"
                  value={form.decision}
                  onChange={updateField}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-400"
                >
                  <option value="">Sélectionner</option>
                  {decisionOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="mt-5 block space-y-2">
              <span className="text-sm font-medium text-slate-700">Remarques</span>
              <textarea
                name="remarks"
                rows="5"
                value={form.remarks}
                onChange={updateField}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-400"
              />
            </label>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={saveDraft}
                disabled={saving}
                className="rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                Enregistrer brouillon
              </button>
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                disabled={saving}
                className="rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-emerald-300"
              >
                Soumettre définitivement
              </button>
            </div>
          </article>
        )}
      </section>

      {showConfirm && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-slate-900">Confirmer la soumission</h3>
            <p className="mt-3 text-slate-600">
              Une fois soumise, l’évaluation ne pourra plus être modifiée.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="rounded-2xl bg-slate-100 px-4 py-3 font-semibold text-slate-700"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={submitEvaluation}
                disabled={saving}
                className="rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white disabled:bg-emerald-300"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      <JuryChatbot />
    </>
  )
}
