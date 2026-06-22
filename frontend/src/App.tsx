import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { FileText, Search, MessageSquare, Upload, LogOut, FolderOpen } from 'lucide-react'
import { AuthProvider, useAuth } from './lib/auth'
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

  if (!isAuthenticated) return <AuthPage />

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
    <aside className="w-64 border-r bg-card flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold tracking-tight">DocVault</h1>
        <p className="text-xs text-muted-foreground mt-1">AI Document Assistant</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        <SidebarLink to="/" icon={<FileText size={18} />} label="Documents" />
        <SidebarLink to="/upload" icon={<Upload size={18} />} label="Upload" />
        <SidebarLink to="/categories" icon={<FolderOpen size={18} />} label="Categories" />
        <SidebarLink to="/search" icon={<Search size={18} />} label="Search" />
        <SidebarLink to="/ask" icon={<MessageSquare size={18} />} label="Ask AI" />
      </nav>
      <div className="p-4 border-t">
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground" onClick={logout}>
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
        `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
          isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  )
}

export default App
