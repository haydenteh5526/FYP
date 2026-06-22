import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, Image, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getDocument, type Document } from '@/lib/api'

export default function DocumentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [doc, setDoc] = useState<Document | null>(null)
  const [tab, setTab] = useState<'image' | 'text' | 'info'>('text')

  useEffect(() => {
    if (id) getDocument(id).then(setDoc)
  }, [id])

  if (!doc) return <div className="p-8 text-muted-foreground">Loading...</div>

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{doc.title}</h2>
          <div className="flex gap-2 mt-1">
            {doc.brand && <Badge>{doc.brand}</Badge>}
            {doc.document_type && <Badge>{doc.document_type}</Badge>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b mb-6">
        <TabButton active={tab === 'image'} onClick={() => setTab('image')} icon={<Image size={16} />} label="Image" />
        <TabButton active={tab === 'text'} onClick={() => setTab('text')} icon={<FileText size={16} />} label="Text" />
        <TabButton active={tab === 'info'} onClick={() => setTab('info')} icon={<Info size={16} />} label="Info" />
      </div>

      {/* Tab content */}
      {tab === 'image' && doc.image_url && (
        <Card>
          <CardContent className="p-4">
            <img src={doc.image_url} alt={doc.title} className="max-w-full rounded-md" />
          </CardContent>
        </Card>
      )}

      {tab === 'text' && (
        <Card>
          <CardContent className="p-6">
            {doc.raw_text ? (
              <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">{doc.raw_text}</pre>
            ) : (
              <p className="text-muted-foreground text-sm">No text extracted yet.</p>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'info' && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Document Details</CardTitle></CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <dt className="text-muted-foreground">Brand</dt>
              <dd>{doc.brand || '—'}</dd>
              <dt className="text-muted-foreground">Model</dt>
              <dd>{doc.model || '—'}</dd>
              <dt className="text-muted-foreground">Type</dt>
              <dd>{doc.document_type || '—'}</dd>
              <dt className="text-muted-foreground">File size</dt>
              <dd>{doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : '—'}</dd>
              <dt className="text-muted-foreground">Uploaded</dt>
              <dd>{new Date(doc.created_at).toLocaleString()}</dd>
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
        active ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
      }`}
    >
      {icon}{label}
    </button>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
      {children}
    </span>
  )
}
