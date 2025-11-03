import { useState } from 'react'
import { MasterAgent } from '../types/dashboard'

export const useAgents = () => {
  const [agents, setAgents] = useState<MasterAgent[]>([])
  const [editingAgent, setEditingAgent] = useState<MasterAgent | null>(null)
  const [newAgent, setNewAgent] = useState<Omit<MasterAgent, 'id'>>({
    name: '',
    slug: '',
    model: '',
    instructions: '',
    base_url: '',
    api_key: '',
    max_tokens: 4048,
    status: 'active',
    accessibility: 'public',
    knowledgebase_ids: [],
    mcp_server_ids: [],
    trigger_ids: []
  })

  const fetchAgents = async () => {
    const response = await fetch('http://localhost:8000/master/agents')
    const data = await response.json()
    setAgents(data)
  }

  const createAgent = async (agent: Omit<MasterAgent, 'id'>): Promise<MasterAgent> => {
    const form = new FormData()
    form.append('agent_json', JSON.stringify(agent))
    const response = await fetch('http://localhost:8000/master/agents', {
      method: 'POST',
      body: form
    })
    const createdAgent = await response.json()
    fetchAgents()
    setEditingAgent(null)
    return createdAgent
  }

  const updateAgent = async (agent: MasterAgent) => {
    const form = new FormData()
    form.append('agent_json', JSON.stringify(agent))
    await fetch(`http://localhost:8000/master/agents/${agent.id}`, {
      method: 'PUT',
      body: form
    })
    fetchAgents()
    setEditingAgent(null)
  }

  const deleteAgent = async (id: string) => {
    if (confirm('Delete agent?')) {
      await fetch(`http://localhost:8000/master/agents/${id}`, {
        method: 'DELETE'
      })
      fetchAgents()
    }
  }

  const resetNewAgent = () => {
    setNewAgent({
      name: '',
      slug: '',
      model: '',
      instructions: '',
      base_url: '',
      api_key: '',
      max_tokens: 4048,
      status: 'active',
      accessibility: 'public',
      knowledgebase_ids: [],
      mcp_server_ids: [],
      trigger_ids: []
    })
  }

  return {
    agents,
    editingAgent,
    setEditingAgent,
    newAgent,
    setNewAgent,
    fetchAgents,
    createAgent,
    updateAgent,
    deleteAgent,
    resetNewAgent
  }
}
