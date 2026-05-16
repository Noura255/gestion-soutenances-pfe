import { useEffect, useState } from 'react'
import api from '../../services/api'

const statusLabels = {
  NOT_SUBMITTED: 'Non déposé',
  SUBMITTED_TO_SUPERVISOR: "Envoyé à l'encadrant",
  NEEDS_CORRECTION: 'Corrections demandées',
  APPROVED_BY_SUPERVISOR: "Approuvé par l'encadrant",
  VISIBLE_TO_JURY: 'Visible au jury',
}

export default function StudentReportUpload({ onUploaded }) {
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState(null)
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)

  async function loadStatus() {
    const { data } = await api.get('/student/report/status')
    setStatus(data)
  }

  useEffect(() => {
    loadStatus()
  }, [])

  async function submit(event) {
    event.preventDefault()
    if (!file) return setMessage('Sélectionne un PDF avant de continuer.')
    if (file.type !== 'application/pdf') return setMessage('Seuls les fichiers PDF sont acceptés.')
    setUploading(true)
    setMessage('')
    const body = new FormData()
    body.append('file', file)
    try {
      await api.post('/student/report/upload', body)
      setMessage("Rapport envoyé à l'encadrant.")
      await loadStatus()
      onUploaded?.()
    } catch (error) {
      setMessage(error.response?.data?.message || "L'upload a échoué.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <p className="text-sm font-medium text-indigo-600">Dépôt du rapport</p>
        <h3 className="text-xl font-semibold">PDF uniquement</h3>
      </div>
      <div className="mb-4 rounded-2xl bg-slate-50 p-4 text-sm">
        <p><span className="font-semibold">Statut :</span> {statusLabels[status?.status] || 'Chargement...'}</p>
        <p className="mt-1 text-slate-600">Visible au jury : {status?.visibleToJury ? 'Oui' : 'Non'}</p>
        {status?.supervisorComment && <p className="mt-2 text-violet-700">Commentaire : {status.supervisorComment}</p>}
      </div>
      <form onSubmit={submit} className="space-y-4">
        <input type="file" accept="application/pdf,.pdf" onChange={(event) => setFile(event.target.files?.[0] || null)} className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" />
        <div className="flex flex-wrap items-center gap-3">
          <button disabled={uploading} className="rounded-full bg-slate-900 px-5 py-3 font-semibold text-white disabled:bg-slate-300">
            {uploading ? 'Envoi...' : 'Déposer le rapport'}
          </button>
          {message && <p className="text-sm text-slate-600">{message}</p>}
        </div>
      </form>
    </article>
  )
}

