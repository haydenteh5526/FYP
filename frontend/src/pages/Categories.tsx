import { useState, useEffect } from 'react'
import { Plus, Folder } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

interface Category {
  id: string
  name: string
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [newName, setNewName] = useState('')

  useEffect(() => { loadCategories() }, [])

  async function loadCategories() {
    const token = localStorage.getItem('token')
    const res = await fetch('/api/v1/categories', { headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) setCategories(await res.json())
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    const token = localStorage.getItem('token')
    await fetch('/api/v1/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: newName }),
    })
    setNewName('')
    loadCategories()
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
        <p className="text-muted-foreground mt-1">Organise your documents</p>
      </div>

      <form onSubmit={handleCreate} className="flex gap-2 max-w-md mb-8">
        <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New category name..." />
        <Button type="submit" size="icon"><Plus size={16} /></Button>
      </form>

      <div className="grid gap-3 max-w-md">
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">No categories yet.</p>
        ) : (
          categories.map(cat => (
            <Card key={cat.id}>
              <CardContent className="flex items-center gap-3 p-4">
                <Folder size={18} className="text-muted-foreground" />
                <span className="text-sm font-medium">{cat.name}</span>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
