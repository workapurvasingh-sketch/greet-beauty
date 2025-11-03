import { useState } from 'react'
import { KnowledgeBase, knowledgebaseResponse } from '../types/dashboard'

export const useKnowledgeBases = () => {
  const [kbs, setKBs] = useState<knowledgebaseResponse[]>([])
  const [editingKB, setEditingKB] = useState<KnowledgeBase | null>(null)
  const [newKB, setNewKB] = useState<Omit<KnowledgeBase, 'id'>>({
    name: '',
    slug: '',
    description: '',
    embedding_model: 'text-embedding-3-small',
    status: 'active'
  })

  const fetchKBs = async () => {
    try {
      const response = await fetch('http://localhost:8000/plugins/knowledgebases')
      if (response.ok) {
        const data = await response.json()
        setKBs(data)
      } else {
        // If knowledgebases endpoint is not available, set empty array
        setKBs([])
      }
    } catch (error) {
      // If there's an error (like 404), set empty array
      setKBs([])
    }
  }

  const createKB = async (kb: Omit<KnowledgeBase, 'id'>, files?: FileList) => {
    const form = new FormData()
    form.append('kb_json', JSON.stringify(kb))
    if (files) {
      for (let i = 0; i < files.length; i++) {
        form.append('files', files[i])
      }
    }
    await fetch('http://localhost:8000/plugins/knowledgebases', {
      method: 'POST',
      body: form
    })
    fetchKBs()
    setEditingKB(null)
    resetNewKB()
  }

  const updateKB = async (kb: KnowledgeBase, files?: FileList) => {
    const form = new FormData()
    form.append('kb_json', JSON.stringify(kb))
    if (files) {
      for (let i = 0; i < files.length; i++) {
        form.append('files', files[i])
      }
    }
    await fetch(`http://localhost:8000/plugins/knowledgebases/${kb.id}`, {
      method: 'PUT',
      body: form
    })
    fetchKBs()
    setEditingKB(null)
  }

  const deleteKB = async (id: string) => {
    if (confirm('Delete knowledge base?')) {
      await fetch(`http://localhost:8000/plugins/knowledgebases/${id}`, {
        method: 'DELETE'
      })
      fetchKBs()
    }
  }

  const resetNewKB = () => {
    setNewKB({
      name: '',
      slug: '',
      description: '',
      embedding_model: 'text-embedding-3-small',
      status: 'active'
    })
  }

  return {
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
  }
}
