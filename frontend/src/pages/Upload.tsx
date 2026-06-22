import { useState, useCallback } from 'react'
import { Upload, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { uploadDocument } from '@/lib/api'

export default function UploadPage() {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{ title: string; brand: string | null } | null>(null)

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
      setResult({ title: doc.title, brand: doc.brand })
    } catch (err) {
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Upload Document</h2>
        <p className="text-muted-foreground mt-1">Snap or upload a physical document to digitise it</p>
      </div>

      <Card
        className={`border-2 border-dashed transition-colors ${
          dragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-16">
          {uploading ? (
            <>
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <p className="mt-4 text-sm font-medium">Processing document...</p>
              <p className="text-xs text-muted-foreground mt-1">Extracting text and categorising</p>
            </>
          ) : result ? (
            <>
              <CheckCircle className="h-12 w-12 text-green-600" />
              <p className="mt-4 text-sm font-medium">Document uploaded successfully</p>
              <p className="text-xs text-muted-foreground mt-1">
                {result.title}{result.brand ? ` • ${result.brand}` : ''}
              </p>
              <Button variant="outline" className="mt-4" onClick={() => setResult(null)}>
                Upload another
              </Button>
            </>
          ) : (
            <>
              <Upload className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-sm font-medium">Drag & drop your document here</p>
              <p className="text-xs text-muted-foreground mt-1">Supports JPEG, PNG, WebP, and PDF up to 20MB</p>
              <label className="mt-4">
                <Button variant="outline" asChild>
                  <span>Choose file</span>
                </Button>
                <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileSelect} />
              </label>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
