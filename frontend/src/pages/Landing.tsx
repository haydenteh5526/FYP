import { Camera, Search, MessageSquare, Shield, Cloud, Zap, ArrowRight, FileText, Star } from 'lucide-react'
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
      <section className="pt-36 pb-24 px-6 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-16 left-1/4 w-[500px] h-[500px] bg-primary/[0.04] rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute top-32 right-1/5 w-[400px] h-[400px] bg-purple-300/[0.06] rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-200/[0.04] rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary border px-4 py-1.5 text-xs font-medium text-secondary-foreground mb-8 animate-scale-in">
            <Zap size={12} className="text-primary" /> AI-Powered Document Intelligence
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.08] animate-fade-in">
            Your documents,<br />
            <span className="gradient-text">instantly searchable.</span>
          </h1>
          <p className="mt-7 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-slide-up">
            Photograph any manual, warranty, or guide. AI extracts the text and lets you ask questions in plain English.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center animate-slide-up" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
            <Button size="lg" className="gradient-bg border-0 text-white px-8 h-12 text-base hover:opacity-90 transition-opacity shadow-lg shadow-primary/20" asChild>
              <Link to="/register">Get started free <ArrowRight size={16} className="ml-1.5" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="px-8 h-12 text-base" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
            No credit card required • Free forever for personal use
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 border-t bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold">How it works</h2>
            <p className="mt-2 text-muted-foreground">Three steps. Thirty seconds.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Step number="1" title="Snap a photo" description="Take a picture of any physical document — manual, warranty card, spec sheet." />
            <Step number="2" title="AI processes it" description="Text is extracted, brand detected, document categorised and indexed automatically." />
            <Step number="3" title="Ask anything" description="Search by meaning or ask questions. Get instant answers with source citations." />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 border-t">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold">Built for the way you work</h2>
            <p className="mt-2 text-muted-foreground">Powerful features, zero learning curve.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            <FeatureCard icon={<Camera size={22} />} title="Smart Capture" description="OCR with pre-processing — deskew, denoise, contrast enhancement for perfect results." delay={0} />
            <FeatureCard icon={<Search size={22} />} title="Semantic Search" description="Find by meaning. 'drainage problem' finds 'blocked filter' without exact keywords." delay={0.05} />
            <FeatureCard icon={<MessageSquare size={22} />} title="AI Q&A" description="Ask natural questions, get sourced answers. Like ChatGPT trained on your docs." delay={0.1} />
            <FeatureCard icon={<Shield size={22} />} title="Private & Secure" description="End-to-end encryption. Per-user isolation. Your documents are yours alone." delay={0.15} />
            <FeatureCard icon={<Cloud size={22} />} title="Everywhere" description="Web, iOS, Android. Always synced, always available. Works offline too." delay={0.2} />
            <FeatureCard icon={<FileText size={22} />} title="Auto-Organise" description="AI detects brand, model, type. Creates categories. Tracks warranty expiry." delay={0.25} />
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-16 px-6 border-t bg-muted/20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />)}
          </div>
          <blockquote className="text-lg font-medium max-w-2xl mx-auto leading-relaxed">
            "I scanned all my appliance manuals in one afternoon. Last week my dishwasher showed error E4 — I asked the app and had the fix in 5 seconds."
          </blockquote>
          <p className="mt-4 text-sm text-muted-foreground">— Early beta tester</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t">
        <div className="max-w-3xl mx-auto text-center rounded-3xl gradient-bg p-14 sm:p-16 relative overflow-hidden shadow-2xl shadow-primary/20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.08),transparent)]" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Ready to go paperless?</h2>
            <p className="mt-3 text-white/70 text-lg">Start scanning your documents today.</p>
            <Button size="lg" className="mt-8 bg-white text-primary hover:bg-white/90 h-12 px-8 text-base shadow-lg" asChild>
              <Link to="/register">Create free account <ArrowRight size={16} className="ml-1.5" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md gradient-bg flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">D</span>
            </div>
            <span className="text-sm font-medium">DocVault</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2027 AI Cloud Document Vault. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function Step({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center mx-auto text-white text-sm font-bold shadow-md shadow-primary/20">
        {number}
      </div>
      <h3 className="font-semibold mt-4">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{description}</p>
    </div>
  )
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode; title: string; description: string; delay: number }) {
  return (
    <div
      className="rounded-xl border bg-card p-6 hover-lift animate-slide-up"
      style={{ animationDelay: `${delay}s`, animationFillMode: 'both' }}
    >
      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="font-semibold mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}
