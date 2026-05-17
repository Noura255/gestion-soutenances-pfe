export default function AlertMessage({ tone = 'info', children }) {
  const tones = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    error: 'border-rose-200 bg-rose-50 text-rose-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-700',
    info: 'border-sky-200 bg-sky-50 text-sky-700',
  }

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${tones[tone] || tones.info}`}>
      {children}
    </div>
  )
}
