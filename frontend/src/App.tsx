import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { FileText, Search, MessageSquare, Upload, LogOut, ShieldCheck, Settings as SettingsIcon, Sun, Moon } from 'lucide-react'
import { AuthProvider, useAuth } from './lib/auth'
import { searchDocuments } from './lib/api'
import { useTheme } from './lib/theme'
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
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
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
  const { logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex h-screen bg-muted/20">
      {/* Sidebar — glass, no hard border, subtle shadow instead */}
      <aside className="w-[260px] flex flex-col glass border-r border-border/40 shadow-[1px_0_12px_rgba(0,0,0,0.03)]">
        <div className="px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center shadow-md shadow-primary/25">
              <span className="text-white text-sm font-bold">D</span>
            </div>
            <div>
              <h1 className="text-[15px] font-semibold leading-none">DocVault</h1>
              <p className="text-[10px] text-muted-foreground mt-0.5">AI Document Assistant</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-0.5">
          <SidebarLink to="/app" icon={<FileText size={17} />} label="Documents" end />
          <SidebarLink to="/app/warranties" icon={<ShieldCheck size={17} />} label="Warranties" />
          <SidebarLink to="/app/ask" icon={<MessageSquare size={17} />} label="Ask AI" />
          <SidebarLink to="/app/settings" icon={<SettingsIcon size={17} />} label="Settings" />
        </nav>

        <div className="px-3 py-3 border-t border-border/40">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2.5 text-muted-foreground hover:text-foreground transition-all duration-200"
            onClick={() => { logout(); navigate('/') }}
          >
            <LogOut size={15} /> Sign out
          </Button>
        </div>
      </aside>

      {/* Main content with neutral bg */}
      <main className="flex-1 overflow-auto bg-background flex flex-col">
        <TopBar />
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="upload" element={<UploadPage />} />
            <Route path="documents/:id" element={<DocumentDetail />} />
            <Route path="warranties" element={<Warranties />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="ask" element={<AskAI />} />
            <Route path="settings" element={<Settings />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

function TopBar() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [results, setResults] = useState<{ document_id: string; document_title: string; chunk_text: string }[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
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

  // Cmd+K / Ctrl+K to focus search
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!q.trim()) { setResults([]); setOpen(false); return }
    if (debounceRef.t) clearTimeout(debounceRef.t)
    debounceRef.t = setTimeout(async () => {
      setLoading(true)
      const data = await searchDocuments(q)
      setResults(data.results.slice(0, 5))
      setOpen(true)
      setLoading(false)
    }, 300)
  }, [q])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (q.trim()) { navigate(`/app/search?q=${encodeURIComponent(q)}`); setOpen(false) }
  }

  return (
    <div className="h-14 border-b border-border/40 glass flex items-center justify-between px-6 gap-4 sticky top-0 z-30">
      <div className="w-20" /> {/* spacer for centering */}

      {/* Centered search */}
      <div ref={wrapRef} className="relative flex-1 max-w-lg">
        <form onSubmit={handleSubmit} className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => q && setOpen(true)}
            placeholder="Search documents..."
            className="pl-10 pr-16 h-9 text-sm bg-muted/40 border-0 rounded-full"
          />
          {!loading && <span />}
          {loading && <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
        </form>

        {/* Live dropdown */}
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
        {open && results.length === 0 && !loading && q && (
          <div className="absolute top-11 left-0 right-0 bg-card border border-border/50 rounded-xl shadow-xl p-4 text-center text-sm text-muted-foreground animate-scale-in z-50">
            No results for "{q}"
          </div>
        )}
      </div>

      {/* Upload button with hover animation */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button size="sm" className="gradient-bg border-0 text-white transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0" onClick={() => navigate('/app/upload')}>
          <Upload size={15} className="mr-1.5" /> Upload
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
