import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Folder, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { getCategories } from '@/lib/api'

interface Category {
  id: string
  name: string
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => { loadCategories() }, [])

  async function loadCategories() {
    setLoading(true)
    const data = await getCategories()
    setCategories(data)
    setLoading(false)
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
    <div className="p-8 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
        <p className="text-muted-foreground text-sm mt-0.5">Organise and browse your documents by category</p>
      </div>

      <form onSubmit={handleCreate} className="flex gap-2 max-w-md mb-8">
        <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New category name..." className="h-10" />
        <Button type="submit" size="icon" className="h-10 w-10 gradient-bg border-0 text-white shrink-0"><Plus size={16} /></Button>
      </form>

      <div className="grid gap-3 sm:grid-cols-2">
        {loading ? (
          [...Array(4)].map((_, i) => <Card key={i} className="animate-pulse"><CardContent className="h-16" /></Card>)
        ) : categories.length === 0 ? (
          <p className="text-sm text-muted-foreground col-span-2 text-center py-8">No categories yet. Documents you upload get auto-categorised.</p>
        ) : (
          categories.map((cat, i) => (
            <Card
              key={cat.id}
              className="group hover-lift cursor-pointer animate-slide-up transition-all duration-200"
              style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
              onClick={() => navigate(`/app?category=${cat.id}`)}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-lg bg-primary/[0.07] flex items-center justify-center text-primary">
                  <Folder size={18} />
                </div>
                <span className="text-sm font-medium flex-1">{cat.name}</span>
                <ChevronRight size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
