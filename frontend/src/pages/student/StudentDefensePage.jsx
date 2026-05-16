import { useEffect, useState } from 'react'
import api from '../../services/api'
import StudentDefenseInfo from '../../components/student/StudentDefenseInfo'

export default function StudentDefensePage() {
  const [defense, setDefense] = useState(null)

  useEffect(() => {
    api.get('/student/defense').then(({ data }) => setDefense(data)).catch(() => setDefense(null))
  }, [])

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-indigo-600">Soutenance</p>
        <h2 className="text-3xl font-bold tracking-tight">Consulter le planning</h2>
      </div>
      <StudentDefenseInfo defense={defense} />
    </section>
  )
}
