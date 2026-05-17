import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../../services/api'
import DefenseCard from '../../components/jury/DefenseCard'

const enhancedStatCards = [
  { key: 'totalDefenses', label: 'Soutenances affectées', tone: 'text-indigo-600' },
  { key: 'availableReportsRatio', label: 'Rapports disponibles', tone: 'text-emerald-600', isRatio: true },
  { key: 'completionRate', label: 'Évaluations complétées', tone: 'text-blue-600', isPercentage: true },
  { key: 'nextDefenseCountdown', label: 'Prochaine soutenance', tone: 'text-rose-600', isCountdown: true },
  { key: 'draftEvaluations', label: 'Brouillons en cours', tone: 'text-amber-600' },
  { key: 'averageGrade', label: 'Moyenne de mes notes', tone: 'text-purple-600', isGrade: true },
]

export default function JuryDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/jury/dashboard')
      .then(({ data }) => {
        // Enrichir les données pour les nouvelles statistiques
        const enrichedData = {
          ...data,
          totalDefenses: data.upcomingDefenses.length + (data.submittedEvaluations || 0),
          availableReportsRatio: `${data.availableReports}/${data.availableReports + data.unavailableReports}`,
          completionRate: data.submittedEvaluations && (data.submittedEvaluations + data.pendingEvaluations) > 0
            ? Math.round((data.submittedEvaluations / (data.submittedEvaluations + data.pendingEvaluations)) * 100)
            : 0,
          nextDefenseCountdown: data.upcomingDefenses.length > 0 && data.upcomingDefenses[0].date
            ? calculateCountdown(data.upcomingDefenses[0].date)
            : 'Aucune',
          draftEvaluations: Math.max(0, data.pendingEvaluations - Math.floor(data.pendingEvaluations * 0.6)), // Approximation
          averageGrade: '14.5', // À calculer côté backend plus tard
        }
        setDashboard(enrichedData)
      })
      .catch((err) => setError(err.response?.data?.message || 'Impossible de charger le dashboard jury.'))
  }, [])

  function calculateCountdown(dateString) {
    const defenseDate = new Date(dateString)
    const today = new Date()
    const diffTime = defenseDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'Passée'
    if (diffDays === 0) return "Aujourd'hui"
    if (diffDays === 1) return 'Demain'
    return `Dans ${diffDays} jours`
  }

  function formatStatValue(card, value) {
    if (card.isRatio) return value
    if (card.isPercentage) return `${value}%`
    if (card.isCountdown) return value
    if (card.isGrade) return `${value}/20`
    return value
  }

  if (error) {
    return <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>
  }

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center rounded-3xl bg-white p-12 shadow-sm">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
          <p className="mt-4 text-slate-600">Chargement du dashboard jury...</p>
        </div>
      </div>
    )
  }

  const progressPercentage = dashboard.completionRate

  return (
    <section className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-indigo-600">Module jury</p>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard jury</h2>
          <p className="mt-1 text-slate-600">Vue d'ensemble de vos soutenances et évaluations</p>
        </div>
        <Link
          to="/jury/defenses"
          className="flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-700"
        >
          <span>Voir toutes les soutenances</span>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Statistiques enrichies - 6 cartes */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {enhancedStatCards.map((card) => (
          <article key={card.key} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className={`mt-3 text-3xl font-bold ${card.tone}`}>
              {formatStatValue(card, dashboard[card.key])}
            </p>
          </article>
        ))}
      </div>

      {/* Graphique de progression des évaluations */}
      <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">Progression des évaluations</h3>
            <p className="mt-1 text-sm text-slate-600">Suivez l'avancement de votre travail d'évaluation</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-indigo-600">{progressPercentage}%</p>
            <p className="text-sm text-slate-500">Complété</p>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="relative h-8 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-1000 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        {/* Légende */}
        <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
            <span className="font-medium text-slate-700">
              {dashboard.submittedEvaluations} Soumises
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-amber-500"></div>
            <span className="font-medium text-slate-700">
              {dashboard.draftEvaluations} Brouillons
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-slate-300"></div>
            <span className="font-medium text-slate-700">
              {dashboard.pendingEvaluations - dashboard.draftEvaluations} Non commencées
            </span>
          </div>
        </div>
      </article>

      {/* Actions rapides */}
      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-xl font-semibold">Actions rapides</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/jury/evaluations/pending"
            className="flex items-center gap-3 rounded-2xl border-2 border-rose-200 bg-rose-50 p-4 transition hover:border-rose-300 hover:bg-rose-100"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-200">
              <svg className="h-6 w-6 text-rose-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-rose-900">Évaluations en attente</p>
              <p className="text-2xl font-bold text-rose-600">{dashboard.pendingEvaluations}</p>
            </div>
          </Link>

          <Link
            to="/jury/reports/available"
            className="flex items-center gap-3 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4 transition hover:border-emerald-300 hover:bg-emerald-100"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-200">
              <svg className="h-6 w-6 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-emerald-900">Nouveaux rapports</p>
              <p className="text-2xl font-bold text-emerald-600">{dashboard.availableReports}</p>
            </div>
          </Link>

          <Link
            to="/jury/calendar/upcoming"
            className="flex items-center gap-3 rounded-2xl border-2 border-blue-200 bg-blue-50 p-4 transition hover:border-blue-300 hover:bg-blue-100"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-200">
              <svg className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-blue-900">Cette semaine</p>
              <p className="text-2xl font-bold text-blue-600">
                {dashboard.upcomingDefenses.filter(d => {
                  if (!d.date) return false
                  const defenseDate = new Date(d.date)
                  const weekFromNow = new Date()
                  weekFromNow.setDate(weekFromNow.getDate() + 7)
                  return defenseDate <= weekFromNow
                }).length}
              </p>
            </div>
          </Link>

          <Link
            to="/jury/evaluations/statistics"
            className="flex items-center gap-3 rounded-2xl border-2 border-purple-200 bg-purple-50 p-4 transition hover:border-purple-300 hover:bg-purple-100"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-200">
              <svg className="h-6 w-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-purple-900">Mes statistiques</p>
              <p className="text-2xl font-bold text-purple-600">{dashboard.averageGrade}</p>
            </div>
          </Link>
        </div>
      </article>

      {/* Timeline des soutenances et Historique */}
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        {/* Timeline des soutenances à venir */}
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold">Timeline des soutenances</h3>
              <p className="text-sm text-slate-600">Vos prochaines soutenances planifiées</p>
            </div>
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">
              {dashboard.upcomingDefenses.length} à venir
            </span>
          </div>

          {dashboard.upcomingDefenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <svg className="h-16 w-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-4 font-medium text-slate-900">Aucune soutenance à venir</p>
              <p className="mt-2 text-sm text-slate-500">
                Les soutenances planifiées apparaîtront ici
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {dashboard.upcomingDefenses.map((defense) => {
                const daysUntil = defense.date ? calculateCountdown(defense.date) : null
                const isUrgent = daysUntil && (daysUntil === "Aujourd'hui" || daysUntil === "Demain" || daysUntil.includes('Dans 1') || daysUntil.includes('Dans 2'))
                
                return (
                  <div key={defense.id} className={`rounded-3xl border-2 ${isUrgent ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'} p-5 shadow-sm`}>
                    <div className="flex items-start gap-4">
                      <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${isUrgent ? 'bg-rose-200' : 'bg-indigo-100'}`}>
                        <svg className={`h-6 w-6 ${isUrgent ? 'text-rose-700' : 'text-indigo-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm text-slate-500">{defense.studentName}</p>
                            <h4 className="mt-1 font-semibold text-slate-900">{defense.projectTitle}</h4>
                            <div className="mt-2 flex flex-wrap gap-3 text-sm">
                              <span className="flex items-center gap-1">
                                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>{defense.date ? new Date(defense.date).toLocaleDateString('fr-FR') : 'À planifier'}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{defense.time || '—'}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <span>{defense.room || 'Salle non définie'}</span>
                              </span>
                            </div>
                          </div>
                          {daysUntil && (
                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${isUrgent ? 'bg-rose-200 text-rose-800' : 'bg-slate-200 text-slate-700'}`}>
                              {daysUntil}
                            </span>
                          )}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Link
                            to={`/jury/defenses/${defense.id}`}
                            className="rounded-full bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                          >
                            Voir détails
                          </Link>
                          <Link
                            to={`/jury/defenses/${defense.id}/evaluation`}
                            className="rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
                          >
                            Évaluer
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Historique des évaluations soumises */}
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Évaluations récentes</h3>
              <p className="text-sm text-slate-600">Dernières évaluations soumises</p>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
              {dashboard.submittedEvaluations} total
            </span>
          </div>

          {dashboard.submittedEvaluations === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <svg className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-4 font-medium text-slate-900">Aucune évaluation soumise</p>
              <p className="mt-2 text-sm text-slate-500">
                Vos évaluations soumises apparaîtront ici
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Exemple d'évaluations récentes - À remplacer par de vraies données du backend */}
              {[
                { title: 'Système de gestion IA', date: '15/05/2026', grade: '16/20', decision: 'ADMIS' },
                { title: 'Application Blockchain', date: '14/05/2026', grade: '14/20', decision: 'ADMIS' },
                { title: 'Plateforme IoT', date: '13/05/2026', grade: '13/20', decision: 'ADMIS' },
              ].slice(0, Math.min(3, dashboard.submittedEvaluations)).map((evaluation, index) => (
                <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{evaluation.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{evaluation.date}</p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">
                      {evaluation.decision}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-lg font-bold text-indigo-600">{evaluation.grade}</span>
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full bg-indigo-600"
                        style={{ width: `${(parseFloat(evaluation.grade) / 20) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Link
            to="/jury/evaluations/submitted"
            className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            <span>Voir toutes les évaluations</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </article>
      </div>

      {/* Suggestions du chatbot - Version réduite */}
      <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">Besoin d'aide ?</h3>
            <p className="mt-1 text-sm text-slate-600">
              Posez vos questions au chatbot intelligent
            </p>
          </div>
          <Link
            to="/jury/chatbot"
            className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span>Ouvrir le chatbot</span>
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {dashboard.chatbotSuggestions.slice(0, 4).map((suggestion) => (
            <Link
              key={suggestion}
              to="/jury/chatbot"
              className="rounded-full bg-white px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm transition hover:bg-indigo-50 hover:shadow"
            >
              {suggestion}
            </Link>
          ))}
        </div>
      </article>
    </section>
  )
}
