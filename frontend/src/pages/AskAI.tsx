import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, Bot, User, FileText, Sparkles, ShieldCheck, Wrench, Package, Zap, BookOpen } from 'lucide-react'
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

  const suggestedPrompts = [
    { icon: ShieldCheck, text: 'What are the safety warnings?', color: 'text-amber-500' },
    { icon: Wrench, text: 'How do I set up this device?', color: 'text-blue-500' },
    { icon: Zap, text: 'What are the specifications?', color: 'text-purple-500' },
    { icon: BookOpen, text: 'Summarise this document', color: 'text-green-500' },
    { icon: Package, text: "What's in the box?", color: 'text-orange-500' },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-8 py-5 border-b border-border/30 bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-md shadow-primary/20">
            <Sparkles className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Ask AI</h2>
            <p className="text-muted-foreground text-xs mt-0.5">Answers grounded in your documents</p>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-auto px-8 py-6 space-y-6">
        {/* Empty state */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center animate-slide-up">
            <div className="relative w-28 h-28 mb-6">
              <div className="absolute inset-0 m-auto w-24 h-24 rounded-full gradient-bg opacity-10 blur-2xl animate-pulse" />
              <div className="absolute inset-0 m-auto w-18 h-18 rounded-2xl bg-background border border-border/50 shadow-xl flex items-center justify-center z-10">
                <Sparkles className="h-8 w-8 text-primary/60" />
              </div>
              <div className="absolute top-1 right-0 w-7 h-7 rounded-md bg-background border border-border/50 shadow-md rotate-[12deg] animate-float z-0 flex items-center justify-center">
                <Bot size={11} className="text-primary/30" />
              </div>
            </div>

            <h3 className="font-bold text-xl tracking-tight text-foreground">Ask anything about your documents</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm leading-relaxed">
              Get instant answers backed by your uploaded files. AI will cite the exact source documents.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-8 max-w-lg">
              {suggestedPrompts.map(({ icon: Icon, text, color }) => (
                <button
                  key={text}
                  onClick={() => setInput(text)}
                  className="flex items-center gap-2 text-xs px-3 py-2.5 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm hover:bg-accent/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200 text-muted-foreground hover:text-foreground text-left group"
                >
                  <Icon size={14} className={`${color} shrink-0 group-hover:scale-110 transition-transform`} />
                  <span className="line-clamp-1">{text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message bubbles */}
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 animate-slide-up ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full gradient-bg flex items-center justify-center shadow-md shadow-primary/20">
                <Bot size={14} className="text-white" />
              </div>
            )}
            <div className="max-w-[72%]">
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'gradient-bg text-white rounded-br-md shadow-md shadow-primary/15'
                  : 'bg-card/60 backdrop-blur-md border border-border/40 text-foreground rounded-bl-md shadow-sm'
              }`}>
                {msg.content}
              </div>
              {/* Citation pills */}
              {uniqueSources(msg.sources).length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <span className="text-[10px] text-muted-foreground/50 mr-0.5 self-center">Sources:</span>
                  {uniqueSources(msg.sources).map((s, j) => (
                    <button
                      key={j}
                      onClick={() => navigate(`/app/documents/${s.document_id}`)}
                      className="inline-flex items-center gap-1.5 text-[11px] text-primary bg-primary/[0.06] hover:bg-primary/[0.12] border border-primary/10 rounded-full pl-2 pr-2.5 py-1 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                    >
                      <FileText size={11} /> {s.document_title}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center shadow-sm">
                <User size={14} className="text-secondary-foreground" />
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center shadow-md shadow-primary/20">
              <Bot size={14} className="text-white" />
            </div>
            <div className="bg-card/60 backdrop-blur-md border border-border/40 rounded-2xl rounded-bl-md px-5 py-3.5 shadow-sm">
              <div className="flex gap-1.5 items-center">
                <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:0.15s]" />
                <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:0.3s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Floating input bar */}
      <div className="px-8 py-4 border-t border-border/30 bg-background/80 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-purple-500/10 to-primary/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-end gap-2 bg-card/60 backdrop-blur-md border border-border/50 rounded-xl p-2 shadow-sm group-focus-within:shadow-lg group-focus-within:border-primary/30 transition-all duration-300">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question... (Shift+Enter for new line)"
                disabled={loading}
                rows={1}
                className="flex-1 resize-none bg-transparent px-3 py-2 text-sm focus:outline-none max-h-40 leading-relaxed placeholder:text-muted-foreground/40"
              />
              <div className="relative group/btn shrink-0">
                {input.trim() && (
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-xl blur opacity-40 group-hover/btn:opacity-70 transition duration-300" />
                )}
                <Button
                  type="submit"
                  size="icon"
                  className="relative h-10 w-10 rounded-xl gradient-bg border-0 text-white shadow-md shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-40 disabled:shadow-none"
                  disabled={loading || !input.trim()}
                >
                  <Send size={15} />
                </Button>
              </div>
            </div>
          </div>
          <p className="text-center text-[10px] text-muted-foreground/40 mt-2">AI answers are grounded in your uploaded documents</p>
        </form>
      </div>
    </div>
  )
}
