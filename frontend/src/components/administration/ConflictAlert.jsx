const TYPE_LABELS = { ROOM: 'Salle', TEACHER: 'Jury', STUDENT: 'Étudiant', SUPERVISOR: 'Encadrant' }
const TYPE_COLORS = {
  ROOM:    'bg-red-50 border-red-300 text-red-800',
  TEACHER: 'bg-orange-50 border-orange-300 text-orange-800',
  STUDENT: 'bg-yellow-50 border-yellow-300 text-yellow-800',
  SUPERVISOR: 'bg-purple-50 border-purple-300 text-purple-800',
}

export default function ConflictAlert({ conflicts, onClose }) {
  if (!conflicts || conflicts.length === 0) return null
  return (
    <div className="rounded-lg border border-red-300 bg-red-50 p-4 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-red-600 text-lg">⚠️</span>
          <h3 className="font-semibold text-red-800">
            {conflicts.length} conflit(s) détecté(s)
          </h3>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-red-400 hover:text-red-600 text-xl leading-none">×</button>
        )}
      </div>
      <ul className="mt-2 space-y-1">
        {conflicts.map((c, i) => (
          <li key={i} className={`text-sm px-3 py-1 rounded border ${TYPE_COLORS[c.type] || 'bg-gray-50 border-gray-300 text-gray-700'}`}>
            <span className="font-medium">[{TYPE_LABELS[c.type] || c.type}]</span>{' '}
            {c.message || c.projectTitle} {c.projectTitle && `— ${c.projectTitle}`} — {c.startTime} → {c.endTime}
          </li>
        ))}
      </ul>
    </div>
  )
}
