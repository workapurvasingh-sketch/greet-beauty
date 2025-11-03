import { useState } from 'react'
import { MCPServerTools } from '../types/dashboard'

export const useMCPs = () => {
  const [mcps, setMcps] = useState<MCPServerTools[]>([])
  const [editingMCP, setEditingMCP] = useState<MCPServerTools | null>(null)
  const [newMCP, setNewMCP] = useState<Omit<MCPServerTools, 'id'>>({
    name: '',
    transport: 'sse',
    base_url: '',
    api_key: '',
    description: '',
    status: 'active',
    args: []
  })

  const fetchMcps = async () => {
    try {
      const response = await fetch('http://localhost:8000/plugins/mcp-servers')
      if (response.ok) {
        const data = await response.json()
        setMcps(data)
      } else {
        setMcps([])
      }
    } catch (error) {
      setMcps([])
    }
  }

  const createMCP = async (mcp: Omit<MCPServerTools, 'id'>) => {
    await fetch('http://localhost:8000/plugins/mcp-servers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mcp)
    })
    fetchMcps()
    setEditingMCP(null)
    resetNewMCP()
  }

  const updateMCP = async (mcp: MCPServerTools) => {
    await fetch(`http://localhost:8000/plugins/mcp-servers/${mcp.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mcp)
    })
    fetchMcps()
    setEditingMCP(null)
  }

  const toggleMCPStatus = async (id: string) => {
    await fetch(`http://localhost:8000/plugins/mcp-servers/${id}/toggle-status`, {
      method: 'PUT'
    })
    fetchMcps()
  }

  const deleteMCP = async (id: string) => {
    if (confirm('Delete MCP server?')) {
      await fetch(`http://localhost:8000/plugins/mcp-servers/${id}`, {
        method: 'DELETE'
      })
      fetchMcps()
    }
  }

  const resetNewMCP = () => {
    setNewMCP({
      name: '',
      transport: 'sse',
      base_url: '',
      api_key: '',
      description: '',
      status: 'active',
      args: []
    })
  }

  return {
    mcps,
    editingMCP,
    setEditingMCP,
    newMCP,
    setNewMCP,
    fetchMcps,
    createMCP,
    updateMCP,
    toggleMCPStatus,
    deleteMCP,
    resetNewMCP
  }
}
