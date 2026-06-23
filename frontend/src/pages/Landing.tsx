import { Camera, Search, MessageSquare, Shield, Cloud, Zap, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function Landing() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 glass border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <span className="text-white text-sm font-bold">D</span>
            </div>
            <span className="text-lg font-semibold">DocVault</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
            <Button size="sm" className="gradient-bg border-0 text-white" asChild>
              <Link to="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-xs font-medium text-secondary-foreground mb-8 animate-scale-in">
            <Zap size={12} /> AI-Powered Document Intelligence
          </div>
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight leading-[1.1]">
            <span className="gradient-text">Snap it. Store it.</span><br />
            Ask it anything.
          </h1>
          <p className="mt-8 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-slide-up">
            Digitise your physical documents and query them with AI. 
            Never lose a manual again.
          </p>
          <div className="mt-12 flex gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Button size="lg" className="gradient-bg border-0 text-white px-8 hover:opacity-90 transition-opacity" asChild>
              <Link to="/register">Start free <ArrowRight size={16} className="ml-1" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="px-8" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Powerful features, effortless experience</h2>
            <p className="mt-3 text-muted-foreground">Everything you need to go paperless, powered by AI.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard icon={<Camera size={24} />} title="Snap & Digitise" description="AI extracts text, detects the brand and model, categorises automatically." delay={0} />
            <FeatureCard icon={<Search size={24} />} title="Semantic Search" description="Find information by meaning, not just keywords. Ask naturally." delay={0.1} />
            <FeatureCard icon={<MessageSquare size={24} />} title="AI Q&A" description="Ask questions, get instant answers with source citations." delay={0.2} />
            <FeatureCard icon={<Shield size={24} />} title="Private & Encrypted" description="Per-user isolation, encrypted storage, JWT authentication." delay={0.3} />
            <FeatureCard icon={<Cloud size={24} />} title="Cloud Synced" description="Access from any device. Web, mobile, always in sync." delay={0.4} />
            <FeatureCard icon={<Zap size={24} />} title="Instant Processing" description="Upload takes seconds. OCR and AI run automatically." delay={0.5} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center rounded-2xl gradient-bg p-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent)]" />
          <div className="relative">
            <h2 className="text-3xl font-bold text-white">Ready to ditch the paper?</h2>
            <p className="mt-3 text-white/70">Join the smarter way to manage documents.</p>
            <Button size="lg" className="mt-8 bg-white text-primary hover:bg-white/90" asChild>
              <Link to="/register">Create free account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-muted-foreground">
          DocVault © 2027 — AI Cloud Document Vault
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode; title: string; description: string; delay: number }) {
  return (
    <div
      className="rounded-xl border bg-card p-6 hover-lift animate-slide-up"
      style={{ animationDelay: `${delay}s`, animationFillMode: 'both' }}
    >
      <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}
