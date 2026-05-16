import { useEffect, useState } from 'react'
import api from '../../services/api'

export default function AcademicStructureManagement() {
  const [departments, setDepartments] = useState([])
  const [fields, setFields] = useState([])
  const [years, setYears] = useState([])
  const [departmentForm, setDepartmentForm] = useState({ name: '', description: '' })
  const [fieldForm, setFieldForm] = useState({ name: '', departmentId: '' })
  const [yearForm, setYearForm] = useState({ label: '', active: false })

  async function load() {
    const [departmentResponse, fieldResponse, yearResponse] = await Promise.all([
      api.get('/admin/departments'),
      api.get('/admin/fields'),
      api.get('/admin/academic-years'),
    ])
    setDepartments(departmentResponse.data)
    setFields(fieldResponse.data)
    setYears(yearResponse.data)
  }

  useEffect(() => {
    load()
  }, [])

  async function createDepartment(event) {
    event.preventDefault()
    await api.post('/admin/departments', departmentForm)
    setDepartmentForm({ name: '', description: '' })
    await load()
  }

  async function createField(event) {
    event.preventDefault()
    await api.post('/admin/fields', { ...fieldForm, departmentId: Number(fieldForm.departmentId) })
    setFieldForm({ name: '', departmentId: '' })
    await load()
  }

  async function createYear(event) {
    event.preventDefault()
    await api.post('/admin/academic-years', yearForm)
    setYearForm({ label: '', active: false })
    await load()
  }

  async function renameDepartment(department) {
    const name = window.prompt('Nouveau nom', department.name)
    if (!name) return
    await api.put(`/admin/departments/${department.id}`, { name, description: department.description })
    await load()
  }

  async function deleteDepartment(department) {
    if (!window.confirm(`Supprimer ${department.name} ?`)) return
    await api.delete(`/admin/departments/${department.id}`)
    await load()
  }

  async function renameField(field) {
    const name = window.prompt('Nouveau nom', field.name)
    if (!name) return
    await api.put(`/admin/fields/${field.id}`, { name, departmentId: field.departmentId })
    await load()
  }

  async function deleteField(field) {
    if (!window.confirm(`Supprimer ${field.name} ?`)) return
    await api.delete(`/admin/fields/${field.id}`)
    await load()
  }

  async function toggleYear(year) {
    await api.put(`/admin/academic-years/${year.id}`, { label: year.label, active: !year.active })
    await load()
  }

  async function deleteYear(year) {
    if (!window.confirm(`Supprimer ${year.label} ?`)) return
    await api.delete(`/admin/academic-years/${year.id}`)
    await load()
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-indigo-600">Administration</p>
        <h2 className="text-3xl font-bold tracking-tight">Structure académique</h2>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-semibold">Départements</h3>
          <form onSubmit={createDepartment} className="mt-4 space-y-3">
            <input value={departmentForm.name} onChange={(event) => setDepartmentForm({ ...departmentForm, name: event.target.value })} placeholder="Nom" className="w-full rounded-2xl border border-slate-200 px-4 py-3" required />
            <input value={departmentForm.description} onChange={(event) => setDepartmentForm({ ...departmentForm, description: event.target.value })} placeholder="Description" className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
            <button className="rounded-2xl bg-indigo-600 px-4 py-2 font-semibold text-white">Ajouter</button>
          </form>
          <div className="mt-5 space-y-2">
            {departments.map((department) => (
              <div key={department.id} className="rounded-2xl bg-slate-50 p-3">
                <p className="font-medium">{department.name}</p>
                <div className="mt-2 flex gap-2 text-xs">
                  <button onClick={() => renameDepartment(department)}>Modifier</button>
                  <button onClick={() => deleteDepartment(department)} className="text-rose-600">Supprimer</button>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-semibold">Filières</h3>
          <form onSubmit={createField} className="mt-4 space-y-3">
            <input value={fieldForm.name} onChange={(event) => setFieldForm({ ...fieldForm, name: event.target.value })} placeholder="Nom" className="w-full rounded-2xl border border-slate-200 px-4 py-3" required />
            <select value={fieldForm.departmentId} onChange={(event) => setFieldForm({ ...fieldForm, departmentId: event.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3" required>
              <option value="">Choisir un département</option>
              {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
            </select>
            <button className="rounded-2xl bg-indigo-600 px-4 py-2 font-semibold text-white">Ajouter</button>
          </form>
          <div className="mt-5 space-y-2">
            {fields.map((field) => (
              <div key={field.id} className="rounded-2xl bg-slate-50 p-3">
                <p className="font-medium">{field.name}</p>
                <p className="text-sm text-slate-500">{field.departmentName}</p>
                <div className="mt-2 flex gap-2 text-xs">
                  <button onClick={() => renameField(field)}>Modifier</button>
                  <button onClick={() => deleteField(field)} className="text-rose-600">Supprimer</button>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-semibold">Années universitaires</h3>
          <form onSubmit={createYear} className="mt-4 space-y-3">
            <input value={yearForm.label} onChange={(event) => setYearForm({ ...yearForm, label: event.target.value })} placeholder="2025-2026" className="w-full rounded-2xl border border-slate-200 px-4 py-3" required />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={yearForm.active} onChange={(event) => setYearForm({ ...yearForm, active: event.target.checked })} />
              Active
            </label>
            <button className="rounded-2xl bg-indigo-600 px-4 py-2 font-semibold text-white">Ajouter</button>
          </form>
          <div className="mt-5 space-y-2">
            {years.map((year) => (
              <div key={year.id} className="rounded-2xl bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{year.label}</p>
                  <span className={`rounded-full px-2 py-1 text-xs ${year.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>{year.active ? 'Active' : 'Inactive'}</span>
                </div>
                <div className="mt-2 flex gap-2 text-xs">
                  <button onClick={() => toggleYear(year)}>{year.active ? 'Désactiver' : 'Activer'}</button>
                  <button onClick={() => deleteYear(year)} className="text-rose-600">Supprimer</button>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}
