import { useEffect, useState } from 'react'
import api from '../../services/api'

const statusLabels = {
  NOT_SUBMITTED: 'Non déposé',
  SUBMITTED_TO_SUPERVISOR: "Envoyé à l'encadrant",
  NEEDS_CORRECTION: 'Corrections demandées',
  APPROVED_BY_SUPERVISOR: "Approuvé par l'encadrant",
  VISIBLE_TO_JURY: 'Visible au jury',
}

const statusColors = {
  NOT_SUBMITTED: 'bg-slate-100 text-slate-700',
  SUBMITTED_TO_SUPERVISOR: 'bg-sky-100 text-sky-700',
  NEEDS_CORRECTION: 'bg-violet-100 text-violet-700',
  APPROVED_BY_SUPERVISOR: 'bg-emerald-100 text-emerald-700',
  VISIBLE_TO_JURY: 'bg-indigo-100 text-indigo-700',
}

export default function StudentReportUpload({ onUploaded }) {
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState(null)
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [filePreview, setFilePreview] = useState(null)
  const [history, setHistory] = useState([])

  async function loadStatus() {
    try {
      const { data } = await api.get('/student/report/status')
      setStatus(data)
    } catch (error) {
      // Ignore errors
    }
  }

  async function loadHistory() {
    try {
      const { data } = await api.get('/student/report/history')
      setHistory(data || [])
    } catch (error) {
      setHistory([])
    }
  }

  useEffect(() => {
    loadStatus()
    loadHistory()
  }, [])

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0] || null
    setFile(selectedFile)
    
    if (selectedFile) {
      // Créer une prévisualisation
      setFilePreview({
        name: selectedFile.name,
        size: (selectedFile.size / 1024 / 1024).toFixed(2), // MB
        type: selectedFile.type
      })
    } else {
      setFilePreview(null)
    }
  }

  async function submit(event) {
    event.preventDefault()
    if (!file) return setMessage('Sélectionne un PDF avant de continuer.')
    if (file.type !== 'application/pdf') return setMessage('Seuls les fichiers PDF sont acceptés.')
    if (file.size > 10 * 1024 * 1024) return setMessage('Le fichier ne doit pas dépasser 10 Mo.')
    
    setUploading(true)
    setMessage('')
    const body = new FormData()
    body.append('file', file)
    try {
      await api.post('/student/report/upload', body)
      setMessage("✅ Rapport envoyé à l'encadrant avec succès.")
      setFile(null)
      setFilePreview(null)
      await loadStatus()
      await loadHistory()
      onUploaded?.()
    } catch (error) {
      setMessage(error.response?.data?.message || "❌ L'upload a échoué.")
    } finally {
      setUploading(false)
    }
  }

  async function downloadReport() {
    try {
      const response = await api.get('/student/report/download', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'rapport.pdf')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      setMessage("❌ Impossible de télécharger le rapport.")
    }
  }

  return (
    <div className="space-y-6">
      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <p className="text-sm font-medium text-indigo-600">Dépôt du rapport</p>
          <h3 className="text-xl font-semibold">PDF uniquement</h3>
        </div>
        
        {/* Statut actuel */}
        <div className="mb-4 rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">Statut actuel</p>
              <span className={`mt-1 inline-block rounded-full px-3 py-1 text-sm font-semibold ${statusColors[status?.status] || statusColors.NOT_SUBMITTED}`}>
                {statusLabels[status?.status] || 'Chargement...'}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">Visible au jury</p>
              <p className="mt-1 font-semibold text-slate-900">{status?.visibleToJury ? '✅ Oui' : '❌ Non'}</p>
            </div>
          </div>
          {status?.supervisorComment && (
            <div className="mt-3 rounded-xl bg-violet-50 p-3">
              <p className="text-xs font-semibold text-violet-900">💬 Commentaire de l'encadrant :</p>
              <p className="mt-1 text-sm text-violet-700">{status.supervisorComment}</p>
            </div>
          )}
        </div>

        {/* Formulaire d'upload */}
        <form onSubmit={submit} className="space-y-4">
          <div>
            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={handleFileChange}
              className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
            />
            <p className="mt-2 text-xs text-slate-500">Taille maximale : 10 Mo • Format : PDF uniquement</p>
          </div>

          {/* Prévisualisation du fichier */}
          {filePreview && (
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-indigo-900">{filePreview.name}</p>
                  <p className="mt-1 text-sm text-indigo-700">{filePreview.size} Mo</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={uploading || !file}
              className="rounded-full bg-slate-900 px-6 py-3 font-semibold text-white transition-all hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {uploading ? '📤 Envoi en cours...' : '📤 Déposer le rapport'}
            </button>
            {status?.status !== 'NOT_SUBMITTED' && (
              <button
                type="button"
                onClick={downloadReport}
                className="rounded-full border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition-all hover:bg-slate-50"
              >
                📥 Télécharger
              </button>
            )}
          </div>
          {message && (
            <div className={`rounded-2xl p-3 text-sm ${message.includes('✅') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              {message}
            </div>
          )}
        </form>
      </article>

      {/* Historique des versions */}
      {history.length > 0 && (
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <p className="text-sm font-medium text-indigo-600">Historique</p>
            <h3 className="text-xl font-semibold">Versions précédentes</h3>
          </div>
          <div className="space-y-2">
            {history.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                    {history.length - idx}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.filename || 'rapport.pdf'}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(item.uploadedAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[item.status] || statusColors.NOT_SUBMITTED}`}>
                  {statusLabels[item.status]}
                </span>
              </div>
            ))}
          </div>
        </article>
      )}
    </div>
  )
}

