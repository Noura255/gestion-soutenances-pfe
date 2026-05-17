export default function StatCard({ label, value, accent = 'indigo', icon }) {
  const accents = {
    indigo: 'from-indigo-500 to-indigo-700',
    emerald: 'from-emerald-500 to-emerald-700',
    amber: 'from-amber-500 to-amber-700',
    rose: 'from-rose-500 to-rose-700',
    violet: 'from-violet-500 to-violet-700',
    slate: 'from-slate-500 to-slate-700',
    sky: 'from-sky-500 to-sky-700',
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-3xl font-bold tracking-tight text-slate-950">{value ?? '—'}</p>
          <p className="mt-1 text-sm text-slate-500">{label}</p>
        </div>
        <div className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br text-xl text-white ${accents[accent] || accents.indigo}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
