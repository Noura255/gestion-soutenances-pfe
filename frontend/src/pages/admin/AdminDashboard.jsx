import { useEffect, useMemo, useState } from 'react'
import api from '../../services/api'
import { downloadFromApi } from '../../services/download'

const summaryCards = [
  { key: 'totalUsers', label: 'Utilisateurs' },
  { key: 'activeUsers', label: 'Comptes actifs' },
  { key: 'disabledUsers', label: 'Comptes désactivés' },
  { key: 'totalProjects', label: 'Projets' },
  { key: 'totalDefenses', label: 'Soutenances' },
  { key: 'failedLoginCount', label: 'Échecs login' },
]

const severityClasses = {
  LOW: 'bg-slate-100 text-slate-700',
  MEDIUM: 'bg-amber-100 text-amber-800',
  HIGH: 'bg-rose-100 text-rose-700',
}

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [ignoredAlerts, setIgnoredAlerts] = useState([])

  async function load() {
    const { data } = await api.get('/admin/dashboard')
    setDashboard(data)
  }

  useEffect(() => {
    load()
  }, [])

  const visibleAlerts = useMemo(
    () => dashboard?.securityAlerts.filter((alert) => !ignoredAlerts.includes(alert.email)) || [],
    [dashboard, ignoredAlerts],
  )

  async function disableUser(alert) {
    if (!alert.userId) return
    await api.put(`/admin/users/${alert.userId}/disable`)
    await load()
  }

  if (!dashboard) {
    return <div className="rounded-3xl bg-white p-6 shadow-sm">Chargement du dashboard...</div>
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-indigo-600">Administration</p>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard intelligent</h2>
        </div>
        <button onClick={() => downloadFromApi('/admin/backup', 'sg-soutenance-backup.json')} className="rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white">
          Sauvegarde JSON
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {summaryCards.map((card) => (
          <article key={card.key} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-3 text-3xl font-bold">{dashboard[card.key]}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold">Alertes intelligentes</h3>
            <span className="text-sm text-slate-500">{visibleAlerts.length} active(s)</span>
          </div>
          <div className="space-y-3">
            {visibleAlerts.map((alert) => (
              <div key={alert.email} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${severityClasses[alert.severity] || severityClasses.LOW}`}>{alert.severity}</span>
                  <span className="font-semibold">{alert.email}</span>
                  <span className="text-sm text-slate-500">{alert.failedAttempts} échec(s)</span>
                </div>
                <p className="mt-3 text-sm text-slate-700">{alert.message}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button disabled={!alert.userId} onClick={() => disableUser(alert)} className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-300">
                    Désactiver le compte
                  </button>
                  <button onClick={() => setIgnoredAlerts((current) => [...current, alert.email])} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold">
                    Ignorer
                  </button>
                </div>
              </div>
            ))}
            {visibleAlerts.length === 0 && <p className="text-slate-500">Aucune alerte répétée active.</p>}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold">Utilisateurs par rôle</h3>
          <div className="mt-4 space-y-3">
            {Object.entries(dashboard.usersByRole).map(([role, total]) => (
              <div key={role} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="font-medium">{role}</span>
                <span className="text-lg font-bold">{total}</span>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold">Dernières connexions échouées</h3>
          <div className="mt-4 space-y-3">
            {dashboard.latestFailedLogins.map((entry, index) => (
              <div key={`${entry.email}-${entry.createdAt}-${index}`} className="rounded-2xl bg-rose-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{entry.email}</span>
                  <span className="text-sm text-slate-500">{new Date(entry.createdAt).toLocaleString('fr-FR')}</span>
                </div>
                <p className="mt-2 text-sm text-rose-800">{entry.description}</p>
              </div>
            ))}
            {dashboard.latestFailedLogins.length === 0 && <p className="text-slate-500">Aucune connexion échouée récente.</p>}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold">Suggestions du chatbot</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {dashboard.chatbotSuggestions.map((suggestion) => (
              <span key={suggestion} className="rounded-full bg-indigo-50 px-4 py-2 text-sm text-indigo-700">{suggestion}</span>
            ))}
          </div>
        </article>
      </div>

      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold">Derniers logs système</h3>
          <span className="text-sm text-slate-500">10 plus récents</span>
        </div>
        <div className="space-y-3">
          {dashboard.latestLogs.map((log) => (
            <div key={log.id} className="rounded-2xl bg-slate-50 p-4">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-full bg-indigo-100 px-3 py-1 font-medium text-indigo-700">{log.action}</span>
                <span className="font-medium">{log.module}</span>
                <span className="text-slate-500">par {log.performedBy}</span>
              </div>
              <p className="mt-2 text-slate-700">{log.description}</p>
            </div>
          ))}
        </div>
      </article>
    </section>
  )
}
