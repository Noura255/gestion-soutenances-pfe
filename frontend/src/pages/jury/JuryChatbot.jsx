import { useEffect, useState } from 'react'
import api from '../../services/api'
import ChatbotBubble from '../../components/jury/ChatbotBubble'

const questions = [
  'Quels rapports sont disponibles ?',
  'Quelle est ma prochaine soutenance ?',
  'Pourquoi je ne vois pas un rapport ?',
  'Comment saisir une note ?',
]

function buildAnswer(question, dashboard, defenses) {
  if (question === questions[0]) {
    const available = defenses.filter((defense) => defense.reportStatus === 'AVAILABLE')
    if (available.length === 0) {
      return 'Aucun rapport n’est disponible pour le moment.'
    }
    return `Rapports disponibles : ${available.map((defense) => defense.projectTitle).join(', ')}.`
  }

  if (question === questions[1]) {
    const nextDefense = dashboard?.upcomingDefenses?.[0]
    if (!nextDefense) {
      return 'Aucune soutenance à venir n’est planifiée actuellement.'
    }
    const date = new Date(`${nextDefense.date}T00:00:00`).toLocaleDateString('fr-FR')
    const time = nextDefense.time ? nextDefense.time.slice(0, 5) : 'heure non définie'
    return `Votre prochaine soutenance concerne « ${nextDefense.projectTitle} » le ${date} à ${time}.`
  }

  if (question === questions[2]) {
    return 'Un rapport reste masqué tant que l’encadrant n’a pas activé sa visibilité pour le jury. Dans ce cas, le système affiche « Rapport non encore disponible ».'
  }

  return 'Saisissez les quatre notes sur 20, laissez la note finale se calculer automatiquement ou ajustez-la, choisissez la décision, puis enregistrez un brouillon ou soumettez définitivement.'
}

export default function JuryChatbot() {
  const [open, setOpen] = useState(false)
  const [dashboard, setDashboard] = useState(null)
  const [defenses, setDefenses] = useState([])
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: 'Bonjour, je peux vous aider à retrouver vos rapports, votre prochaine soutenance ou le parcours de saisie des notes.',
    },
  ])

  useEffect(() => {
    Promise.all([
      api.get('/jury/dashboard'),
      api.get('/jury/defenses'),
    ]).then(([dashboardResponse, defensesResponse]) => {
      setDashboard(dashboardResponse.data)
      setDefenses(defensesResponse.data)
    }).catch(() => {
      setMessages((current) => [
        ...current,
        { from: 'bot', text: 'Je n’arrive pas à charger les données jury pour le moment.' },
      ])
    })
  }, [])

  function ask(question) {
    const answer = buildAnswer(question, dashboard, defenses)
    setMessages((current) => [
      ...current,
      { from: 'user', text: question },
      { from: 'bot', text: answer },
    ])
  }

  return (
    <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-3">
      {open && (
        <section className="w-[360px] max-w-[calc(100vw-3rem)] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
          <div className="border-b border-slate-200 bg-slate-900 px-5 py-4 text-white">
            <p className="text-sm text-slate-300">Assistant jury</p>
            <h3 className="font-semibold">Questions rapides</h3>
          </div>

          <div className="max-h-80 space-y-3 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div
                key={`${message.from}-${index}`}
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                  message.from === 'bot'
                    ? 'bg-slate-100 text-slate-700'
                    : 'ml-auto bg-indigo-600 text-white'
                }`}
              >
                {message.text}
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 p-4">
            <div className="flex flex-wrap gap-2">
              {questions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => ask(question)}
                  className="rounded-full bg-indigo-50 px-3 py-2 text-left text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}
      <ChatbotBubble open={open} onClick={() => setOpen((current) => !current)} />
    </div>
  )
}
