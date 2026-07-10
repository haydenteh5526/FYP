import { useState, useCallback } from 'react'
import { CheckCircle, Loader2, FileImage, FileText, X, Upload, CloudUpload, ArrowRight, RotateCcw, Sparkles } from 'lucide-react'
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

  function retryItem(id: string) {
    const item = queue.find(q => q.id === id)
    if (!item) return
    setQueue(prev => prev.map(q => q.id === id ? { ...q, status: 'pending', progress: 0 } : q))
    processQueue([{ ...item, status: 'pending', progress: 0 }])
  }

  function removeFromQueue(id: string) {
    setQueue(prev => prev.filter(q => q.id !== id))
  }

  const allDone = queue.length > 0 && queue.every(q => q.status === 'done' || q.status === 'error')
  const uploadingCount = queue.filter(q => q.status === 'uploading').length
  const doneCount = queue.filter(q => q.status === 'done').length
  const errorCount = queue.filter(q => q.status === 'error').length
  const totalProgress = queue.length > 0 ? queue.reduce((sum, q) => sum + q.progress, 0) / queue.length : 0

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-slide-up">
        <h2 className="text-3xl font-bold tracking-tight text-foreground/90">Upload Documents</h2>
        <p className="text-muted-foreground text-sm mt-1.5 font-medium">Drag multiple files or choose from your device</p>
      </div>

      {/* Drop zone */}
      <div
        className={`relative rounded-2xl transition-all duration-500 animate-slide-up ${
          dragging ? 'scale-[1.02]' : ''
        }`}
        style={{ animationDelay: '50ms', animationFillMode: 'both' }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        {/* Animated dashed border */}
        <div className={`absolute inset-0 rounded-2xl border-2 border-dashed transition-all duration-500 ${
          dragging
            ? 'border-primary bg-primary/[0.04] shadow-2xl shadow-primary/10 drop-zone-active'
            : 'border-border/50 hover:border-primary/30'
        }`} />
        
        {dragging && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/[0.02] to-primary/[0.06] pointer-events-none" />
        )}

        <div className="relative flex flex-col items-center justify-center py-20 text-center">
          <div className="relative w-44 h-36 mb-6">
            <div className="absolute inset-0 m-auto w-28 h-28 rounded-full gradient-bg opacity-10 blur-2xl animate-pulse" />
            
            <div className={`absolute inset-0 m-auto w-20 h-20 rounded-2xl bg-background border border-border/50 shadow-xl flex items-center justify-center z-10 transition-all duration-500 ${
              dragging ? 'scale-110 shadow-2xl shadow-primary/20' : ''
            }`}>
              {dragging ? (
                <Upload className="h-8 w-8 text-primary animate-bounce" />
              ) : (
                <CloudUpload className="h-8 w-8 text-muted-foreground/40" />
              )}
            </div>

            <div className="absolute top-0 left-2 w-12 h-16 rounded-lg bg-background border border-border/50 shadow-lg rotate-[-12deg] animate-float z-0 flex flex-col gap-1 p-2">
              <div className="w-full h-1 bg-muted rounded-full" />
              <div className="w-3/4 h-1 bg-muted rounded-full" />
              <div className="w-full h-1 bg-muted rounded-full" />
            </div>
            <div className="absolute bottom-0 right-2 w-11 h-11 rounded-lg bg-background border border-border/50 shadow-lg rotate-[10deg] animate-float-delayed z-0 flex items-center justify-center">
              <span className="text-primary/40 font-bold text-[10px]">PDF</span>
            </div>
            <div className="absolute top-4 right-6 w-8 h-8 rounded-md bg-background border border-border/50 shadow-md rotate-[6deg] animate-float z-0 flex items-center justify-center" style={{ animationDelay: '1s' }}>
              <FileImage size={12} className="text-blue-400/50" />
            </div>
          </div>

          <h3 className={`font-bold text-xl tracking-tight transition-colors duration-300 ${
            dragging ? 'text-primary' : 'text-foreground'
          }`}>
            {dragging ? 'Release to upload' : 'Drop your documents here'}
          </h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm leading-relaxed">
            Upload multiple files at once — AI will extract text, categorise, and make them fully searchable
          </p>

          <div className="flex items-center gap-3 mt-8">
            <label className="inline-block">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500 group-hover:duration-200" />
                <Button className="relative rounded-full gradient-bg border-0 text-white shadow-lg px-6 font-medium transition-all hover:-translate-y-0.5 cursor-pointer" asChild>
                  <span><Upload size={16} className="mr-2" /> Choose files</span>
                </Button>
              </div>
              <input type="file" className="hidden" accept="image/*,.pdf" multiple onChange={handleFileSelect} />
            </label>
          </div>

          <div className="flex items-center gap-2 mt-6">
            {['PDF', 'JPEG', 'PNG', 'WebP'].map(fmt => (
              <span key={fmt} className="text-[10px] font-medium text-muted-foreground/60 px-2 py-0.5 rounded-full border border-border/40 bg-muted/20">
                {fmt}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Upload queue */}
      {queue.length > 0 && (
        <div className="mt-8 animate-slide-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {allDone
                  ? `${doneCount} file${doneCount !== 1 ? 's' : ''} uploaded`
                  : uploadingCount > 0
                    ? `Uploading ${uploadingCount} of ${queue.length} files...`
                    : `${queue.length} file${queue.length !== 1 ? 's' : ''} queued`
                }
              </p>
              {!allDone && uploadingCount > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">{Math.round(totalProgress)}% overall</p>
              )}
            </div>
            {allDone && (
              <Button size="sm" className="rounded-full gradient-bg border-0 text-white shadow-md px-5 font-medium transition-all hover:-translate-y-0.5" onClick={() => navigate('/app')}>
                View documents <ArrowRight size={14} className="ml-1.5" />
              </Button>
            )}
          </div>

          {!allDone && uploadingCount > 0 && (
            <div className="h-1.5 bg-muted/60 rounded-full overflow-hidden mb-4">
              <div
                className="h-full gradient-bg rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(totalProgress, 99)}%` }}
              />
            </div>
          )}

          {allDone && errorCount === 0 && (
            <Card className="border-0 bg-green-500/5 mb-4 animate-scale-in">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                  <Sparkles size={18} className="text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">All uploads complete!</p>
                  <p className="text-xs text-green-600/70 dark:text-green-500/70 mt-0.5">AI is now processing your documents — text extraction and categorisation will happen automatically.</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            {queue.map((item, i) => (
              <div
                key={item.id}
                className={`rounded-xl border bg-card/50 backdrop-blur-sm animate-slide-up overflow-hidden transition-all duration-300 ${
                  item.status === 'done' ? 'border-green-500/20' :
                  item.status === 'error' ? 'border-destructive/20' :
                  item.status === 'uploading' ? 'border-primary/20' :
                  'border-border/50'
                }`}
                style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'both' }}
              >
                <div className="flex items-center gap-3 p-3.5">
                  {item.file.type === 'application/pdf' ? (
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      item.status === 'done' ? 'bg-green-500/10' : 'bg-red-500/10'
                    }`}>
                      <FileText size={16} className={item.status === 'done' ? 'text-green-600' : 'text-red-500'} />
                    </div>
                  ) : (
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      item.status === 'done' ? 'bg-green-500/10' : 'bg-primary/10'
                    }`}>
                      <FileImage size={16} className={item.status === 'done' ? 'text-green-600' : 'text-primary'} />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate font-medium">{item.file.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {item.file.size >= 1024 * 1024
                        ? `${(item.file.size / (1024 * 1024)).toFixed(1)} MB`
                        : `${(item.file.size / 1024).toFixed(0)} KB`
                      }
                    </p>
                  </div>

                  {item.status === 'pending' && (
                    <span className="text-[11px] text-muted-foreground px-2.5 py-1 rounded-full bg-muted/50 font-medium">Queued</span>
                  )}
                  {item.status === 'uploading' && (
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs text-primary font-semibold tabular-nums">{Math.min(Math.round(item.progress), 99)}%</span>
                      <Loader2 size={16} className="animate-spin text-primary shrink-0" />
                    </div>
                  )}
                  {item.status === 'done' && (
                    <button onClick={() => navigate(`/app/documents/${item.docId}`)} className="flex items-center gap-1.5 text-xs text-green-600 font-medium hover:text-green-700 transition-colors px-2.5 py-1 rounded-full hover:bg-green-500/10">
                      <CheckCircle size={14} /> View
                    </button>
                  )}
                  {item.status === 'error' && (
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => retryItem(item.id)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-full hover:bg-muted/50">
                        <RotateCcw size={12} /> Retry
                      </button>
                      <span className="text-[11px] text-destructive font-medium px-2 py-0.5 rounded-full bg-destructive/10">Failed</span>
                    </div>
                  )}

                  {(item.status === 'done' || item.status === 'error') && (
                    <button onClick={() => removeFromQueue(item.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors ml-0.5">
                      <X size={14} />
                    </button>
                  )}
                </div>

                {item.status === 'uploading' && (
                  <div className="h-1 bg-muted/40">
                    <div
                      className="h-full gradient-bg transition-all duration-300 ease-out rounded-full"
                      style={{ width: `${Math.min(item.progress, 99)}%` }}
                    />
                  </div>
                )}
                {item.status === 'done' && (
                  <div className="h-1 bg-green-500/40 rounded-full" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
