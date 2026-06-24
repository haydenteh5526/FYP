import { ArrowRight, Camera, Search, MessageSquare, Shield, Cloud, FileText, Star, Zap, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-40 pb-24 px-6 relative overflow-hidden">
        {/* Dot grid background */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-primary/[0.07] via-purple-400/[0.03] to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="opacity-0" style={{ animation: 'fadeSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s forwards' }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/80 backdrop-blur px-4 py-1.5 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full gradient-bg animate-pulse" /> Now with AI OCR 2.0
            </span>
          </div>

          <h1 className="mt-8 text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.05] opacity-0" style={{ animation: 'fadeSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.2s forwards' }}>
            Documents that<br /><span className="gradient-text">think for you.</span>
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed opacity-0" style={{ animation: 'fadeSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.35s forwards' }}>
            Snap any physical document. AI extracts, organises, and lets you query it — like having a photographic memory for every manual you've ever owned.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center opacity-0" style={{ animation: 'fadeSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.5s forwards' }}>
            <Button size="lg" className="gradient-bg border-0 text-white h-12 px-8 text-[15px] shadow-xl shadow-primary/20 transition-all duration-200 hover:shadow-2xl hover:-translate-y-0.5" asChild>
              <Link to="/register">Start free <ArrowRight size={16} className="ml-1.5" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-[15px] border-border/50 transition-all duration-200 hover:bg-accent/50" asChild>
              <Link to="/login">Watch demo</Link>
            </Button>
          </div>

          <p className="mt-5 text-xs text-muted-foreground/50 opacity-0" style={{ animation: 'fadeSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.65s forwards' }}>
            No credit card required • Free forever for personal use
          </p>
        </div>
      </section>

      {/* Scanner showcase */}
      <section className="pb-24 px-6">
        <div className="max-w-3xl mx-auto opacity-0" style={{ animation: 'fadeSlideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.8s forwards' }}>
          <div className="relative rounded-2xl border border-border/40 bg-card p-8 shadow-2xl shadow-black/[0.04] overflow-hidden">
            {/* Scan animation */}
            <div className="absolute top-0 left-0 right-0 h-0.5 gradient-bg animate-[scanLine_3s_ease-in-out_infinite]" />

            <div className="grid md:grid-cols-2 gap-6 items-center">
              {/* Left: "Physical document" */}
              <div className="rounded-xl bg-muted/50 border border-border/30 p-5 aspect-[4/5] flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="h-3 bg-muted-foreground/10 rounded w-3/4" />
                  <div className="h-3 bg-muted-foreground/10 rounded w-full" />
                  <div className="h-3 bg-muted-foreground/10 rounded w-5/6" />
                  <div className="h-3 bg-muted-foreground/10 rounded w-2/3" />
                </div>
                <div className="mt-4 flex gap-2">
                  <div className="h-8 w-8 rounded bg-muted-foreground/10" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2.5 bg-muted-foreground/10 rounded w-1/2" />
                    <div className="h-2.5 bg-muted-foreground/10 rounded w-3/4" />
                  </div>
                </div>
              </div>

              {/* Right: "Digital output" */}
              <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/[0.02] to-transparent p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center"><FileText size={14} className="text-white" /></div>
                  <div>
                    <p className="text-sm font-medium">Samsung WW90T Manual</p>
                    <p className="text-[11px] text-muted-foreground">User Manual • Detected automatically</p>
                  </div>
                </div>
                <div className="space-y-2 text-[12px] text-muted-foreground border-t border-border/30 pt-3">
                  <p><span className="font-medium text-foreground">Brand:</span> Samsung</p>
                  <p><span className="font-medium text-foreground">Model:</span> WW90T554DAW</p>
                  <p><span className="font-medium text-foreground">Category:</span> Appliances → Laundry</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-[12px]">
                  <p className="text-muted-foreground">💬 "Wash delicates at 30°C with 800rpm spin"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento feature grid */}
      <section id="features" className="py-24 px-6 bg-muted/20 border-t border-border/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight">Built for the way you think</h2>
            <p className="mt-2 text-muted-foreground">Every feature designed to feel invisible until you need it.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: <Camera size={20} />, title: 'Smart OCR', desc: 'Deskew, denoise, enhance — handles real-world photos perfectly. Multi-page PDF support included.' },
              { icon: <Search size={20} />, title: 'Semantic Search', desc: 'Find "drainage issue" even when the manual says "blocked filter". AI understands context.' },
              { icon: <MessageSquare size={20} />, title: 'AI Q&A', desc: 'Ask natural questions, get sourced answers. Grounded in your documents — no hallucinations.' },
              { icon: <Shield size={20} />, title: 'End-to-end Security', desc: 'JWT auth, bcrypt, per-user isolation, encrypted storage. Your data never leaves your account.' },
              { icon: <Cloud size={20} />, title: 'Cloud Native', desc: 'Sync everywhere. Web, mobile, tablet. Built on AWS with Terraform IaC for reliability.' },
              { icon: <Zap size={20} />, title: 'Instant Processing', desc: 'Upload → OCR → categorise → embed → searchable in under 30 seconds. Zero manual work.' },
            ].map((f, i) => (
              <div
                key={f.title}
                className="rounded-2xl border border-border/40 bg-card p-6 hover-lift animate-slide-up transition-all duration-200"
                style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/[0.07] flex items-center justify-center text-primary mb-4 transition-colors duration-200 group-hover:bg-primary/[0.12]">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-[15px] mb-1.5">{f.title}</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="py-24 px-6 border-t border-border/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight">Security you can trust</h2>
            <p className="mt-2 text-muted-foreground">Your documents are private by default. Always.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { title: 'Encrypted at rest', desc: 'AES-256 encryption on all stored files via AWS S3.' },
              { title: 'Encrypted in transit', desc: 'TLS 1.3 for every API call and data transfer.' },
              { title: 'User isolation', desc: 'Row-level security — no user can ever access another\'s data.' },
              { title: 'No data selling', desc: 'Your documents are never used for training or shared with third parties.' },
            ].map((item, i) => (
              <div
                key={item.title}
                className="rounded-xl border border-border/40 bg-card p-5 animate-slide-up"
                style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
              >
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center mb-3">
                  <Shield size={16} className="text-green-600" />
                </div>
                <h4 className="text-sm font-semibold mb-1">{item.title}</h4>
                <p className="text-[12px] text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-muted/20 border-t border-border/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight">Simple, transparent pricing</h2>
            <p className="mt-2 text-muted-foreground">Start free. Upgrade when you need more.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free tier */}
            <div className="rounded-2xl border border-border/40 bg-card p-8 hover-lift transition-all duration-200">
              <h3 className="font-semibold text-lg">Free</h3>
              <p className="text-muted-foreground text-sm mt-1">For personal use</p>
              <p className="mt-5"><span className="text-4xl font-bold">€0</span><span className="text-muted-foreground text-sm">/month</span></p>
              <ul className="mt-6 space-y-3 text-sm">
                <li className="flex items-center gap-2"><Check /> Up to 50 documents</li>
                <li className="flex items-center gap-2"><Check /> OCR + AI categorisation</li>
                <li className="flex items-center gap-2"><Check /> Semantic search</li>
                <li className="flex items-center gap-2"><Check /> AI Q&A (10/day)</li>
              </ul>
              <Button variant="outline" className="w-full mt-8 h-10 transition-all duration-200" asChild>
                <Link to="/register">Get started free</Link>
              </Button>
            </div>

            {/* Pro tier */}
            <div className="rounded-2xl border-2 border-primary/30 bg-card p-8 relative hover-lift transition-all duration-200 shadow-lg shadow-primary/[0.05]">
              <span className="absolute -top-3 left-6 px-3 py-0.5 text-xs font-medium gradient-bg text-white rounded-full shadow-sm">Popular</span>
              <h3 className="font-semibold text-lg">Pro</h3>
              <p className="text-muted-foreground text-sm mt-1">For power users</p>
              <p className="mt-5"><span className="text-4xl font-bold">€9</span><span className="text-muted-foreground text-sm">/month</span></p>
              <ul className="mt-6 space-y-3 text-sm">
                <li className="flex items-center gap-2"><Check /> Unlimited documents</li>
                <li className="flex items-center gap-2"><Check /> Everything in Free</li>
                <li className="flex items-center gap-2"><Check /> Unlimited AI Q&A</li>
                <li className="flex items-center gap-2"><Check /> Priority OCR processing</li>
                <li className="flex items-center gap-2"><Check /> Warranty expiry alerts</li>
              </ul>
              <Button className="w-full mt-8 h-10 gradient-bg border-0 text-white shadow-md shadow-primary/20 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5" asChild>
                <Link to="/register">Start 14-day trial</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center gap-0.5 mb-5">
            {[...Array(5)].map((_, i) => <Star key={i} size={15} className="fill-yellow-400 text-yellow-400" />)}
          </div>
          <blockquote className="text-xl font-medium leading-relaxed max-w-2xl mx-auto">
            "I scanned 40+ appliance manuals in one weekend. Now when something breaks, I just ask the app instead of digging through drawers."
          </blockquote>
          <p className="mt-5 text-sm text-muted-foreground">— Early access user</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto rounded-3xl gradient-bg p-16 sm:p-20 relative overflow-hidden shadow-2xl shadow-primary/20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.12),transparent)]" />
          <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-white/[0.04] rounded-full blur-2xl" />
          <div className="relative text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">Ready to make your<br />documents intelligent?</h2>
            <p className="mt-4 text-white/60 text-lg">Start scanning in 30 seconds. Free forever.</p>
            <Button size="lg" className="mt-9 bg-white text-primary hover:bg-white/90 h-12 px-8 text-[15px] shadow-xl transition-all duration-200 hover:-translate-y-0.5" asChild>
              <Link to="/register">Get started free <ArrowRight size={16} className="ml-1.5" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scanLine {
          0%, 100% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          50% { transform: translateY(320px); }
        }
      `}</style>
    </div>
  )
}
