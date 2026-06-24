import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, FileText, Sparkles } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { askQuestion, type AskResponse } from '@/lib/api'

interface Message {
  role: 'user' | 'assistant'
  content: string
  sources?: AskResponse['sources']
}

export default function AskAI() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Auto-dismiss error
  useEffect(() => {
    if (error) { const t = setTimeout(() => setError(''), 4000); return () => clearTimeout(t) }
  }, [error])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const question = input
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: question }])
    setLoading(true)

    try {
      const data = await askQuestion(question)
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer, sources: data.sources }])
    } catch {
      setError('Failed to get a response. Please try again.')
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Error toast */}
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="bg-destructive text-white text-sm px-4 py-2 rounded-lg shadow-lg">{error}</div>
        </div>
      )}

      {/* Header */}
      <div className="px-8 py-6 border-b bg-card/50 glass">
        <h2 className="text-xl font-bold tracking-tight">Ask AI</h2>
        <p className="text-muted-foreground text-sm mt-0.5">Answers grounded in your documents</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto px-8 py-6 space-y-5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
            <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <h3 className="mt-5 font-semibold">Ask anything about your documents</h3>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">
              I'll find the answer in your uploaded manuals and guides.
            </p>
            <div className="flex flex-wrap gap-2 mt-6 justify-center max-w-md">
              {['What temperature for delicates?', 'How to reset my router?', 'When does my warranty expire?'].map(q => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="text-xs px-3 py-1.5 rounded-full border border-border/60 hover:bg-accent hover:border-primary/20 transition-all duration-200 text-muted-foreground"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 animate-slide-up ${msg.role === 'user' ? 'justify-end' : ''}`}
            style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
          >
            {msg.role === 'assistant' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full gradient-bg flex items-center justify-center shadow-sm shadow-primary/20">
                <Bot size={14} className="text-white" />
              </div>
            )}
            <div className="max-w-[72%]">
              <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'gradient-bg text-white rounded-br-md shadow-sm shadow-primary/15'
                  : 'bg-muted/70 text-foreground rounded-bl-md'
              }`}>
                {msg.content}
              </div>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {msg.sources.map((s, j) => (
                    <span key={j} className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/50 rounded px-1.5 py-0.5">
                      <FileText size={9} /> {s.document_title}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <User size={14} className="text-secondary-foreground" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center shadow-sm shadow-primary/20">
              <Bot size={14} className="text-white" />
            </div>
            <div className="bg-muted/70 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0.15s]" />
                <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0.3s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input — sticky bottom with glass */}
      <div className="px-8 py-5 border-t glass">
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-2xl mx-auto">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={loading}
            className="h-10 text-sm"
          />
          <Button type="submit" size="icon" className="h-10 w-10 gradient-bg border-0 text-white shrink-0 shadow-md shadow-primary/20 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50" disabled={loading || !input.trim()}>
            <Send size={15} />
          </Button>
        </form>
      </div>
    </div>
  )
}
