import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, AlertTriangle, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { getWarranties, type Warranty } from '@/lib/api'

export default function Warranties() {
  const [warranties, setWarranties] = useState<Warranty[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getWarranties().then(data => { setWarranties(data); setLoading(false) })
  }, [])

  function statusFor(expiry: string | null): { label: string; color: string; icon: React.ReactNode } {
    if (!expiry) return { label: 'No expiry set', color: 'text-muted-foreground bg-muted', icon: <Calendar size={13} /> }
    const days = Math.ceil((new Date(expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (days < 0) return { label: 'Expired', color: 'text-red-700 bg-red-50', icon: <AlertTriangle size={13} /> }
    if (days <= 30) return { label: `${days}d left`, color: 'text-yellow-700 bg-yellow-50', icon: <AlertTriangle size={13} /> }
    return { label: `${days}d left`, color: 'text-green-700 bg-green-50', icon: <ShieldCheck size={13} /> }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Warranties</h2>
        <p className="text-muted-foreground text-sm mt-0.5">Track warranty expiry across your documents</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Card key={i} className="animate-pulse"><CardContent className="h-16" /></Card>)}</div>
      ) : warranties.length === 0 ? (
        <Card className="border-dashed border-2 border-border/60">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/[0.07] flex items-center justify-center">
              <ShieldCheck className="h-7 w-7 text-primary/50" />
            </div>
            <h3 className="font-semibold mt-4">No warranties tracked</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Upload a receipt or warranty card and we'll automatically detect expiry dates.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {warranties.map((w, i) => {
            const status = statusFor(w.expiry_date)
            return (
              <Card key={w.id} className="hover-lift cursor-pointer animate-slide-up" style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }} onClick={() => navigate(`/app/documents/${w.document_id}`)}>
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="w-10 h-10 rounded-lg bg-primary/[0.07] flex items-center justify-center text-primary">
                    <ShieldCheck size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{w.document_title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {w.expiry_date ? `Expires ${new Date(w.expiry_date).toLocaleDateString()}` : 'No expiry date'}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium ${status.color}`}>
                    {status.icon} {status.label}
                  </span>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
