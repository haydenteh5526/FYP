import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FileText, Trash2, FolderOpen, FolderPlus, ChevronRight, Home, CheckSquare, Square, X, Loader2, MoveRight, Pencil } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getDocuments, deleteDocument, bulkDeleteDocuments, getCategories, createCategory, renameCategory, deleteCategory, moveToCategory, type Document } from '@/lib/api'

export default function Dashboard() {
  const [allDocs, setAllDocs] = useState<Document[]>([])
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [moveTarget, setMoveTarget] = useState<string | null>(null) // doc id being moved
  const [editingFolder, setEditingFolder] = useState<string | null>(null)
  const [editFolderName, setEditFolderName] = useState('')
  const [dragDocId, setDragDocId] = useState<string | null>(null)
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const currentFolder = searchParams.get('folder')
  const navigate = useNavigate()

  useEffect(() => { load() }, [])

  // Poll while processing
  useEffect(() => {
    const anyProcessing = allDocs.some(d => d.processing_status && d.processing_status !== 'complete' && d.processing_status !== 'failed')
    if (!anyProcessing) return
    const timer = setInterval(async () => {
      try {
        const docsData = await getDocuments()
        setAllDocs(Array.isArray(docsData?.documents) ? docsData.documents : [])
      } catch { /* ignore */ }
    }, 3000)
    return () => clearInterval(timer)
  }, [allDocs])

  async function load() {
    setLoading(true)
    setError(false)
    try {
      const [docsData, catsData] = await Promise.all([getDocuments(), getCategories()])
      setAllDocs(Array.isArray(docsData?.documents) ? docsData.documents : [])
      setCategories(Array.isArray(catsData) ? catsData : [])
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    await deleteDocument(id)
    setAllDocs(allDocs.filter(d => d.id !== id))
    setSelected(prev => { const n = new Set(prev); n.delete(id); return n })
  }

  function toggleSelect(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleBulkDelete() {
    const ids = [...selected]
    await bulkDeleteDocuments(ids)
    setAllDocs(allDocs.filter(d => !selected.has(d.id)))
    setSelected(new Set())
  }

  async function handleCreateFolder() {
    const name = newFolderName.trim()
    if (!name) return
    const cat = await createCategory(name)
    setCategories([...categories, cat])
    setCreatingFolder(false)
    setNewFolderName('')
  }

  async function handleRenameFolder(id: string) {
    const name = editFolderName.trim()
    if (!name) return
    const updated = await renameCategory(id, name)
    setCategories(categories.map(c => c.id === id ? updated : c))
    setEditingFolder(null)
    setEditFolderName('')
  }

  async function handleDeleteFolder(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    await deleteCategory(id)
    setCategories(categories.filter(c => c.id !== id))
    // Docs in this folder become uncategorised
    setAllDocs(allDocs.map(d => d.category_id === id ? { ...d, category_id: null } : d))
    if (currentFolder === id) setSearchParams({})
  }

  function handleDragStart(docId: string) {
    setDragDocId(docId)
  }

  function handleDragOverFolder(e: React.DragEvent, folderId: string) {
    e.preventDefault()
    setDragOverFolder(folderId)
  }

  async function handleDropOnFolder(folderId: string) {
    if (dragDocId) {
      await moveToCategory(dragDocId, folderId)
      setAllDocs(allDocs.map(d => d.id === dragDocId ? { ...d, category_id: folderId } : d))
    }
    setDragDocId(null)
    setDragOverFolder(null)
  }

  async function handleMove(docId: string, categoryId: string | null) {
    await moveToCategory(docId, categoryId)
    setAllDocs(allDocs.map(d => d.id === docId ? { ...d, category_id: categoryId } : d))
    setMoveTarget(null)
  }

  // Current view
  const currentCategoryName = categories.find(c => c.id === currentFolder)?.name
  const docsInFolder = currentFolder
    ? allDocs.filter(d => d.category_id === currentFolder)
    : allDocs.filter(d => !d.category_id) // Root shows uncategorised docs
  const totalDocs = allDocs.length

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6 animate-fade-in">
        <button onClick={() => setSearchParams({})} className="hover:text-foreground transition-colors flex items-center gap-1">
          <Home size={14} /> All Documents
        </button>
        {currentCategoryName && (
          <>
            <ChevronRight size={14} />
            <span className="text-foreground font-medium">{currentCategoryName}</span>
          </>
        )}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {currentCategoryName || 'Documents'}
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            {loading ? 'Loading...' : currentFolder
              ? `${docsInFolder.length} document${docsInFolder.length !== 1 ? 's' : ''}`
              : `${totalDocs} document${totalDocs !== 1 ? 's' : ''} · ${categories.length} folder${categories.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setCreatingFolder(true)}>
            <FolderPlus size={14} className="mr-1.5" /> New Folder
          </Button>
          <Button size="sm" className="gradient-bg border-0 text-white" onClick={() => navigate('/app/upload')}>
            Upload
          </Button>
        </div>
      </div>

      {/* New folder input */}
      {creatingFolder && (
        <div className="flex items-center gap-2 mb-4 animate-slide-up">
          <FolderOpen size={18} className="text-primary" />
          <Input
            autoFocus
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCreateFolder(); if (e.key === 'Escape') setCreatingFolder(false) }}
            placeholder="Folder name..."
            className="h-9 w-56 text-sm"
          />
          <Button size="sm" onClick={handleCreateFolder} disabled={!newFolderName.trim()}>Create</Button>
          <Button variant="ghost" size="sm" onClick={() => setCreatingFolder(false)}>Cancel</Button>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <Card className="border-destructive/30 animate-fade-in">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm font-medium text-destructive">Couldn't load your documents</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={load}>Retry</Button>
          </CardContent>
        </Card>
      )}

      {/* Skeleton */}
      {loading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-5"><div className="w-10 h-10 rounded-lg bg-muted" /><div className="h-4 bg-muted rounded mt-4 w-3/4" /></CardContent></Card>
          ))}
        </div>
      )}

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 rounded-xl border border-primary/30 bg-primary/[0.04] animate-slide-up">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <div className="flex-1" />
          <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
            <Trash2 size={14} className="mr-1.5" /> Delete
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
            <X size={14} className="mr-1" /> Clear
          </Button>
        </div>
      )}

      {/* Folders (only show at root level) */}
      {!loading && !error && !currentFolder && categories.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {categories.map((cat, i) => {
            const count = allDocs.filter(d => d.category_id === cat.id).length
            const isDropTarget = dragOverFolder === cat.id
            return (
              <Card
                key={cat.id}
                className={`group hover-lift cursor-pointer animate-slide-up transition-all ${isDropTarget ? 'ring-2 ring-primary bg-primary/[0.04]' : ''}`}
                style={{ animationDelay: `${i * 30}ms`, animationFillMode: 'both' }}
                onClick={() => { if (!editingFolder) setSearchParams({ folder: cat.id }) }}
                onDragOver={(e) => handleDragOverFolder(e, cat.id)}
                onDragLeave={() => setDragOverFolder(null)}
                onDrop={() => handleDropOnFolder(cat.id)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/15 transition-colors">
                    <FolderOpen size={18} className="text-amber-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    {editingFolder === cat.id ? (
                      <Input
                        autoFocus
                        value={editFolderName}
                        onChange={e => setEditFolderName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleRenameFolder(cat.id); if (e.key === 'Escape') setEditingFolder(null) }}
                        onBlur={() => handleRenameFolder(cat.id)}
                        onClick={e => e.stopPropagation()}
                        className="h-7 text-sm"
                      />
                    ) : (
                      <>
                        <p className="text-sm font-medium truncate">{cat.name}</p>
                        <p className="text-[11px] text-muted-foreground">{count} doc{count !== 1 ? 's' : ''}</p>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={(e) => { e.stopPropagation(); setEditingFolder(cat.id); setEditFolderName(cat.name) }} aria-label="Rename folder">
                      <Pencil size={12} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={(e) => handleDeleteFolder(e, cat.id)} aria-label="Delete folder">
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Section label */}
      {!loading && !error && !currentFolder && docsInFolder.length > 0 && categories.length > 0 && (
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Uncategorised</p>
      )}

      {/* Empty state */}
      {!loading && !error && docsInFolder.length === 0 && (currentFolder || categories.length === 0) && (
        <Card className="border-dashed border-2 border-border/60 animate-scale-in">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-primary/[0.07] flex items-center justify-center">
              <FileText className="h-7 w-7 text-primary/50" />
            </div>
            <h3 className="font-semibold text-lg mt-5">{currentFolder ? 'This folder is empty' : 'No documents yet'}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{currentFolder ? 'Move documents here or upload new ones.' : 'Upload your first document to get started.'}</p>
            <Button className="mt-6 gradient-bg border-0 text-white" onClick={() => navigate('/app/upload')}>Upload document</Button>
          </CardContent>
        </Card>
      )}

      {/* Document grid */}
      {!loading && !error && docsInFolder.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {docsInFolder.map((doc, i) => {
            const isSelected = selected.has(doc.id)
            return (
              <Card
                key={doc.id}
                className={`group hover-lift cursor-pointer animate-slide-up overflow-hidden transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}
                style={{ animationDelay: `${Math.min(i * 40, 300)}ms`, animationFillMode: 'both' }}
                onClick={() => navigate(`/app/documents/${doc.id}`)}
                draggable
                onDragStart={() => handleDragStart(doc.id)}
                onDragEnd={() => { setDragDocId(null); setDragOverFolder(null) }}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <button onClick={(e) => toggleSelect(e, doc.id)} className="text-muted-foreground hover:text-primary transition-colors" aria-label="Select">
                      {isSelected ? <CheckSquare size={18} className="text-primary" /> : <Square size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </button>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      {currentFolder && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-amber-600" onClick={async (e) => { e.stopPropagation(); await handleMove(doc.id, null) }} aria-label="Remove from folder">
                          <Home size={13} />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={(e) => { e.stopPropagation(); setMoveTarget(doc.id) }} aria-label="Move to folder">
                        <MoveRight size={13} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={(e) => handleDelete(e, doc.id)}>
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-primary/[0.07] flex items-center justify-center transition-all duration-200 group-hover:bg-primary/[0.12] group-hover:scale-105 mt-1">
                    <FileText size={18} className="text-primary/70" />
                  </div>
                  <h3 className="font-medium text-sm mt-3.5 leading-snug line-clamp-2">{doc.title}</h3>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {doc.processing_status && doc.processing_status !== 'complete' && (
                      doc.processing_status === 'failed'
                        ? <Badge variant="secondary"><span className="text-destructive">Failed</span></Badge>
                        : <Badge variant="secondary"><Loader2 size={11} className="mr-1 animate-spin" /> Processing</Badge>
                    )}
                    {doc.brand && <Badge>{doc.brand}</Badge>}
                    {doc.document_type && <Badge variant="secondary">{doc.document_type}</Badge>}
                  </div>
                  <p className="text-[11px] text-muted-foreground/70 mt-3">
                    {new Date(doc.created_at).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Move to folder modal */}
      {moveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in" onClick={() => setMoveTarget(null)}>
          <Card className="w-80 animate-scale-in" onClick={e => e.stopPropagation()}>
            <CardContent className="p-5">
              <h3 className="font-semibold text-sm mb-3">Move to folder</h3>
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left hover:bg-accent transition-colors"
                  onClick={() => handleMove(moveTarget, null)}
                >
                  <Home size={15} className="text-muted-foreground" /> Uncategorised
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left hover:bg-accent transition-colors"
                    onClick={() => handleMove(moveTarget, cat.id)}
                  >
                    <FolderOpen size={15} className="text-amber-600" /> {cat.name}
                  </button>
                ))}
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-3" onClick={() => setMoveTarget(null)}>Cancel</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function Badge({ children, variant = 'primary' }: { children: React.ReactNode; variant?: 'primary' | 'secondary' }) {
  const styles = variant === 'primary' ? 'bg-primary/[0.08] text-primary' : 'bg-secondary text-secondary-foreground'
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${styles}`}>{children}</span>
}
