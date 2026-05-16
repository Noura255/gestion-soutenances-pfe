import { useEffect, useState } from 'react'
import api from '../../services/api'

export default function JuryChatbot() {
  const [suggestions, setSuggestions] = useState([])
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/jury/chatbot/suggestions')
      .then(({ data }) => setSuggestions(data))
      .catch(() => setError('Impossible de charger les suggestions du chatbot jury.'))
  }, [])

  async function ask(value) {
    const finalQuestion = value || question
    if (!finalQuestion.trim()) return

    setLoading(true)
    setError('')

    try {
      const { data } = await api.post('/jury/chatbot/ask', { question: finalQuestion })
      setMessages((current) => [...current, data])
      setQuestion('')
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de contacter le chatbot jury.')
    } finally {
      setLoading(false)
    }
  }

  function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      ask()
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-indigo-600">Module jury</p>
        <h2 className="text-3xl font-bold tracking-tight">Chatbot jury</h2>
        <p className="mt-2 text-slate-600">
          Posez vos questions sur vos soutenances, rapports et évaluations
        </p>
      </div>

      {/* Suggestions prédéfinies */}
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-slate-50 p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <p className="text-sm font-semibold text-slate-900">Questions rapides</p>
        </div>
        <p className="mb-4 text-sm text-slate-600">
          Cliquez sur une question pour obtenir une réponse instantanée
        </p>

        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => ask(suggestion)}
              disabled={loading}
              className="rounded-full bg-white px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm transition hover:bg-indigo-100 hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Zone de conversation */}
      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-4">
          <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <h3 className="font-semibold text-slate-900">Conversation</h3>
        </div>

        <div className="min-h-[300px] space-y-4">
          {messages.length === 0 && !error && (
            <div className="flex h-[300px] items-center justify-center">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="mt-4 text-sm text-slate-500">
                  Choisissez une question prédéfinie ou posez votre propre question
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  sur vos soutenances, rapports ou évaluations
                </p>
              </div>
            </div>
          )}

          {messages.map((entry, index) => (
            <div key={`${entry.question}-${index}`} className="space-y-3">
              {/* Question de l'utilisateur */}
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl bg-slate-100 px-4 py-3">
                  <p className="text-sm font-medium text-slate-900">{entry.question}</p>
                </div>
              </div>
              
              {/* Réponse du chatbot */}
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 px-4 py-3 shadow-md">
                  <p className="text-sm leading-relaxed text-white">{entry.answer}</p>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-indigo-100 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-600" style={{ animationDelay: '0ms' }}></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-600" style={{ animationDelay: '150ms' }}></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-600" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 border border-rose-200">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-rose-700">{error}</p>
            </div>
          </div>
        )}

        {/* Zone de saisie */}
        <div className="mt-5 flex gap-3">
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ex. Quelle est ma prochaine soutenance ?"
            disabled={loading}
            className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20 disabled:bg-slate-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={() => ask()}
            disabled={loading || !question.trim()}
            className="rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Envoi...</span>
              </>
            ) : (
              <>
                <span>Envoyer</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </div>

        <p className="mt-3 text-xs text-slate-500 text-center">
          Appuyez sur Entrée pour envoyer votre question
        </p>
      </article>
    </section>
  )
}
