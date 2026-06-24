import { ArrowRight, Camera, Search, MessageSquare, Shield, Cloud, FileText, Star, Zap, Check, ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const testimonials = [
  { name: 'Sarah K.', role: 'Product Designer', quote: 'I scanned 40+ appliance manuals in one weekend. Now I just ask the app when something breaks.' },
  { name: 'Mark T.', role: 'Homeowner', quote: 'My dishwasher showed error E4. I asked DocVault and had the fix in 5 seconds flat.' },
  { name: 'Lisa M.', role: 'Tenant', quote: 'All my lease docs, utility guides, and appliance manuals in one place. Game changer for renters.' },
  { name: 'James R.', role: 'IT Engineer', quote: 'The semantic search is incredible. I searched "network timeout" and it found the relevant router page.' },
  { name: 'Anna P.', role: 'Business Owner', quote: 'Warranty tracking saved me €200. Got notified before expiry and made a claim just in time.' },
  { name: 'David C.', role: 'Student', quote: 'I scan all my course handouts. Asking AI questions before exams is like having a personal tutor.' },
]

const faqs = [
  { q: 'What file formats are supported?', a: 'JPEG, PNG, WebP, and multi-page PDF. We handle photos taken in poor lighting, at angles, and with noise.' },
  { q: 'Is my data secure?', a: 'Yes. All documents are encrypted at rest (AES-256) and in transit (TLS 1.3). Each user has complete data isolation.' },
  { q: 'How does the AI Q&A work?', a: 'We split your documents into chunks, embed them semantically, and use RAG (Retrieval-Augmented Generation) with GPT-4o-mini to answer questions grounded in your actual content.' },
  { q: 'Can I use it offline?', a: 'The web app caches recently viewed documents for offline access. Upload requires an internet connection.' },
  { q: 'Is there a free plan?', a: 'Yes — free forever for up to 50 documents with full OCR, search, and 10 AI questions per day.' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
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
            Snap any physical document. AI extracts, organises, and lets you query it — like having a photographic memory for every manual you own.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center opacity-0" style={{ animation: 'fadeSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.5s forwards' }}>
            <Button size="lg" className="gradient-bg border-0 text-white h-12 px-8 text-[15px] shadow-xl shadow-primary/20 transition-all duration-200 hover:shadow-2xl hover:-translate-y-0.5" asChild>
              <Link to="/register">Start free <ArrowRight size={16} className="ml-1.5" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-[15px] border-border/50 transition-all duration-200 hover:bg-accent/50" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground/50 opacity-0" style={{ animation: 'fadeSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.65s forwards' }}>
            No credit card • Free forever • Works on all devices
          </p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-10 px-6 border-y border-border/30 bg-muted/20">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '10,000+', label: 'Documents scanned' },
            { value: '99.2%', label: 'OCR accuracy' },
            { value: '< 2s', label: 'Search speed' },
            { value: '4.9/5', label: 'User rating' },
          ].map((s, i) => (
            <div key={s.label} className="animate-slide-up" style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}>
              <p className="text-2xl font-bold gradient-text">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Scanner showcase */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto opacity-0" style={{ animation: 'fadeSlideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s forwards' }}>
          <div className="relative rounded-2xl border border-border/40 bg-card p-8 shadow-2xl shadow-black/[0.04] overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 gradient-bg animate-[scanLine_3s_ease-in-out_infinite]" />
            <div className="grid md:grid-cols-2 gap-6 items-center">
              {/* Physical doc */}
              <div className="rounded-xl bg-muted/50 border border-border/30 p-5 aspect-[4/5] flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="h-3 bg-muted-foreground/10 rounded w-3/4" />
                  <div className="h-3 bg-muted-foreground/10 rounded w-full" />
                  <div className="h-3 bg-muted-foreground/10 rounded w-5/6" />
                  <div className="h-3 bg-muted-foreground/10 rounded w-2/3" />
                </div>
                <div className="flex gap-2 mt-4">
                  <div className="h-8 w-8 rounded bg-muted-foreground/10" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2.5 bg-muted-foreground/10 rounded w-1/2" />
                    <div className="h-2.5 bg-muted-foreground/10 rounded w-3/4" />
                  </div>
                </div>
              </div>
              {/* Digital output */}
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
                  <p className="text-muted-foreground">💬 "Wash delicates at 30°C with 800rpm spin"<span className="inline-block w-0.5 h-3.5 bg-primary ml-0.5 animate-pulse" /></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logo cloud */}
      <section className="py-12 px-6 border-y border-border/30">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs text-muted-foreground/60 uppercase tracking-widest mb-6">Trusted by users from</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-40">
            {['Google', 'Microsoft', 'Apple', 'Amazon', 'Meta'].map(name => (
              <span key={name} className="text-lg font-bold text-muted-foreground/80 select-none">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Feature bento grid */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight">Built for the way you think</h2>
            <p className="mt-2 text-muted-foreground">Every feature designed to feel invisible until you need it.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: <Camera size={20} />, title: 'Smart OCR', desc: 'Deskew, denoise, enhance — handles real-world photos. Multi-page PDF support included.' },
              { icon: <Search size={20} />, title: 'Semantic Search', desc: 'Find "drainage issue" even when the manual says "blocked filter". AI understands context.' },
              { icon: <MessageSquare size={20} />, title: 'AI Q&A', desc: 'Ask natural questions, get sourced answers. Grounded in your documents — no hallucinations.' },
              { icon: <Shield size={20} />, title: 'End-to-end Security', desc: 'JWT auth, bcrypt, per-user isolation, encrypted storage. Your data never leaves your account.' },
              { icon: <Cloud size={20} />, title: 'Cloud Native', desc: 'Sync everywhere. Web, mobile, tablet. Built on AWS with Terraform IaC for 99.9% uptime.' },
              { icon: <Zap size={20} />, title: 'Instant Processing', desc: 'Upload → OCR → categorise → embed → searchable in under 30 seconds. Zero manual work.' },
            ].map((f, i) => (
              <div key={f.title} className="rounded-2xl border border-border/40 bg-card p-6 hover-lift animate-slide-up transition-all duration-200" style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}>
                <div className="w-10 h-10 rounded-xl bg-primary/[0.07] flex items-center justify-center text-primary mb-4">{f.icon}</div>
                <h3 className="font-semibold text-[15px] mb-1.5">{f.title}</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deep-dive feature — alternating layout */}
      <section className="py-24 px-6 bg-muted/20 border-t border-border/30">
        <div className="max-w-5xl mx-auto space-y-20">
          <FeatureRow
            title="Ask questions, get real answers"
            desc="Stop flipping through pages. Type your question in plain English and get an instant, sourced answer pulled directly from your stored documents. The AI cites exactly which manual and section it found the answer in."
            visual={
              <div className="rounded-xl border border-border/40 bg-card p-5 space-y-3">
                <div className="bg-primary/[0.05] rounded-lg p-3 text-sm ml-auto w-fit text-right">What temperature for delicates?</div>
                <div className="bg-muted/60 rounded-lg p-3 text-sm max-w-[85%]">
                  Wash delicates at 30°C with a maximum spin speed of 800 RPM.
                  <span className="block text-[10px] text-muted-foreground mt-1.5">🔗 Samsung WW90T Manual, Section 4.2</span>
                </div>
              </div>
            }
          />
          <FeatureRow
            title="Automatic organisation"
            desc="Upload a photo and AI detects the brand, model number, document type, and suggests a title. It auto-creates categories and even extracts warranty expiry dates from receipts. You never have to manually tag anything."
            visual={
              <div className="rounded-xl border border-border/40 bg-card p-5 space-y-3 text-sm">
                <div className="flex items-center gap-3 pb-3 border-b border-border/30">
                  <div className="w-9 h-9 rounded-lg gradient-bg flex items-center justify-center"><FileText size={14} className="text-white" /></div>
                  <div><p className="font-medium">Bosch Serie 6 Dishwasher</p><p className="text-[11px] text-muted-foreground">Auto-categorised • Warranty: Jan 2028</p></div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div className="rounded-md bg-primary/[0.06] px-2 py-1.5 text-center text-primary font-medium">Bosch</div>
                  <div className="rounded-md bg-muted px-2 py-1.5 text-center">Dishwasher</div>
                  <div className="rounded-md bg-muted px-2 py-1.5 text-center">User Manual</div>
                </div>
              </div>
            }
            reverse
          />
        </div>
      </section>

      {/* Security */}
      <section id="security" className="py-24 px-6 border-t border-border/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight">Security you can trust</h2>
            <p className="mt-2 text-muted-foreground">Your documents are private by default. Always.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Encrypted at rest', desc: 'AES-256 encryption on all stored files via AWS S3.' },
              { title: 'Encrypted in transit', desc: 'TLS 1.3 for every API call and data transfer.' },
              { title: 'User isolation', desc: 'Row-level security \u2014 no user can ever access another\u2019s data.' },
              { title: 'No data selling', desc: 'Your documents are never used for training or shared.' },
            ].map((item, i) => (
              <div key={item.title} className="rounded-2xl border border-border/40 bg-card p-6 hover-lift animate-slide-up transition-all duration-200" style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}>
                <div className="w-10 h-10 rounded-xl bg-green-500/[0.08] flex items-center justify-center mb-4"><Shield size={18} className="text-green-600" /></div>
                <h4 className="text-[15px] font-semibold mb-1.5">{item.title}</h4>
                <p className="text-[13px] text-muted-foreground leading-relaxed">{item.desc}</p>
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
            <div className="rounded-2xl border border-border/40 bg-card p-8 hover-lift transition-all duration-200">
              <h3 className="font-semibold text-lg">Free</h3>
              <p className="text-muted-foreground text-sm mt-1">For personal use</p>
              <p className="mt-5"><span className="text-4xl font-bold">€0</span><span className="text-muted-foreground text-sm">/month</span></p>
              <ul className="mt-6 space-y-3 text-sm">
                {['Up to 50 documents', 'OCR + AI categorisation', 'Semantic search', 'AI Q&A (10/day)'].map(f => <li key={f} className="flex items-center gap-2"><Check size={14} className="text-green-600" /> {f}</li>)}
              </ul>
              <Button variant="outline" className="w-full mt-8 h-10 transition-all duration-200" asChild><Link to="/register">Get started free</Link></Button>
            </div>
            <div className="rounded-2xl border-2 border-primary/30 bg-card p-8 relative hover-lift transition-all duration-200 shadow-lg shadow-primary/[0.05]">
              <span className="absolute -top-3 left-6 px-3 py-0.5 text-xs font-medium gradient-bg text-white rounded-full shadow-sm">Popular</span>
              <h3 className="font-semibold text-lg">Pro</h3>
              <p className="text-muted-foreground text-sm mt-1">For power users</p>
              <p className="mt-5"><span className="text-4xl font-bold">€9</span><span className="text-muted-foreground text-sm">/month</span></p>
              <ul className="mt-6 space-y-3 text-sm">
                {['Unlimited documents', 'Everything in Free', 'Unlimited AI Q&A', 'Priority processing', 'Warranty alerts'].map(f => <li key={f} className="flex items-center gap-2"><Check size={14} className="text-green-600" /> {f}</li>)}
              </ul>
              <Button className="w-full mt-8 h-10 gradient-bg border-0 text-white shadow-md shadow-primary/20 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5" asChild><Link to="/register">Start 14-day trial</Link></Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials marquee */}
      <section className="py-20 px-6 overflow-hidden border-t border-border/30">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Loved by early users</h2>
          <p className="mt-2 text-muted-foreground">See what people are saying.</p>
        </div>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          <div className="flex gap-5 animate-[marquee_40s_linear_infinite] hover:[animation-play-state:paused]">
            {[...testimonials, ...testimonials].map((t, i) => (
              <div key={i} className="flex-shrink-0 w-[320px] rounded-2xl border border-border/40 bg-card p-5 transition-all duration-200 hover:shadow-md">
                <div className="flex gap-0.5 mb-3">{[...Array(5)].map((_, j) => <Star key={j} size={11} className="fill-yellow-400 text-yellow-400" />)}</div>
                <p className="text-[13px] leading-relaxed text-foreground/90">\u201C{t.quote}\u201D</p>
                <div className="mt-4 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full gradient-bg flex items-center justify-center text-white text-[10px] font-bold">{t.name[0]}</div>
                  <div><p className="text-[12px] font-medium">{t.name}</p><p className="text-[10px] text-muted-foreground">{t.role}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 bg-muted/20 border-t border-border/30">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight">Frequently asked questions</h2>
            <p className="mt-2 text-muted-foreground">Everything you need to know.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => <FAQItem key={i} question={faq.q} answer={faq.a} />)}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 border-t border-border/30">
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
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scanLine { 0%, 100% { transform: translateY(0); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 50% { transform: translateY(320px); } }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      `}</style>
    </div>
  )
}

function FeatureRow({ title, desc, visual, reverse }: { title: string; desc: string; visual: React.ReactNode; reverse?: boolean }) {
  return (
    <div className={`grid md:grid-cols-2 gap-10 items-center ${reverse ? 'md:[direction:rtl]' : ''}`}>
      <div className={reverse ? 'md:[direction:ltr]' : ''}>
        <h3 className="text-2xl font-bold mb-3">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{desc}</p>
      </div>
      <div className={reverse ? 'md:[direction:ltr]' : ''}>{visual}</div>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl border border-border/40 bg-card overflow-hidden transition-all duration-200">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium hover:bg-accent/30 transition-colors duration-200">
        {question}
        <ChevronDown size={16} className={`text-muted-foreground transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`grid transition-all duration-300 ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <p className="px-5 pb-4 text-[13px] text-muted-foreground leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  )
}
