import { useState, useCallback } from 'react'
import { CheckCircle, Loader2, FileImage, FileText, X, Upload, CloudUpload } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { uploadDocument } from '@/lib/api'
import { useToast } from '@/components/Toast'
import confetti from 'canvas-confetti'

interface UploadItem {
  id: string
  file: File
  status: 'pending' | 'uploading' | 'done' | 'error'
  progress: number
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
      .map(f => ({ id: Math.random().toString(36).slice(2), file: f, status: 'pending' as const, progress: 0 }))
    if (items.length === 0) { toast('Only images and PDFs are supported', 'error'); return }
    setQueue(prev => [...prev, ...items])
    processQueue(items)
  }

  async function processQueue(items: UploadItem[]) {
    for (const item of items) {
      setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'uploading', progress: 0 } : q))
      // Simulate progress in steps while upload runs
      const progressInterval = setInterval(() => {
        setQueue(prev => prev.map(q =>
          q.id === item.id && q.status === 'uploading' && q.progress < 85
            ? { ...q, progress: q.progress + Math.random() * 15 }
            : q
        ))
      }, 200)
      try {
        const doc = await uploadDocument(item.file)
        clearInterval(progressInterval)
        setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'done', progress: 100, docId: doc.id } : q))
        // 🎉 Confetti on very first ever upload
        if (!localStorage.getItem('docvault-first-upload')) {
          localStorage.setItem('docvault-first-upload', '1')
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#06b6d4'],
          })
        }
      } catch {
        clearInterval(progressInterval)
        setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'error', progress: 0 } : q))
      }
    }
    toast(`${items.length} file${items.length > 1 ? 's' : ''} uploaded`, 'success')
  }

  function removeFromQueue(id: string) {
    setQueue(prev => prev.filter(q => q.id !== id))
  }

  const allDone = queue.length > 0 && queue.every(q => q.status === 'done' || q.status === 'error')
  const uploadingCount = queue.filter(q => q.status === 'uploading').length
  const doneCount = queue.filter(q => q.status === 'done').length

  return (
    <div className="p-8 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Upload Documents</h2>
        <p className="text-muted-foreground text-sm mt-0.5">Drag multiple files or choose from your device</p>
      </div>

      {/* Drop zone — enhanced visuals */}
      <Card
        className={`border-2 border-dashed transition-all duration-300 relative overflow-hidden ${
          dragging
            ? 'border-primary bg-primary/[0.03] scale-[1.01] shadow-lg shadow-primary/10 drop-zone-active'
            : 'border-border/60 hover:border-primary/30 hover:shadow-sm'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        {dragging && (
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-primary/[0.08] pointer-events-none" />
        )}
        <CardContent className="flex flex-col items-center justify-center py-16 relative">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
            dragging
              ? 'gradient-bg shadow-lg shadow-primary/20 scale-110'
              : 'bg-muted/60'
          }`}>
            {dragging ? (
              <Upload className="h-7 w-7 text-white animate-bounce" />
            ) : (
              <CloudUpload className="h-7 w-7 text-muted-foreground/50" />
            )}
          </div>
          <p className="mt-5 text-sm font-medium">
            {dragging ? 'Drop your files here' : 'Drag & drop your documents'}
          </p>
          <p className="text-xs text-muted-foreground mt-1.5">JPEG, PNG, WebP, or PDF — multiple files supported</p>
          <label className="mt-6 inline-block">
            <Button variant="outline" size="sm" className="cursor-pointer transition-all duration-200 hover:border-primary/30" asChild>
              <span>Choose files</span>
            </Button>
            <input type="file" className="hidden" accept="image/*,.pdf" multiple onChange={handleFileSelect} />
          </label>
        </CardContent>
      </Card>

      {/* Upload queue — with progress bars */}
      {queue.length > 0 && (
        <div className="mt-6 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">
              {uploadingCount > 0
                ? `Uploading ${uploadingCount} file${uploadingCount > 1 ? 's' : ''}...`
                : `${queue.length} file${queue.length > 1 ? 's' : ''}`
              }
              {doneCount > 0 && <span className="text-muted-foreground font-normal ml-1.5">· {doneCount} complete</span>}
            </p>
            {allDone && (
              <Button size="sm" className="gradient-bg border-0 text-white" onClick={() => navigate('/app')}>
                View documents
              </Button>
            )}
          </div>
          {queue.map(item => (
            <div key={item.id} className="rounded-lg border bg-background animate-slide-up overflow-hidden">
              <div className="flex items-center gap-3 p-3">
                {item.file.type === 'application/pdf' ? (
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                    <FileText size={14} className="text-red-600" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg icon-gradient-blue flex items-center justify-center shrink-0">
                    <FileImage size={14} className="text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate font-medium">{item.file.name}</p>
                  <p className="text-[11px] text-muted-foreground">{(item.file.size / 1024).toFixed(0)} KB</p>
                </div>
                {item.status === 'pending' && (
                  <span className="text-[11px] text-muted-foreground px-2 py-0.5 rounded-full bg-muted">Queued</span>
                )}
                {item.status === 'uploading' && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-primary font-medium">{Math.min(Math.round(item.progress), 99)}%</span>
                    <Loader2 size={14} className="animate-spin text-primary shrink-0" />
                  </div>
                )}
                {item.status === 'done' && (
                  <button onClick={() => navigate(`/app/documents/${item.docId}`)} className="flex items-center gap-1.5 text-[11px] text-green-600 font-medium hover:underline">
                    <CheckCircle size={14} /> View
                  </button>
                )}
                {item.status === 'error' && (
                  <span className="text-[11px] text-destructive font-medium px-2 py-0.5 rounded-full bg-destructive/10">Failed</span>
                )}
                {(item.status === 'done' || item.status === 'error') && (
                  <button onClick={() => removeFromQueue(item.id)} className="text-muted-foreground hover:text-foreground transition-colors ml-1">
                    <X size={14} />
                  </button>
                )}
              </div>
              {/* Progress bar */}
              {item.status === 'uploading' && (
                <div className="h-0.5 bg-muted">
                  <div
                    className="h-full gradient-bg transition-all duration-300 ease-out"
                    style={{ width: `${Math.min(item.progress, 99)}%` }}
                  />
                </div>
              )}
              {item.status === 'done' && (
                <div className="h-0.5 bg-green-500" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
