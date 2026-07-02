import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FileText, Trash2, FolderOpen, FolderPlus, ChevronRight, Home, CheckSquare, Square, X, Loader2, Pencil, LayoutGrid, List, ArrowUpDown, Search, Filter } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getDocuments, deleteDocument, bulkDeleteDocuments, getCategories, createCategory, renameCategory, deleteCategory, moveToCategory, type Document } from '@/lib/api'

type SortKey = 'name' | 'date' | 'size' | 'type'
type SortDir = 'asc' | 'desc'
type ViewMode = 'grid' | 'list'
type FileFilter = 'all' | 'pdf' | 'image'

export default function Dashboard() {
  const [allDocs, setAllDocs] = useState<Document[]>([])
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [editingFolder, setEditingFolder] = useState<string | null>(null)
  const [editFolderName, setEditFolderName] = useState('')
  const [dragDocId, setDragDocId] = useState<string | null>(null)
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [viewMode, setViewMode] = useState<ViewMode>(() => (localStorage.getItem('docvault-view') as ViewMode) || 'grid')
  const [fileFilter, setFileFilter] = useState<FileFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [showFilterMenu, setShowFilterMenu] = useState(false)
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

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  function switchView(mode: ViewMode) {
    setViewMode(mode)
    localStorage.setItem('docvault-view', mode)
  }

  function handleDragOverFolder(e: React.DragEvent, folderId: string) {
    e.preventDefault()
    setDragOverFolder(folderId)
  }

  async function handleDropOnFolder(folderId: string) {
    if (dragDocId) {
      const categoryId = folderId === '__root__' ? null : folderId
      await moveToCategory(dragDocId, categoryId)
      setAllDocs(allDocs.map(d => d.id === dragDocId ? { ...d, category_id: categoryId } : d))
    }
    setDragDocId(null)
    setDragOverFolder(null)
  }

  // Current view
  const currentCategoryName = categories.find(c => c.id === currentFolder)?.name
  const docsInFolder = useMemo(() => {
    let docs = currentFolder
      ? allDocs.filter(d => d.category_id === currentFolder)
      : allDocs.filter(d => !d.category_id)

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      docs = docs.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.brand?.toLowerCase().includes(q) ||
        d.document_type?.toLowerCase().includes(q)
      )
    }

    // File type filter
    if (fileFilter === 'pdf') docs = docs.filter(d => d.title.toLowerCase().endsWith('.pdf'))
    else if (fileFilter === 'image') docs = docs.filter(d => !d.title.toLowerCase().endsWith('.pdf'))

    // Sort
    docs = [...docs].sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'name': cmp = a.title.localeCompare(b.title); break
        case 'date': cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime(); break
        case 'size': cmp = (a.file_size || 0) - (b.file_size || 0); break
        case 'type': cmp = (a.document_type || '').localeCompare(b.document_type || ''); break
      }
      return sortDir === 'desc' ? -cmp : cmp
    })

    return docs
  }, [allDocs, currentFolder, searchQuery, fileFilter, sortKey, sortDir])
  const totalDocs = allDocs.length

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      {/* Breadcrumb — "All Documents" is a drop target when inside a folder */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6 animate-fade-in">
        <button
          onClick={() => setSearchParams({})}
          className={`hover:text-foreground transition-all flex items-center gap-1 px-2 py-1 rounded-md ${currentFolder && dragDocId ? (dragOverFolder === '__root__' ? 'ring-2 ring-primary bg-primary/[0.06] text-primary' : 'border border-dashed border-border') : ''}`}
          onDragOver={(e) => { if (currentFolder) { e.preventDefault(); setDragOverFolder('__root__') } }}
          onDragLeave={() => setDragOverFolder(null)}
          onDrop={() => { if (currentFolder) handleDropOnFolder('__root__') }}
        >
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

      {/* Toolbar: search, filter, sort, view */}
      {!loading && !error && (
        <div className="flex items-center gap-2 mb-4 animate-fade-in">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="h-8 pl-8 text-sm"
            />
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => { setShowSortMenu(!showSortMenu); setShowFilterMenu(false) }}>
              <ArrowUpDown size={13} /> Sort
              {sortKey !== 'date' && <span className="text-primary">· {sortKey}</span>}
            </Button>
            {showSortMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowSortMenu(false)} />
                <div className="absolute top-full mt-1 left-0 z-50 w-44 bg-background border rounded-lg shadow-lg p-1 animate-scale-in">
                  {(['date', 'name', 'size', 'type'] as SortKey[]).map(key => (
                    <button key={key} onClick={() => { toggleSort(key); setShowSortMenu(false) }} className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${sortKey === key ? 'bg-primary/[0.08] text-primary font-medium' : 'text-foreground hover:bg-accent'}`}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                      {sortKey === key && <span className="text-xs opacity-70">{sortDir === 'asc' ? '↑' : '↓'}</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Filter dropdown */}
          <div className="relative">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => { setShowFilterMenu(!showFilterMenu); setShowSortMenu(false) }}>
              <Filter size={13} /> Filter
              {fileFilter !== 'all' && <span className="text-primary">· {fileFilter}</span>}
            </Button>
            {showFilterMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowFilterMenu(false)} />
                <div className="absolute top-full mt-1 left-0 z-50 w-36 bg-background border rounded-lg shadow-lg p-1 animate-scale-in">
                  {([['all', 'All files'], ['pdf', 'PDFs only'], ['image', 'Images only']] as [FileFilter, string][]).map(([key, label]) => (
                    <button key={key} onClick={() => { setFileFilter(key); setShowFilterMenu(false) }} className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${fileFilter === key ? 'bg-primary/[0.08] text-primary font-medium' : 'text-foreground hover:bg-accent'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-0.5 border rounded-md p-0.5 ml-auto">
            <button onClick={() => switchView('grid')} className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`} aria-label="Grid view">
              <LayoutGrid size={14} />
            </button>
            <button onClick={() => switchView('list')} className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`} aria-label="List view">
              <List size={14} />
            </button>
          </div>
        </div>
      )}

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
        <>
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
        </>
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

      {/* Document grid/list */}
      {!loading && !error && docsInFolder.length > 0 && viewMode === 'grid' && (
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

      {/* List/table view */}
      {!loading && !error && docsInFolder.length > 0 && viewMode === 'list' && (
        <div className="border rounded-xl overflow-hidden animate-fade-in">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_100px_100px_120px_80px] gap-2 px-4 py-2.5 bg-muted/50 border-b text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <span>Name</span>
            <span>Type</span>
            <span>Brand</span>
            <span>Date</span>
            <span>Size</span>
          </div>
          {/* Rows */}
          {docsInFolder.map((doc, i) => {
            const isSelected = selected.has(doc.id)
            return (
              <div
                key={doc.id}
                className={`grid grid-cols-[1fr_100px_100px_120px_80px] gap-2 px-4 py-3 border-b last:border-b-0 items-center cursor-pointer hover:bg-accent/50 transition-colors group animate-slide-up ${isSelected ? 'bg-primary/[0.04]' : ''}`}
                style={{ animationDelay: `${Math.min(i * 20, 200)}ms`, animationFillMode: 'both' }}
                onClick={() => navigate(`/app/documents/${doc.id}`)}
                draggable
                onDragStart={() => handleDragStart(doc.id)}
                onDragEnd={() => { setDragDocId(null); setDragOverFolder(null) }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button onClick={(e) => toggleSelect(e, doc.id)} className="text-muted-foreground hover:text-primary transition-colors shrink-0" aria-label="Select">
                    {isSelected ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </button>
                  <FileText size={16} className="text-primary/60 shrink-0" />
                  <span className="text-sm font-medium truncate">{doc.title}</span>
                  {doc.processing_status && doc.processing_status !== 'complete' && (
                    <Loader2 size={12} className="animate-spin text-primary shrink-0" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground truncate">{doc.document_type || '—'}</span>
                <span className="text-xs text-muted-foreground truncate">{doc.brand || '—'}</span>
                <span className="text-xs text-muted-foreground">{new Date(doc.created_at).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: '2-digit' })}</span>
                <span className="text-xs text-muted-foreground">{doc.file_size ? `${(doc.file_size / 1024).toFixed(0)} KB` : '—'}</span>
              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}

function Badge({ children, variant = 'primary' }: { children: React.ReactNode; variant?: 'primary' | 'secondary' }) {
  const styles = variant === 'primary' ? 'bg-primary/[0.08] text-primary' : 'bg-secondary text-secondary-foreground'
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${styles}`}>{children}</span>
}
