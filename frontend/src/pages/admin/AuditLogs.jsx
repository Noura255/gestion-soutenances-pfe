import { useEffect, useState } from 'react'
import api from '../../services/api'

export default function AuditLogs() {
  const [logs, setLogs] = useState([])

  useEffect(() => {
    api.get('/admin/logs').then(({ data }) => setLogs(data))
  }, [])

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-indigo-600">Administration</p>
        <h2 className="text-3xl font-bold tracking-tight">Logs système</h2>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Module</th>
                <th className="px-4 py-3">Utilisateur</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-4 font-medium">{log.action}</td>
                  <td className="px-4 py-4">{log.module}</td>
                  <td className="px-4 py-4">{log.performedBy}</td>
                  <td className="px-4 py-4">{new Date(log.createdAt).toLocaleString('fr-FR')}</td>
                  <td className="px-4 py-4">{log.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
