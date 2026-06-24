import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Trash2, Plus, Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getDocuments, deleteDocument, type Document } from '@/lib/api'

export default function Dashboard() {
  const [docs, setDocs] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const navigate = useNavigate()

  useEffect(() => { loadDocs() }, [])

  async function loadDocs() {
    setLoading(true)
    const data = await getDocuments()
    setDocs(data.documents)
    setLoading(false)
  }

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    await deleteDocument(id)
    setDocs(docs.filter(d => d.id !== id))
  }

  const filtered = docs.filter(d =>
    d.title.toLowerCase().includes(filter.toLowerCase()) ||
    d.brand?.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Documents</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            {loading ? 'Loading...' : `${docs.length} document${docs.length !== 1 ? 's' : ''} in your vault`}
          </p>
        </div>
        <Button className="gradient-bg border-0 text-white shadow-md shadow-primary/20 transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5" onClick={() => navigate('/app/upload')}>
          <Plus size={16} className="mr-1.5" /> Upload
        </Button>
      </div>

      {/* Filter */}
      {!loading && docs.length > 0 && (
        <div className="relative max-w-xs mb-6 animate-fade-in">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter..." className="pl-9 h-9 text-sm" />
        </div>
      )}

      {/* Skeleton loader */}
      {loading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-5">
                <div className="w-10 h-10 rounded-lg bg-muted" />
                <div className="h-4 bg-muted rounded mt-4 w-3/4" />
                <div className="h-3 bg-muted rounded mt-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && docs.length === 0 && (
        <Card className="border-dashed border-2 border-border/60 animate-scale-in">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-primary/[0.07] flex items-center justify-center">
              <FileText className="h-7 w-7 text-primary/50" />
            </div>
            <h3 className="font-semibold text-lg mt-5">No documents yet</h3>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-xs text-center">
              Upload your first document to get started.
            </p>
            <Button className="mt-6 gradient-bg border-0 text-white shadow-md shadow-primary/20" onClick={() => navigate('/app/upload')}>
              <Plus size={16} className="mr-1.5" /> Upload document
            </Button>
          </CardContent>
        </Card>
      )}

      {/* No filter match */}
      {!loading && docs.length > 0 && filtered.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-16 animate-fade-in">No documents match "{filter}"</p>
      )}

      {/* Document grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((doc, i) => (
            <Card
              key={doc.id}
              className="group hover-lift cursor-pointer animate-slide-up overflow-hidden"
              style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
              onClick={() => navigate(`/app/documents/${doc.id}`)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-primary/[0.07] flex items-center justify-center transition-all duration-200 group-hover:bg-primary/[0.12]">
                    <FileText size={18} className="text-primary/70" />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-all duration-200 h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={(e) => handleDelete(e, doc.id)}
                  >
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

function Badge({ children, variant = 'primary' }: { children: React.ReactNode; variant?: 'primary' | 'secondary' }) {
  const styles = variant === 'primary'
    ? 'bg-primary/[0.08] text-primary'
    : 'bg-secondary text-secondary-foreground'
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${styles}`}>
      {children}
    </span>
  )
}
