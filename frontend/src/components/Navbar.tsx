import { Link } from 'react-router-dom'
import { Layers, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

const NAV_ITEMS = ['Features', 'Security', 'Pricing']

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20)

      // Detect active section
      for (const id of [...NAV_ITEMS].reverse()) {
        const el = document.getElementById(id.toLowerCase())
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveSection(id.toLowerCase())
          return
        }
      }
      setActiveSection('')
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileOpen(false)
  }

  return (
    <>
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'glass border-b border-border/30 shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 group">
            <Layers size={22} className="text-primary transition-transform duration-300 group-hover:rotate-12" />
            <span className="text-lg font-bold gradient-text tracking-tight">DocVault</span>
          </Link>

          {/* Center nav — desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item}
                onClick={() => scrollTo(item.toLowerCase())}
                className={`relative px-4 py-1.5 text-sm transition-all duration-200 rounded-full ${
                  activeSection === item.toLowerCase()
                    ? 'text-foreground bg-accent/70'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
                }`}
              >
                {item}
              </button>
            ))}
          </nav>

          {/* Right — desktop */}
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
            <Button size="sm" className="gradient-bg border-0 text-white shadow-md shadow-primary/20 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5" asChild>
              <Link to="/register">Get started</Link>
            </Button>
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 pt-16 bg-background/95 backdrop-blur-lg md:hidden animate-fade-in">
          <nav className="flex flex-col items-center gap-4 pt-12">
            {NAV_ITEMS.map(item => (
              <button key={item} onClick={() => scrollTo(item.toLowerCase())} className="text-lg font-medium text-foreground/80 hover:text-foreground transition-colors">
                {item}
              </button>
            ))}
            <div className="flex flex-col gap-3 mt-6 w-48">
              <Button variant="outline" className="w-full" asChild><Link to="/login">Sign in</Link></Button>
              <Button className="w-full gradient-bg border-0 text-white" asChild><Link to="/register">Get started</Link></Button>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
