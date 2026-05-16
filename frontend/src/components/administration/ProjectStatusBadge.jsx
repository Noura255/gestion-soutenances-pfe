const STATUS_COLORS = {
  // Project
  DRAFT:       'bg-gray-100 text-gray-600',
  SUBMITTED:   'bg-blue-100 text-blue-700',
  VALIDATED:   'bg-green-100 text-green-700',
  REJECTED:    'bg-red-100 text-red-700',
  // Report
  NOT_SUBMITTED:           'bg-gray-100 text-gray-500',
  SUBMITTED_TO_SUPERVISOR: 'bg-yellow-100 text-yellow-700',
  NEEDS_CORRECTION:        'bg-orange-100 text-orange-700',
  APPROVED_BY_SUPERVISOR:  'bg-green-100 text-green-700',
  VISIBLE_TO_JURY:         'bg-purple-100 text-purple-700',
  // Defense
  NOT_SCHEDULED: 'bg-gray-100 text-gray-500',
  SCHEDULED:     'bg-blue-100 text-blue-700',
  PUBLISHED:     'bg-green-100 text-green-700',
  COMPLETED:     'bg-indigo-100 text-indigo-700',
}

const STATUS_LABELS = {
  DRAFT: 'Brouillon', SUBMITTED: 'Soumis', VALIDATED: 'Validé', REJECTED: 'Rejeté',
  NOT_SUBMITTED: 'Non soumis', SUBMITTED_TO_SUPERVISOR: 'Soumis encadrant',
  NEEDS_CORRECTION: 'Correction', APPROVED_BY_SUPERVISOR: 'Approuvé',
  VISIBLE_TO_JURY: 'Visible jury',
  NOT_SCHEDULED: 'Non planifié', SCHEDULED: 'Planifié',
  PUBLISHED: 'Publié', COMPLETED: 'Terminé',
}

export default function ProjectStatusBadge({ status }) {
  const color = STATUS_COLORS[status] || 'bg-gray-100 text-gray-600'
  const label = STATUS_LABELS[status] || status
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      {label}
    </span>
  )
}
