import { useState, useEffect, useRef } from 'react'
import { Search, FileText, Sparkles } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { searchDocuments, type SearchResult } from '@/lib/api'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setSearched(false)
      return
    }
    // Debounce: search 400ms after the user stops typing
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      const data = await searchDocuments(query)
      setResults(data.results)
      setSearched(true)
      setLoading(false)
    }, 400)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  return (
    <div className="p-8 max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Search</h2>
        <p className="text-muted-foreground text-sm mt-0.5">Find information across all your documents</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by keyword or meaning..." className="pl-10 h-11" autoFocus />
        {loading && <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
      </div>

      {!searched && !query && (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
          <div className="w-12 h-12 rounded-xl bg-primary/[0.07] flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary/50" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Start typing to search — results appear instantly</p>
        </div>
      )}

      {searched && (
        <div className="mt-6 space-y-3">
          {results.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-16 animate-fade-in">No results for "{query}"</p>
          ) : (
            <>
              <p className="text-xs text-muted-foreground mb-3">{results.length} result{results.length !== 1 ? 's' : ''}</p>
              {results.map((r, i) => (
                <Card
                  key={i}
                  className="hover-lift cursor-pointer transition-all duration-200 animate-slide-up"
                  style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
                  onClick={() => navigate(`/app/documents/${r.document_id}`)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/[0.07] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <FileText size={15} className="text-primary/70" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium">{r.document_title}</h4>
                        <p
                          className="text-[13px] text-muted-foreground leading-relaxed mt-1 line-clamp-3 [&_b]:text-foreground [&_b]:font-semibold [&_b]:bg-primary/10 [&_b]:rounded [&_b]:px-0.5"
                          dangerouslySetInnerHTML={{ __html: r.chunk_text }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
