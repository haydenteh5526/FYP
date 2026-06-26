import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { FileText, Search, MessageSquare, Upload, LogOut, FolderOpen } from 'lucide-react'
import { AuthProvider, useAuth } from './lib/auth'
import Landing from './pages/Landing'
import AuthPage from './pages/Auth'
import VerifyEmail from './pages/VerifyEmail'
import Dashboard from './pages/Dashboard'
import UploadPage from './pages/Upload'
import SearchPage from './pages/Search'
import AskAI from './pages/AskAI'
import DocumentDetail from './pages/DocumentDetail'
import Categories from './pages/Categories'
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
      <Route path="/app" element={isAuthenticated ? <AppShell /> : <Navigate to="/login" />}>
        <Route index element={<Dashboard />} />
        <Route path="upload" element={<UploadPage />} />
        <Route path="documents/:id" element={<DocumentDetail />} />
        <Route path="categories" element={<Categories />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="ask" element={<AskAI />} />
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
          <SidebarLink to="/app/upload" icon={<Upload size={17} />} label="Upload" />
          <SidebarLink to="/app/categories" icon={<FolderOpen size={17} />} label="Categories" />
          <SidebarLink to="/app/search" icon={<Search size={17} />} label="Search" />
          <SidebarLink to="/app/ask" icon={<MessageSquare size={17} />} label="Ask AI" />
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
            <Route path="categories" element={<Categories />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="ask" element={<AskAI />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

function TopBar() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (q.trim()) {
      navigate(`/app/search?q=${encodeURIComponent(q)}`)
      setQ('')
    }
  }

  return (
    <div className="h-14 border-b border-border/40 glass flex items-center px-6 gap-4 sticky top-0 z-30">
      <form onSubmit={handleSubmit} className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search your documents..."
          className="pl-9 h-9 text-sm bg-muted/40 border-0"
        />
      </form>
      <Button size="sm" className="gradient-bg border-0 text-white" onClick={() => navigate('/app/upload')}>
        <Upload size={15} className="mr-1.5" /> Upload
      </Button>
    </div>
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
