export default function StudentDefenseInfo({ defense }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <p className="text-sm font-medium text-indigo-600">Soutenance</p>
        <h3 className="text-xl font-semibold">Planning</h3>
      </div>
      {!defense ? (
        <p className="text-slate-500">Aucune soutenance planifiée pour le moment.</p>
      ) : (
        <div className="space-y-3 text-sm">
          <p><span className="font-semibold">Date :</span> {defense.date || 'À définir'}</p>
          <p><span className="font-semibold">Heure :</span> {defense.startTime ? `${defense.startTime} - ${defense.endTime || ''}` : 'À définir'}</p>
          <p><span className="font-semibold">Salle :</span> {defense.room || 'À définir'}</p>
          <p><span className="font-semibold">Statut planning :</span> {defense.planningStatus}</p>
          <div>
            <p className="font-semibold">Jury :</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {defense.juryMembers?.length ? defense.juryMembers.map((member) => (
                <span key={member} className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">{member}</span>
              )) : <span className="text-slate-500">Non affecté</span>}
            </div>
          </div>
        </div>
      )}
    </article>
  )
}

