import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, Info, Save, Eye, MessageSquare, Send, Bot, Copy, Check, Share2, X, Plus, Tag as TagIcon, History, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { getDocument, askQuestion, shareDocument, getTags, createTag, addTagToDocument, removeTagFromDocument, updateDocumentText, getDocumentVersions, restoreDocumentVersion, type Document, type Tag, type DocumentVersion } from '@/lib/api'

export default function DocumentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [doc, setDoc] = useState<Document | null>(null)
  const [tab, setTab] = useState<'preview' | 'text' | 'info' | 'ask'>('preview')

  useEffect(() => {
    if (id) getDocument(id).then(setDoc)
  }, [id])

  // Poll while processing — only update state when status changes to avoid re-rendering preview
  useEffect(() => {
    if (!doc || !id) return
    if (doc.processing_status === 'complete' || doc.processing_status === 'failed') return
    const timer = setInterval(async () => {
      const updated = await getDocument(id)
      if (updated.processing_status !== doc.processing_status) {
        setDoc(updated)
      }
      if (updated.processing_status === 'complete' || updated.processing_status === 'failed') {
        clearInterval(timer)
        setDoc(updated) // final update with all data
      }
    }, 3000)
    return () => clearInterval(timer)
  }, [doc?.processing_status, id])

  if (!doc) {
    return (
      <div className="p-8 max-w-5xl mx-auto animate-fade-in">
        <div className="h-8 w-64 bg-muted rounded animate-pulse mb-6" />
        <div className="h-10 w-80 bg-muted rounded animate-pulse mb-6" />
        <div className="h-[70vh] bg-muted rounded-xl animate-pulse" />
      </div>
    )
  }

  const isProcessing = doc.processing_status && doc.processing_status !== 'complete' && doc.processing_status !== 'failed'
  const isPdf = doc.image_url?.includes('.pdf')
  // Use the first image_url we get — don't let polling re-trigger image loads
  const stableImageUrl = useRef(doc.image_url)
  if (!stableImageUrl.current && doc.image_url) stableImageUrl.current = doc.image_url

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      {/* Processing banner */}
      {isProcessing && (
        <div className="mb-6 rounded-xl border border-primary/20 bg-primary/[0.03] p-5 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center shadow-md shadow-primary/20">
              <Loader2 size={20} className="text-white animate-spin" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Processing your document...</p>
              <p className="text-xs text-muted-foreground mt-0.5">AI is extracting text, detecting metadata, and generating embeddings.</p>
            </div>
          </div>
          <div className="mt-4 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full gradient-bg rounded-full animate-[progress_2.5s_ease-in-out_infinite]" style={{ width: '70%' }} />
          </div>
        </div>
      )}

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
            {stableImageUrl.current ? (
              isPdf ? (
                <iframe src={stableImageUrl.current} className="w-full h-[80vh] rounded-md" title={doc.title} />
              ) : (
                <img src={stableImageUrl.current} alt={doc.title} className="w-full rounded-md object-contain" />
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
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
                <Loader2 size={28} className="animate-spin text-primary mb-4" />
                <p className="text-sm font-medium">Extracting text...</p>
                <p className="text-xs text-muted-foreground mt-1">AI is reading your document. This usually takes 10–30 seconds.</p>
              </div>
            ) : doc.raw_text ? (
              <EditableText documentId={doc.id} initialText={doc.raw_text} />
            ) : (
              <p className="text-muted-foreground text-sm py-12 text-center">No text could be extracted from this document.</p>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'info' && (
        <Card>
          <CardContent className="p-6">
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
                <Loader2 size={28} className="animate-spin text-primary mb-4" />
                <p className="text-sm font-medium">Analysing document...</p>
                <p className="text-xs text-muted-foreground mt-1">Detecting brand, model, and document type.</p>
              </div>
            ) : (
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
            )}
            <TagEditor doc={doc} onChange={setDoc} />
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

function TagEditor({ doc, onChange }: { doc: Document; onChange: (d: Document) => void }) {
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [input, setInput] = useState('')
  const [adding, setAdding] = useState(false)
  const docTags = doc.tags || []

  useEffect(() => { getTags().then(setAllTags) }, [])

  async function attach(tag: Tag) {
    await addTagToDocument(doc.id, tag.id)
    onChange({ ...doc, tags: [...docTags, tag] })
  }

  async function detach(tag: Tag) {
    await removeTagFromDocument(doc.id, tag.id)
    onChange({ ...doc, tags: docTags.filter(t => t.id !== tag.id) })
  }

  async function createAndAttach() {
    const name = input.trim()
    if (!name) return
    const tag = await createTag(name)
    setAllTags(prev => (prev.some(t => t.id === tag.id) ? prev : [...prev, tag]))
    if (!docTags.some(t => t.id === tag.id)) {
      await addTagToDocument(doc.id, tag.id)
      onChange({ ...doc, tags: [...docTags, tag] })
    }
    setInput('')
    setAdding(false)
  }

  const available = allTags.filter(t => !docTags.some(dt => dt.id === t.id))

  return (
    <div className="mt-6 pt-5 border-t">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2.5">
        <TagIcon size={13} /> Tags
      </div>
      <div className="flex flex-wrap gap-1.5 items-center">
        {docTags.map(tag => (
          <span key={tag.id} className="inline-flex items-center gap-1 rounded-full bg-primary/[0.08] px-2.5 py-1 text-xs font-medium text-primary">
            {tag.name}
            <button onClick={() => detach(tag)} className="hover:text-destructive" aria-label={`Remove ${tag.name}`}><X size={12} /></button>
          </span>
        ))}
        {adding ? (
          <Input
            autoFocus
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') createAndAttach(); if (e.key === 'Escape') { setAdding(false); setInput('') } }}
            onBlur={() => { if (!input.trim()) setAdding(false) }}
            placeholder="Tag name…"
            className="h-7 w-32 text-xs"
          />
        ) : (
          <button onClick={() => setAdding(true)} className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors">
            <Plus size={12} /> Add tag
          </button>
        )}
      </div>
      {adding && available.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {available.map(tag => (
            <button key={tag.id} onClick={() => attach(tag)} className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground hover:bg-primary/[0.08] hover:text-primary transition-colors">
              {tag.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
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
  const [showHistory, setShowHistory] = useState(false)
  const [versions, setVersions] = useState<DocumentVersion[]>([])
  const [loadingVersions, setLoadingVersions] = useState(false)

  async function loadVersions() {
    setLoadingVersions(true)
    try {
      setVersions(await getDocumentVersions(documentId))
    } finally {
      setLoadingVersions(false)
    }
  }

  async function toggleHistory() {
    const next = !showHistory
    setShowHistory(next)
    if (next) await loadVersions()
  }

  async function handleSave() {
    setSaving(true)
    try {
      await updateDocumentText(documentId, text)
    } finally {
      setSaving(false)
      setEditing(false)
    }
  }

  async function handleRestore(versionId: string) {
    const updated = await restoreDocumentVersion(documentId, versionId)
    setText(updated.raw_text || '')
    await loadVersions()
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
          <Button variant="outline" size="sm" onClick={toggleHistory}>
            <History size={13} className="mr-1" /> History
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <><Check size={13} className="mr-1 text-green-600" /> Copied</> : <><Copy size={13} className="mr-1" /> Copy</>}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>Edit</Button>
        </div>
        {showHistory && (
          <Card className="mb-4 animate-slide-up">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground mb-3">Edit history</p>
              {loadingVersions ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : versions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No previous versions yet. Versions are saved each time you edit the text.</p>
              ) : (
                <ul className="space-y-2">
                  {versions.map(v => (
                    <li key={v.id} className="flex items-start justify-between gap-3 rounded-lg border p-3">
                      <div className="min-w-0">
                        <p className="text-xs font-medium">Version {v.version_number}<span className="text-muted-foreground font-normal"> · {v.char_count} chars · {v.created_at ? new Date(v.created_at).toLocaleString() : ''}</span></p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{v.preview}</p>
                      </div>
                      <Button variant="outline" size="sm" className="shrink-0" onClick={() => handleRestore(v.id)}>Restore</Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}
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
