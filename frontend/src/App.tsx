import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { FileText, Search, MessageSquare, Upload } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import UploadPage from './pages/Upload'
import SearchPage from './pages/Search'
import AskAI from './pages/AskAI'

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-card flex flex-col">
          <div className="p-6 border-b">
            <h1 className="text-xl font-bold tracking-tight">DocVault</h1>
            <p className="text-xs text-muted-foreground mt-1">AI Document Assistant</p>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            <SidebarLink to="/" icon={<FileText size={18} />} label="Documents" />
            <SidebarLink to="/upload" icon={<Upload size={18} />} label="Upload" />
            <SidebarLink to="/search" icon={<Search size={18} />} label="Search" />
            <SidebarLink to="/ask" icon={<MessageSquare size={18} />} label="Ask AI" />
          </nav>
          <div className="p-4 border-t">
            <p className="text-xs text-muted-foreground">AI Cloud Document Vault</p>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/ask" element={<AskAI />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
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
