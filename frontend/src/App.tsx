import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { useState } from 'react'
import { FileText, Search, MessageSquare, Upload, LogOut, FolderOpen } from 'lucide-react'
import { AuthProvider, useAuth } from './lib/auth'
import Landing from './pages/Landing'
import AuthPage from './pages/Auth'
import Dashboard from './pages/Dashboard'
import UploadPage from './pages/Upload'
import SearchPage from './pages/Search'
import AskAI from './pages/AskAI'
import DocumentDetail from './pages/DocumentDetail'
import Categories from './pages/Categories'
import { Button } from './components/ui/button'

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

function AppContent() {
  const { isAuthenticated } = useAuth()
  const [showAuth, setShowAuth] = useState(false)

  if (!isAuthenticated) {
    if (showAuth) return <AuthPage />
    return <Landing onGetStarted={() => setShowAuth(true)} />
  }

  return (
    <BrowserRouter>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/documents/:id" element={<DocumentDetail />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/ask" element={<AskAI />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

function Sidebar() {
  const { logout } = useAuth()

  return (
    <aside className="w-64 border-r bg-card/50 glass flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center shadow-sm shadow-primary/20">
            <span className="text-white text-sm font-bold">D</span>
          </div>
          <div>
            <h1 className="text-base font-semibold">DocVault</h1>
            <p className="text-[10px] text-muted-foreground -mt-0.5">AI Document Assistant</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        <SidebarLink to="/" icon={<FileText size={18} />} label="Documents" />
        <SidebarLink to="/upload" icon={<Upload size={18} />} label="Upload" />
        <SidebarLink to="/categories" icon={<FolderOpen size={18} />} label="Categories" />
        <SidebarLink to="/search" icon={<Search size={18} />} label="Search" />
        <SidebarLink to="/ask" icon={<MessageSquare size={18} />} label="Ask AI" />
      </nav>
      <div className="p-3 border-t">
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground" onClick={logout}>
          <LogOut size={16} /> Sign out
        </Button>
      </div>
    </aside>
  )
}

function SidebarLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
          isActive ? 'gradient-bg text-white shadow-sm shadow-primary/20' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  )
}

export default App
