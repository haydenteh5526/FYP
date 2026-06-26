import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FileText, Trash2, FolderOpen, Layers } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getDocuments, deleteDocument, getCategories, type Document } from '@/lib/api'

export default function Dashboard() {
  const [allDocs, setAllDocs] = useState<Document[]>([])
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryFilter = searchParams.get('category')
  const navigate = useNavigate()

  // Fetch everything once
  useEffect(() => {
    Promise.all([getDocuments(), getCategories()]).then(([docsData, catsData]) => {
      setAllDocs(docsData.documents)
      setCategories(catsData)
      setLoading(false)
    })
  }, [])

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    await deleteDocument(id)
    setAllDocs(allDocs.filter(d => d.id !== id))
  }

  // Client-side filter — instant, no network call
  const activeCategoryName = categories.find(c => c.id === categoryFilter)?.name
  const docs = categoryFilter
    ? allDocs.filter(d => d.category_id === categoryFilter)
    : allDocs

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 animate-fade-in">
        <h2 className="text-2xl font-bold tracking-tight">Documents</h2>
        <p className="text-muted-foreground text-sm mt-0.5">
          {loading ? 'Loading...' : `${docs.length} document${docs.length !== 1 ? 's' : ''}${activeCategoryName ? ` in ${activeCategoryName}` : ' in your vault'}`}
        </p>
      </div>

      {/* Summary stats */}
      {!loading && (
        <div className="grid grid-cols-3 gap-4 mb-8 animate-fade-in">
          <StatCard icon={<FileText size={18} />} value={allDocs.length} label="Documents" />
          <StatCard icon={<FolderOpen size={18} />} value={categories.length} label="Categories" />
          <StatCard icon={<Layers size={18} />} value={new Set(allDocs.map(d => d.brand).filter(Boolean)).size} label="Brands" />
        </div>
      )}

      {/* Category filter pills */}
      {!loading && categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6 animate-fade-in">
          <FilterPill active={!categoryFilter} onClick={() => setSearchParams({})}>All</FilterPill>
          {categories.map(cat => (
            <FilterPill key={cat.id} active={categoryFilter === cat.id} onClick={() => setSearchParams({ category: cat.id })}>
              {cat.name}
            </FilterPill>
          ))}
        </div>
      )}

      {/* Skeleton — only on first load */}
      {loading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-5"><div className="w-10 h-10 rounded-lg bg-muted" /><div className="h-4 bg-muted rounded mt-4 w-3/4" /><div className="h-3 bg-muted rounded mt-3 w-1/2" /></CardContent></Card>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && docs.length === 0 && (
        <Card className="border-dashed border-2 border-border/60 animate-scale-in">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-primary/[0.07] flex items-center justify-center">
              <FileText className="h-7 w-7 text-primary/50" />
            </div>
            <h3 className="font-semibold text-lg mt-5">{activeCategoryName ? `No documents in ${activeCategoryName}` : 'No documents yet'}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{activeCategoryName ? 'Try another category.' : 'Upload your first document to get started.'}</p>
            {!activeCategoryName && <Button className="mt-6 gradient-bg border-0 text-white" onClick={() => navigate('/app/upload')}>Upload document</Button>}
          </CardContent>
        </Card>
      )}

      {/* Grid — key on filter forces smooth re-mount animation */}
      {!loading && docs.length > 0 && (
        <div key={categoryFilter || 'all'} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {docs.map((doc, i) => (
            <Card
              key={doc.id}
              className="group hover-lift cursor-pointer animate-slide-up overflow-hidden"
              style={{ animationDelay: `${Math.min(i * 40, 300)}ms`, animationFillMode: 'both' }}
              onClick={() => navigate(`/app/documents/${doc.id}`)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-primary/[0.07] flex items-center justify-center transition-all duration-200 group-hover:bg-primary/[0.12] group-hover:scale-105">
                    <FileText size={18} className="text-primary/70" />
                  </div>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-all duration-200 h-7 w-7 text-muted-foreground hover:text-destructive" onClick={(e) => handleDelete(e, doc.id)}>
                    <Trash2 size={13} />
                  </Button>
                </div>
                <h3 className="font-medium text-sm mt-3.5 leading-snug line-clamp-2">{doc.title}</h3>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {doc.brand && <Badge>{doc.brand}</Badge>}
                  {doc.document_type && <Badge variant="secondary">{doc.document_type}</Badge>}
                </div>
                <p className="text-[11px] text-muted-foreground/70 mt-3">
                  {new Date(doc.created_at).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-3.5 py-1.5 rounded-full border transition-all duration-300 ${
        active
          ? 'gradient-bg text-white border-transparent shadow-sm shadow-primary/20'
          : 'border-border/60 text-muted-foreground hover:bg-accent hover:border-primary/20'
      }`}
    >
      {children}
    </button>
  )
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <Card className="transition-all duration-200 hover:shadow-sm">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/[0.07] flex items-center justify-center text-primary">{icon}</div>
        <div>
          <p className="text-xl font-bold tabular-nums">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function Badge({ children, variant = 'primary' }: { children: React.ReactNode; variant?: 'primary' | 'secondary' }) {
  const styles = variant === 'primary' ? 'bg-primary/[0.08] text-primary' : 'bg-secondary text-secondary-foreground'
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${styles}`}>{children}</span>
}
