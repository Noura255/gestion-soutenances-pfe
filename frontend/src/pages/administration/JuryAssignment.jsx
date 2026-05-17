import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import AlertMessage from '../../components/administration/AlertMessage'
import JuryAssignForm from '../../components/administration/JuryAssignForm'
import ProjectStatusBadge from '../../components/administration/ProjectStatusBadge'
import api from '../../services/api'

export default function JuryAssignment() {
  const [searchParams] = useSearchParams()
  const [projects, setProjects] = useState([])
  const [assignments, setAssignments] = useState([])
  const [selectedId, setSelectedId] = useState(searchParams.get('projectId') || '')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const [projectsResponse, assignmentsResponse] = await Promise.all([
        api.get('/administration/projects'),
        api.get('/administration/jury-assignments'),
      ])
      setProjects(projectsResponse.data)
      setAssignments(assignmentsResponse.data)
    } catch {
      setError('Impossible de charger les affectations jury.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const selectedProject = useMemo(
    () => projects.find(project => String(project.projectId) === String(selectedId)),
    [projects, selectedId],
  )

  const handleSuccess = (assignment) => {
    setSuccess(`Jury enregistré pour « ${assignment.projectTitle} ».`)
    load()
    window.setTimeout(() => setSuccess(null), 3500)
  }

  if (loading) return <div className="grid h-48 place-items-center text-slate-400">Chargement…</div>

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-indigo-600">Jurys</p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Affectation des jurys</h2>
        <p className="mt-2 text-sm text-slate-500">Trois membres JURY distincts au minimum ; l’invité reste optionnel.</p>
      </div>

      {error && <AlertMessage tone="error">{error}</AlertMessage>}
      {success && <AlertMessage tone="success">{success}</AlertMessage>}

      <section className="grid gap-5 xl:grid-cols-[1fr_1.1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="text-sm font-medium text-slate-700">Projet</label>
          <select
            value={selectedId}
            onChange={event => setSelectedId(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          >
            <option value="">Sélectionner un projet</option>
            {projects.map(project => (
              <option key={project.projectId} value={project.projectId}>
                {project.title} — {project.studentOrGroup}
              </option>
            ))}
          </select>

          {selectedProject ? (
            <div className="mt-5 space-y-3">
              <ProjectInfo label="Étudiant" value={selectedProject.studentOrGroup} />
              <ProjectInfo label="Titre" value={selectedProject.title} />
              <ProjectInfo label="Encadrant" value={selectedProject.supervisorName} />
              <div className="grid gap-3 sm:grid-cols-2">
                <ProjectInfo label="Rapport" value={<ProjectStatusBadge status={selectedProject.reportStatus} />} />
                <ProjectInfo label="Jury" value={<ProjectStatusBadge status={selectedProject.juryStatus} />} />
              </div>
              <p className="rounded-2xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                L’affectation du jury ne rend jamais le rapport visible automatiquement. Cette activation reste réservée à l’encadrant.
              </p>
            </div>
          ) : (
            <p className="mt-5 text-sm text-slate-400">Choisissez un projet pour afficher ses informations.</p>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-950">Composition du jury</h3>
          <div className="mt-4">
            {selectedProject ? (
              <JuryAssignForm
                projectId={selectedProject.projectId}
                projectTitle={selectedProject.title}
                initialAssignment={selectedProject}
                onSuccess={handleSuccess}
              />
            ) : (
              <p className="text-sm text-slate-400">Le formulaire apparaîtra après sélection d’un projet.</p>
            )}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="font-semibold text-slate-950">Affectations existantes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                {['Projet', 'Président', 'Examinateur 1', 'Examinateur 2', 'Invité', 'Dernière affectation'].map(header => (
                  <th key={header} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assignments.map(assignment => (
                <tr key={assignment.id}>
                  <td className="px-4 py-4 font-medium text-slate-950">{assignment.projectTitle}</td>
                  <td className="px-4 py-4 text-slate-600">{fullName(assignment.president)}</td>
                  <td className="px-4 py-4 text-slate-600">{fullName(assignment.examiner1)}</td>
                  <td className="px-4 py-4 text-slate-600">{fullName(assignment.examiner2)}</td>
                  <td className="px-4 py-4 text-slate-600">{fullName(assignment.guest)}</td>
                  <td className="px-4 py-4 text-slate-600">{formatDateTime(assignment.assignedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function ProjectInfo({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-1 text-sm font-medium text-slate-700">{value || '—'}</div>
    </div>
  )
}

function fullName(user) {
  return user ? `${user.firstName} ${user.lastName}` : '—'
}

function formatDateTime(value) {
  return value ? new Date(value).toLocaleString('fr-FR') : '—'
}
