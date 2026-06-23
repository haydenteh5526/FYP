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
        <p className="text-muted-foreground mt-0.5 text-sm">Find information across all your documents</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your documents..."
            className="pl-10 h-11"
          />
        </div>
        <Button type="submit" className="h-11 gradient-bg border-0 text-white px-6" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </form>

      {!searched && (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-7 w-7 text-primary/60" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Search by keywords or meaning — AI understands both</p>
        </div>
      )}

      {searched && (
        <div className="mt-8 space-y-3 animate-slide-up">
          {results.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">No results found for "{query}"</p>
          ) : (
            <>
              <p className="text-xs text-muted-foreground mb-4">{results.length} result{results.length !== 1 ? 's' : ''}</p>
              {results.map((r, i) => (
                <Card key={i} className="hover-lift transition-all" style={{ animationDelay: `${i * 0.05}s` }}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <FileText size={16} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium">{r.document_title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed mt-1.5 line-clamp-3">{r.chunk_text}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[11px] text-muted-foreground/70">
                            {(r.similarity * 100).toFixed(0)}% match
                          </span>
                        </div>
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
