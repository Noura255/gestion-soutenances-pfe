import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, FileText, Calendar, Clock, User, CheckCircle, AlertCircle, Eye, Download } from 'lucide-react'
import api from '../../services/api'
import ReportValidationActions from '../../components/supervisor/ReportValidationActions'

export default function SupervisorReportDetails() {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchReport = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/supervisor/reports/${id}`)
      setReport(response.data)
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du chargement des détails du rapport.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [id])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="h-6 w-64 bg-slate-100 rounded animate-pulse" />
          <div className="h-40 bg-slate-50 rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Link to="/supervisor/students" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors">
          <ArrowLeft size={16} /> Retour aux étudiants
        </Link>
        <div className="p-8 text-center text-red-500 bg-red-50 rounded-2xl">{error}</div>
      </div>
    )
  }

  if (!report) return null

  const statusConfig = {
    'NOT_SUBMITTED': { label: 'Non déposé', icon: Clock, bg: 'bg-slate-100 text-slate-700' },
    'SUBMITTED_TO_SUPERVISOR': { label: "En attente d'approbation", icon: AlertCircle, bg: 'bg-orange-100 text-orange-700' },
    'NEEDS_CORRECTION': { label: 'À corriger', icon: AlertCircle, bg: 'bg-red-100 text-red-700' },
    'APPROVED_BY_SUPERVISOR': { label: 'Approuvé par l\'encadrant', icon: CheckCircle, bg: 'bg-emerald-100 text-emerald-700' },
    'VISIBLE_TO_JURY': { label: 'Visible au jury', icon: Eye, bg: 'bg-purple-100 text-purple-700' },
  }

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || { label: status, icon: Clock, bg: 'bg-slate-100 text-slate-700' }
    const Icon = config.icon
    return (
      <span className={`${config.bg} px-3 py-1.5 rounded-full text-sm font-medium inline-flex items-center gap-1.5`}>
        <Icon size={15} /> {config.label}
      </span>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  const pdfUrl = `http://localhost:8080/uploads/${report.fileName}`

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/supervisor/students" className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Détails du rapport</h2>
          <p className="text-sm text-slate-500">Consultez et validez le rapport déposé par l'étudiant.</p>
        </div>
      </div>

      {/* Report Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Title & Status */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">{report.projectTitle}</h3>
              <div className="flex items-center gap-2 text-slate-600 text-sm">
                <User size={16} className="text-indigo-500" />
                <span className="font-medium">{report.studentName}</span>
              </div>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2.5">
              {getStatusBadge(report.status)}
              {report.juryAssigned ? (
                <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle size={13} /> Jury affecté
                </span>
              ) : (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock size={13} /> Jury non affecté
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={15} className="text-slate-400" />
            <div>
              <span className="text-slate-400 text-xs block">Date de dépôt</span>
              <span className="text-slate-700 font-medium">{formatDate(report.uploadedAt)}</span>
            </div>
          </div>
          {report.approvedAt && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle size={15} className="text-emerald-400" />
              <div>
                <span className="text-slate-400 text-xs block">Approuvé le</span>
                <span className="text-slate-700 font-medium">{formatDate(report.approvedAt)}</span>
              </div>
            </div>
          )}
          {report.visibilityActivatedAt && (
            <div className="flex items-center gap-2 text-sm">
              <Eye size={15} className="text-purple-400" />
              <div>
                <span className="text-slate-400 text-xs block">Visible depuis le</span>
                <span className="text-slate-700 font-medium">{formatDate(report.visibilityActivatedAt)}</span>
              </div>
            </div>
          )}
        </div>

        {/* File */}
        <div className="p-6 flex flex-col items-center justify-center border-b border-slate-100">
          <div className="w-20 h-20 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
            <FileText size={36} className="text-indigo-300" />
          </div>
          <p className="text-sm font-medium text-slate-900 mb-1">{report.originalFileName || 'Document PDF'}</p>
          <p className="text-xs text-slate-400 mb-4">{report.fileName}</p>
          <div className="flex gap-3">
            <a 
              href={pdfUrl}
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
            >
              <Download size={16} /> Ouvrir le document PDF
            </a>
          </div>
        </div>

        {/* Supervisor Comment */}
        {report.supervisorComment && (
          <div className="p-6 bg-amber-50/30">
            <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock size={13} className="text-amber-600" />
              </div>
              Commentaire de l'encadrant
            </h4>
            <div className="bg-white p-4 rounded-xl border border-amber-100 text-sm text-slate-700 leading-relaxed">
              {report.supervisorComment}
            </div>
          </div>
        )}
      </div>

      {/* Validation Actions */}
      <ReportValidationActions 
        reportId={report.id} 
        currentStatus={report.status} 
        juryAssigned={report.juryAssigned}
        onActionSuccess={fetchReport}
      />
    </div>
  )
}
