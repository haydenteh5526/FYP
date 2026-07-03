import { useState, useCallback } from 'react'
import { CheckCircle, Loader2, FileImage, FileText, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { uploadDocument } from '@/lib/api'
import { useToast } from '@/components/Toast'

interface UploadItem {
  id: string
  file: File
  status: 'pending' | 'uploading' | 'done' | 'error'
  docId?: string
}

export default function UploadPage() {
  const [dragging, setDragging] = useState(false)
  const [queue, setQueue] = useState<UploadItem[]>([])
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files)
    addFiles(files)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    addFiles(files)
  }

  function addFiles(files: File[]) {
    const items: UploadItem[] = files
      .filter(f => f.type.startsWith('image/') || f.type === 'application/pdf')
      .map(f => ({ id: Math.random().toString(36).slice(2), file: f, status: 'pending' as const }))
    if (items.length === 0) { toast('Only images and PDFs are supported', 'error'); return }
    setQueue(prev => [...prev, ...items])
    processQueue(items)
  }

  async function processQueue(items: UploadItem[]) {
    for (const item of items) {
      setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'uploading' } : q))
      try {
        const doc = await uploadDocument(item.file)
        setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'done', docId: doc.id } : q))
      } catch {
        setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'error' } : q))
      }
    }
    toast(`${items.length} file${items.length > 1 ? 's' : ''} uploaded`, 'success')
  }

  function removeFromQueue(id: string) {
    setQueue(prev => prev.filter(q => q.id !== id))
  }

  const allDone = queue.length > 0 && queue.every(q => q.status === 'done' || q.status === 'error')

  return (
    <div className="p-8 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Upload Documents</h2>
        <p className="text-muted-foreground text-sm mt-0.5">Drag multiple files or choose from your device</p>
      </div>

      {/* Drop zone */}
      <Card
        className={`border-2 border-dashed transition-all duration-300 ${
          dragging ? 'border-primary bg-primary/[0.03] scale-[1.01] shadow-lg shadow-primary/5' : 'border-border/60 hover:border-primary/30'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center">
            <FileImage className="h-7 w-7 text-muted-foreground/50" />
          </div>
          <p className="mt-5 text-sm font-medium">Drag & drop your documents</p>
          <p className="text-xs text-muted-foreground mt-1.5">JPEG, PNG, WebP, or PDF — multiple files supported</p>
          <label className="mt-6 inline-block">
            <Button variant="outline" size="sm" className="cursor-pointer" asChild>
              <span>Choose files</span>
            </Button>
            <input type="file" className="hidden" accept="image/*,.pdf" multiple onChange={handleFileSelect} />
          </label>
        </CardContent>
      </Card>

      {/* Upload queue */}
      {queue.length > 0 && (
        <div className="mt-6 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">{queue.length} file{queue.length > 1 ? 's' : ''}</p>
            {allDone && (
              <Button size="sm" className="gradient-bg border-0 text-white" onClick={() => navigate('/app')}>
                View documents
              </Button>
            )}
          </div>
          {queue.map(item => (
            <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border bg-background animate-slide-up">
              {item.file.type === 'application/pdf' ? (
                <FileText size={16} className="text-red-600 shrink-0" />
              ) : (
                <FileImage size={16} className="text-primary shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{item.file.name}</p>
                <p className="text-[11px] text-muted-foreground">{(item.file.size / 1024).toFixed(0)} KB</p>
              </div>
              {item.status === 'pending' && (
                <span className="text-[11px] text-muted-foreground">Waiting...</span>
              )}
              {item.status === 'uploading' && (
                <Loader2 size={16} className="animate-spin text-primary shrink-0" />
              )}
              {item.status === 'done' && (
                <button onClick={() => navigate(`/app/documents/${item.docId}`)} className="flex items-center gap-1">
                  <CheckCircle size={16} className="text-green-600 shrink-0" />
                </button>
              )}
              {item.status === 'error' && (
                <span className="text-[11px] text-destructive font-medium">Failed</span>
              )}
              {(item.status === 'done' || item.status === 'error') && (
                <button onClick={() => removeFromQueue(item.id)} className="text-muted-foreground hover:text-foreground">
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
