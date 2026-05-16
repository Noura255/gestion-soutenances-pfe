import { useEffect, useState } from 'react'
import api from '../../services/api'
import ProjectStatusBadge from '../../components/administration/ProjectStatusBadge'

export default function ProjectManagement() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/administration/projects')
      .then(r => setProjects(r.data))
      .catch(() => setError('Impossible de charger les projets.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = projects.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.studentName.toLowerCase().includes(search.toLowerCase()) ||
    p.supervisorName.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="flex items-center justify-center h-48 text-gray-400">Chargement…</div>
  if (error)   return <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-red-700">{error}</div>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des projets</h2>
          <p className="text-sm text-gray-500 mt-0.5">{projects.length} projet(s) au total</p>
        </div>
        <input
          type="text" placeholder="Rechercher…" value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Titre', 'Étudiant', 'Encadrant', 'Filière', 'Statut projet', 'Rapport', 'Jury', 'Planning'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Aucun projet trouvé.</td></tr>
            ) : filtered.map(p => (
              <tr key={p.projectId} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{p.title}</td>
                <td className="px-4 py-3 text-gray-600">{p.studentName}</td>
                <td className="px-4 py-3 text-gray-600">{p.supervisorName}</td>
                <td className="px-4 py-3 text-gray-500">{p.academicYear || '—'}</td>
                <td className="px-4 py-3"><ProjectStatusBadge status={p.projectStatus} /></td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <ProjectStatusBadge status={p.reportStatus} />
                    {p.reportVisibleToJury && (
                      <span className="text-xs text-purple-600 font-medium">Visible jury</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {p.juryAssigned
                    ? <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">Affecté</span>
                    : <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">Non affecté</span>
                  }
                </td>
                <td className="px-4 py-3"><ProjectStatusBadge status={p.defenseStatus} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
