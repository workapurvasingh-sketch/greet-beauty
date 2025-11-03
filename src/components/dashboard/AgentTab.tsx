import React, { useEffect, useState } from 'react'
import { useAgents } from '../../hooks/useAgents'
import { useKnowledgeBases } from '../../hooks/useKnowledgeBases'
import { useMCPs } from '../../hooks/useMCPs'
import { useTriggers } from '../../hooks/useTriggers'
import { useSuggestionPrompts } from '../../hooks/useSuggestionPrompts'
import { MasterAgent, SuggestionPrompt } from '../../types/dashboard'

interface AgentTabProps {
  onChatWithAgent: (agent: MasterAgent) => void
}

const AgentTab: React.FC<AgentTabProps> = ({ onChatWithAgent }) => {
  const {
    agents,
    editingAgent,
    setEditingAgent,
    newAgent,
    setNewAgent,
    createAgent,
    updateAgent,
    deleteAgent,
    resetNewAgent,
    fetchAgents
  } = useAgents()

  const { kbs, fetchKBs } = useKnowledgeBases()
  const { mcps, fetchMcps } = useMCPs()
  const { triggers, fetchTriggers } = useTriggers()

  const [selectedAgentForPrompts, setSelectedAgentForPrompts] = useState<string | null>(null)
  const {
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
  } = useSuggestionPrompts(selectedAgentForPrompts || '')

  // State for editing agent prompts
  const [editingAgentPrompts, setEditingAgentPrompts] = useState<Array<{id: number, prompt_title: string, prompt: string, isExisting?: boolean, dbId?: string}>>([])

  // Function to load prompts for editing
  const loadPromptsForEditing = async (agentId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/master/agents/${agentId}/suggestion-prompts`)
      if (response.ok) {
        const existingPrompts = await response.json()
        const promptForms = existingPrompts.map((prompt: SuggestionPrompt, index: number) => ({
          id: index + 1,
          prompt_title: prompt.prompt_title,
          prompt: prompt.prompt,
          isExisting: true,
          dbId: prompt.id
        }))
        setEditingAgentPrompts(promptForms.length > 0 ? promptForms : [{id: 1, prompt_title: '', prompt: ''}])
      } else {
        setEditingAgentPrompts([{id: 1, prompt_title: '', prompt: ''}])
      }
    } catch (error) {
      setEditingAgentPrompts([{id: 1, prompt_title: '', prompt: ''}])
    }
  }

  // State for suggestion prompts during agent creation
  const [agentSuggestionPrompts, setAgentSuggestionPrompts] = useState<Array<{prompt_title: string, prompt: string}>>([])
  const [promptForms, setPromptForms] = useState<Array<{id: number, prompt_title: string, prompt: string}>>([{id: 1, prompt_title: '', prompt: ''}])

  // Type for prompt forms that can be either new or existing
  type PromptForm = {id: number, prompt_title: string, prompt: string, isExisting?: boolean, dbId?: string}

  useEffect(() => {
    fetchAgents()
    fetchKBs()
    fetchMcps()
    fetchTriggers()
  }, [])

  return (
    <div className="glass-card p-8 rounded-2xl">
      <h2 className="text-3xl font-bold mb-8 gradient-text">Master Agents</h2>
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          const form = e.target as HTMLFormElement
          const data = {
            id: editingAgent?.id,
            name: (form.elements.namedItem('name') as HTMLInputElement).value,
            slug: (form.elements.namedItem('slug') as HTMLInputElement).value,
            model: (form.elements.namedItem('model') as HTMLInputElement).value,
            instructions: (form.elements.namedItem('instructions') as HTMLInputElement).value,
            base_url: (form.elements.namedItem('base_url') as HTMLInputElement).value,
            api_key: (form.elements.namedItem('api_key') as HTMLInputElement).value,
            max_tokens: parseInt((form.elements.namedItem('max_tokens') as HTMLInputElement).value) || 4048,
            status: (form.elements.namedItem('status') as HTMLSelectElement).value,
            accessibility: (form.elements.namedItem('accessibility') as HTMLSelectElement).value,
            knowledgebase_ids: editingAgent ? editingAgent.knowledgebase_ids : newAgent.knowledgebase_ids,
            mcp_server_ids: editingAgent ? editingAgent.mcp_server_ids : newAgent.mcp_server_ids,
            trigger_ids: editingAgent ? editingAgent.trigger_ids : newAgent.trigger_ids
          }

          if (editingAgent) {
            // Update agent data
            await updateAgent(data as MasterAgent)

            // Handle suggestion prompts updates
            const validPrompts = editingAgentPrompts.filter(f => f.prompt_title.trim() && f.prompt.trim())

            // Update existing prompts and create new ones
            for (const prompt of validPrompts) {
              if (prompt.isExisting && prompt.dbId) {
                // Update existing prompt
                const form = new FormData()
                form.append('prompt_json', JSON.stringify({
                  prompt_title: prompt.prompt_title.trim(),
                  prompt: prompt.prompt.trim()
                }))
                await fetch(`http://localhost:8000/master/agents/${editingAgent.id}/suggestion-prompts/${prompt.dbId}`, {
                  method: 'PUT',
                  body: form
                })
              } else {
                // Create new prompt
                const form = new FormData()
                form.append('prompt_json', JSON.stringify({
                  prompt_title: prompt.prompt_title.trim(),
                  prompt: prompt.prompt.trim()
                }))
                await fetch(`http://localhost:8000/master/agents/${editingAgent.id}/suggestion-prompts`, {
                  method: 'POST',
                  body: form
                })
              }
            }

            // Reset editing state
            setEditingAgent(null)
            setEditingAgentPrompts([])
          } else {
            // Create agent first
            const newAgentData = await createAgent(data as Omit<MasterAgent, 'id'>)
            resetNewAgent()

            // Then create suggestion prompts if any were added
            const validPrompts = promptForms.filter(f => f.prompt_title.trim() && f.prompt.trim())
            if (validPrompts.length > 0 && newAgentData) {
              const agentId = newAgentData.id

              for (const prompt of validPrompts) {
                const form = new FormData()
                form.append('prompt_json', JSON.stringify({
                  prompt_title: prompt.prompt_title.trim(),
                  prompt: prompt.prompt.trim()
                }))
                await fetch(`http://localhost:8000/master/agents/${agentId}/suggestion-prompts`, {
                  method: 'POST',
                  body: form
                })
              }
            }

            // Reset suggestion prompts state
            setPromptForms([{id: 1, prompt_title: '', prompt: ''}])
          }
          form.reset()
        }}
        className="mb-6 space-y-4 bg-gray-50 p-4 rounded-lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="name" placeholder="Name" value={editingAgent ? editingAgent.name : newAgent.name} onChange={e => editingAgent ? setEditingAgent({...editingAgent, name: e.target.value}) : setNewAgent({...newAgent, name: e.target.value})} className="input" required />
          <input name="slug" placeholder="Slug" value={editingAgent ? editingAgent.slug : newAgent.slug} onChange={e => editingAgent ? setEditingAgent({...editingAgent, slug: e.target.value}) : setNewAgent({...newAgent, slug: e.target.value})} className="input" required />
        </div>
        <input name="model" placeholder="Model" value={editingAgent ? editingAgent.model : newAgent.model} onChange={e => editingAgent ? setEditingAgent({...editingAgent, model: e.target.value}) : setNewAgent({...newAgent, model: e.target.value})} className="input" required />
        <textarea name="instructions" placeholder="Instructions" value={editingAgent ? editingAgent.instructions || '' : newAgent.instructions} onChange={e => editingAgent ? setEditingAgent({...editingAgent, instructions: e.target.value}) : setNewAgent({...newAgent, instructions: e.target.value})} className="input" rows={3}></textarea>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="base_url" placeholder="Base URL" value={editingAgent ? editingAgent.base_url : newAgent.base_url} onChange={e => editingAgent ? setEditingAgent({...editingAgent, base_url: e.target.value}) : setNewAgent({...newAgent, base_url: e.target.value})} className="input" required />
          <input name="api_key" placeholder="API Key" value={editingAgent ? editingAgent.api_key : newAgent.api_key} onChange={e => editingAgent ? setEditingAgent({...editingAgent, api_key: e.target.value}) : setNewAgent({...newAgent, api_key: e.target.value})} className="input" required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input name="max_tokens" type="number" placeholder="Max Tokens" value={editingAgent ? editingAgent.max_tokens || '' : newAgent.max_tokens} onChange={e => editingAgent ? setEditingAgent({...editingAgent, max_tokens: parseInt(e.target.value)}) : setNewAgent({...newAgent, max_tokens: parseInt(e.target.value)})} className="input" />
          <select name="status" value={editingAgent ? editingAgent.status : newAgent.status} onChange={e => editingAgent ? setEditingAgent({...editingAgent, status: e.target.value}) : setNewAgent({...newAgent, status: e.target.value})} className="input">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select name="accessibility" value={editingAgent ? editingAgent.accessibility : newAgent.accessibility} onChange={e => editingAgent ? setEditingAgent({...editingAgent, accessibility: e.target.value}) : setNewAgent({...newAgent, accessibility: e.target.value})} className="input">
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>

        {/* Knowledge Bases Multi-Select */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Select Knowledge Bases</label>
          <select
            multiple
            value={editingAgent ? (editingAgent.knowledgebase_ids || []) : newAgent.knowledgebase_ids}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value)
              if (editingAgent) {
                setEditingAgent({...editingAgent, knowledgebase_ids: selected})
              } else {
                setNewAgent({...newAgent, knowledgebase_ids: selected})
              }
            }}
            className="input"
          >
            {Array.isArray(kbs) && kbs.map(kb => (
              <option key={kb.knowledgebase.id} value={kb.knowledgebase.id}>
                {kb.knowledgebase.name}
              </option>
            ))}
          </select>
        </div>

        {/* MCP Servers Multi-Select */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Select MCP Servers</label>
          <select
            multiple
            value={editingAgent ? (editingAgent.mcp_server_ids || []) : newAgent.mcp_server_ids}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value)
              if (editingAgent) {
                setEditingAgent({...editingAgent, mcp_server_ids: selected})
              } else {
                setNewAgent({...newAgent, mcp_server_ids: selected})
              }
            }}
            className="input"
          >
            {Array.isArray(mcps) && mcps.map(mcp => (
              <option key={mcp.id} value={mcp.id}>
                {mcp.name}
              </option>
            ))}
          </select>
        </div>

        {/* Triggers Multi-Select */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Select Triggers</label>
          <select
            multiple
            value={editingAgent ? (editingAgent.trigger_ids || []) : newAgent.trigger_ids}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value)
              if (editingAgent) {
                setEditingAgent({...editingAgent, trigger_ids: selected})
              } else {
                setNewAgent({...newAgent, trigger_ids: selected})
              }
            }}
            className="input"
          >
            {Array.isArray(triggers) && triggers.map(trigger => (
              <option key={trigger.id} value={trigger.id}>
                {trigger.name} ({trigger.trigger_type})
              </option>
            ))}
          </select>
        </div>

        {/* Suggestion Prompts Section */}
        <div className="border-t border-border pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-foreground">Suggestion Prompts</h3>
            <button
              type="button"
              onClick={() => {
                if (editingAgent) {
                  const newId = Math.max(...editingAgentPrompts.map(f => f.id), 0) + 1
                  setEditingAgentPrompts([...editingAgentPrompts, {id: newId, prompt_title: '', prompt: ''}])
                } else {
                  const newId = Math.max(...promptForms.map(f => f.id), 0) + 1
                  setPromptForms([...promptForms, {id: newId, prompt_title: '', prompt: ''}])
                }
              }}
              className="btn bg-success text-success-foreground hover:bg-success/90"
            >
              + Add Another Prompt
            </button>
          </div>

          {/* Dynamic Prompt Forms */}
          <div className="space-y-4">
            {(editingAgent ? editingAgentPrompts : promptForms).map((form, index) => {
              const isExistingForm = 'isExisting' in form && form.isExisting
              const dbId = 'dbId' in form ? form.dbId : undefined
              return (
                <div key={form.id} className={`p-4 rounded-lg border border-border relative ${isExistingForm ? 'bg-accent/5' : 'bg-success-light'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-foreground">Prompt {index + 1}</h4>
                      {isExistingForm && (
                        <span className="badge bg-accent/10 text-accent">Existing</span>
                      )}
                    </div>
                    {(editingAgent ? editingAgentPrompts : promptForms).length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (editingAgent) {
                            if (isExistingForm && dbId) {
                              // Delete existing prompt from database
                              fetch(`http://localhost:8000/master/agents/${editingAgent.id}/suggestion-prompts/${dbId}`, {
                                method: 'DELETE'
                              }).then(() => {
                                setEditingAgentPrompts(editingAgentPrompts.filter(f => f.id !== form.id))
                              })
                            } else {
                              setEditingAgentPrompts(editingAgentPrompts.filter(f => f.id !== form.id))
                            }
                          } else {
                            setPromptForms(promptForms.filter(f => f.id !== form.id))
                          }
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        ✕ Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <input
                      type="text"
                      placeholder="Prompt Title"
                      value={form.prompt_title}
                      onChange={(e) => {
                        if (editingAgent) {
                          const updatedForms = [...editingAgentPrompts]
                          updatedForms[index].prompt_title = e.target.value
                          setEditingAgentPrompts(updatedForms)
                        } else {
                          const updatedForms = [...promptForms]
                          updatedForms[index].prompt_title = e.target.value
                          setPromptForms(updatedForms)
                        }
                      }}
                      className="input text-sm"
                    />
                    <textarea
                      placeholder="Prompt Content"
                      value={form.prompt}
                      onChange={(e) => {
                        if (editingAgent) {
                          const updatedForms = [...editingAgentPrompts]
                          updatedForms[index].prompt = e.target.value
                          setEditingAgentPrompts(updatedForms)
                        } else {
                          const updatedForms = [...promptForms]
                          updatedForms[index].prompt = e.target.value
                          setPromptForms(updatedForms)
                        }
                      }}
                      className="input text-sm"
                      rows={3}
                    />
                  </div>
                </div>
              ) as React.ReactElement
            })}
          </div>

          {/* Summary of Valid Prompts */}
          {(() => {
            const currentForms = editingAgent ? editingAgentPrompts : promptForms
            const validPrompts = currentForms.filter(f => f.prompt_title.trim() && f.prompt.trim())
            return validPrompts.length > 0 && (
              <div className="mt-4 p-4 bg-accent/10 rounded-lg border border-accent/20">
                <p className="text-sm text-foreground">
                  <strong>{validPrompts.length}</strong> prompt{validPrompts.length !== 1 ? 's' : ''} will be {editingAgent ? 'updated for' : 'created with'} the agent.
                </p>
              </div>
            )
          })()}
        </div>

        <div className="flex space-x-4">
          <button type="submit" className="btn-primary px-6 py-3 font-semibold">{editingAgent ? 'Update Agent' : 'Create Agent'}</button>
          {editingAgent && <button type="button" onClick={() => setEditingAgent(null)} className="btn-secondary px-6 py-3 font-semibold">Cancel</button>}
        </div>
      </form>
      <ul className="space-y-3 mt-8">
        {agents.map(agent => (
          <li key={agent.id} className="bg-gradient-card p-5 rounded-xl shadow-md border border-border card-hover">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-foreground text-lg">{agent.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{agent.model} • <span className={`badge ${agent.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{agent.status}</span></p>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => onChatWithAgent(agent)} className="btn-primary px-4 py-2 text-sm hover-scale">Chat</button>
                <button onClick={async () => {
                  setEditingAgent(agent)
                  await loadPromptsForEditing(agent.id)
                }} className="btn-secondary px-4 py-2 text-sm hover-scale">Edit</button>
                <button onClick={() => deleteAgent(agent.id)} className="btn-destructive px-4 py-2 text-sm hover-scale">Delete</button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Suggestion Prompts Management */}
      {selectedAgentForPrompts && (
        <div className="mt-8 bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Suggestion Prompts for {agents.find(a => a.id === selectedAgentForPrompts)?.name}
          </h3>

          {/* Add/Edit Prompt Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const form = e.target as HTMLFormElement
              const data = {
                prompt_title: (form.elements.namedItem('prompt_title') as HTMLInputElement).value,
                prompt: (form.elements.namedItem('prompt') as HTMLTextAreaElement).value
              }
              if (editingPrompt) {
                updateSuggestionPrompt({...editingPrompt, ...data})
              } else {
                createSuggestionPrompt(data)
                resetNewPrompt()
              }
              form.reset()
            }}
            className="mb-6 space-y-4 bg-white p-4 rounded-lg shadow-sm"
          >
            <div className="grid grid-cols-1 gap-4">
              <input
                name="prompt_title"
                placeholder="Prompt Title"
                value={editingPrompt ? editingPrompt.prompt_title : newPrompt.prompt_title}
                onChange={e => editingPrompt ? setEditingPrompt({...editingPrompt, prompt_title: e.target.value}) : setNewPrompt({...newPrompt, prompt_title: e.target.value})}
                className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 transition"
                required
              />
              <textarea
                name="prompt"
                placeholder="Prompt Content"
                value={editingPrompt ? editingPrompt.prompt : newPrompt.prompt}
                onChange={e => editingPrompt ? setEditingPrompt({...editingPrompt, prompt: e.target.value}) : setNewPrompt({...newPrompt, prompt: e.target.value})}
                className="border rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-green-500 transition"
                rows={4}
                required
              ></textarea>
            </div>
            <div className="flex space-x-4">
              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transform hover:scale-105 transition duration-200">
                {editingPrompt ? 'Update Prompt' : 'Add Prompt'}
              </button>
              {editingPrompt && (
                <button type="button" onClick={() => setEditingPrompt(null)} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transform hover:scale-105 transition duration-200">
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* Prompts List */}
          <ul className="space-y-2">
            {suggestionPrompts.map(prompt => (
              <li key={prompt.id} className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{prompt.prompt_title}</h4>
                    <p className="text-gray-600 mt-2">{prompt.prompt}</p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button onClick={() => setEditingPrompt(prompt)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">Edit</button>
                    <button onClick={() => deleteSuggestionPrompt(prompt.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">Delete</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <button
            onClick={() => setSelectedAgentForPrompts(null)}
            className="mt-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
          >
            Close Prompt Management
          </button>
        </div>
      )}
    </div>
  )
}

export default AgentTab
