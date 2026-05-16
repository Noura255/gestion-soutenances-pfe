const config = {
  AVAILABLE: {
    label: 'Disponible',
    className: 'bg-emerald-100 text-emerald-700',
  },
  UNAVAILABLE: {
    label: 'Non disponible',
    className: 'bg-rose-100 text-rose-700',
  },
}

export default function ReportStatusBadge({ status }) {
  const item = config[status] || config.UNAVAILABLE
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${item.className}`}>
      {item.label}
    </span>
  )
}
