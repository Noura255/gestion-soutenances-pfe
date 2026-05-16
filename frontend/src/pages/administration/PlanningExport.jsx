import { useState } from 'react'
import api from '../../services/api'

export default function PlanningExport() {
  const [publishing, setPublishing] = useState(false)
  const [publishResult, setPublishResult] = useState(null)
  const [error, setError] = useState(null)
  const [downloading, setDownloading] = useState(null) // 'pdf' | 'excel' | null

  const handlePublish = async () => {
    setPublishing(true)
    setError(null)
    setPublishResult(null)
    try {
      const res = await api.put('/administration/defenses/publish')
      setPublishResult(res.data.published)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la publication.')
    } finally {
      setPublishing(false)
    }
  }

  const handleExport = async (type) => {
    setDownloading(type)
    setError(null)
    try {
      const res = await api.get(`/administration/export/${type}`, { responseType: 'blob' })
      const filename = type === 'pdf' ? 'planning-soutenances.pdf' : 'planning-soutenances.xlsx'
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      setError(`Erreur lors de l'export ${type.toUpperCase()}.`)
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Publication & Export</h2>
        <p className="text-sm text-gray-500 mt-0.5">Publiez le planning final et exportez-le en PDF ou Excel.</p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 text-sm">{error}</div>
      )}

      {publishResult !== null && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-green-700 text-sm">
          ✅ {publishResult} soutenance(s) publiée(s) avec succès.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Publication */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-3">
          <div className="text-3xl">📢</div>
          <h3 className="font-semibold text-gray-900">Publier le planning</h3>
          <p className="text-sm text-gray-500">
            Toutes les soutenances avec le statut <span className="font-medium">Planifié</span> seront publiées.
          </p>
          <button onClick={handlePublish} disabled={publishing}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
            {publishing ? 'Publication…' : 'Publier maintenant'}
          </button>
        </div>

        {/* Export PDF */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-3">
          <div className="text-3xl">📄</div>
          <h3 className="font-semibold text-gray-900">Exporter en PDF</h3>
          <p className="text-sm text-gray-500">
            Téléchargez le planning des soutenances publiées au format PDF.
          </p>
          <button onClick={() => handleExport('pdf')} disabled={downloading === 'pdf'}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors">
            {downloading === 'pdf' ? 'Génération…' : 'Télécharger PDF'}
          </button>
        </div>

        {/* Export Excel */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-3">
          <div className="text-3xl">📊</div>
          <h3 className="font-semibold text-gray-900">Exporter en Excel</h3>
          <p className="text-sm text-gray-500">
            Téléchargez le planning des soutenances publiées au format Excel.
          </p>
          <button onClick={() => handleExport('excel')} disabled={downloading === 'excel'}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors">
            {downloading === 'excel' ? 'Génération…' : 'Télécharger Excel'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
        <p className="text-sm text-blue-700">
          <span className="font-medium">Note :</span> Seules les soutenances avec le statut{' '}
          <span className="font-medium">Publié</span> apparaissent dans les exports.
          Publiez d'abord le planning avant d'exporter.
        </p>
      </div>
    </div>
  )
}
