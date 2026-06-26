import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, Info, Save, Eye, MessageSquare, Send, Bot, Copy, Check, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { getDocument, askQuestion, shareDocument, type Document } from '@/lib/api'

export default function DocumentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [doc, setDoc] = useState<Document | null>(null)
  const [tab, setTab] = useState<'preview' | 'text' | 'info' | 'ask'>('preview')

  useEffect(() => {
    if (id) getDocument(id).then(setDoc)
  }, [id])

  if (!doc) {
    return (
      <div className="p-8 max-w-5xl mx-auto animate-fade-in">
        <div className="h-8 w-64 bg-muted rounded animate-pulse mb-6" />
        <div className="h-10 w-80 bg-muted rounded animate-pulse mb-6" />
        <div className="h-[70vh] bg-muted rounded-xl animate-pulse" />
      </div>
    )
  }

  const isPdf = doc.image_url?.includes('.pdf')

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/app')}>
          <ArrowLeft size={18} />
        </Button>
        <div className="flex-1">
          <h2 className="text-xl font-bold tracking-tight">{doc.title}</h2>
          <div className="flex gap-2 mt-1">
            {doc.brand && <Badge>{doc.brand}</Badge>}
            {doc.document_type && <Badge>{doc.document_type}</Badge>}
          </div>
        </div>
        <ShareButton documentId={doc.id} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b mb-6">
        <TabButton active={tab === 'preview'} onClick={() => setTab('preview')} icon={<Eye size={16} />} label="Preview" />
        <TabButton active={tab === 'text'} onClick={() => setTab('text')} icon={<FileText size={16} />} label="Text" />
        <TabButton active={tab === 'info'} onClick={() => setTab('info')} icon={<Info size={16} />} label="Info" />
        <TabButton active={tab === 'ask'} onClick={() => setTab('ask')} icon={<MessageSquare size={16} />} label="Ask AI" />
      </div>

      {/* Preview — full width, tall */}
      {tab === 'preview' && (
        <Card>
          <CardContent className="p-3">
            {doc.image_url ? (
              isPdf ? (
                <iframe src={doc.image_url} className="w-full h-[80vh] rounded-md" title={doc.title} />
              ) : (
                <img src={doc.image_url} alt={doc.title} className="w-full rounded-md object-contain" />
              )
            ) : (
              <div className="h-[60vh] flex items-center justify-center text-sm text-muted-foreground">No preview available</div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'text' && (
        <Card>
          <CardContent className="p-6">
            {doc.raw_text ? (
              <EditableText documentId={doc.id} initialText={doc.raw_text} />
            ) : (
              <p className="text-muted-foreground text-sm py-12 text-center">No text extracted yet.</p>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'info' && (
        <Card>
          <CardContent className="p-6">
            <dl className="grid grid-cols-2 gap-4 text-sm max-w-md">
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

      {tab === 'ask' && <DocumentChat documentId={doc.id} documentTitle={doc.title} />}
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
    <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-all duration-200 ${active ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
      {icon}{label}
    </button>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center rounded-full bg-primary/[0.08] px-2.5 py-0.5 text-xs font-medium text-primary">{children}</span>
}

function ShareButton({ documentId }: { documentId: string }) {
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleShare() {
    setLoading(true)
    try {
      const { share_url } = await shareDocument(documentId, 24)
      await navigator.clipboard.writeText(share_url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleShare} disabled={loading}>
      {copied ? <><Check size={14} className="mr-1.5 text-green-600" /> Link copied</> : <><Share2 size={14} className="mr-1.5" /> Share</>}
    </Button>
  )
}

function EditableText({ documentId, initialText }: { documentId: string; initialText: string }) {
  const [text, setText] = useState(initialText)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

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

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!editing) {
    return (
      <div>
        <div className="flex justify-end gap-2 mb-3">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <><Check size={13} className="mr-1 text-green-600" /> Copied</> : <><Copy size={13} className="mr-1" /> Copy</>}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>Edit</Button>
        </div>
        <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans max-h-[65vh] overflow-auto">{text}</pre>
      </div>
    )
  }

  return (
    <div>
      <textarea className="w-full h-[60vh] text-sm border rounded-md p-3 font-sans focus:outline-none focus:ring-1 focus:ring-primary" value={text} onChange={(e) => setText(e.target.value)} />
      <div className="flex gap-2 mt-2">
        <Button size="sm" className="gradient-bg border-0 text-white" onClick={handleSave} disabled={saving}>
          <Save size={14} className="mr-1" />{saving ? 'Saving...' : 'Save'}
        </Button>
        <Button variant="outline" size="sm" onClick={() => { setText(initialText); setEditing(false) }}>Cancel</Button>
      </div>
    </div>
  )
}

function DocumentChat({ documentId, documentTitle }: { documentId: string; documentTitle: string }) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return
    const question = input
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: question }])
    setLoading(true)
    try {
      const data = await askQuestion(question, documentId)
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="min-h-[300px] max-h-[60vh] overflow-auto space-y-4 mb-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center"><Bot className="h-6 w-6 text-white" /></div>
              <p className="mt-4 text-sm font-medium">Ask about {documentTitle}</p>
              <p className="text-xs text-muted-foreground mt-1">Answered using only this document.</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'assistant' && <div className="flex-shrink-0 w-8 h-8 rounded-full gradient-bg flex items-center justify-center"><Bot size={14} className="text-white" /></div>}
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === 'user' ? 'gradient-bg text-white rounded-br-md' : 'bg-muted/70 rounded-bl-md'}`}>{msg.content}</div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center"><Bot size={14} className="text-white" /></div>
              <div className="bg-muted/70 rounded-2xl rounded-bl-md px-4 py-3"><div className="flex gap-1.5"><div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" /><div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0.15s]" /><div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0.3s]" /></div></div>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about this document..." disabled={loading} className="h-10" />
          <Button type="submit" size="icon" className="h-10 w-10 gradient-bg border-0 text-white shrink-0" disabled={loading || !input.trim()}><Send size={15} /></Button>
        </form>
      </CardContent>
    </Card>
  )
}
