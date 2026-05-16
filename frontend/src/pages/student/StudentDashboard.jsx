import { useEffect, useState } from 'react'
import api from '../../services/api'
import StudentProjectForm from '../../components/student/StudentProjectForm'
import StudentReportUpload from '../../components/student/StudentReportUpload'
import StudentDefenseInfo from '../../components/student/StudentDefenseInfo'
import StudentChatbot from '../../components/student/StudentChatbot'

const reportLabels = {
  NOT_SUBMITTED: 'Non déposé',
  SUBMITTED_TO_SUPERVISOR: "Envoyé à l'encadrant",
  NEEDS_CORRECTION: 'Corrections demandées',
  APPROVED_BY_SUPERVISOR: "Approuvé par l'encadrant",
  VISIBLE_TO_JURY: 'Visible au jury',
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
      <div>
        <p className="text-sm font-medium text-indigo-600">Espace étudiant</p>
        <h2 className="text-3xl font-bold tracking-tight">Bonjour, {dashboard.studentName}</h2>
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
          <p className="text-sm text-slate-500">Rapport</p>
          <p className="mt-3 text-lg font-semibold">{reportLabels[dashboard.reportStatus]}</p>
        </article>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <StudentProjectForm onSaved={load} />
        <StudentReportUpload onUploaded={load} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <StudentDefenseInfo defense={defense} />
        <StudentChatbot />
      </div>
    </section>
  )
}

