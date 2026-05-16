import { useEffect, useState } from 'react'
import api from '../../services/api'

export default function AdminChatbot() {
  const [suggestions, setSuggestions] = useState([])
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])

  useEffect(() => {
    api.get('/admin/chatbot/suggestions').then(({ data }) => setSuggestions(data))
  }, [])

  async function ask(value) {
    const finalQuestion = value || question
    if (!finalQuestion.trim()) return
    const { data } = await api.post('/admin/chatbot/ask', { question: finalQuestion })
    setMessages((current) => [...current, data])
    setQuestion('')
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-indigo-600">Administration</p>
        <h2 className="text-3xl font-bold tracking-tight">Chatbot admin</h2>
      </div>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <button key={suggestion} onClick={() => ask(suggestion)} className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700">
            {suggestion}
          </button>
        ))}
      </div>

      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          {messages.map((entry, index) => (
            <div key={`${entry.question}-${index}`} className="space-y-2">
              <p className="rounded-2xl bg-slate-100 px-4 py-3 font-medium">{entry.question}</p>
              <p className="rounded-2xl bg-indigo-600 px-4 py-3 text-white">{entry.answer}</p>
            </div>
          ))}
          {messages.length === 0 && <p className="text-slate-500">Posez une question sur l'état du système.</p>}
        </div>

        <div className="mt-5 flex gap-3">
          <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ex. Combien d'utilisateurs sont désactivés ?" className="flex-1 rounded-2xl border border-slate-200 px-4 py-3" />
          <button onClick={() => ask()} className="rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white">Envoyer</button>
        </div>
      </article>
    </section>
  )
}
