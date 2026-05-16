import { useEffect, useState } from 'react'
import api from '../../services/api'

export default function LoginHistory() {
  const [history, setHistory] = useState([])

  useEffect(() => {
    api.get('/admin/login-history').then(({ data }) => setHistory(data))
  }, [])

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-indigo-600">Administration</p>
        <h2 className="text-3xl font-bold tracking-tight">Historique des connexions</h2>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Rôle</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((entry, index) => (
                <tr key={`${entry.email}-${entry.createdAt}-${index}`}>
                  <td className="px-4 py-4 font-medium">{entry.email}</td>
                  <td className="px-4 py-4">{entry.role || '—'}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${entry.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">{new Date(entry.createdAt).toLocaleString('fr-FR')}</td>
                  <td className="px-4 py-4">{entry.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
