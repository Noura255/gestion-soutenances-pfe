import StudentReportUpload from '../../components/student/StudentReportUpload'

export default function StudentReportPage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-indigo-600">Rapport</p>
        <h2 className="text-3xl font-bold tracking-tight">Déposer le rapport final</h2>
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <StudentReportUpload />
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-indigo-600">À retenir</p>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <p>• Seuls les fichiers PDF sont acceptés.</p>
            <p>• Ton encadrant voit le rapport avant le jury.</p>
            <p>• Si des corrections sont demandées, dépose simplement une nouvelle version.</p>
          </div>
        </article>
      </div>
    </section>
  )
}
