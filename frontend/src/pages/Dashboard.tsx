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

  if (loading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Documents</h2>
          <p className="text-muted-foreground mt-0.5 text-sm">{docs.length} document{docs.length !== 1 ? 's' : ''} in your vault</p>
        </div>
        <Button className="gradient-bg border-0 text-white" onClick={() => navigate('/app/upload')}>
          <Plus size={16} className="mr-1.5" /> Upload
        </Button>
      </div>

      {/* Search filter */}
      {docs.length > 0 && (
        <div className="relative max-w-sm mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter documents..."
            className="pl-9 h-10"
          />
        </div>
      )}

      {/* Content */}
      {docs.length === 0 ? (
        <Card className="border-dashed border-2 animate-fade-in">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-primary/60" />
            </div>
            <h3 className="font-semibold text-lg">No documents yet</h3>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-sm text-center">
              Upload your first document to get started. Snap a photo of a manual, warranty card, or guide.
            </p>
            <Button className="mt-6 gradient-bg border-0 text-white" onClick={() => navigate('/app/upload')}>
              <Plus size={16} className="mr-1.5" /> Upload your first document
            </Button>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">No documents match "{filter}"</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((doc, i) => (
            <Card
              key={doc.id}
              className="group hover-lift cursor-pointer animate-slide-up overflow-hidden"
              style={{ animationDelay: `${i * 0.05}s`, animationFillMode: 'both' }}
              onClick={() => navigate(`/app/documents/${doc.id}`)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText size={18} className="text-primary" />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={(e) => handleDelete(e, doc.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
                <h3 className="font-medium text-sm mt-3 leading-tight line-clamp-2">{doc.title}</h3>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {doc.brand && <Badge color="blue">{doc.brand}</Badge>}
                  {doc.document_type && <Badge color="purple">{doc.document_type}</Badge>}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  {new Date(doc.created_at).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  )
}

function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="p-8 max-w-6xl mx-auto animate-fade-in">{children}</div>
}

function Badge({ children, color }: { children: React.ReactNode; color: 'blue' | 'purple' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700',
    purple: 'bg-purple-50 text-purple-700',
  }
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${colors[color]}`}>
      {children}
    </span>
  )
}
