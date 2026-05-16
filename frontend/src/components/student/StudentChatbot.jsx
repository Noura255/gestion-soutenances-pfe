import { useState } from 'react'

const answers = {
  'Comment déposer mon rapport ?': "Va dans la section dépôt du rapport, choisis un fichier PDF puis clique sur « Déposer le rapport ».",
  "Pourquoi mon rapport n’est pas visible au jury ?": "Le jury ne voit le rapport qu'après approbation de l'encadrant puis activation de la visibilité.",
  'Quand est ma soutenance ?': 'La date apparaît dans la carte Soutenance dès que le planning est disponible.',
  'Qui sont les membres du jury ?': 'Les membres du jury sont affichés dans la carte Soutenance dès leur affectation.',
}

export default function StudentChatbot() {
  const [question, setQuestion] = useState('Comment déposer mon rapport ?')

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <p className="text-sm font-medium text-indigo-600">Chatbot étudiant</p>
        <h3 className="text-xl font-semibold">Aide rapide</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.keys(answers).map((item) => (
          <button key={item} onClick={() => setQuestion(item)} className={`rounded-full px-4 py-2 text-sm ${question === item ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
            {item}
          </button>
        ))}
      </div>
      <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">{answers[question]}</div>
    </article>
  )
}

