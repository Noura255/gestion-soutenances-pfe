import { useEffect, useState } from 'react'
import api from '../../services/api'

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/student/notifications')
      .then(({ data }) => setNotifications(data.slice(0, 5)))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Chargement des notifications...</p>
      </article>
    )
  }

  if (notifications.length === 0) {
    return (
      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <p className="text-sm font-medium text-indigo-600">Notifications</p>
          <h3 className="text-xl font-semibold">Aucune notification</h3>
        </div>
        <p className="text-sm text-slate-500">Tu es à jour ! Aucune notification pour le moment.</p>
      </article>
    )
  }

  const typeStyles = {
    INFO: 'bg-blue-50 text-blue-700 border-blue-200',
    SUCCESS: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    WARNING: 'bg-amber-50 text-amber-700 border-amber-200',
    ERROR: 'bg-red-50 text-red-700 border-red-200'
  }

  const typeIcons = {
    INFO: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    SUCCESS: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    WARNING: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    ERROR: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <p className="text-sm font-medium text-indigo-600">Notifications récentes</p>
        <h3 className="text-xl font-semibold">Dernières mises à jour</h3>
      </div>
      <div className="space-y-3">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`flex items-start gap-3 rounded-2xl border p-4 ${typeStyles[notif.type] || typeStyles.INFO}`}
          >
            <div className="shrink-0">
              {typeIcons[notif.type] || typeIcons.INFO}
            </div>
            <div className="flex-1">
              <p className="font-medium">{notif.title}</p>
              <p className="mt-1 text-sm opacity-90">{notif.message}</p>
              {notif.timestamp && (
                <p className="mt-2 text-xs opacity-75">
                  {new Date(notif.timestamp).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}
