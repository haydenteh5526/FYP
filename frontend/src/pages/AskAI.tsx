import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, Bot, User, FileText, Sparkles } from 'lucide-react'
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
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Auto-expand textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`
    }
  }, [input])

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    if (!input.trim() || loading) return
    const question = input
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: question }])
    setLoading(true)
    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      const data = await askQuestion(question, undefined, history)
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer, sources: data.sources }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  // Dedupe sources by document
  function uniqueSources(sources?: AskResponse['sources']) {
    if (!sources) return []
    const seen = new Set<string>()
    return sources.filter(s => {
      if (seen.has(s.document_id)) return false
      seen.add(s.document_id)
      return true
    })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-8 py-6 border-b border-border/40">
        <h2 className="text-xl font-bold tracking-tight">Ask AI</h2>
        <p className="text-muted-foreground text-sm mt-0.5">Answers grounded in your documents</p>
      </div>

      <div className="flex-1 overflow-auto px-8 py-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
            <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <h3 className="mt-5 font-semibold">Ask anything about your documents</h3>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">I'll find the answer in your uploaded manuals and guides.</p>
            <div className="flex flex-wrap gap-2 mt-6 justify-center max-w-md">
              {[
                'What are the safety warnings?',
                'How do I set up this device?',
                'What are the specifications?',
                'When does my warranty expire?',
                'How to clean and maintain?',
                'What\'s in the box?',
              ].map(q => (
                <button key={q} onClick={() => setInput(q)} className="text-xs px-3 py-1.5 rounded-full border border-border/60 hover:bg-accent hover:border-primary/20 transition-all duration-200 text-muted-foreground">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 animate-slide-up ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full gradient-bg flex items-center justify-center shadow-sm shadow-primary/20">
                <Bot size={14} className="text-white" />
              </div>
            )}
            <div className="max-w-[72%]">
              <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === 'user' ? 'gradient-bg text-white rounded-br-md shadow-sm shadow-primary/15' : 'bg-muted/70 text-foreground rounded-bl-md'}`}>
                {msg.content}
              </div>
              {/* Citation pills */}
              {uniqueSources(msg.sources).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {uniqueSources(msg.sources).map((s, j) => (
                    <button
                      key={j}
                      onClick={() => navigate(`/app/documents/${s.document_id}`)}
                      className="inline-flex items-center gap-1.5 text-[11px] text-primary bg-primary/[0.08] hover:bg-primary/[0.15] rounded-full pl-2 pr-2.5 py-1 transition-all duration-200 hover:-translate-y-0.5"
                    >
                      <FileText size={11} /> {s.document_title}
                    </button>
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

      {/* Auto-expanding input */}
      <div className="px-8 py-5 border-t border-border/40 glass">
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-2xl mx-auto items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question... (Shift+Enter for new line)"
            disabled={loading}
            rows={1}
            className="flex-1 resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring max-h-40 leading-relaxed"
          />
          <Button type="submit" size="icon" className="h-11 w-11 gradient-bg border-0 text-white shrink-0 shadow-md shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5" disabled={loading || !input.trim()}>
            <Send size={15} />
          </Button>
        </form>
      </div>
    </div>
  )
}
