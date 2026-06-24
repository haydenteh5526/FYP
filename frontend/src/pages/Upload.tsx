import { useState, useCallback } from 'react'
import { CheckCircle, Loader2, FileImage, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { uploadDocument } from '@/lib/api'

export default function UploadPage() {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{ id: string; title: string; brand: string | null } | null>(null)
  const navigate = useNavigate()

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleUpload(file)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
  }

  async function handleUpload(file: File) {
    setUploading(true)
    setResult(null)
    try {
      const doc = await uploadDocument(file)
      setResult({ id: doc.id, title: doc.title, brand: doc.brand })
    } catch (err) {
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Upload Document</h2>
        <p className="text-muted-foreground text-sm mt-0.5">Snap or upload a physical document to digitise it</p>
      </div>

      <Card
        className={`border-2 border-dashed transition-all duration-300 ${
          dragging ? 'border-primary bg-primary/[0.03] scale-[1.01] shadow-lg shadow-primary/5' : 'border-border/60 hover:border-primary/30'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-20">
          {uploading ? (
            <div className="animate-scale-in text-center">
              <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              </div>
              <p className="mt-5 text-sm font-medium">Processing...</p>
              <p className="text-xs text-muted-foreground mt-1">Extracting text & categorising</p>
            </div>
          ) : result ? (
            <div className="animate-scale-in text-center">
              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mx-auto">
                <CheckCircle className="h-7 w-7 text-green-600" />
              </div>
              <p className="mt-5 text-sm font-semibold">Uploaded successfully</p>
              <p className="text-xs text-muted-foreground mt-1">
                {result.title}{result.brand ? ` • ${result.brand}` : ''}
              </p>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" size="sm" onClick={() => setResult(null)}>Upload another</Button>
                <Button size="sm" className="gradient-bg border-0 text-white shadow-sm shadow-primary/20" onClick={() => navigate(`/app/documents/${result.id}`)}>
                  View <ArrowRight size={13} className="ml-1" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto">
                <FileImage className="h-7 w-7 text-muted-foreground/50" />
              </div>
              <p className="mt-5 text-sm font-medium">Drag & drop your document</p>
              <p className="text-xs text-muted-foreground mt-1.5">JPEG, PNG, WebP, or PDF — up to 20 MB</p>
              <label className="mt-6 inline-block">
                <Button variant="outline" size="sm" className="cursor-pointer transition-all duration-200" asChild>
                  <span>Choose file</span>
                </Button>
                <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileSelect} />
              </label>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
