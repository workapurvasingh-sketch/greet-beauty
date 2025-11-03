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
          <input name="name" placeholder="Name" value={editingTrigger ? editingTrigger.name : newTrigger.name} onChange={e => editingTrigger ? setEditingTrigger({...editingTrigger, name: e.target.value}) : setNewTrigger({...newTrigger, name: e.target.value})} className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 transition" required />
          <input name="trigger_type" placeholder="Trigger Type" value={editingTrigger ? editingTrigger.trigger_type : newTrigger.trigger_type} onChange={e => editingTrigger ? setEditingTrigger({...editingTrigger, trigger_type: e.target.value}) : setNewTrigger({...newTrigger, trigger_type: e.target.value})} className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 transition" required />
        </div>
        <textarea name="description" placeholder="Description" value={editingTrigger ? editingTrigger.description || '' : newTrigger.description} onChange={e => editingTrigger ? setEditingTrigger({...editingTrigger, description: e.target.value}) : setNewTrigger({...newTrigger, description: e.target.value})} className="border rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-red-500 transition" rows={3}></textarea>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select name="status" value={editingTrigger ? editingTrigger.status : newTrigger.status} onChange={e => editingTrigger ? setEditingTrigger({...editingTrigger, status: e.target.value}) : setNewTrigger({...newTrigger, status: e.target.value})} className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 transition">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="flex space-x-4">
          <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transform hover:scale-105 transition duration-200">{editingTrigger ? 'Update Trigger' : 'Create Trigger'}</button>
          {editingTrigger && <button type="button" onClick={() => setEditingTrigger(null)} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transform hover:scale-105 transition duration-200">Cancel</button>}
        </div>
      </form>
      <ul className="space-y-2">
        {triggers.map(trigger => (
          <li key={trigger.id} className="bg-gradient-to-r from-red-100 to-red-200 p-4 rounded-lg shadow-md flex justify-between items-center hover:shadow-lg transition duration-200">
            <span className="font-medium">{trigger.name} ({trigger.trigger_type}) - {trigger.status}</span>
            <div className="flex space-x-2">
              <button onClick={() => setEditingTrigger(trigger)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transform hover:scale-105 transition duration-200">Edit</button>
              <button onClick={() => deleteTrigger(trigger.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transform hover:scale-105 transition duration-200">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TriggerTab
