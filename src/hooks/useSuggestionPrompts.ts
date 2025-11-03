import { useState } from 'react'
import { SuggestionPrompt } from '../types/dashboard'

export const useSuggestionPrompts = (agentId: string) => {
  const [suggestionPrompts, setSuggestionPrompts] = useState<SuggestionPrompt[]>([])
  const [editingPrompt, setEditingPrompt] = useState<SuggestionPrompt | null>(null)
  const [newPrompt, setNewPrompt] = useState<Omit<SuggestionPrompt, 'id' | 'master_agent_id'>>({
    prompt_title: '',
    prompt: ''
  })

  const fetchSuggestionPrompts = async () => {
    const response = await fetch(`http://localhost:8000/master/agents/${agentId}/suggestion-prompts`)
    const data = await response.json()
    setSuggestionPrompts(data)
  }

  const createSuggestionPrompt = async (prompt: Omit<SuggestionPrompt, 'id' | 'master_agent_id'>) => {
    const form = new FormData()
    form.append('prompt_json', JSON.stringify(prompt))
    await fetch(`http://localhost:8000/master/agents/${agentId}/suggestion-prompts`, {
      method: 'POST',
      body: form
    })
    fetchSuggestionPrompts()
    setEditingPrompt(null)
  }

  const updateSuggestionPrompt = async (prompt: SuggestionPrompt) => {
    const form = new FormData()
    form.append('prompt_json', JSON.stringify(prompt))
    await fetch(`http://localhost:8000/master/agents/${agentId}/suggestion-prompts/${prompt.id}`, {
      method: 'PUT',
      body: form
    })
    fetchSuggestionPrompts()
    setEditingPrompt(null)
  }

  const deleteSuggestionPrompt = async (id: string) => {
    if (confirm('Delete suggestion prompt?')) {
      await fetch(`http://localhost:8000/master/agents/${agentId}/suggestion-prompts/${id}`, {
        method: 'DELETE'
      })
      fetchSuggestionPrompts()
    }
  }

  const resetNewPrompt = () => {
    setNewPrompt({
      prompt_title: '',
      prompt: ''
    })
  }

  return {
    suggestionPrompts,
    editingPrompt,
    setEditingPrompt,
    newPrompt,
    setNewPrompt,
    fetchSuggestionPrompts,
    createSuggestionPrompt,
    updateSuggestionPrompt,
    deleteSuggestionPrompt,
    resetNewPrompt
  }
}
