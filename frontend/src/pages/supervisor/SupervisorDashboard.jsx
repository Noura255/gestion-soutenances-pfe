import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, FileText, CheckCircle, AlertCircle, Eye, Calendar, ArrowRight, Clock } from 'lucide-react'
import api from '../../services/api'
import SupervisorChatbot from '../../components/supervisor/SupervisorChatbot'

export default function SupervisorDashboard() {
  const [stats, setStats] = useState(null)
  const [pendingReports, setPendingReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, pendingRes] = await Promise.all([
          api.get('/supervisor/dashboard'),
          api.get('/supervisor/reports/pending')
        ])
        setStats(statsRes.data)
        setPendingReports(pendingRes.data)
      } catch (err) {
        setError("Erreur lors du chargement des données.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-slate-200 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-28 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="p-8 text-center text-red-500 bg-red-50 rounded-2xl">{error}</div>
  }

  const statCards = [
    { title: "Étudiants encadrés", value: stats?.supervisedStudentsCount ?? 0, icon: Users, color: "bg-blue-50 text-blue-600", border: "border-blue-100" },
    { title: "Rapports en attente", value: stats?.pendingReportsCount ?? 0, icon: FileText, color: "bg-orange-50 text-orange-600", border: "border-orange-100" },
    { title: "Rapports à corriger", value: stats?.toCorrectReportsCount ?? 0, icon: AlertCircle, color: "bg-red-50 text-red-600", border: "border-red-100" },
    { title: "Rapports approuvés", value: stats?.approvedReportsCount ?? 0, icon: CheckCircle, color: "bg-emerald-50 text-emerald-600", border: "border-emerald-100" },
    { title: "Prêts pour visibilité", value: stats?.readyForVisibilityReportsCount ?? 0, icon: Eye, color: "bg-purple-50 text-purple-600", border: "border-purple-100" },
    { title: "Prochaines soutenances", value: stats?.upcomingDefensesCount ?? 0, icon: Calendar, color: "bg-indigo-50 text-indigo-600", border: "border-indigo-100" }
  ]

  const formatDate = (dateString) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard Encadrant</h2>
          <p className="text-sm text-slate-500 mt-1">Vue d'ensemble de vos étudiants et de leurs rapports.</p>
        </div>
        <Link to="/supervisor/students" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md">
          <Users size={16} /> Gérer les étudiants
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon
          return (
            <div key={idx} className={`bg-white p-5 rounded-2xl shadow-sm border ${card.border} flex items-center gap-4 hover:shadow-md transition-all duration-200 group cursor-default`}>
              <div className={`p-3.5 rounded-xl ${card.color} group-hover:scale-105 transition-transform`}>
                <Icon size={22} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{card.title}</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">{card.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pending Reports Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Rapports en attente de validation</h3>
            <p className="text-xs text-slate-400 mt-0.5">Rapports déposés par vos étudiants nécessitant votre action</p>
          </div>
          {pendingReports.length > 0 && (
            <Link to="/supervisor/students" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
              Tout voir <ArrowRight size={14} />
            </Link>
          )}
        </div>
        {pendingReports.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <CheckCircle size={40} className="text-emerald-200 mx-auto mb-3" />
            <p className="text-sm text-slate-500 font-medium">Aucun rapport en attente</p>
            <p className="text-xs text-slate-400 mt-1">Tous les rapports ont été traités.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-xs text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 font-medium">Étudiant</th>
                  <th className="px-6 py-3 font-medium">Sujet PFE</th>
                  <th className="px-6 py-3 font-medium">Date de dépôt</th>
                  <th className="px-6 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pendingReports.slice(0, 5).map((report) => (
                  <tr key={report.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{report.studentName}</td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={report.projectTitle}>{report.projectTitle}</td>
                    <td className="px-6 py-4 text-slate-500 flex items-center gap-1.5">
                      <Clock size={14} className="text-slate-400" /> {formatDate(report.uploadedAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/supervisor/reports/${report.id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-xs font-medium transition-colors"
                      >
                        <FileText size={14} /> Examiner
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <SupervisorChatbot />
    </div>
  )
}
