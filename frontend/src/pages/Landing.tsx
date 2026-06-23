import { Camera, Search, MessageSquare, Shield, Cloud, ArrowRight, FileText, Star, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function Landing() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Seamless navbar - no border, just glass blur */}
      <header className="fixed top-0 w-full z-50 backdrop-blur-xl bg-background/60">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center shadow-sm shadow-primary/25">
              <span className="text-white text-sm font-bold">D</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">DocVault</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
            <Button size="sm" className="gradient-bg border-0 text-white shadow-md shadow-primary/20" asChild>
              <Link to="/register">Get started <ChevronRight size={14} className="ml-0.5" /></Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero — big breathing space, staggered entrance */}
      <section className="pt-40 pb-28 px-6 relative">
        {/* Ambient glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-primary/[0.06] via-purple-300/[0.04] to-transparent rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 rounded-full border bg-background/80 backdrop-blur px-4 py-1.5 text-xs font-medium text-muted-foreground mb-8 opacity-0"
            style={{ animation: 'fadeSlideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s forwards' }}
          >
            <span className="flex h-2 w-2 rounded-full gradient-bg" />
            Now with AI-powered document intelligence
          </div>

          {/* Headline */}
          <h1
            className="text-5xl sm:text-6xl md:text-[4.5rem] font-bold tracking-tight leading-[1.06] opacity-0"
            style={{ animation: 'fadeSlideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s forwards' }}
          >
            Your documents,<br />
            <span className="gradient-text">instantly intelligent.</span>
          </h1>

          {/* Subtitle */}
          <p
            className="mt-7 text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed opacity-0"
            style={{ animation: 'fadeSlideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.35s forwards' }}
          >
            Photograph any manual or guide. AI reads it, organises it, and answers your questions in seconds.
          </p>

          {/* CTAs */}
          <div
            className="mt-10 flex flex-col sm:flex-row gap-3 justify-center opacity-0"
            style={{ animation: 'fadeSlideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.5s forwards' }}
          >
            <Button size="lg" className="gradient-bg border-0 text-white px-8 h-12 text-[15px] hover:opacity-90 transition-all shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/25 hover:-translate-y-0.5" asChild>
              <Link to="/register">Start free <ArrowRight size={16} className="ml-1.5" /></Link>
            </Button>
            <Button size="lg" variant="ghost" className="px-8 h-12 text-[15px] text-muted-foreground" asChild>
              <Link to="/login">I have an account</Link>
            </Button>
          </div>

          {/* Trust */}
          <p
            className="mt-5 text-[13px] text-muted-foreground/60 opacity-0"
            style={{ animation: 'fadeSlideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.65s forwards' }}
          >
            Free forever • No credit card • Works on all devices
          </p>
        </div>
      </section>

      {/* How it works — minimal, Apple-style */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <SectionHeader title="How it works" subtitle="Three steps to never lose information again." />
          <div className="grid md:grid-cols-3 gap-12 mt-14">
            <Step number="01" title="Snap" description="Take a photo of any document with your phone or upload a file." />
            <Step number="02" title="Process" description="AI extracts text, detects brand & model, categorises automatically." />
            <Step number="03" title="Ask" description="Search by meaning or ask questions. Get answers with source citations." />
          </div>
        </div>
      </section>

      {/* Features — bento-style grid */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <SectionHeader title="Everything you need" subtitle="Powerful features that feel effortless." />
          <div className="grid md:grid-cols-3 gap-4 mt-14">
            <FeatureCard icon={<Camera size={20} />} title="Smart OCR" description="Pre-processing + extraction. Handles skewed photos, poor lighting, and multi-page PDFs." />
            <FeatureCard icon={<Search size={20} />} title="Semantic Search" description="Find 'drainage issue' even when the manual says 'blocked filter'. AI understands meaning." />
            <FeatureCard icon={<MessageSquare size={20} />} title="Ask Anything" description="Natural language Q&A grounded in your actual documents. No hallucinations." />
            <FeatureCard icon={<Shield size={20} />} title="Bank-level Security" description="JWT auth, bcrypt encryption, per-user isolation. Your data stays yours." />
            <FeatureCard icon={<Cloud size={20} />} title="Sync Everywhere" description="Web, mobile, tablet. Cloud-native architecture keeps everything in sync." />
            <FeatureCard icon={<FileText size={20} />} title="Auto-organise" description="Brand, model, category detected. Warranties tracked. Zero manual work." />
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center gap-0.5 mb-5">
            {[...Array(5)].map((_, i) => <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />)}
          </div>
          <blockquote className="text-xl font-medium leading-relaxed max-w-2xl mx-auto">
            "I scanned all my appliance manuals in one afternoon. Last week my dishwasher showed error E4 — I asked the app and had the fix in 5 seconds."
          </blockquote>
          <p className="mt-5 text-sm text-muted-foreground">— Early beta tester</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto rounded-3xl gradient-bg p-14 sm:p-20 relative overflow-hidden shadow-2xl shadow-primary/25">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.12),transparent)]" />
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-white/[0.05] rounded-full blur-2xl" />
          <div className="relative text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
              Ready to make your<br />documents work for you?
            </h2>
            <p className="mt-4 text-white/60 text-lg">Join thousands going paperless with AI.</p>
            <Button size="lg" className="mt-9 bg-white text-primary hover:bg-white/90 h-12 px-8 text-[15px] shadow-xl hover:-translate-y-0.5 transition-all" asChild>
              <Link to="/register">Get started free <ArrowRight size={16} className="ml-1.5" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md gradient-bg flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">D</span>
            </div>
            <span className="text-sm font-medium">DocVault</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2027 AI Cloud Document Vault</p>
        </div>
      </footer>

      {/* Custom animation keyframes */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
      <p className="mt-2 text-muted-foreground">{subtitle}</p>
    </div>
  )
}

function Step({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center sm:text-left">
      <span className="text-xs font-mono text-primary/60 tracking-widest">{number}</span>
      <h3 className="font-semibold text-lg mt-2">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{description}</p>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-2xl border bg-card p-6 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/[0.03] transition-all duration-300">
      <div className="w-10 h-10 rounded-xl bg-primary/[0.08] flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="font-semibold mb-1.5">{title}</h3>
      <p className="text-[13px] text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}
