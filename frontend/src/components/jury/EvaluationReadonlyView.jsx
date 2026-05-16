const decisionLabels = {
  VALIDATED: 'VALIDÉ',
  NEEDS_REVISION: 'RÉVISION',
  REJECTED: 'REJETÉ',
}

function displayGrade(value) {
  return value ?? '—'
}

export default function EvaluationReadonlyView({ evaluation }) {
  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800">
        <p className="font-semibold">Évaluation soumise avec succès</p>
        <p className="mt-1 text-sm">
          Soumise le {evaluation.submittedAt ? new Date(evaluation.submittedAt).toLocaleString('fr-FR') : '—'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          ['Présentation', evaluation.notePresentation],
          ['Rapport', evaluation.noteReport],
          ['Technique', evaluation.noteTechnical],
          ['Communication', evaluation.noteCommunication],
          ['Note finale', evaluation.finalGrade],
        ].map(([label, value]) => (
          <article key={label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{displayGrade(value)}</p>
          </article>
        ))}
      </div>

      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[180px_1fr]">
          <div>
            <p className="text-sm text-slate-500">Décision</p>
            <p className="mt-2 font-semibold text-slate-900">{decisionLabels[evaluation.decision] || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Remarques</p>
            <p className="mt-2 whitespace-pre-wrap text-slate-700">{evaluation.remarks || 'Aucune remarque.'}</p>
          </div>
        </div>
      </article>
    </section>
  )
}
