import { useEffect, useState } from 'react'

export default function StudentDefenseCountdown({ defenseDate, defenseTime }) {
  const [timeLeft, setTimeLeft] = useState(null)

  useEffect(() => {
    if (!defenseDate) return

    const calculateTimeLeft = () => {
      const targetDate = new Date(`${defenseDate}T${defenseTime || '00:00:00'}`)
      const now = new Date()
      const difference = targetDate - now

      if (difference <= 0) {
        return { expired: true }
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((difference / 1000 / 60) % 60)
      const seconds = Math.floor((difference / 1000) % 60)

      return { days, hours, minutes, seconds, expired: false }
    }

    setTimeLeft(calculateTimeLeft())
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [defenseDate, defenseTime])

  if (!defenseDate || !timeLeft) {
    return (
      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-500">Aucune soutenance planifiée</p>
        </div>
      </article>
    )
  }

  if (timeLeft.expired) {
    return (
      <article className="overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 shadow-sm">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-emerald-900">C'est le jour J !</p>
          <p className="mt-2 text-sm text-emerald-700">Bonne chance pour ta soutenance 🎓</p>
        </div>
      </article>
    )
  }

  const timeUnits = [
    { value: timeLeft.days, label: 'Jours', color: 'from-indigo-500 to-violet-600' },
    { value: timeLeft.hours, label: 'Heures', color: 'from-violet-500 to-purple-600' },
    { value: timeLeft.minutes, label: 'Minutes', color: 'from-purple-500 to-pink-600' },
    { value: timeLeft.seconds, label: 'Secondes', color: 'from-pink-500 to-rose-600' }
  ]

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <p className="text-sm font-medium text-indigo-600">Compte à rebours</p>
        <h3 className="text-xl font-semibold">Temps restant avant ta soutenance</h3>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {timeUnits.map((unit) => (
          <div key={unit.label} className="text-center">
            <div className={`mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${unit.color} text-white shadow-lg`}>
              <span className="text-2xl font-bold">{unit.value}</span>
            </div>
            <p className="text-xs font-medium text-slate-600">{unit.label}</p>
          </div>
        ))}
      </div>
      {timeLeft.days <= 7 && (
        <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-center">
          <p className="text-sm font-medium text-amber-900">
            ⚠️ Ta soutenance approche ! Assure-toi d'être bien préparé.
          </p>
        </div>
      )}
    </article>
  )
}
