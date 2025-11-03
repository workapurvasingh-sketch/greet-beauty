import React, { useEffect, useState } from 'react'
import { useMCPs } from '../../hooks/useMCPs'
import { MCPServerTools, MCPServerArg } from '../../types/dashboard'

const MCPTab: React.FC = () => {
  const {
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
  } = useMCPs()

  const [args, setArgs] = useState<{ key: string; value: string }[]>([])
  const [mode, setMode] = useState<'cloud' | 'local'>('cloud')
  const [command, setCommand] = useState<'python' | 'uvx'>('uvx')
  const [serverPath, setServerPath] = useState('')

  useEffect(() => {
    fetchMcps()
  }, [])

  // Set up form when starting to edit
  useEffect(() => {
    if (editingMCP) {
      setArgs(editingMCP.args.map(arg => ({ key: arg.key, value: arg.value || '' })))
      const isLocal = editingMCP.transport === 'stdio'
      setMode(isLocal ? 'local' : 'cloud')
      if (isLocal) {
        setCommand(editingMCP.base_url === 'python' || editingMCP.base_url === 'uvx' ? editingMCP.base_url as 'python' | 'uvx' : 'uvx')
        const serverPathArg = editingMCP.args.find(arg => arg.key === 'server_path')
        setServerPath(serverPathArg?.value || '')
      } else {
        setCommand('uvx')
        setServerPath('')
      }
    }
  }, [editingMCP?.id]) // Only when editingMCP.id changes

  // Set up form for new
  useEffect(() => {
    if (!editingMCP) {
      setArgs(newMCP.args.map(arg => ({ key: arg.key, value: arg.value || '' })))
      setMode('cloud')
      setCommand('uvx')
      setServerPath('')
    }
  }, [editingMCP]) // Only depend on editingMCP, not newMCP

  // Update transport when mode changes
  useEffect(() => {
    if (mode === 'cloud') {
      if (editingMCP) {
        setEditingMCP({...editingMCP, transport: 'sse'})
      } else {
        setNewMCP({...newMCP, transport: 'sse'})
      }
    } else if (mode === 'local') {
      if (editingMCP) {
        setEditingMCP({...editingMCP, transport: 'stdio'})
      } else {
        setNewMCP({...newMCP, transport: 'stdio'})
      }
    }
  }, [mode])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    let data: any = {
      id: editingMCP?.id,
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      description: (form.elements.namedItem('description') as HTMLTextAreaElement).value || undefined,
      status: (form.elements.namedItem('status') as HTMLSelectElement)?.value as 'active' | 'inactive' || 'active',
      args: args.filter(arg => arg.key.trim() !== '').map(arg => ({ key: arg.key, value: arg.value || undefined }))
    }

    if (mode === 'cloud') {
      data.transport = (form.elements.namedItem('transport') as HTMLSelectElement).value as 'sse' | 'streamable_http'
      data.base_url = (form.elements.namedItem('base_url') as HTMLInputElement).value
      data.api_key = (form.elements.namedItem('api_key') as HTMLInputElement).value || undefined
    } else {
      data.transport = 'stdio'
      data.base_url = command
      // Add server_path to args if provided
      if (serverPath.trim()) {
        data.args.push({ key: 'server_path', value: serverPath })
      }
    }

    if (editingMCP) {
      updateMCP(data)
    } else {
      createMCP(data)
    }
    form.reset()
    resetForm()
  }

  const addArg = () => {
    setArgs([...args, { key: '', value: '' }])
  }

  const updateArg = (index: number, field: 'key' | 'value', value: string) => {
    const newArgs = [...args]
    newArgs[index][field] = value
    setArgs(newArgs)
  }

  const removeArg = (index: number) => {
    setArgs(args.filter((_, i) => i !== index))
  }

  const resetForm = () => {
    setArgs([])
    setServerPath('')
    setCommand('uvx')
    setMode('cloud')
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">MCP Servers</h2>
      <form onSubmit={handleSubmit} className="mb-6 space-y-4 bg-gray-50 p-4 rounded-lg">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input type="radio" name="mode" value="cloud" checked={mode === 'cloud'} onChange={() => setMode('cloud')} className="mr-2" />
              Cloud
            </label>
            <label className="flex items-center">
              <input type="radio" name="mode" value="local" checked={mode === 'local'} onChange={() => setMode('local')} className="mr-2" />
              Local
            </label>
          </div>
        </div>

        {mode === 'cloud' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="name" placeholder="Name" value={editingMCP ? editingMCP.name : newMCP.name} onChange={e => editingMCP ? setEditingMCP({...editingMCP, name: e.target.value}) : setNewMCP({...newMCP, name: e.target.value})} className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 transition" required />
              <select name="transport" value={editingMCP ? editingMCP.transport : newMCP.transport} onChange={e => editingMCP ? setEditingMCP({...editingMCP, transport: e.target.value as 'sse' | 'streamable_http'}) : setNewMCP({...newMCP, transport: e.target.value as 'sse' | 'streamable_http'})} className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 transition" required>
                <option value="streamable_http">Streamable HTTP</option>
                <option value="sse">SSE</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="base_url" placeholder={`Base URL (e.g., server_url/${editingMCP ? editingMCP.transport : 'sse'})`} value={editingMCP ? editingMCP.base_url : newMCP.base_url} onChange={e => editingMCP ? setEditingMCP({...editingMCP, base_url: e.target.value}) : setNewMCP({...newMCP, base_url: e.target.value})} className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 transition" required />
              <input name="api_key" placeholder="API Key" value={editingMCP ? editingMCP.api_key || '' : newMCP.api_key} onChange={e => editingMCP ? setEditingMCP({...editingMCP, api_key: e.target.value}) : setNewMCP({...newMCP, api_key: e.target.value})} className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 transition" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select name="status" value={editingMCP ? editingMCP.status : 'active'} onChange={e => editingMCP ? setEditingMCP({...editingMCP, status: e.target.value as 'active' | 'inactive'}) : setNewMCP({...newMCP, status: e.target.value as 'active' | 'inactive'})} className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 transition">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <textarea name="description" placeholder="Description" value={editingMCP ? editingMCP.description || '' : newMCP.description} onChange={e => editingMCP ? setEditingMCP({...editingMCP, description: e.target.value}) : setNewMCP({...newMCP, description: e.target.value})} className="border rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-purple-500 transition" rows={3}></textarea>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="name" placeholder="Name" value={editingMCP ? editingMCP.name : newMCP.name} onChange={e => editingMCP ? setEditingMCP({...editingMCP, name: e.target.value}) : setNewMCP({...newMCP, name: e.target.value})} className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 transition" required />
              <select name="transport" value="stdio" className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 transition" disabled>
                <option value="stdio">stdio</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select name="command" value={command} onChange={e => setCommand(e.target.value as 'python' | 'uvx')} className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 transition">
                <option value="python">python</option>
                <option value="uvx">uvx</option>
              </select>
              <input name="server_path" placeholder="Absolute path to server" value={serverPath} onChange={e => setServerPath(e.target.value)} className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 transition" />
            </div>
            <textarea name="description" placeholder="Description" value={editingMCP ? editingMCP.description || '' : newMCP.description} onChange={e => editingMCP ? setEditingMCP({...editingMCP, description: e.target.value}) : setNewMCP({...newMCP, description: e.target.value})} className="border rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-purple-500 transition" rows={3}></textarea>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Arguments</label>
              {args.map((arg, index) => (
                <div key={index} className="flex space-x-2 mb-2">
                  <input placeholder="Key" value={arg.key} onChange={e => updateArg(index, 'key', e.target.value)} className="border rounded-lg px-4 py-2 flex-1 focus:ring-2 focus:ring-purple-500 transition" />
                  <input placeholder="Value" value={arg.value} onChange={e => updateArg(index, 'value', e.target.value)} className="border rounded-lg px-4 py-2 flex-1 focus:ring-2 focus:ring-purple-500 transition" />
                  <button type="button" onClick={() => removeArg(index)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg">Remove</button>
                </div>
              ))}
              <button type="button" onClick={addArg} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg">Add Argument</button>
            </div>
          </>
        )}

        <div className="flex space-x-4">
          <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transform hover:scale-105 transition duration-200">{editingMCP ? 'Update MCP Server' : 'Create MCP Server'}</button>
          {editingMCP && <button type="button" onClick={() => { setEditingMCP(null); resetForm(); }} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transform hover:scale-105 transition duration-200">Cancel</button>}
        </div>
      </form>
      <ul className="space-y-2">
        {mcps.map(mcp => (
          <li key={mcp.id} className="bg-gradient-to-r from-purple-100 to-purple-200 p-4 rounded-lg shadow-md flex justify-between items-center hover:shadow-lg transition duration-200">
            <div>
              <span className="font-medium">{mcp.name} ({mcp.status}) - {mcp.transport} - {mcp.base_url}</span>
              {mcp.args.length > 0 && (
                <div className="text-sm text-gray-600 mt-1">
                  Args: {mcp.args.map(arg => `${arg.key}=${arg.value}`).join(', ')}
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              <button onClick={() => toggleMCPStatus(mcp.id)} className={`px-3 py-2 rounded-lg transform hover:scale-105 transition duration-200 ${mcp.status === 'active' ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'} text-white`}>
                {mcp.status === 'active' ? 'Deactivate' : 'Activate'}
              </button>
              <button onClick={() => setEditingMCP(mcp)} className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-lg transform hover:scale-105 transition duration-200">Edit</button>
              <button onClick={() => deleteMCP(mcp.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transform hover:scale-105 transition duration-200">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default MCPTab
