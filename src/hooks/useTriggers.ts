import { useState } from 'react'
import { Triggers } from '../types/dashboard'

export const useTriggers = () => {
  const [triggers, setTriggers] = useState<Triggers[]>([])
  const [editingTrigger, setEditingTrigger] = useState<Triggers | null>(null)
  const [newTrigger, setNewTrigger] = useState<Omit<Triggers, 'id'>>({
    name: '',
    description: '',
    trigger_type: '',
    status: 'active'
  })

  const fetchTriggers = async () => {
    try {
      const response = await fetch('http://localhost:8000/plugins/triggers')
      if (response.ok) {
        const data = await response.json()
        setTriggers(data)
      } else {
        setTriggers([])
      }
    } catch (error) {
      setTriggers([])
    }
  }

  const createTrigger = async (trigger: Omit<Triggers, 'id'>) => {
    const form = new FormData()
    form.append('trigger_json', JSON.stringify(trigger))
    await fetch('http://localhost:8000/plugins/triggers', {
      method: 'POST',
      body: form
    })
    fetchTriggers()
    setEditingTrigger(null)
    resetNewTrigger()
  }

  const updateTrigger = async (trigger: Triggers) => {
    const form = new FormData()
    form.append('trigger_json', JSON.stringify(trigger))
    await fetch(`http://localhost:8000/plugins/triggers/${trigger.id}`, {
      method: 'PUT',
      body: form
    })
    fetchTriggers()
    setEditingTrigger(null)
  }

  const deleteTrigger = async (id: string) => {
    if (confirm('Delete trigger?')) {
      await fetch(`http://localhost:8000/plugins/triggers/${id}`, {
        method: 'DELETE'
      })
      fetchTriggers()
    }
  }

  const resetNewTrigger = () => {
    setNewTrigger({
      name: '',
      description: '',
      trigger_type: '',
      status: 'active'
    })
  }

  return {
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
  }
}
