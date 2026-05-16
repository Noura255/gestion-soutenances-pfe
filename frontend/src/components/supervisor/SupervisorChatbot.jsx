import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User } from 'lucide-react'

export default function SupervisorChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { text: "Bonjour ! 👋 Je suis votre assistant encadrant. Cliquez sur une question ci-dessous ou posez la vôtre.", sender: 'bot' }
  ])
  const [inputText, setInputText] = useState('')
  const messagesEndRef = useRef(null)

  const predefinedQuestions = [
    "Quels rapports sont en attente ?",
    "Comment approuver un rapport ?",
    "Pourquoi je ne peux pas activer la visibilité ?",
    "Quels étudiants n'ont pas encore déposé ?"
  ]

  const answers = {
    "Quels rapports sont en attente ?":
      "Les rapports en attente sont ceux avec le statut « En attente » (SUBMITTED_TO_SUPERVISOR). Consultez votre Dashboard ou la page « Mes Étudiants » pour les retrouver. Cliquez sur « Consulter » pour voir les détails et valider.",
    "Comment approuver un rapport ?":
      "Pour approuver un rapport :\n1. Allez dans « Mes Étudiants »\n2. Cliquez sur « Consulter » à côté de l'étudiant\n3. Lisez le rapport PDF\n4. Cliquez sur « Approuver le rapport »\n5. Ajoutez un commentaire si vous le souhaitez\n6. Confirmez l'action",
    "Pourquoi je ne peux pas activer la visibilité ?":
      "La visibilité au jury ne peut être activée que si les deux conditions suivantes sont remplies :\n\n✅ Le rapport est approuvé (statut APPROVED_BY_SUPERVISOR)\n✅ L'administration a affecté les membres du jury au projet\n\nSi le bouton est grisé, c'est que l'une de ces conditions n'est pas remplie.",
    "Quels étudiants n'ont pas encore déposé ?":
      "Les étudiants avec le statut « Non déposé » dans votre liste n'ont pas encore soumis leur rapport. Vous pouvez les identifier dans la page « Mes Étudiants » — leur colonne « Statut Rapport » affichera une icône grise « Non déposé »."
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (text) => {
    if (!text.trim()) return
    setMessages(prev => [...prev, { text, sender: 'user' }])
    setInputText('')

    setTimeout(() => {
      let reply = answers[text]
      if (!reply) {
        // Simple keyword matching for free-text input
        const lower = text.toLowerCase()
        if (lower.includes('attente') || lower.includes('pending')) {
          reply = answers["Quels rapports sont en attente ?"]
        } else if (lower.includes('approuver') || lower.includes('valider') || lower.includes('accepter')) {
          reply = answers["Comment approuver un rapport ?"]
        } else if (lower.includes('visibilité') || lower.includes('jury') || lower.includes('visible')) {
          reply = answers["Pourquoi je ne peux pas activer la visibilité ?"]
        } else if (lower.includes('déposé') || lower.includes('soumis') || lower.includes('pas encore')) {
          reply = answers["Quels étudiants n'ont pas encore déposé ?"]
        } else if (lower.includes('bonjour') || lower.includes('salut') || lower.includes('hello')) {
          reply = "Bonjour ! Comment puis-je vous aider aujourd'hui ? Vous pouvez cliquer sur les suggestions ci-dessous."
        } else if (lower.includes('merci')) {
          reply = "De rien ! N'hésitez pas si vous avez d'autres questions. 😊"
        } else {
          reply = "Je n'ai pas compris votre question. Essayez l'une des suggestions ci-dessous, ou reformulez avec des mots-clés comme « attente », « approuver », « visibilité » ou « déposé »."
        }
      }
      setMessages(prev => [...prev, { text: reply, sender: 'bot' }])
    }, 400)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(inputText)
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-lg transition-all z-50 ${
          isOpen ? 'bg-slate-700 hover:bg-slate-800 rotate-0' : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105'
        }`}
      >
        {isOpen ? <X size={22} className="text-white" /> : <MessageCircle size={22} className="text-white" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-50 animate-in" style={{ height: '520px' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <Bot size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Assistant Encadrant</h3>
              <p className="text-indigo-200 text-xs">Toujours disponible pour vous aider</p>
            </div>
          </div>
          
          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-slate-50/80">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  msg.sender === 'user' ? 'bg-indigo-100' : 'bg-white border border-slate-200'
                }`}>
                  {msg.sender === 'user' ? <User size={13} className="text-indigo-600" /> : <Bot size={13} className="text-slate-500" />}
                </div>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                  msg.sender === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-sm' 
                    : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          <div className="px-3 py-2 border-t border-slate-100 bg-white">
            <div className="flex flex-wrap gap-1.5">
              {predefinedQuestions.map((q, idx) => (
                <button 
                  key={idx} 
                  onClick={() => handleSend(q)}
                  className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-2.5 py-1.5 rounded-lg font-medium transition-colors text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tapez votre question..."
              className="flex-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-slate-50/50"
            />
            <button
              onClick={() => handleSend(inputText)}
              disabled={!inputText.trim()}
              className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
