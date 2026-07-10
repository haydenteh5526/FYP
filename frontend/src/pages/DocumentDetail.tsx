import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, Info, Save, Eye, MessageSquare, Send, Bot, Copy, Check, Share2, X, Plus, Tag as TagIcon, History, Loader2, FolderOpen, Download, Star, Trash2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { getDocument, askQuestion, shareDocument, findSimilarDocuments, getTags, createTag, addTagToDocument, removeTagFromDocument, updateDocumentText, getDocumentVersions, restoreDocumentVersion, deleteDocument, toggleFavourite, type Document, type Tag, type DocumentVersion, type SimilarDocument } from '@/lib/api'
import { useToast } from '@/components/Toast'

export default function DocumentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [doc, setDoc] = useState<Document | null>(null)
  const [tab, setTab] = useState<'preview' | 'text' | 'info' | 'ask'>('preview')
  const stableImageUrl = useRef<string | null>(null)
  const { toast } = useToast()

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

  // Keep the first image_url we get stable so preview doesn't re-load on polls
  if (doc?.image_url && !stableImageUrl.current) {
    stableImageUrl.current = doc.image_url
  }

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

  async function handleDelete() {
    if (!doc || !window.confirm('Are you sure you want to delete this document?')) return
    try {
      await deleteDocument(doc.id)
      toast('Document deleted', 'success')
      navigate('/app')
    } catch {
      toast('Failed to delete document', 'error')
    }
  }

  async function handleToggleFavourite() {
    if (!doc) return
    const nextState = !doc.is_favourite
    setDoc({ ...doc, is_favourite: nextState })
    try {
      await toggleFavourite(doc.id)
      toast(nextState ? 'Added to favourites' : 'Removed from favourites', 'success')
    } catch {
      setDoc({ ...doc, is_favourite: !nextState }) // revert on error
    }
  }

  return (
    <div className="flex flex-col h-full bg-muted/10">
      {/* Hero Section */}
      <div className="relative border-b border-border/40 bg-background/80 backdrop-blur-xl overflow-hidden shrink-0 z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.05] via-purple-500/[0.05] to-transparent pointer-events-none" />
        
        <div className="relative px-8 pt-6 pb-4">
          <div className="flex items-start gap-5">
            <Button variant="ghost" size="icon" onClick={() => navigate('/app')} className="shrink-0 rounded-full hover:bg-background/80 hover:shadow-sm">
              <ArrowLeft size={18} className="text-muted-foreground" />
            </Button>
            
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold tracking-tight truncate text-foreground/90">{doc.title}</h2>
                {doc.is_favourite && <Star className="h-5 w-5 text-amber-500 fill-amber-500 shrink-0 drop-shadow-sm" />}
              </div>
              
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {doc.brand && <Badge variant="secondary">{doc.brand}</Badge>}
                {doc.document_type && <Badge variant="outline">{doc.document_type}</Badge>}
                {doc.category_id && <Badge variant="outline" className="bg-primary/[0.03] text-primary border-primary/20">Categorised</Badge>}
                <span className="text-xs text-muted-foreground font-medium pl-1">
                  {formatFileSize(doc.file_size)} • Uploaded {new Date(doc.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Top right actions */}
            <div className="flex items-center gap-2 shrink-0">
              {stableImageUrl.current && (
                <Button variant="outline" size="sm" className="h-9 rounded-full bg-background/50 hover:bg-background shadow-sm hover:shadow transition-all" asChild>
                  <a href={stableImageUrl.current} download={doc.title} target="_blank" rel="noopener noreferrer">
                    <Download size={14} className="mr-1.5" /> Download
                  </a>
                </Button>
              )}
              <ShareButton documentId={doc.id} />
            </div>
          </div>

          {/* Processing banner inline */}
          {isProcessing && (
            <div className="mt-5 rounded-xl border border-primary/20 bg-primary/[0.04] p-4 flex items-center gap-4 animate-fade-in shadow-inner">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center shrink-0">
                <Loader2 size={16} className="text-white animate-spin" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-primary">Processing document...</p>
                <div className="mt-1.5 h-1.5 bg-primary/10 rounded-full overflow-hidden">
                  <div className="h-full gradient-bg rounded-full animate-[progress_2s_ease-in-out_infinite]" style={{ width: '60%' }} />
                </div>
              </div>
            </div>
          )}

          {/* Folder suggestion inline */}
          {!isProcessing && doc.document_type && !doc.category_id && (
            <div className="mt-5 flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 animate-fade-in">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                <FolderOpen size={16} className="text-amber-600" />
              </div>
              <p className="text-sm flex-1 text-amber-900/80 dark:text-amber-200/80">AI suggests moving this to <span className="font-semibold text-amber-900 dark:text-amber-200">{doc.document_type}</span></p>
              <Button size="sm" className="shrink-0 h-8 text-xs bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-sm" onClick={async () => {
                const { createCategory, moveToCategory, getCategories } = await import('@/lib/api')
                const cats = await getCategories()
                let cat = cats.find((c: { name: string }) => c.name === doc.document_type)
                if (!cat) cat = await createCategory(doc.document_type!)
                await moveToCategory(doc.id, cat.id)
                setDoc({ ...doc, category_id: cat.id })
              }}>Move</Button>
              <Button size="sm" variant="ghost" className="shrink-0 h-8 text-xs text-amber-700/60 hover:text-amber-700 hover:bg-amber-500/10" onClick={() => setDoc({ ...doc, document_type: null })}>Dismiss</Button>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 mt-6 -mb-4">
            <TabButton active={tab === 'preview'} onClick={() => setTab('preview')} icon={<Eye size={14} />} label="Preview" />
            <TabButton active={tab === 'text'} onClick={() => setTab('text')} icon={<FileText size={14} />} label="Text" />
            <TabButton active={tab === 'info'} onClick={() => setTab('info')} icon={<Info size={14} />} label="Details" />
            <TabButton active={tab === 'ask'} onClick={() => setTab('ask')} icon={<MessageSquare size={14} />} label="Ask AI" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-8 relative">
        <div className="max-w-5xl mx-auto space-y-6 pb-20">

      {/* Preview */}
      {tab === 'preview' && (
        <Card className="border-border/50 shadow-sm animate-slide-up overflow-hidden">
          <CardContent className="p-0 bg-background/50">
            {stableImageUrl.current ? (
              isPdf ? (
                <iframe src={stableImageUrl.current} className="w-full h-[75vh] border-0" title={doc.title} />
              ) : (
                <div className="flex items-center justify-center p-8 bg-black/5">
                  <img src={stableImageUrl.current} alt={doc.title} className="max-w-full max-h-[75vh] rounded-lg shadow-xl" />
                </div>
              )
            ) : (
              <div className="h-[60vh] flex flex-col items-center justify-center text-muted-foreground bg-muted/10">
                <FileText size={48} className="mb-4 opacity-20" />
                <p className="text-sm font-medium">No preview available</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'text' && (
        <Card className="border-border/50 shadow-sm animate-slide-up">
          <CardContent className="p-8">
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                <Loader2 size={32} className="animate-spin text-primary mb-5" />
                <p className="text-base font-semibold">Extracting text...</p>
                <p className="text-sm text-muted-foreground mt-1.5">AI is reading your document. This usually takes 10–30 seconds.</p>
              </div>
            ) : doc.raw_text ? (
              <EditableText documentId={doc.id} initialText={doc.raw_text} />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
                <FileText size={40} className="mb-4 opacity-20" />
                <p className="text-sm font-medium">No text could be extracted from this document.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'info' && (
        <div className="animate-slide-up">
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-8">
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
                  <Loader2 size={28} className="animate-spin text-primary mb-4" />
                  <p className="text-sm font-medium">Analysing document...</p>
                  <p className="text-xs text-muted-foreground mt-1">Detecting brand, model, and document type.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  <div>
                    <h3 className="text-sm font-semibold mb-4 text-foreground/80 flex items-center gap-2">
                      <Info size={16} className="text-primary" /> Document Details
                    </h3>
                    <dl className="space-y-3 text-sm">
                      <div className="flex justify-between border-b border-border/40 pb-2"><dt className="text-muted-foreground">Brand</dt><dd className="font-medium">{doc.brand || '—'}</dd></div>
                      <div className="flex justify-between border-b border-border/40 pb-2"><dt className="text-muted-foreground">Model</dt><dd className="font-medium">{doc.model || '—'}</dd></div>
                      <div className="flex justify-between border-b border-border/40 pb-2"><dt className="text-muted-foreground">Type</dt><dd className="font-medium">{doc.document_type || '—'}</dd></div>
                      <div className="flex justify-between border-b border-border/40 pb-2"><dt className="text-muted-foreground">File size</dt><dd className="font-medium">{formatFileSize(doc.file_size)}</dd></div>
                      <div className="flex justify-between"><dt className="text-muted-foreground">Uploaded</dt><dd className="font-medium">{new Date(doc.created_at).toLocaleString()}</dd></div>
                    </dl>
                  </div>
                  <div>
                    <TagEditor doc={doc} onChange={setDoc} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {!isProcessing && doc.raw_text && (
            <div className="mt-6">
              <RelatedDocuments documentId={doc.id} />
            </div>
          )}
        </div>
      )}

      {tab === 'ask' && (
        <div className="animate-slide-up h-[75vh]">
          <DocumentChat documentId={doc.id} documentTitle={doc.title} />
        </div>
      )}
        </div>
      </div>

      {/* Floating Action Bar (Bottom) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-background/80 backdrop-blur-xl border border-border/50 shadow-lg shadow-black/5">
          <Button variant="ghost" size="sm" className="h-9 rounded-full px-4 text-xs font-medium hover:bg-muted" onClick={handleToggleFavourite}>
            <Star size={14} className={`mr-1.5 ${doc.is_favourite ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground'}`} />
            {doc.is_favourite ? 'Favourited' : 'Favourite'}
          </Button>
          <div className="w-px h-5 bg-border/60" />
          <Button variant="ghost" size="sm" className="h-9 rounded-full px-4 text-xs font-medium text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={handleDelete}>
            <Trash2 size={14} className="mr-1.5" />
            Delete
          </Button>
        </div>
      </div>
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
    <button onClick={onClick} className="relative px-5 py-2.5 text-sm font-semibold transition-colors duration-200 group flex items-center gap-2">
      <span className={`relative z-10 flex items-center gap-2 ${active ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground/80'}`}>
        <span className={active ? 'text-primary' : ''}>{icon}</span>
        {label}
      </span>
      {active && (
        <div className="absolute inset-0 bg-background rounded-t-lg border-t border-l border-r border-border/50 z-0" />
      )}
      {!active && (
        <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/50 rounded-t-lg z-0 transition-colors" />
      )}
    </button>
  )
}

function Badge({ children, variant = 'secondary', className = '' }: { children: React.ReactNode, variant?: 'secondary' | 'outline', className?: string }) {
  const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors"
  const variants = {
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-transparent",
    outline: "border border-border/60 text-foreground"
  }
  return <span className={`${base} ${variants[variant]} ${className}`}>{children}</span>
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
    <Button variant="outline" size="sm" onClick={handleShare} disabled={loading} className="h-9 rounded-full bg-background/50 hover:bg-background shadow-sm hover:shadow transition-all w-24">
      {copied ? <><Check size={14} className="mr-1.5 text-green-600" /> Copied</> : <><Share2 size={14} className="mr-1.5" /> Share</>}
    </Button>
  )
}

function RelatedDocuments({ documentId }: { documentId: string }) {
  const [similar, setSimilar] = useState<SimilarDocument[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    findSimilarDocuments(documentId).then(data => {
      setSimilar(data.similar || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [documentId])

  if (loading) return (
    <Card className="mt-4 animate-fade-in">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 size={14} className="animate-spin" /> Finding related documents...
        </div>
      </CardContent>
    </Card>
  )

  if (similar.length === 0) return null

  return (
    <Card className="mt-4 animate-fade-in">
      <CardContent className="p-5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Related Documents</p>
        <div className="space-y-2">
          {similar.map(doc => (
            <button
              key={doc.id}
              onClick={() => navigate(`/app/documents/${doc.id}`)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent/50 transition-colors text-left"
            >
              <FileText size={15} className="text-primary/60 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{doc.title}</p>
                <p className="text-[11px] text-muted-foreground">
                  {doc.brand && `${doc.brand} · `}{doc.document_type || 'Document'} · {Math.round(doc.similarity * 100)}% similar
                </p>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
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
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

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
    <Card className="h-full border-border/50 shadow-sm flex flex-col overflow-hidden">
      <CardContent className="p-0 flex flex-col h-full bg-background/50">
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="relative w-20 h-20 mb-4">
                <div className="absolute inset-0 m-auto w-16 h-16 rounded-full gradient-bg opacity-10 blur-xl animate-pulse" />
                <div className="absolute inset-0 m-auto w-12 h-12 rounded-xl bg-background border border-border/50 shadow-lg flex items-center justify-center z-10">
                  <Bot className="h-5 w-5 text-primary/70" />
                </div>
              </div>
              <h3 className="font-semibold text-foreground">Ask about {documentTitle}</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">Get answers specifically from this document's contents.</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 animate-slide-up ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full gradient-bg flex items-center justify-center shadow-sm shadow-primary/20">
                    <Bot size={14} className="text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'gradient-bg text-white rounded-br-md shadow-sm shadow-primary/15' 
                    : 'bg-card/60 backdrop-blur-md border border-border/40 text-foreground rounded-bl-md shadow-sm'
                }`}>
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center shadow-sm">
                    <User size={14} className="text-secondary-foreground" />
                  </div>
                )}
              </div>
            ))
          )}
          {loading && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center shadow-sm shadow-primary/20">
                <Bot size={14} className="text-white" />
              </div>
              <div className="bg-card/60 backdrop-blur-md border border-border/40 rounded-2xl rounded-bl-md px-5 py-3.5 shadow-sm">
                <div className="flex gap-1.5 items-center">
                  <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:0.3s]" />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        
        <div className="p-4 bg-card border-t border-border/40">
          <form onSubmit={handleSubmit} className="relative group flex items-end gap-2 bg-background border border-border/60 rounded-xl p-1.5 shadow-sm group-focus-within:border-primary/30 transition-all duration-300">
            <Input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="Ask a question about this document..." 
              disabled={loading} 
              className="border-0 shadow-none focus-visible:ring-0 h-10 px-3" 
            />
            <Button 
              type="submit" 
              size="icon" 
              className="h-10 w-10 rounded-lg gradient-bg border-0 text-white shrink-0 shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:shadow-none" 
              disabled={loading || !input.trim()}
            >
              <Send size={15} />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
