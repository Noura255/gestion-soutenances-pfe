import { useEffect, useRef, useState } from 'react'
import api from '../../services/api'

export default function AdministrationChatbot() {
  const [messages, setMessages]     = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [input, setInput]           = useState('')
  const [loading, setLoading]       = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    api.get('/administration/chatbot/suggestions')
      .then(r => setSuggestions(r.data))
      .catch(() => {})

    setMessages([{
      role: 'bot',
      text: 'Bonjour ! Je suis l\'assistant administration. Posez-moi une question ou choisissez une suggestion ci-dessous.',
    }])
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (question) => {
    if (!question.trim()) return
    const q = question.trim()
    setInput('')
    setMessages(m => [...m, { role: 'user', text: q }])
    setLoading(true)
    try {
      const res = await api.post('/administration/chatbot/ask', { question: q })
      setMessages(m => [...m, { role: 'bot', text: res.data.answer }])
    } catch {
      setMessages(m => [...m, { role: 'bot', text: 'Désolé, une erreur est survenue.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    send(input)
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Chatbot Administration</h2>
        <p className="text-sm text-gray-500 mt-0.5">Posez vos questions sur l'état du système.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[520px]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-500 px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm">
                <span className="animate-pulse">En train de répondre…</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 flex flex-wrap gap-2">
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => send(s)} disabled={loading}
                className="px-3 py-1.5 text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-full hover:bg-indigo-100 disabled:opacity-50 transition-colors">
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Posez votre question…"
            disabled={loading}
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          />
          <button type="submit" disabled={loading || !input.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors">
            Envoyer
          </button>
        </form>
      </div>
    </div>
  )
}
