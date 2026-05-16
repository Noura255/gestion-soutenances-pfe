import { Link, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import api from '../../services/api'

function resolveFileUrl(fileUrl) {
  if (!fileUrl) return ''
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl
  if (import.meta.env.DEV && fileUrl.startsWith('/')) {
    return `http://localhost:8080${fileUrl}`
  }
  return fileUrl
}

export default function JuryReportViewer({ report: initialReport = null, reportStatus: initialReportStatus = null }) {
  const { id } = useParams()
  const [report, setReport] = useState(initialReport)
  const [reportStatus, setReportStatus] = useState(initialReportStatus)
  const [loading, setLoading] = useState(!initialReport && Boolean(id))
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialReport || !id) {
      return
    }

    setLoading(true)
    api.get(`/jury/reports/${id}`)
      .then(({ data }) => {
        setReport(data)
        setReportStatus(data.visibilityStatus === 'VISIBLE_TO_JURY' ? 'AVAILABLE' : 'UNAVAILABLE')
      })
      .catch((err) => {
        if (err.response?.status === 403) {
          setReportStatus('UNAVAILABLE')
          return
        }
        setError(err.response?.data?.message || 'Impossible de charger le rapport.')
      })
      .finally(() => setLoading(false))
  }, [id, initialReport])

  const embeddedUrl = useMemo(() => resolveFileUrl(report?.fileUrl), [report])

  if (loading) {
    return <div className="rounded-3xl bg-white p-6 shadow-sm">Chargement du rapport...</div>
  }

  if (error) {
    return <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-700">{error}</div>
  }

  if (reportStatus !== 'AVAILABLE' || !report || report.visibilityStatus === 'HIDDEN') {
    return (
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-slate-700">
        Rapport non encore disponible
      </div>
    )
  }

  return (
    <article className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Rapport visible au jury</p>
          <h4 className="mt-1 text-lg font-semibold text-slate-900">{report.title}</h4>
          <p className="mt-1 text-sm text-slate-500">
            Téléversé le {report.uploadedAt ? new Date(report.uploadedAt).toLocaleString('fr-FR') : '—'}
          </p>
        </div>
        {id && (
          <Link to={`/jury/defenses/${id}`} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
            Retour aux détails
          </Link>
        )}
      </div>

      {embeddedUrl ? (
        <iframe
          title={report.title}
          src={embeddedUrl}
          className="h-[680px] w-full rounded-2xl border border-slate-200"
        />
      ) : (
        <div className="rounded-2xl bg-slate-50 p-5 text-slate-600">
          Aucun fichier PDF n’est associé à ce rapport.
        </div>
      )}
    </article>
  )
}
