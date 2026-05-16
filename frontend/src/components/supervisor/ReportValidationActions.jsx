import { useState } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Eye, Loader2, MessageSquare, X } from 'lucide-react'
import api from '../../services/api'

export default function ReportValidationActions({ reportId, currentStatus, juryAssigned, onActionSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [actionType, setActionType] = useState(null)
  const [comment, setComment] = useState('')

  const actionLabels = {
    'approve': { label: 'Approuver', verb: 'valider', color: 'bg-emerald-600 hover:bg-emerald-700' },
    'request-correction': { label: 'Demander correction', verb: 'demander une correction pour', color: 'bg-orange-500 hover:bg-orange-600' },
    'reject': { label: 'Refuser', verb: 'refuser', color: 'bg-red-600 hover:bg-red-700' },
  }

  const handleActionClick = (type) => {
    setActionType(type)
    setComment('')
    setError('')
    setSuccess('')
    setShowModal(true)
  }

  const submitAction = async () => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      await api.put(`/supervisor/reports/${reportId}/${actionType}`, { comment: comment || null })
      setShowModal(false)
      setSuccess(`Action "${actionLabels[actionType]?.label}" effectuée avec succès.`)
      setTimeout(() => onActionSuccess(), 500)
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue lors de l'action.")
    } finally {
      setLoading(false)
    }
  }

  const activateVisibility = async () => {
    if (!window.confirm("Voulez-vous vraiment rendre ce rapport visible au jury ?\nCette action est irréversible.")) return
    
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      await api.put(`/supervisor/reports/${reportId}/activate-visibility`)
      setSuccess("Rapport rendu visible au jury avec succès.")
      setTimeout(() => onActionSuccess(), 500)
    } catch (err) {
      setError(err.response?.data?.message || "Impossible d'activer la visibilité.")
    } finally {
      setLoading(false)
    }
  }

  const hasActions = 
    currentStatus === 'SUBMITTED_TO_SUPERVISOR' || 
    currentStatus === 'NEEDS_CORRECTION' || 
    currentStatus === 'APPROVED_BY_SUPERVISOR'

  if (!hasActions && currentStatus === 'VISIBLE_TO_JURY') {
    return (
      <div className="bg-purple-50 p-5 rounded-2xl border border-purple-100">
        <div className="flex items-center gap-3">
          <Eye size={20} className="text-purple-600" />
          <div>
            <p className="text-sm font-semibold text-purple-900">Rapport visible au jury</p>
            <p className="text-xs text-purple-600 mt-0.5">Ce rapport est maintenant accessible aux membres du jury affectés.</p>
          </div>
        </div>
      </div>
    )
  }

  if (!hasActions) return null

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <h3 className="text-base font-semibold text-slate-900 mb-4">Actions de validation</h3>
      
      {error && (
        <div className="mb-4 p-3.5 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-start gap-2">
          <XCircle size={16} className="mt-0.5 flex-shrink-0" /> {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3.5 bg-emerald-50 text-emerald-600 rounded-xl text-sm border border-emerald-100 flex items-start gap-2">
          <CheckCircle size={16} className="mt-0.5 flex-shrink-0" /> {success}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {/* Approve: available for SUBMITTED_TO_SUPERVISOR and NEEDS_CORRECTION */}
        {(currentStatus === 'SUBMITTED_TO_SUPERVISOR' || currentStatus === 'NEEDS_CORRECTION') && (
          <button
            onClick={() => handleActionClick('approve')}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium transition-all disabled:opacity-50 text-sm shadow-sm hover:shadow-md"
          >
            <CheckCircle size={16} /> Approuver le rapport
          </button>
        )}

        {/* Request correction: only SUBMITTED_TO_SUPERVISOR */}
        {currentStatus === 'SUBMITTED_TO_SUPERVISOR' && (
          <button
            onClick={() => handleActionClick('request-correction')}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 font-medium transition-all disabled:opacity-50 text-sm shadow-sm hover:shadow-md"
          >
            <AlertTriangle size={16} /> Demander une correction
          </button>
        )}

        {/* Reject: only SUBMITTED_TO_SUPERVISOR */}
        {currentStatus === 'SUBMITTED_TO_SUPERVISOR' && (
          <button
            onClick={() => handleActionClick('reject')}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition-all disabled:opacity-50 text-sm shadow-sm hover:shadow-md"
          >
            <XCircle size={16} /> Refuser temporairement
          </button>
        )}

        {/* Activate visibility: only APPROVED_BY_SUPERVISOR */}
        {currentStatus === 'APPROVED_BY_SUPERVISOR' && (
          <button
            onClick={activateVisibility}
            disabled={loading || !juryAssigned}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-sm hover:shadow-md"
            title={!juryAssigned ? "L'administration n'a pas encore affecté de jury pour ce projet." : "Rendre le rapport visible au jury"}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />}
            Activer visibilité au Jury
          </button>
        )}
      </div>

      {/* Warning message when jury is not assigned */}
      {currentStatus === 'APPROVED_BY_SUPERVISOR' && !juryAssigned && (
        <div className="mt-4 p-3.5 bg-amber-50 text-amber-700 rounded-xl text-xs border border-amber-100 flex items-start gap-2">
          <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Visibilité non activable</p>
            <p className="mt-0.5">L'administration n'a pas encore défini les membres du jury pour ce projet. Vous serez en mesure d'activer la visibilité une fois le jury affecté.</p>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                <MessageSquare size={18} className="text-indigo-600" /> 
                {actionLabels[actionType]?.label}
              </h4>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-slate-600">
                Vous êtes sur le point de <strong>{actionLabels[actionType]?.verb}</strong> ce rapport.
                Vous pouvez ajouter un commentaire destiné à l'étudiant.
              </p>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Commentaire (optionnel)</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none h-32 bg-slate-50/50"
                  placeholder="Ex: Veuillez corriger la bibliographie page 45..."
                />
              </div>
            </div>
            <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 text-slate-600 hover:bg-slate-200 rounded-xl text-sm font-medium transition-colors"
                disabled={loading}
              >
                Annuler
              </button>
              <button 
                onClick={submitAction}
                disabled={loading}
                className={`px-5 py-2.5 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2 shadow-sm ${actionLabels[actionType]?.color || 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                {loading && <Loader2 size={15} className="animate-spin" />} Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
