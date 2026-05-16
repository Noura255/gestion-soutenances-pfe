import { useState, useEffect } from 'react'

const defaultChecklist = [
  { id: 'presentation', label: 'Préparer la présentation PowerPoint/Slides', category: 'Préparation' },
  { id: 'demo', label: 'Tester la démo technique', category: 'Préparation' },
  { id: 'report', label: 'Relire le rapport final', category: 'Documents' },
  { id: 'questions', label: 'Anticiper les questions du jury', category: 'Préparation' },
  { id: 'timing', label: 'Chronométrer la présentation (15-20 min)', category: 'Préparation' },
  { id: 'backup', label: 'Préparer une clé USB de secours', category: 'Technique' },
  { id: 'dress', label: 'Préparer une tenue professionnelle', category: 'Logistique' },
  { id: 'location', label: 'Repérer la salle de soutenance', category: 'Logistique' },
  { id: 'equipment', label: 'Vérifier le matériel (câbles, adaptateurs)', category: 'Technique' },
  { id: 'sleep', label: 'Bien dormir la veille', category: 'Bien-être' }
]

export default function StudentDefenseChecklist() {
  const [checklist, setChecklist] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem('defense-checklist')
    if (saved) {
      try {
        setChecklist(JSON.parse(saved))
      } catch (e) {
        setChecklist(defaultChecklist.map(item => ({ ...item, checked: false })))
      }
    } else {
      setChecklist(defaultChecklist.map(item => ({ ...item, checked: false })))
    }
  }, [])

  function toggleItem(id) {
    const updated = checklist.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    )
    setChecklist(updated)
    localStorage.setItem('defense-checklist', JSON.stringify(updated))
  }

  const categories = [...new Set(checklist.map(item => item.category))]
  const completedCount = checklist.filter(item => item.checked).length
  const totalCount = checklist.length
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <p className="text-sm font-medium text-indigo-600">Checklist de préparation</p>
        <h3 className="text-xl font-semibold">Prépare ta soutenance</h3>
      </div>

      {/* Barre de progression */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">Progression</span>
          <span className="font-bold text-indigo-600">{completedCount}/{totalCount} ({progressPercentage}%)</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Checklist par catégorie */}
      <div className="space-y-4">
        {categories.map(category => {
          const categoryItems = checklist.filter(item => item.category === category)
          const categoryCompleted = categoryItems.filter(item => item.checked).length

          return (
            <div key={category}>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{category}</p>
                <span className="text-xs text-slate-400">{categoryCompleted}/{categoryItems.length}</span>
              </div>
              <div className="space-y-2">
                {categoryItems.map(item => (
                  <label
                    key={item.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition-all ${
                      item.checked
                        ? 'border-indigo-200 bg-indigo-50'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleItem(item.id)}
                      className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className={`text-sm ${item.checked ? 'text-slate-500 line-through' : 'text-slate-700'}`}>
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {progressPercentage === 100 && (
        <div className="mt-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4 text-center">
          <p className="font-semibold text-emerald-900">🎉 Félicitations !</p>
          <p className="mt-1 text-sm text-emerald-700">Tu es prêt pour ta soutenance !</p>
        </div>
      )}
    </article>
  )
}
