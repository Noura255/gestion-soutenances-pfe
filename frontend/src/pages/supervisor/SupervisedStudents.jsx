import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Eye, CheckCircle, AlertCircle, Clock, Search, ArrowLeft } from 'lucide-react'
import api from '../../services/api'

export default function SupervisedStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get('/supervisor/students')
        setStudents(response.data)
      } catch (err) {
        setError("Erreur lors du chargement des étudiants.")
      } finally {
        setLoading(false)
      }
    }
    fetchStudents()
  }, [])

  const getStatusBadge = (status) => {
    const badges = {
      'NOT_SUBMITTED': { label: 'Non déposé', icon: Clock, bg: 'bg-slate-100 text-slate-600' },
      'SUBMITTED_TO_SUPERVISOR': { label: 'En attente', icon: AlertCircle, bg: 'bg-orange-100 text-orange-700' },
      'NEEDS_CORRECTION': { label: 'À corriger', icon: AlertCircle, bg: 'bg-red-100 text-red-700' },
      'APPROVED_BY_SUPERVISOR': { label: 'Approuvé', icon: CheckCircle, bg: 'bg-emerald-100 text-emerald-700' },
      'VISIBLE_TO_JURY': { label: 'Visible au jury', icon: Eye, bg: 'bg-purple-100 text-purple-700' },
    }
    const badge = badges[status] || { label: status || 'Inconnu', icon: Clock, bg: 'bg-slate-100 text-slate-700' }
    const Icon = badge.icon
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg}`}>
        <Icon size={13} /> {badge.label}
      </span>
    )
  }

  const filteredStudents = students.filter(s =>
    s.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.major?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-slate-200 rounded-lg animate-pulse" />
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />)}
        </div>
      </div>
    )
  }

  if (error) return <div className="p-8 text-center text-red-500 bg-red-50 rounded-2xl">{error}</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link to="/supervisor/dashboard" className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Mes étudiants encadrés</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {students.length} étudiant{students.length > 1 ? 's' : ''} sous votre supervision
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Rechercher par nom, sujet ou filière..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-700 text-xs uppercase tracking-wider">Étudiant</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-xs uppercase tracking-wider">Sujet</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-xs uppercase tracking-wider">Filière</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-xs uppercase tracking-wider">Statut Rapport</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-xs uppercase tracking-wider">Jury</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-xs uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <FileText size={36} className="text-slate-200 mx-auto mb-3" />
                    <p className="text-sm text-slate-500 font-medium">
                      {searchTerm ? 'Aucun résultat trouvé.' : 'Aucun étudiant ne vous est assigné.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.projectId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{student.studentName}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{student.studentEmail}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-[220px] truncate" title={student.projectTitle}>
                      {student.projectTitle}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{student.major || '—'}</td>
                    <td className="px-6 py-4">{getStatusBadge(student.reportStatus)}</td>
                    <td className="px-6 py-4">
                      {student.juryAssigned ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-medium text-xs">
                          <CheckCircle size={14} /> Affecté
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">Non affecté</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {student.reportId ? (
                        <Link 
                          to={`/supervisor/reports/${student.reportId}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-medium transition-colors"
                        >
                          <FileText size={14} /> Consulter
                        </Link>
                      ) : (
                        <span className="text-slate-300 text-xs italic">Pas de rapport</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
