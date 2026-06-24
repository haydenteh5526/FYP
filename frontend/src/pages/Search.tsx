import { useState } from 'react'
import { Search, FileText, Sparkles } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { searchDocuments, type SearchResult } from '@/lib/api'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    const data = await searchDocuments(query)
    setResults(data.results)
    setSearched(true)
    setLoading(false)
  }

  return (
    <div className="p-8 max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Search</h2>
        <p className="text-muted-foreground text-sm mt-0.5">Find information across all your documents</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by keyword or meaning..." className="pl-10 h-10 text-sm" />
        </div>
        <Button type="submit" className="h-10 px-5 gradient-bg border-0 text-white shadow-md shadow-primary/20 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </form>

      {/* Empty state */}
      {!searched && (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
          <div className="w-12 h-12 rounded-xl bg-primary/[0.07] flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary/50" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">AI understands keywords and meaning</p>
        </div>
      )}

      {/* Results */}
      {searched && (
        <div className="mt-8 space-y-3">
          {results.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-16 animate-fade-in">No results for "{query}"</p>
          ) : (
            <>
              <p className="text-xs text-muted-foreground mb-3">{results.length} result{results.length !== 1 ? 's' : ''}</p>
              {results.map((r, i) => (
                <Card
                  key={i}
                  className="hover-lift transition-all duration-200 animate-slide-up"
                  style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/[0.07] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <FileText size={15} className="text-primary/70" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium">{r.document_title}</h4>
                        <p className="text-[13px] text-muted-foreground leading-relaxed mt-1 line-clamp-3">{r.chunk_text}</p>
                        <span className="text-[10px] text-muted-foreground/60 mt-1.5 inline-block">
                          {(r.similarity * 100).toFixed(0)}% relevance
                        </span>
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
