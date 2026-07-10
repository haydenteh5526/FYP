import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { FileText, Search, MessageSquare, Upload, LogOut, ShieldCheck, Settings as SettingsIcon, Sun, Moon } from 'lucide-react'
import { AuthProvider, useAuth } from './lib/auth'
import { searchDocuments } from './lib/api'
import { useTheme } from './lib/theme'
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
        <Route index element={<Dashboard />} />
        <Route path="upload" element={<UploadPage />} />
        <Route path="documents/:id" element={<DocumentDetail />} />
        <Route path="warranties" element={<Warranties />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="ask" element={<AskAI />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

function AppShell() {
  const { logout, token } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userName, setUserName] = useState('')
  const [paletteOpen, setPaletteOpen] = useState(false)
  const notifs = useNotifications()

  useEffect(() => {
    if (token) {
      fetch('/api/v1/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data) setUserName(data.display_name || data.email.split('@')[0]) })
        .catch(() => {})
    }
  }, [token])

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
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-[260px] flex flex-col glass border-r border-border/40 shadow-[1px_0_12px_rgba(0,0,0,0.03)] transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-5 py-5">
          <button onClick={() => navigate('/app')} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center shadow-md shadow-primary/25">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M7 18h10V6H7v12zM5 4h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1zm4 4h6v2h-6V8zm0 4h6v2h-6v-2z" fill="currentColor"/>
              </svg>
            </div>
            <div>
              <h1 className="text-[15px] font-semibold leading-none">DocVault</h1>
              <p className="text-[10px] text-muted-foreground mt-0.5">AI Document Assistant</p>
            </div>
          </button>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-0.5" onClick={() => setSidebarOpen(false)}>
          <SidebarLink to="/app" icon={<FileText size={17} />} label="Documents" end />
          <SidebarLink to="/app/warranties" icon={<ShieldCheck size={17} />} label="Warranties" />
          <SidebarLink to="/app/ask" icon={<MessageSquare size={17} />} label="Ask AI" />
        </nav>

        <div className="px-3 py-3 border-t border-border/40">
          <div className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => { navigate('/app/profile'); setSidebarOpen(false) }}>
            <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {userName ? userName[0].toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userName || 'User'}</p>
              <p className="text-[10px] text-muted-foreground">Free plan</p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); navigate('/app/settings'); setSidebarOpen(false) }} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" aria-label="Settings">
              <SettingsIcon size={15} />
            </button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2.5 text-muted-foreground hover:text-foreground transition-all duration-200 mt-1"
            onClick={() => { logout(); navigate('/') }}
          >
            <LogOut size={15} /> Sign out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-background flex flex-col min-w-0">
        <TopBar
          onMenuClick={() => setSidebarOpen(true)}
          onPaletteOpen={() => setPaletteOpen(true)}
          notifications={notifs}
        />
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="upload" element={<UploadPage />} />
            <Route path="documents/:id" element={<DocumentDetail />} />
            <Route path="warranties" element={<Warranties />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="ask" element={<AskAI />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<Settings />} />
          </Routes>
        </div>
      </main>

      {/* Global overlays */}
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <OnboardingTour />
    </div>
  )
}

function TopBar({ onMenuClick, onPaletteOpen, notifications }: {
  onMenuClick: () => void
  onPaletteOpen: () => void
  notifications: ReturnType<typeof useNotifications>
}) {
  const navigate = useNavigate()
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
    <div className="h-14 border-b border-border/40 glass flex items-center justify-between px-4 sm:px-6 gap-3 sm:gap-4 sticky top-0 z-30">
      {/* Mobile menu button */}
      <button onClick={onMenuClick} className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground" aria-label="Open menu">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
      </button>
      <div className="w-20 hidden lg:block" />

      {/* Search — click to open palette on mobile, inline on desktop */}
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

      {/* Right actions */}
      <div className="flex items-center gap-1 sm:gap-2">
        <ThemeToggle />
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

function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground" onClick={toggle} aria-label="Toggle dark mode">
      {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
    </Button>
  )
}

function SidebarLink({ to, icon, label, end }: { to: string; icon: React.ReactNode; label: string; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200 ${
          isActive
            ? 'gradient-bg text-white shadow-md shadow-primary/20'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  )
}

export default App
