import { useEffect, useState } from 'react'
import AlertMessage from '../../components/administration/AlertMessage'
import ProjectStatusBadge from '../../components/administration/ProjectStatusBadge'
import api from '../../services/api'

export default function VisibleReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/administration/reports/visible')
      .then(({ data }) => setReports(data))
      .catch(() => setError('Impossible de charger les rapports visibles.'))
      .finally(() => setLoading(false))
  }, [])

  const openReport = async (report, download = false) => {
    try {
      const { data } = await api.get(`/administration/reports/visible/${report.id}/download`, { responseType: 'blob' })
      const blob = new Blob([data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      if (download) {
        const link = document.createElement('a')
        link.href = url
        link.download = report.originalFileName || `rapport-${report.id}.pdf`
        document.body.appendChild(link)
        link.click()
        link.remove()
      } else {
        window.open(url, '_blank', 'noopener,noreferrer')
      }
      window.setTimeout(() => window.URL.revokeObjectURL(url), 30000)
    } catch (err) {
      setError(err.response?.data?.message || 'Le fichier du rapport est indisponible.')
    }
  }

  if (loading) return <div className="grid h-48 place-items-center text-slate-400">Chargement…</div>

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-indigo-600">Rapports</p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Rapports visibles</h2>
        <p className="mt-2 text-sm text-slate-500">Uniquement les rapports déjà activés par l’encadrant pour le jury.</p>
      </div>

      {error && <AlertMessage tone="error">{error}</AlertMessage>}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                {['Étudiant', 'Projet', 'Encadrant', 'Statut rapport', 'Date dépôt', 'Date approbation', 'Activation visibilité', 'Actions'].map(header => (
                  <th key={header} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-400">Aucun rapport visible.</td>
                </tr>
              ) : reports.map(report => (
                <tr key={report.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4 text-slate-600">{report.studentOrGroup}</td>
                  <td className="px-4 py-4 font-medium text-slate-950">{report.projectTitle}</td>
                  <td className="px-4 py-4 text-slate-600">{report.supervisorName}</td>
                  <td className="px-4 py-4"><ProjectStatusBadge status={report.status} /></td>
                  <td className="px-4 py-4 text-slate-600">{formatDate(report.uploadedAt)}</td>
                  <td className="px-4 py-4 text-slate-600">{formatDate(report.approvedAt)}</td>
                  <td className="px-4 py-4 text-slate-600">{formatDate(report.visibilityActivatedAt)}</td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={!report.downloadable}
                        onClick={() => openReport(report)}
                        className="rounded-xl border border-indigo-200 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Consulter
                      </button>
                      <button
                        type="button"
                        disabled={!report.downloadable}
                        onClick={() => openReport(report, true)}
                        className="rounded-xl border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Télécharger
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString('fr-FR') : '—'
}
