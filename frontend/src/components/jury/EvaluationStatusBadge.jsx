const config = {
  NOT_STARTED: {
    label: 'Non commencé',
    className: 'bg-slate-100 text-slate-700',
  },
  DRAFT: {
    label: 'Brouillon',
    className: 'bg-amber-100 text-amber-800',
  },
  SUBMITTED: {
    label: 'Soumise',
    className: 'bg-emerald-100 text-emerald-700',
  },
}

export default function EvaluationStatusBadge({ status }) {
  const item = config[status] || config.NOT_STARTED
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${item.className}`}>
      {item.label}
    </span>
  )
}
