import StudentChatbot from '../../components/student/StudentChatbot'

export default function StudentChatbotPage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-indigo-600">Aide</p>
        <h2 className="text-3xl font-bold tracking-tight">Assistant étudiant</h2>
      </div>
      <StudentChatbot />
    </section>
  )
}
