import { useEffect, useState } from 'react'
import api from '../../services/api'
import StudentDefenseInfo from '../../components/student/StudentDefenseInfo'
import StudentDefenseCountdown from '../../components/student/StudentDefenseCountdown'
import StudentDefenseChecklist from '../../components/student/StudentDefenseChecklist'

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
      
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <StudentDefenseInfo defense={defense} />
          <StudentDefenseCountdown defenseDate={defense?.date} defenseTime={defense?.startTime} />
        </div>
        <StudentDefenseChecklist />
      </div>
    </section>
  )
}
