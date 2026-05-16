import { useState } from 'react'
import api from '../../services/api'

export default function ImportUsers() {
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event) {
    event.preventDefault()
    if (!file) return
    setLoading(true)
    setError('')
    const formData = new FormData()
    formData.append('file', file)
    try {
      const { data } = await api.post('/admin/users/import', formData)
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.message || "Import impossible.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-indigo-600">Administration</p>
        <h2 className="text-3xl font-bold tracking-tight">Import utilisateurs</h2>
      </div>

      <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">
          Déposez un fichier CSV ou Excel contenant : firstName, lastName, email, role, department, phone.
        </p>
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
          className="mt-5 block w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm"
        />
        {error && <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
        <button disabled={!file || loading} className="mt-5 rounded-2xl bg-indigo-600 px-5 py-3 font-semibold text-white disabled:bg-indigo-300">
          {loading ? 'Import...' : 'Importer'}
        </button>
      </form>

      {result && (
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold">Résultat</h3>
          <p className="mt-3 text-emerald-700">{result.importedCount} utilisateur(s) importé(s).</p>
          <div className="mt-5 space-y-2">
            {result.ignoredRows.map((row) => (
              <div key={`${row.rowNumber}-${row.email}`} className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Ligne {row.rowNumber} · {row.email || 'email vide'} — {row.reason}
              </div>
            ))}
            {result.ignoredRows.length === 0 && <p className="text-sm text-slate-500">Aucune ligne ignorée.</p>}
          </div>
        </article>
      )}
    </section>
  )
}
