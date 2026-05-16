import StudentProjectForm from '../../components/student/StudentProjectForm'

export default function StudentProjectPage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-indigo-600">Sujet</p>
        <h2 className="text-3xl font-bold tracking-tight">Déposer ou mettre à jour le projet</h2>
      </div>
      <StudentProjectForm />
    </section>
  )
}
