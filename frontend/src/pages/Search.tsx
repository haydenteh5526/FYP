import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { searchDocuments, type SearchResult } from '@/lib/api'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searched, setSearched] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    const data = await searchDocuments(query)
    setResults(data.results)
    setSearched(true)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Search</h2>
        <p className="text-muted-foreground mt-1">Find information across all your documents</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your documents..."
            className="pl-9"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {searched && (
        <div className="mt-8 space-y-4 max-w-2xl">
          {results.length === 0 ? (
            <p className="text-sm text-muted-foreground">No results found.</p>
          ) : (
            results.map((r, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{r.document_title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{r.chunk_text}</p>
                  <p className="text-xs text-muted-foreground/70 mt-2">
                    Relevance: {(r.similarity * 100).toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
