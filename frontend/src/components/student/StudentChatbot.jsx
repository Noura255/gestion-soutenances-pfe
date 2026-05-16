import { useState, useEffect } from 'react'

const categories = {
  'Rapport': [
    {
      q: 'Comment déposer mon rapport ?',
      a: "Va dans la section dépôt du rapport, choisis un fichier PDF puis clique sur « Déposer le rapport ». Le fichier sera automatiquement envoyé à ton encadrant."
    },
    {
      q: "Pourquoi mon rapport n'est pas visible au jury ?",
      a: "Le jury ne voit le rapport qu'après approbation de l'encadrant puis activation de la visibilité. C'est une procédure en 3 étapes : dépôt → validation encadrant → visibilité jury."
    },
    {
      q: 'Puis-je modifier mon rapport après dépôt ?',
      a: "Oui, tu peux déposer une nouvelle version à tout moment. La nouvelle version remplacera l'ancienne et sera à nouveau soumise à validation."
    },
    {
      q: 'Quel format de fichier est accepté ?',
      a: "Seuls les fichiers PDF sont acceptés. Assure-toi que ton fichier ne dépasse pas 10 Mo et qu'il est bien lisible."
    }
  ],
  'Soutenance': [
    {
      q: 'Quand est ma soutenance ?',
      a: 'La date apparaît dans la carte Soutenance dès que le planning est disponible. Tu recevras également une notification par email.'
    },
    {
      q: 'Qui sont les membres du jury ?',
      a: 'Les membres du jury sont affichés dans la carte Soutenance dès leur affectation. Généralement, le jury est composé de 3 à 5 membres.'
    },
    {
      q: 'Comment me préparer à la soutenance ?',
      a: "Prépare une présentation de 15-20 minutes, révise ton rapport, anticipe les questions du jury et teste ton matériel (slides, démo) à l'avance."
    },
    {
      q: 'Puis-je changer la date de soutenance ?',
      a: "Pour toute demande de modification, contacte directement ton encadrant ou l'administration. Les changements doivent être justifiés."
    }
  ],
  'Projet': [
    {
      q: 'Comment remplir le formulaire projet ?',
      a: "Renseigne le titre, le résumé, les mots-clés et les membres du groupe. Tous les champs marqués d'un astérisque sont obligatoires."
    },
    {
      q: 'Puis-je modifier mon sujet après validation ?',
      a: "Oui, mais contacte d'abord ton encadrant. Les modifications importantes doivent être approuvées par l'administration."
    },
    {
      q: 'Comment ajouter des membres au groupe ?',
      a: "Dans le formulaire projet, saisis les noms des membres séparés par des virgules dans le champ 'Membres du groupe'."
    }
  ],
  'Général': [
    {
      q: 'Comment contacter mon encadrant ?',
      a: "Les coordonnées de ton encadrant sont disponibles dans ton dashboard. Tu peux également le contacter via l'administration."
    },
    {
      q: 'Où voir mes notifications ?',
      a: "Les notifications importantes s'affichent dans ton dashboard. Tu reçois également des emails pour les événements majeurs."
    },
    {
      q: 'Que faire en cas de problème technique ?',
      a: "Contacte le support technique via l'administration ou envoie un email décrivant ton problème. Joins des captures d'écran si possible."
    }
  ]
}

export default function StudentChatbot() {
  const [selectedCategory, setSelectedCategory] = useState('Rapport')
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [history, setHistory] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem('chatbot-history')
    if (saved) {
      try {
        setHistory(JSON.parse(saved))
      } catch (e) {
        // Ignore parsing errors
      }
    }
  }, [])

  function selectQuestion(category, item) {
    setSelectedQuestion(item)
    const newHistory = [{ category, ...item, timestamp: Date.now() }, ...history.slice(0, 4)]
    setHistory(newHistory)
    localStorage.setItem('chatbot-history', JSON.stringify(newHistory))
  }

  const allQuestions = Object.entries(categories).flatMap(([cat, items]) => 
    items.map(item => ({ category: cat, ...item }))
  )

  const filteredQuestions = searchTerm 
    ? allQuestions.filter(item => 
        item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.a.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : categories[selectedCategory]

  const displayedAnswer = selectedQuestion || (filteredQuestions[0] || allQuestions[0])

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <p className="text-sm font-medium text-indigo-600">Assistant étudiant</p>
        <h3 className="text-xl font-semibold">Aide et questions fréquentes</h3>
      </div>

      {/* Barre de recherche */}
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher une question..."
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      {!searchTerm && (
        <>
          {/* Catégories */}
          <div className="mb-4 flex flex-wrap gap-2">
            {Object.keys(categories).map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat)
                  setSelectedQuestion(null)
                }}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Historique récent */}
          {history.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Récemment consultées</p>
              <div className="flex flex-wrap gap-2">
                {history.slice(0, 3).map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedQuestion(item)}
                    className="rounded-full bg-violet-50 px-3 py-1.5 text-xs text-violet-700 hover:bg-violet-100"
                  >
                    {item.q.substring(0, 40)}...
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Questions */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {searchTerm ? `${filteredQuestions.length} résultat(s)` : 'Questions'}
        </p>
        <div className="space-y-2">
          {filteredQuestions.map((item, idx) => (
            <button
              key={idx}
              onClick={() => selectQuestion(searchTerm ? item.category : selectedCategory, item)}
              className={`w-full rounded-2xl px-4 py-3 text-left text-sm transition-colors ${
                selectedQuestion?.q === item.q
                  ? 'bg-indigo-50 text-indigo-900 ring-2 ring-indigo-200'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="font-medium">{item.q}</span>
              {searchTerm && (
                <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs text-slate-500">
                  {item.category}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Réponse */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 p-5">
        <div className="mb-2 flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="mb-2 font-semibold text-slate-900">{displayedAnswer.q}</p>
            <p className="text-sm leading-relaxed text-slate-700">{displayedAnswer.a}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 rounded-2xl bg-slate-50 p-4">
        <p className="text-xs text-slate-600">
          💡 <span className="font-semibold">Besoin d'aide supplémentaire ?</span> Contacte ton encadrant ou l'administration pour toute question spécifique à ton projet.
        </p>
      </div>
    </article>
  )
}
