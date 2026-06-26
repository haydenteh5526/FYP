import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, Info, Save, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getDocument, type Document } from '@/lib/api'

export default function DocumentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [doc, setDoc] = useState<Document | null>(null)
  const [tab, setTab] = useState<'preview' | 'text' | 'info'>('preview')

  useEffect(() => {
    if (id) getDocument(id).then(setDoc)
  }, [id])

  if (!doc) return <div className="p-8 text-muted-foreground animate-fade-in">Loading...</div>

  const isPdf = doc.image_url?.includes('.pdf')

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/app')}>
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h2 className="text-xl font-bold tracking-tight">{doc.title}</h2>
          <div className="flex gap-2 mt-1">
            {doc.brand && <Badge>{doc.brand}</Badge>}
            {doc.document_type && <Badge>{doc.document_type}</Badge>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b mb-6">
        <TabButton active={tab === 'preview'} onClick={() => setTab('preview')} icon={<Eye size={16} />} label="Preview" />
        <TabButton active={tab === 'text'} onClick={() => setTab('text')} icon={<FileText size={16} />} label="Text" />
        <TabButton active={tab === 'info'} onClick={() => setTab('info')} icon={<Info size={16} />} label="Info" />
      </div>

      {/* Preview tab */}
      {tab === 'preview' && (
        <Card>
          <CardContent className="p-4">
            {doc.image_url ? (
              isPdf ? (
                <iframe src={doc.image_url} className="w-full h-[600px] rounded-md border" title={doc.title} />
              ) : (
                <img src={doc.image_url} alt={doc.title} className="max-w-full rounded-md" />
              )
            ) : (
              <p className="text-muted-foreground text-sm py-12 text-center">No preview available</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Text tab */}
      {tab === 'text' && (
        <Card>
          <CardContent className="p-6">
            {doc.raw_text ? (
              <EditableText documentId={doc.id} initialText={doc.raw_text} />
            ) : (
              <p className="text-muted-foreground text-sm py-12 text-center">No text extracted yet. The document may still be processing.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Info tab */}
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
              <dd>{formatFileSize(doc.file_size)}</dd>
              <dt className="text-muted-foreground">Uploaded</dt>
              <dd>{new Date(doc.created_at).toLocaleString()}</dd>
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '—'
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / 1024).toFixed(1)} KB`
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-all duration-200 ${
        active ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
      }`}
    >
      {icon}{label}
    </button>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-primary/[0.08] px-2.5 py-0.5 text-xs font-medium text-primary">
      {children}
    </span>
  )
}

function EditableText({ documentId, initialText }: { documentId: string; initialText: string }) {
  const [text, setText] = useState(initialText)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    const token = localStorage.getItem('token')
    await fetch(`/api/v1/documents/${documentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ raw_text: text }),
    })
    setSaving(false)
    setEditing(false)
  }

  if (!editing) {
    return (
      <div>
        <div className="flex justify-end mb-3">
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>Edit text</Button>
        </div>
        <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans max-h-[500px] overflow-auto">{text}</pre>
      </div>
    )
  }

  return (
    <div>
      <textarea
        className="w-full h-64 text-sm border rounded-md p-3 font-sans focus:outline-none focus:ring-1 focus:ring-primary"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex gap-2 mt-2">
        <Button size="sm" className="gradient-bg border-0 text-white" onClick={handleSave} disabled={saving}>
          <Save size={14} className="mr-1" />{saving ? 'Saving...' : 'Save'}
        </Button>
        <Button variant="outline" size="sm" onClick={() => { setText(initialText); setEditing(false) }}>Cancel</Button>
      </div>
    </div>
  )
}
