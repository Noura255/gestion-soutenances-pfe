const statusStyles = {
  NOT_SUBMITTED: 'bg-slate-100 text-slate-700',
  SUBMITTED_TO_SUPERVISOR: 'bg-sky-100 text-sky-700',
  NEEDS_CORRECTION: 'bg-violet-100 text-violet-700',
  APPROVED_BY_SUPERVISOR: 'bg-emerald-100 text-emerald-700',
  VISIBLE_TO_JURY: 'bg-indigo-100 text-indigo-700',
}

const statusLabels = {
  NOT_SUBMITTED: 'Non déposé',
  SUBMITTED_TO_SUPERVISOR: "Envoyé à l'encadrant",
  NEEDS_CORRECTION: 'Corrections demandées',
  APPROVED_BY_SUPERVISOR: "Approuvé par l'encadrant",
  VISIBLE_TO_JURY: 'Visible au jury',
}

export default function StudentProgress({ reportStatus, defense }) {
  const steps = [
    { label: 'Sujet', done: true },
    { label: 'Rapport déposé', done: reportStatus !== 'NOT_SUBMITTED' },
    {
      label: 'Validé',
      done: ['APPROVED_BY_SUPERVISOR', 'VISIBLE_TO_JURY'].includes(reportStatus),
    },
    { label: 'Jury informé', done: reportStatus === 'VISIBLE_TO_JURY' },
    { label: 'Soutenance', done: Boolean(defense?.date) },
  ]

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-indigo-600">Suivi du parcours</p>
          <h3 className="text-xl font-semibold">Où en est ton dossier ?</h3>
        </div>
        <span className={`rounded-full px-4 py-2 text-sm font-semibold ${statusStyles[reportStatus] || statusStyles.NOT_SUBMITTED}`}>
          {statusLabels[reportStatus] || statusLabels.NOT_SUBMITTED}
        </span>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-5">
        {steps.map((step, index) => (
          <div key={step.label} className="rounded-2xl bg-slate-50 p-4">
            <div className={`mb-3 grid h-9 w-9 place-items-center rounded-full text-sm font-bold ${step.done ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 ring-1 ring-slate-200'}`}>
              {index + 1}
            </div>
            <p className={`text-sm font-medium ${step.done ? 'text-slate-900' : 'text-slate-500'}`}>{step.label}</p>
          </div>
        ))}
      </div>
    </article>
  )
}
