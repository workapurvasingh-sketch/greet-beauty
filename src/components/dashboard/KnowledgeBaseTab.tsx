import React, { useEffect } from 'react'
import { useKnowledgeBases } from '../../hooks/useKnowledgeBases'
import { KnowledgeBase } from '../../types/dashboard'

const KnowledgeBaseTab: React.FC = () => {
  const {
    kbs,
    editingKB,
    setEditingKB,
    newKB,
    setNewKB,
    fetchKBs,
    createKB,
    updateKB,
    deleteKB,
    resetNewKB
  } = useKnowledgeBases()

  useEffect(() => {
    fetchKBs()
  }, [])

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Knowledge Bases</h2>
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          const form = e.target as HTMLFormElement
          const filesInput = form.elements.namedItem('files') as HTMLInputElement
          const kb = {
            id: editingKB?.id,
            name: (form.elements.namedItem('name') as HTMLInputElement).value,
            slug: (form.elements.namedItem('slug') as HTMLInputElement).value,
            description: (form.elements.namedItem('description') as HTMLInputElement).value,
            embedding_model: (form.elements.namedItem('embedding_model') as HTMLInputElement).value,
            status: (form.elements.namedItem('status') as HTMLSelectElement).value
          }
          if (editingKB) {
            await updateKB(kb as KnowledgeBase, filesInput.files && filesInput.files.length > 0 ? filesInput.files : undefined)
          } else {
            if (filesInput.files && filesInput.files.length > 0) {
              await createKB(kb as Omit<KnowledgeBase, 'id'>, filesInput.files)
            }
          }
          form.reset()
        }}
        className="mb-6 space-y-4 bg-gray-50 p-4 rounded-lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="name" placeholder="Name" value={editingKB ? editingKB.name : newKB.name} onChange={e => editingKB ? setEditingKB({...editingKB, name: e.target.value}) : setNewKB({...newKB, name: e.target.value})} className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 transition" required />
          <input name="slug" placeholder="Slug" value={editingKB ? editingKB.slug : newKB.slug} onChange={e => editingKB ? setEditingKB({...editingKB, slug: e.target.value}) : setNewKB({...newKB, slug: e.target.value})} className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 transition" required />
        </div>
        <textarea name="description" placeholder="Description" value={editingKB ? editingKB.description || '' : newKB.description} onChange={e => editingKB ? setEditingKB({...editingKB, description: e.target.value}) : setNewKB({...newKB, description: e.target.value})} className="border rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-green-500 transition" rows={3}></textarea>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="embedding_model" placeholder="Embedding Model" value={editingKB ? editingKB.embedding_model : newKB.embedding_model} onChange={e => editingKB ? setEditingKB({...editingKB, embedding_model: e.target.value}) : setNewKB({...newKB, embedding_model: e.target.value})} className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 transition" required />
          <input name="files" type="file" multiple className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 transition" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select name="status" value={editingKB ? editingKB.status : newKB.status} onChange={e => editingKB ? setEditingKB({...editingKB, status: e.target.value}) : setNewKB({...newKB, status: e.target.value})} className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 transition">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="flex space-x-4">
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transform hover:scale-105 transition duration-200">{editingKB ? 'Update KB' : 'Create KB'}</button>
          {editingKB && <button type="button" onClick={() => setEditingKB(null)} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transform hover:scale-105 transition duration-200">Cancel</button>}
        </div>
      </form>
      <ul className="space-y-2">
        {kbs.map(kb => (
          <li key={kb.knowledgebase.id} className="bg-gradient-to-r from-green-100 to-green-200 p-4 rounded-lg shadow-md flex justify-between items-center hover:shadow-lg transition duration-200">
            <span className="font-medium">
              {kb.knowledgebase.name} ({kb.knowledgebase.status}) - {kb.documents.length} documents
            </span>
            <div className="flex space-x-2">
              <button onClick={() => setEditingKB(kb.knowledgebase)} className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg transform hover:scale-105 transition duration-200">Edit</button>
              <button onClick={() => deleteKB(kb.knowledgebase.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transform hover:scale-105 transition duration-200">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default KnowledgeBaseTab
