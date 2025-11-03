import React, { useEffect } from 'react'
import { useTriggers } from '../../hooks/useTriggers'
import { Triggers } from '../../types/dashboard'

const TriggerTab: React.FC = () => {
  const {
    triggers,
    editingTrigger,
    setEditingTrigger,
    newTrigger,
    setNewTrigger,
    fetchTriggers,
    createTrigger,
    updateTrigger,
    deleteTrigger,
    resetNewTrigger
  } = useTriggers()

  useEffect(() => {
    fetchTriggers()
  }, [])

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Triggers</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const form = e.target as HTMLFormElement
          const data = {
            id: editingTrigger?.id,
            name: (form.elements.namedItem('name') as HTMLInputElement).value,
            description: (form.elements.namedItem('description') as HTMLInputElement).value,
            trigger_type: (form.elements.namedItem('trigger_type') as HTMLInputElement).value,
            parameters: undefined,
            status: (form.elements.namedItem('status') as HTMLSelectElement).value
          }
          if (editingTrigger) {
            updateTrigger(data as Triggers)
          } else {
            createTrigger(data as Omit<Triggers, 'id'>)
          }
          form.reset()
        }}
        className="mb-6 space-y-4 bg-gray-50 p-4 rounded-lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="name" placeholder="Name" value={editingTrigger ? editingTrigger.name : newTrigger.name} onChange={e => editingTrigger ? setEditingTrigger({...editingTrigger, name: e.target.value}) : setNewTrigger({...newTrigger, name: e.target.value})} className="input" required />
          <input name="trigger_type" placeholder="Trigger Type" value={editingTrigger ? editingTrigger.trigger_type : newTrigger.trigger_type} onChange={e => editingTrigger ? setEditingTrigger({...editingTrigger, trigger_type: e.target.value}) : setNewTrigger({...newTrigger, trigger_type: e.target.value})} className="input" required />
        </div>
        <textarea name="description" placeholder="Description" value={editingTrigger ? editingTrigger.description || '' : newTrigger.description} onChange={e => editingTrigger ? setEditingTrigger({...editingTrigger, description: e.target.value}) : setNewTrigger({...newTrigger, description: e.target.value})} className="input" rows={3}></textarea>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select name="status" value={editingTrigger ? editingTrigger.status : newTrigger.status} onChange={e => editingTrigger ? setEditingTrigger({...editingTrigger, status: e.target.value}) : setNewTrigger({...newTrigger, status: e.target.value})} className="input">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="flex space-x-4">
          <button type="submit" className="btn-destructive px-6 py-3 font-semibold">{editingTrigger ? 'Update Trigger' : 'Create Trigger'}</button>
          {editingTrigger && <button type="button" onClick={() => setEditingTrigger(null)} className="btn-secondary px-6 py-3 font-semibold">Cancel</button>}
        </div>
      </form>
      <ul className="space-y-3 mt-8">
        {triggers.map(trigger => (
          <li key={trigger.id} className="bg-gradient-card p-5 rounded-xl shadow-md border border-border card-hover">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-foreground text-lg">{trigger.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{trigger.trigger_type} • <span className={`badge ${trigger.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{trigger.status}</span></p>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => setEditingTrigger(trigger)} className="btn-destructive px-4 py-2 text-sm hover-scale">Edit</button>
                <button onClick={() => deleteTrigger(trigger.id)} className="btn-destructive px-4 py-2 text-sm hover-scale">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TriggerTab
