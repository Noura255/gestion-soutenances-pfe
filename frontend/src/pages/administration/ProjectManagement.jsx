import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AlertMessage from '../../components/administration/AlertMessage'
import ProjectStatusBadge from '../../components/administration/ProjectStatusBadge'
import api from '../../services/api'

const initialFilters = {
  student: '',
  title: '',
  type: '',
  supervisor: '',
  reportStatus: '',
  withoutJury: false,
  unscheduled: false,
}

export default function ProjectManagement() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [filters, setFilters] = useState(initialFilters)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    api.get('/administration/projects')
      .then(({ data }) => setProjects(data))
      .catch(() => setError('Impossible de charger les projets.'))
      .finally(() => setLoading(false))
  }, [])

  const supervisors = useMemo(
    () => [...new Set(projects.map(project => project.supervisorName).filter(Boolean))],
    [projects],
  )
  const reportStatuses = useMemo(
    () => [...new Set(projects.map(project => project.reportStatus).filter(Boolean))],
    [projects],
  )

  const filtered = projects.filter(project => {
    const studentMatch = project.studentOrGroup.toLowerCase().includes(filters.student.toLowerCase())
    const titleMatch = project.title.toLowerCase().includes(filters.title.toLowerCase())
    const typeMatch = !filters.type || project.projectType === filters.type
    const supervisorMatch = !filters.supervisor || project.supervisorName === filters.supervisor
    const reportMatch = !filters.reportStatus || project.reportStatus === filters.reportStatus
    const juryMatch = !filters.withoutJury || project.juryStatus === 'NOT_ASSIGNED'
    const defenseMatch = !filters.unscheduled || project.defenseStatus === 'NOT_SCHEDULED'
    return studentMatch && titleMatch && typeMatch && supervisorMatch && reportMatch && juryMatch && defenseMatch
  })

  const setFilter = (key, value) => setFilters(current => ({ ...current, [key]: value }))

  const openDetails = async (projectId) => {
    setDetailLoading(true)
    setError(null)
    try {
      const { data } = await api.get(`/administration/projects/${projectId}`)
      setDetail(data)
    } catch {
      setError('Impossible de charger le détail du projet.')
    } finally {
      setDetailLoading(false)
    }
  }

  const openVisibleReport = async (reportId) => {
    try {
      const { data } = await api.get(`/administration/reports/visible/${reportId}/download`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }))
      window.open(url, '_blank', 'noopener,noreferrer')
      window.setTimeout(() => window.URL.revokeObjectURL(url), 30000)
    } catch (err) {
      setError(err.response?.data?.message || 'Le rapport visible ne peut pas être ouvert.')
    }
  }

  if (loading) return <div className="grid h-48 place-items-center text-slate-400">Chargement…</div>

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-indigo-600">Projets</p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Gestion des projets</h2>
        <p className="mt-2 text-sm text-slate-500">Tous les projets déposés, avec leurs états métier croisés.</p>
      </div>

      {error && <AlertMessage tone="error">{error}</AlertMessage>}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <input
            value={filters.student}
            onChange={event => setFilter('student', event.target.value)}
            placeholder="Recherche étudiant"
            className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          />
          <input
            value={filters.title}
            onChange={event => setFilter('title', event.target.value)}
            placeholder="Recherche titre"
            className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          />
          <select
            value={filters.type}
            onChange={event => setFilter('type', event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          >
            <option value="">Tous les types</option>
            <option value="PFE">PFE</option>
            <option value="MASTER">MASTER</option>
          </select>
          <select
            value={filters.supervisor}
            onChange={event => setFilter('supervisor', event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          >
            <option value="">Tous les encadrants</option>
            {supervisors.map(supervisor => <option key={supervisor} value={supervisor}>{supervisor}</option>)}
          </select>
          <select
            value={filters.reportStatus}
            onChange={event => setFilter('reportStatus', event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          >
            <option value="">Tous les rapports</option>
            {reportStatuses.map(status => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>
        <div className="mt-4 flex flex-wrap gap-5 text-sm text-slate-600">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.withoutJury}
              onChange={event => setFilter('withoutJury', event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600"
            />
            Projets sans jury
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.unscheduled}
              onChange={event => setFilter('unscheduled', event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600"
            />
            Soutenances non planifiées
          </label>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1300px] w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                {[
                  'ID', 'Étudiant', 'Titre du projet', 'Type', 'Filière / département', 'Encadrant',
                  'Statut projet', 'Statut rapport', 'Jury affecté', 'Soutenance planifiée',
                  'Rapport visible', 'Actions',
                ].map(header => (
                  <th key={header} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-10 text-center text-slate-400">Aucun projet trouvé.</td>
                </tr>
              ) : filtered.map(project => (
                <tr key={project.projectId} className="align-top hover:bg-slate-50">
                  <td className="px-4 py-4 font-medium text-slate-700">#{project.projectId}</td>
                  <td className="px-4 py-4 text-slate-600">{project.studentOrGroup}</td>
                  <td className="max-w-xs px-4 py-4 font-medium text-slate-950">{project.title}</td>
                  <td className="px-4 py-4 text-slate-600">{project.projectType}</td>
                  <td className="px-4 py-4 text-slate-600">{project.fieldName || '—'}</td>
                  <td className="px-4 py-4 text-slate-600">{project.supervisorName}</td>
                  <td className="px-4 py-4"><ProjectStatusBadge status={project.projectStatus} /></td>
                  <td className="px-4 py-4"><ProjectStatusBadge status={project.reportStatus} /></td>
                  <td className="px-4 py-4">{project.juryStatus === 'JURY_ASSIGNED' ? 'Oui' : 'Non'}</td>
                  <td className="px-4 py-4">{project.defenseStatus === 'NOT_SCHEDULED' ? 'Non' : 'Oui'}</td>
                  <td className="px-4 py-4">{project.reportVisibleToJury ? 'Oui' : 'Non'}</td>
                  <td className="px-4 py-4">
                    <div className="flex min-w-[240px] flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openDetails(project.projectId)}
                        className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                      >
                        Voir détails
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/administration/jury-assignment?projectId=${project.projectId}`)}
                        className="rounded-xl border border-indigo-200 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-50"
                      >
                        Affecter jury
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/administration/planning?projectId=${project.projectId}`)}
                        className="rounded-xl border border-sky-200 px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-50"
                      >
                        Planifier
                      </button>
                      {project.visibleReportId && (
                        <button
                          type="button"
                          onClick={() => openVisibleReport(project.visibleReportId)}
                          className="rounded-xl border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                        >
                          Voir rapport
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {(detail || detailLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
          <div className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            {detailLoading ? (
              <div className="grid h-40 place-items-center text-slate-400">Chargement…</div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-indigo-600">Projet #{detail.projectId}</p>
                    <h3 className="mt-1 text-2xl font-bold text-slate-950">{detail.title}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDetail(null)}
                    className="rounded-full border border-slate-200 px-3 py-1 text-slate-500 hover:bg-slate-50"
                  >
                    ×
                  </button>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <Detail label="Étudiant" value={`${detail.student?.firstName || ''} ${detail.student?.lastName || ''}`.trim()} />
                  <Detail label="Encadrant" value={`${detail.supervisor?.firstName || ''} ${detail.supervisor?.lastName || ''}`.trim()} />
                  <Detail label="Filière / département" value={detail.fieldName || '—'} />
                  <Detail label="Type" value={detail.projectType || '—'} />
                  <Detail label="Statut projet" value={detail.projectStatus} />
                  <Detail label="Statut rapport" value={detail.reportStatus} />
                  <Detail label="Statut jury" value={detail.juryStatus} />
                  <Detail label="Statut soutenance" value={detail.defenseStatus} />
                </div>

                <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-950">Résumé</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{detail.summary || 'Aucun résumé renseigné.'}</p>
                  {detail.keywords && <p className="mt-3 text-xs text-slate-500">Mots-clés : {detail.keywords}</p>}
                </div>

                <div className="mt-6">
                  <p className="text-sm font-semibold text-slate-950">Jury</p>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <Detail label="Président" value={fullName(detail.president)} />
                    <Detail label="Examinateur 1" value={fullName(detail.examiner1)} />
                    <Detail label="Examinateur 2" value={fullName(detail.examiner2)} />
                    <Detail label="Invité" value={fullName(detail.guest)} />
                  </div>
                </div>

                {detail.visibleReport && (
                  <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-sm font-semibold text-emerald-900">Rapport visible au jury</p>
                    <p className="mt-1 text-sm text-emerald-700">{detail.visibleReport.originalFileName || 'Rapport disponible'}</p>
                    <button
                      type="button"
                      onClick={() => openVisibleReport(detail.visibleReport.id)}
                      className="mt-3 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                    >
                      Consulter le rapport
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Detail({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-700">{value || '—'}</p>
    </div>
  )
}

function fullName(user) {
  return user ? `${user.firstName} ${user.lastName}` : '—'
}
