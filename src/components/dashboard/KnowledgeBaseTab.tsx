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
    <div className="glass-card p-8 rounded-2xl">
      <h2 className="text-3xl font-bold mb-8 gradient-text">Knowledge Bases</h2>
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
        className="mb-6 space-y-4 bg-muted/50 p-6 rounded-xl border border-border"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="name" placeholder="Name" value={editingKB ? editingKB.name : newKB.name} onChange={e => editingKB ? setEditingKB({...editingKB, name: e.target.value}) : setNewKB({...newKB, name: e.target.value})} className="input" required />
          <input name="slug" placeholder="Slug" value={editingKB ? editingKB.slug : newKB.slug} onChange={e => editingKB ? setEditingKB({...editingKB, slug: e.target.value}) : setNewKB({...newKB, slug: e.target.value})} className="input" required />
        </div>
        <textarea name="description" placeholder="Description" value={editingKB ? editingKB.description || '' : newKB.description} onChange={e => editingKB ? setEditingKB({...editingKB, description: e.target.value}) : setNewKB({...newKB, description: e.target.value})} className="input" rows={3}></textarea>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="embedding_model" placeholder="Embedding Model" value={editingKB ? editingKB.embedding_model : newKB.embedding_model} onChange={e => editingKB ? setEditingKB({...editingKB, embedding_model: e.target.value}) : setNewKB({...newKB, embedding_model: e.target.value})} className="input" required />
          <input name="files" type="file" multiple className="input" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select name="status" value={editingKB ? editingKB.status : newKB.status} onChange={e => editingKB ? setEditingKB({...editingKB, status: e.target.value}) : setNewKB({...newKB, status: e.target.value})} className="input">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="flex space-x-4">
          <button type="submit" className="btn bg-success text-success-foreground hover:bg-success/90 px-6 py-3 font-semibold">{editingKB ? 'Update KB' : 'Create KB'}</button>
          {editingKB && <button type="button" onClick={() => setEditingKB(null)} className="btn-secondary px-6 py-3 font-semibold">Cancel</button>}
        </div>
      </form>
      <ul className="space-y-3 mt-8">
        {kbs.map(kb => (
          <li key={kb.knowledgebase.id} className="bg-gradient-card p-5 rounded-xl shadow-md border border-border card-hover">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-foreground text-lg">{kb.knowledgebase.name}</h3>
                <p className="text-sm text-muted-foreground mt-1"><span className={`badge ${kb.knowledgebase.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{kb.knowledgebase.status}</span> • {kb.documents.length} documents</p>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => setEditingKB(kb.knowledgebase)} className="btn bg-success text-success-foreground hover:bg-success/90 px-4 py-2 text-sm hover-scale">Edit</button>
                <button onClick={() => deleteKB(kb.knowledgebase.id)} className="btn-destructive px-4 py-2 text-sm hover-scale">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default KnowledgeBaseTab
