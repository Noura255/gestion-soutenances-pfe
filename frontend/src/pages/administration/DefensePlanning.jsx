import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import AlertMessage from '../../components/administration/AlertMessage'
import ConflictAlert from '../../components/administration/ConflictAlert'
import ConfirmModal from '../../components/administration/ConfirmModal'
import DefenseForm from '../../components/administration/DefenseForm'
import ProjectStatusBadge from '../../components/administration/ProjectStatusBadge'
import api from '../../services/api'

export default function DefensePlanning() {
  const [searchParams] = useSearchParams()
  const [defenses, setDefenses] = useState([])
  const [projects, setProjects] = useState([])
  const [conflicts, setConflicts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [modal, setModal] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const requestedProjectId = searchParams.get('projectId')

  const load = async () => {
    setLoading(true)
    try {
      const [defensesResponse, projectsResponse, conflictsResponse] = await Promise.all([
        api.get('/administration/defenses'),
        api.get('/administration/projects'),
        api.get('/administration/defenses/conflicts'),
      ])
      setDefenses(defensesResponse.data)
      setProjects(projectsResponse.data)
      setConflicts(conflictsResponse.data)
    } catch {
      setError('Impossible de charger le planning des soutenances.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (!loading && requestedProjectId) {
      setModal({ mode: 'create', projectId: requestedProjectId })
    }
  }, [loading, requestedProjectId])

  const unplannedProjects = useMemo(
    () => projects.filter(project => project.juryStatus === 'JURY_ASSIGNED' && project.defenseStatus === 'NOT_SCHEDULED'),
    [projects],
  )

  const handleSuccess = () => {
    setModal(null)
    setSuccess('Planning enregistré avec succès.')
    load()
    window.setTimeout(() => setSuccess(null), 3500)
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/administration/defenses/${deleteTarget.id}`)
      setDeleteTarget(null)
      setSuccess('Brouillon supprimé.')
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de supprimer cette soutenance.')
      setDeleteTarget(null)
    }
  }

  if (loading) return <div className="grid h-48 place-items-center text-slate-400">Chargement…</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-indigo-600">Planning</p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Planning des soutenances</h2>
          <p className="mt-2 text-sm text-slate-500">Chaque créneau doit respecter les contraintes de salle, jury, étudiant et encadrant.</p>
        </div>
        <button
          type="button"
          onClick={() => setModal({ mode: 'create' })}
          className="rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Planifier une soutenance
        </button>
      </div>

      {error && <AlertMessage tone="error">{error}</AlertMessage>}
      {success && <AlertMessage tone="success">{success}</AlertMessage>}
      <ConflictAlert conflicts={conflicts} />

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-slate-950">Projets prêts à planifier</h3>
        <p className="mt-1 text-sm text-slate-500">Jurys affectés, aucune soutenance encore planifiée.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {unplannedProjects.length === 0 ? (
            <span className="text-sm text-slate-400">Aucun projet en attente de planification.</span>
          ) : unplannedProjects.map(project => (
            <button
              key={project.projectId}
              type="button"
              onClick={() => setModal({ mode: 'create', projectId: project.projectId })}
              className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
            >
              {project.title}
            </button>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                {['Projet', 'Étudiant', 'Date', 'Horaire', 'Salle', 'Jury', 'Statut', 'Actions'].map(header => (
                  <th key={header} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {defenses.map(defense => (
                <tr key={defense.id} className="align-top hover:bg-slate-50">
                  <td className="px-4 py-4 font-medium text-slate-950">{defense.projectTitle}</td>
                  <td className="px-4 py-4 text-slate-600">{defense.studentOrGroup}</td>
                  <td className="px-4 py-4 text-slate-600">{defense.defenseDate || '—'}</td>
                  <td className="px-4 py-4 text-slate-600">
                    {defense.startTime && defense.endTime ? `${defense.startTime} → ${defense.endTime}` : '—'}
                  </td>
                  <td className="px-4 py-4 text-slate-600">{defense.room?.name || '—'}</td>
                  <td className="px-4 py-4 text-xs text-slate-600">
                    <p>P : {fullName(defense.president)}</p>
                    <p>E1 : {fullName(defense.examiner1)}</p>
                    <p>E2 : {fullName(defense.examiner2)}</p>
                  </td>
                  <td className="px-4 py-4"><ProjectStatusBadge status={defense.status} /></td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      {defense.status !== 'COMPLETED' && (
                        <button
                          type="button"
                          onClick={() => setModal({ mode: 'edit', defense })}
                          className="rounded-xl border border-indigo-200 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-50"
                        >
                          Modifier
                        </button>
                      )}
                      {defense.status === 'SCHEDULED' && (
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(defense)}
                          className="rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
                        >
                          Supprimer
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

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5">
              <p className="text-sm font-medium text-indigo-600">{modal.mode === 'create' ? 'Nouveau créneau' : 'Modification'}</p>
              <h3 className="mt-1 text-xl font-semibold text-slate-950">
                {modal.mode === 'create' ? 'Planifier une soutenance' : 'Modifier la soutenance'}
              </h3>
            </div>
            <DefenseForm
              initial={modal.mode === 'edit' ? modal.defense : null}
              initialProjectId={modal.mode === 'create' ? modal.projectId : null}
              onSuccess={handleSuccess}
              onCancel={() => setModal(null)}
            />
          </div>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Supprimer ce brouillon ?"
        description="La soutenance sera retirée du planning tant qu’elle n’a pas été publiée."
        confirmLabel="Supprimer"
        destructive
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}

function fullName(user) {
  return user ? `${user.firstName} ${user.lastName}` : '—'
}
