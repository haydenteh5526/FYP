import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef, useCallback } from 'react'
import { FileText, Search, MessageSquare, Upload, Settings as SettingsIcon, Layers, Plus, Trash2, LogOut, ExternalLink, Sparkles } from 'lucide-react'
import { AuthProvider, useAuth } from './lib/auth'
import { searchDocuments, listConversations, deleteConversation, type Conversation } from './lib/api'
import { ToastProvider } from './components/Toast'
import { CommandPalette } from './components/CommandPalette'
import { OnboardingTour } from './components/OnboardingTour'
import { NotificationCenter, useNotifications } from './components/NotificationCenter'
import Landing from './pages/Landing'
import AuthPage from './pages/Auth'
import VerifyEmail from './pages/VerifyEmail'
import Dashboard from './pages/Dashboard'
import UploadPage from './pages/Upload'
import SearchPage from './pages/Search'
import SearchChats from './pages/SearchChats'
import AskAI from './pages/AskAI'
import DocumentDetail from './pages/DocumentDetail'
import Warranties from './pages/Warranties'
import Settings from './pages/Settings'
import ProfilePage from './pages/Profile'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}

function AppRoutes() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/app" /> : <Landing />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/app" /> : <AuthPage mode="login" />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/app" /> : <AuthPage mode="register" />} />
      <Route path="/verify" element={<VerifyEmail />} />
      <Route path="/app/*" element={isAuthenticated ? <AppShell /> : <Navigate to="/login" />}>
        <Route index element={<AskAI />} />
        <Route path="documents" element={<Dashboard />} />
        <Route path="upload" element={<UploadPage />} />
        <Route path="documents/:id" element={<DocumentDetail />} />
        <Route path="warranties" element={<Warranties />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="ask" element={<AskAI />} />
        <Route path="ask/:conversationId" element={<AskAI />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

function AppShell() {
  const { logout, token } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsTab, setSettingsTab] = useState<'general' | 'account' | 'billing'>('general')
  const [userName, setUserName] = useState('')
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const notifs = useNotifications()

  useEffect(() => {
    if (token) {
      fetch('/api/v1/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data) setUserName(data.display_name || data.email.split('@')[0]) })
        .catch(() => {})
    }
  }, [token])

  // Fetch conversations on mount and when navigating to Ask AI
  const fetchConversations = useCallback(() => {
    listConversations()
      .then(data => setConversations(data.filter(c => !c.title.startsWith('[')).slice(0, 10)))
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  useEffect(() => {
    if (location.pathname.startsWith('/app/ask')) {
      fetchConversations()
    }
  }, [location.pathname, fetchConversations])

  // Global ⌘K → command palette
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setPaletteOpen(o => !o)
      }
      if (e.key === 'Escape') setPaletteOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="flex h-screen bg-muted/20">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 ${sidebarCollapsed ? 'w-0 lg:w-0 overflow-hidden' : 'w-[260px]'} flex flex-col bg-background/80 backdrop-blur-2xl border-r border-border/40 shadow-[1px_0_12px_rgba(0,0,0,0.03)] transition-all duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0 !w-[260px]' : !sidebarCollapsed ? '' : '-translate-x-full'}`}>
        {/* Top: Logo + Nav */}
        <div className="px-3 pt-4 pb-2">
          <div className="flex items-center justify-between px-2 mb-4">
            <button onClick={() => navigate('/app')} className="flex items-center gap-2 group hover:opacity-80 transition-opacity">
              <Layers size={20} className="text-primary transition-transform duration-300 group-hover:rotate-12" />
              <span className="text-base font-bold gradient-text tracking-tight">DocVault</span>
            </button>
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="p-1.5 rounded-md text-muted-foreground/50 hover:text-foreground hover:bg-accent transition-colors hidden lg:block"
              title="Collapse sidebar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 17l-5-5 5-5"/><path d="M18 17l-5-5 5-5"/></svg>
            </button>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => { navigate('/app/ask'); setSidebarOpen(false) }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-border/50 text-sm font-medium text-foreground/80 hover:bg-accent/50 hover:border-border transition-all duration-200"
            >
              <Plus size={16} className="text-muted-foreground" />
              New chat
            </button>

            <button
              onClick={() => { navigate('/app/chats'); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                location.pathname === '/app/chats'
                  ? 'bg-accent/80 text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
              }`}
            >
              <Search size={16} />
              Search chats
            </button>

            <button
              onClick={() => { navigate('/app/documents'); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                location.pathname.startsWith('/app/documents')
                  ? 'bg-accent/80 text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
              }`}
            >
              <FileText size={16} />
              Documents
            </button>
          </div>
        </div>

        {/* Conversations list */}
        <div className="flex-1 overflow-auto px-3 py-2 min-h-0 border-t border-border/30 mt-1" onClick={() => setSidebarOpen(false)}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 px-3 mb-2">Recent chats</p>
          {conversations.map(conv => (
            <div key={conv.id} className="group relative">
              <button
                onClick={(e) => { e.stopPropagation(); navigate(`/app/ask/${conv.id}`); setSidebarOpen(false) }}
                className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] text-left transition-all duration-200 ${
                  location.pathname === `/app/ask/${conv.id}`
                    ? 'bg-accent/80 text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
                }`}
              >
                <MessageSquare size={13} className="shrink-0 opacity-50" />
                <span className="truncate flex-1">{conv.title || 'New conversation'}</span>
                <span className="text-[10px] text-muted-foreground/50 shrink-0 group-hover:hidden">{formatRelativeTime(conv.updated_at || conv.created_at)}</span>
              </button>
              <button
                onClick={async (e) => {
                  e.stopPropagation()
                  await deleteConversation(conv.id)
                  setConversations(prev => prev.filter(c => c.id !== conv.id))
                  if (location.pathname === `/app/ask/${conv.id}`) navigate('/app/ask')
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                title="Delete conversation"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          {conversations.length === 0 && (
            <p className="text-[11px] text-muted-foreground/40 px-3 py-4 text-center">Your conversations will appear here</p>
          )}
        </div>

        {/* Bottom: User with dropdown menu */}
        <div className="px-3 py-3 border-t border-border/40 relative">
          {/* Dropdown menu */}
          {userMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
              <div className="absolute bottom-full left-3 right-3 mb-2 bg-card border border-border/50 rounded-xl shadow-xl z-50 animate-scale-in overflow-hidden">
                <div className="px-4 py-3 border-b border-border/30">
                  <p className="text-xs text-muted-foreground truncate">{userName || 'User'}</p>
                </div>
                <div className="py-1">
                  <button onClick={() => { setSettingsOpen(true); setSettingsTab('general'); setUserMenuOpen(false) }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground/80 hover:bg-accent/50 transition-colors">
                    <SettingsIcon size={15} className="text-muted-foreground" /> Settings
                  </button>
                  <button onClick={() => { setSettingsOpen(true); setSettingsTab('billing'); setUserMenuOpen(false) }} className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-foreground/80 hover:bg-accent/50 transition-colors">
                    <span className="flex items-center gap-3"><Sparkles size={15} className="text-muted-foreground" /> Upgrade plan</span>
                  </button>
                  <button onClick={() => { window.open('https://github.com/haydenteh5526/FYP', '_blank'); setUserMenuOpen(false) }} className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-foreground/80 hover:bg-accent/50 transition-colors">
                    <span className="flex items-center gap-3"><ExternalLink size={15} className="text-muted-foreground" /> Learn more</span>
                    <ExternalLink size={12} className="text-muted-foreground/40" />
                  </button>
                </div>
                <div className="border-t border-border/30 py-1">
                  <button onClick={() => { logout(); navigate('/'); setUserMenuOpen(false) }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground/80 hover:bg-accent/50 transition-colors">
                    <LogOut size={15} className="text-muted-foreground" /> Log out
                  </button>
                </div>
              </div>
            </>
          )}

          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-accent/50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {userName ? userName[0].toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium truncate">{userName || 'User'}</p>
              <p className="text-[10px] text-muted-foreground">Free plan</p>
            </div>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-background/50 flex flex-col min-w-0">
        <TopBar
          onMenuClick={() => setSidebarOpen(true)}
          onPaletteOpen={() => setPaletteOpen(true)}
          notifications={notifs}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(false)}
        />
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route index element={<AskAI />} />
            <Route path="documents" element={<Dashboard />} />
            <Route path="upload" element={<UploadPage />} />
            <Route path="documents/:id" element={<DocumentDetail />} />
            <Route path="warranties" element={<Warranties />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="ask" element={<AskAI />} />
            <Route path="ask/:conversationId" element={<AskAI />} />
            <Route path="chats" element={<SearchChats />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<Settings />} />
          </Routes>
        </div>
      </main>

      {/* Global overlays */}
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <OnboardingTour />

      {/* Settings modal */}
      {settingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSettingsOpen(false)} />
          <div className="relative w-full max-w-4xl h-[85vh] bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
            <button
              onClick={() => setSettingsOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors z-10"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
            </button>
            <Settings initialTab={settingsTab} />
          </div>
        </div>
      )}
    </div>
  )
}

function TopBar({ onMenuClick, onPaletteOpen, notifications, sidebarCollapsed, onToggleSidebar }: {
  onMenuClick: () => void
  onPaletteOpen: () => void
  notifications: ReturnType<typeof useNotifications>
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const showSearch = location.pathname === '/app/documents' || location.pathname === '/app/documents/'
  const [q, setQ] = useState('')
  const [results, setResults] = useState<{ document_id: string; document_title: string; chunk_text: string }[]>([])
  const [open, setOpen] = useState(false)
  const debounceRef = useState<{ t?: ReturnType<typeof setTimeout> }>({})[0]
  const wrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  useEffect(() => {
    if (!q.trim()) { setResults([]); setOpen(false); return }
    if (debounceRef.t) clearTimeout(debounceRef.t)
    debounceRef.t = setTimeout(async () => {
      const data = await searchDocuments(q)
      setResults(data.results.slice(0, 5))
      setOpen(true)
    }, 300)
  }, [q])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (q.trim()) { navigate(`/app/search?q=${encodeURIComponent(q)}`); setOpen(false) }
  }

  return (
    <div className="h-14 border-b border-border/30 bg-background/60 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 gap-3 sm:gap-4 sticky top-0 z-30">
      {/* Left: menu/expand button */}
      <div className="flex items-center gap-2">
        <button onClick={onMenuClick} className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground" aria-label="Open menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
        </button>
        {sidebarCollapsed && (
          <button onClick={onToggleSidebar} className="hidden lg:block p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Expand sidebar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 17l5-5-5-5"/><path d="M6 17l5-5-5-5"/></svg>
          </button>
        )}
      </div>

      {/* Search — only on Documents page */}
      {showSearch ? (
      <div ref={wrapRef} className="relative flex-1 max-w-lg">
        {/* On mobile, just a search icon that opens the palette */}
        <button
          className="sm:hidden p-2 text-muted-foreground hover:text-foreground"
          onClick={onPaletteOpen}
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </button>

        {/* Desktop inline search */}
        <form onSubmit={handleSubmit} className="relative hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="topbar-search"
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => q && setOpen(true)}
            onClick={onPaletteOpen}
            readOnly
            placeholder="Search documents…"
            className="pl-10 pr-16 h-9 text-sm bg-muted/40 border-0 rounded-full cursor-pointer"
          />
          <kbd className="absolute right-3.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-muted/60 border border-border/50 text-[10px] text-muted-foreground font-medium pointer-events-none">
            ⌘K
          </kbd>
        </form>

        {/* Live dropdown (kept for keyboard search fallback) */}
        {open && results.length > 0 && (
          <div className="absolute top-11 left-0 right-0 bg-card border border-border/50 rounded-xl shadow-xl overflow-hidden animate-scale-in z-50">
            {results.map((r, i) => (
              <button
                key={i}
                onClick={() => { navigate(`/app/documents/${r.document_id}`); setOpen(false); setQ('') }}
                className="w-full flex items-start gap-3 px-4 py-3 hover:bg-accent/50 transition-colors text-left border-b border-border/30 last:border-0"
              >
                <FileText size={15} className="text-primary/60 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{r.document_title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1" dangerouslySetInnerHTML={{ __html: r.chunk_text }} />
                </div>
              </button>
            ))}
            <button onClick={handleSubmit} className="w-full px-4 py-2.5 text-xs text-primary hover:bg-accent/50 transition-colors font-medium">
              View all results →
            </button>
          </div>
        )}
      </div>
      ) : (
        <div className="flex-1" />
      )}

      {/* Right actions */}
      <div className="flex items-center gap-1 sm:gap-2">
        <NotificationCenter
          notifications={notifications.notifications}
          unreadCount={notifications.unreadCount}
          onMarkAllRead={notifications.markAllRead}
          onRemove={notifications.remove}
        />
        <Button
          id="topbar-upload"
          size="sm"
          className="gradient-bg border-0 text-white transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 hidden sm:flex"
          onClick={() => navigate('/app/upload')}
        >
          <Upload size={15} className="mr-1.5" /> Upload
        </Button>
        {/* Mobile upload icon */}
        <Button
          size="icon"
          className="gradient-bg border-0 text-white h-8 w-8 sm:hidden"
          onClick={() => navigate('/app/upload')}
        >
          <Upload size={15} />
        </Button>
      </div>
    </div>
  )
}



function formatRelativeTime(dateStr: string): string {
  const now = Date.now()
  // Ensure UTC interpretation if no timezone specified
  const normalized = dateStr.endsWith('Z') || dateStr.includes('+') ? dateStr : dateStr + 'Z'
  const date = new Date(normalized).getTime()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `${diffMins}m`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d`
  const diffWeeks = Math.floor(diffDays / 7)
  return `${diffWeeks}w`
}

export default App
