import { useEffect, useState } from 'react'
import api from '../../services/api'
import StudentProgress from '../../components/student/StudentProgress'

const reportLabels = {
  NOT_SUBMITTED: 'Non déposé',
  SUBMITTED_TO_SUPERVISOR: "Envoyé à l'encadrant",
  NEEDS_CORRECTION: 'Corrections demandées',
  APPROVED_BY_SUPERVISOR: "Approuvé par l'encadrant",
  VISIBLE_TO_JURY: 'Visible au jury',
}

const reportStyles = {
  NOT_SUBMITTED: 'from-slate-500 to-slate-700',
  SUBMITTED_TO_SUPERVISOR: 'from-sky-500 to-indigo-600',
  NEEDS_CORRECTION: 'from-violet-500 to-indigo-700',
  APPROVED_BY_SUPERVISOR: 'from-emerald-500 to-teal-600',
  VISIBLE_TO_JURY: 'from-indigo-500 to-violet-600',
}

export default function StudentDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [defense, setDefense] = useState(null)

  async function load() {
    const [{ data: dashboardData }, defenseResult] = await Promise.all([
      api.get('/student/dashboard'),
      api.get('/student/defense').then((response) => response.data).catch(() => null),
    ])
    setDashboard(dashboardData)
    setDefense(defenseResult)
  }

  useEffect(() => {
    load()
  }, [])

  if (!dashboard) {
    return <div className="rounded-3xl bg-white p-6 shadow-sm">Chargement de l’espace étudiant...</div>
  }

  return (
    <section className="space-y-6">
      <div className={`overflow-hidden rounded-[2rem] bg-gradient-to-br ${reportStyles[dashboard.reportStatus] || reportStyles.NOT_SUBMITTED} p-6 text-white shadow-sm`}>
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-white/75">Espace étudiant</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Bonjour, {dashboard.studentName}</h2>
            <p className="mt-3 max-w-2xl text-white/80">
              Suis ici l’état de ton projet, de ton rapport et de ta soutenance.
            </p>
          </div>
          <div className="rounded-3xl bg-white/15 p-4 backdrop-blur">
            <p className="text-sm text-white/75">Statut du rapport</p>
            <p className="mt-2 text-lg font-semibold">{reportLabels[dashboard.reportStatus]}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Filière</p>
          <p className="mt-3 text-lg font-semibold">{dashboard.field || 'Non renseignée'}</p>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Sujet</p>
          <p className="mt-3 text-lg font-semibold">{dashboard.projectTitle}</p>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Encadrant</p>
          <p className="mt-3 text-lg font-semibold">{dashboard.supervisorName}</p>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Prochaine soutenance</p>
          <p className="mt-3 text-lg font-semibold">{dashboard.defenseDate || 'À planifier'}</p>
        </article>
      </div>

      <StudentProgress reportStatus={dashboard.reportStatus} defense={defense} />
    </section>
  )
}
