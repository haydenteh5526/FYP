import { useEffect, useState } from 'react'
import { FileText, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getDocuments, deleteDocument, type Document } from '@/lib/api'

export default function Dashboard() {
  const [docs, setDocs] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDocs()
  }, [])

  async function loadDocs() {
    setLoading(true)
    const data = await getDocuments()
    setDocs(data.documents)
    setLoading(false)
  }

  async function handleDelete(id: string) {
    await deleteDocument(id)
    setDocs(docs.filter(d => d.id !== id))
  }

  if (loading) return <PageShell title="Documents"><p className="text-muted-foreground">Loading...</p></PageShell>

  return (
    <PageShell title="Documents" subtitle={`${docs.length} document${docs.length !== 1 ? 's' : ''} stored`}>
      {docs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-sm text-muted-foreground">No documents yet. Upload your first one.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {docs.map(doc => (
            <Card key={doc.id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm font-medium leading-tight">{doc.title}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                    onClick={() => handleDelete(doc.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {doc.brand && <Badge>{doc.brand}</Badge>}
                  {doc.document_type && <Badge>{doc.document_type}</Badge>}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {new Date(doc.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  )
}

function PageShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
      {children}
    </span>
  )
}
