import { Link } from 'react-router-dom'
import { Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Navbar() {
  return (
    <header className="fixed top-0 w-full z-50 glass border-b border-border/30">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 group">
          <Layers size={22} className="text-primary transition-transform duration-300 group-hover:rotate-12" />
          <span className="text-lg font-bold gradient-text tracking-tight">DocVault</span>
        </Link>

        {/* Center nav — hidden on mobile */}
        <nav className="hidden md:flex items-center gap-1">
          {['Features', 'Security', 'Pricing'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="relative px-4 py-1.5 text-sm text-muted-foreground transition-all duration-200 rounded-full hover:text-foreground hover:bg-accent/60"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-muted-foreground hidden sm:inline-flex" asChild>
            <Link to="/login">Sign in</Link>
          </Button>
          <Button size="sm" className="gradient-bg border-0 text-white shadow-md shadow-primary/20 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5" asChild>
            <Link to="/register">Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
