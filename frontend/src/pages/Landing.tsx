import { ArrowRight, Camera, Search, MessageSquare, Shield, Cloud, FileText, Star, Zap, Check, ChevronDown, ArrowUp, Lock, ShieldCheck, Users, EyeOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
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

const features = [
  { icon: <Camera size={20} />, title: 'Smart OCR', desc: 'Deskew, denoise, enhance — handles real-world photos. Multi-page PDF support included.', gradient: 'icon-gradient-blue' },
  { icon: <Search size={20} />, title: 'Semantic Search', desc: 'Find "drainage issue" even when the manual says "blocked filter". AI understands context.', gradient: 'icon-gradient-purple' },
  { icon: <MessageSquare size={20} />, title: 'AI Q&A', desc: 'Ask natural questions, get sourced answers. Grounded in your documents — no hallucinations.', gradient: 'icon-gradient-blue', featured: true },
  { icon: <Shield size={20} />, title: 'End-to-end Security', desc: 'JWT auth, bcrypt, per-user isolation, encrypted storage. Your data never leaves your account.', gradient: 'icon-gradient-green' },
  { icon: <Cloud size={20} />, title: 'Cloud Native', desc: 'Sync everywhere. Web, mobile, tablet. Built on AWS with Terraform IaC for 99.9% uptime.', gradient: 'icon-gradient-amber' },
  { icon: <Zap size={20} />, title: 'Instant Processing', desc: 'Upload → OCR → categorise → embed → searchable in under 30 seconds. Zero manual work.', gradient: 'icon-gradient-purple' },
]

const securityFeatures = [
  { icon: <Lock size={18} />, title: 'Encrypted at rest', desc: 'AES-256 encryption on all stored files via AWS S3.' },
  { icon: <ShieldCheck size={18} />, title: 'Encrypted in transit', desc: 'TLS 1.3 for every API call and data transfer.' },
  { icon: <Users size={18} />, title: 'User isolation', desc: 'Row-level security — no user can ever access another\u2019s data.' },
  { icon: <EyeOff size={18} />, title: 'No data selling', desc: 'Your documents are never used for training or shared.' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero — split layout with product mockup */}
      <section className="pt-36 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-b from-primary/[0.07] via-purple-400/[0.03] to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — copy */}
            <div className="text-center lg:text-left">
              <div className="opacity-0" style={{ animation: 'fadeSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s forwards' }}>
                <span className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/80 backdrop-blur px-4 py-1.5 text-xs font-medium text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full gradient-bg animate-pulse" /> Now with AI OCR 2.0
                </span>
              </div>
              <h1 className="mt-7 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] opacity-0" style={{ animation: 'fadeSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.2s forwards' }}>
                Documents that<br /><span className="gradient-text">think for you.</span>
              </h1>
              <p className="mt-5 text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed opacity-0" style={{ animation: 'fadeSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.35s forwards' }}>
                Snap any physical document. AI extracts, organises, and lets you query it — like having a photographic memory for every manual you own.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start opacity-0" style={{ animation: 'fadeSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.5s forwards' }}>
                <Button size="lg" className="gradient-bg border-0 text-white h-12 px-8 text-[15px] shadow-xl shadow-primary/20 transition-all duration-200 hover:shadow-2xl hover:-translate-y-0.5" asChild>
                  <Link to="/register">Start free <ArrowRight size={16} className="ml-1.5" /></Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8 text-[15px] border-border/50 transition-all duration-200 hover:bg-accent/50" asChild>
                  <Link to="/login">Sign in</Link>
                </Button>
              </div>
              <p className="mt-4 text-xs text-muted-foreground/50 text-center lg:text-left opacity-0" style={{ animation: 'fadeSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.65s forwards' }}>
                No credit card • Free forever • Works on all devices
              </p>
            </div>

            {/* Right — animated app mockup */}
            <div className="relative opacity-0 hidden lg:block" style={{ animation: 'fadeSlideUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.4s forwards' }}>
              <div className="absolute -inset-4 gradient-bg opacity-[0.06] rounded-3xl blur-2xl" />
              <AppMockup />
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-10 px-6 border-y border-border/30 bg-muted/20">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <AnimatedStat value={10000} suffix="+" label="Documents scanned" delay={0} />
          <AnimatedStat value={99.2} suffix="%" label="OCR accuracy" delay={80} decimals={1} />
          <AnimatedStat prefix="< " value={2} suffix="s" label="Search speed" delay={160} />
          <AnimatedStat value={4.9} suffix="/5" label="User rating" delay={240} decimals={1} />
        </div>
      </section>

      {/* Scanner showcase — enhanced mockup */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto opacity-0" style={{ animation: 'fadeSlideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s forwards' }}>
          <div className="relative rounded-2xl border border-border/40 bg-card p-8 shadow-2xl shadow-black/[0.04] overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 gradient-bg animate-[scanLine_3s_ease-in-out_infinite]" />
            <div className="grid md:grid-cols-2 gap-6 items-center">
              {/* Physical doc — realistic mockup instead of grey bars */}
              <div className="rounded-xl bg-muted/50 border border-border/30 p-5 aspect-[4/5] flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-border/30">
                    <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center">
                      <span className="text-[8px] font-bold text-blue-600">S</span>
                    </div>
                    <span className="text-[11px] font-semibold text-foreground/70">Samsung User Manual</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
                    <span className="font-semibold text-foreground/50">Chapter 4: Washing Programmes</span>
                  </p>
                  <p className="text-[9px] text-muted-foreground/50 leading-relaxed">
                    Select the appropriate programme for your fabric type. Delicate fabrics should be washed at 30°C with reduced spin speed...
                  </p>
                  <p className="text-[9px] text-muted-foreground/50 leading-relaxed">
                    For heavily soiled items, use the Intensive programme at 60°C. Pre-soak is recommended for stubborn stains.
                  </p>
                  <div className="flex gap-2 mt-1">
                    <div className="h-8 w-8 rounded bg-muted-foreground/[0.06] flex items-center justify-center text-[8px] text-muted-foreground/40">📷</div>
                    <div className="h-8 w-8 rounded bg-muted-foreground/[0.06] flex items-center justify-center text-[8px] text-muted-foreground/40">📷</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                  <span className="text-[9px] text-muted-foreground/40">Page 42 of 98</span>
                  <span className="ml-auto text-[8px] text-muted-foreground/30">WW90T554DAW</span>
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

      {/* Logo cloud — replaced text with styled brand marks */}
      <section className="py-12 px-6 border-y border-border/30">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs text-muted-foreground/60 uppercase tracking-widest mb-6">Trusted by users from</p>
          <div className="flex flex-wrap justify-center items-center gap-10 opacity-30">
            {[
              { name: 'Google', letter: 'G', colors: ['#4285F4','#EA4335','#FBBC05','#34A853'] },
              { name: 'Microsoft', letter: 'M', color: '#00A4EF' },
              { name: 'Apple', letter: '', color: '#555' },
              { name: 'Amazon', letter: 'a', color: '#FF9900' },
              { name: 'Meta', letter: 'M', color: '#0668E1' },
            ].map(brand => (
              <span key={brand.name} className="text-xl font-bold text-foreground/70 select-none tracking-tight" style={{ fontFamily: '-apple-system, system-ui, sans-serif' }}>
                {brand.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Feature bento grid — enhanced with gradient icons + hover effects */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight">Built for the way you think</h2>
            <p className="mt-2 text-muted-foreground">Every feature designed to feel invisible until you need it.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`group rounded-2xl border border-border/40 bg-card p-6 hover-lift animate-slide-up transition-all duration-300 hover:border-primary/20 ${f.featured ? 'md:ring-1 md:ring-primary/10 md:shadow-lg md:shadow-primary/[0.03]' : ''}`}
                style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
              >
                <div className={`w-10 h-10 rounded-xl ${f.gradient} flex items-center justify-center text-primary mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                  {f.icon}
                </div>
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

      {/* Security — with distinct icons per card */}
      <section id="security" className="py-24 px-6 border-t border-border/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight">Security you can trust</h2>
            <p className="mt-2 text-muted-foreground">Your documents are private by default. Always.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {securityFeatures.map((item, i) => (
              <div key={item.title} className="group rounded-2xl border border-border/40 bg-card p-6 hover-lift animate-slide-up transition-all duration-300 hover:border-green-500/20" style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}>
                <div className="w-10 h-10 rounded-xl icon-gradient-green flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                  <span className="text-green-600">{item.icon}</span>
                </div>
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

      {/* Testimonials marquee — fixed overflow + star rating */}
      <section className="py-20 px-6 overflow-hidden border-t border-border/30">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Loved by early users</h2>
          <p className="mt-2 text-muted-foreground">See what people are saying.</p>
        </div>
        <div className="relative max-w-[100vw]">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          <div className="flex gap-5 animate-[marquee_40s_linear_infinite] hover:[animation-play-state:paused] w-max">
            {[...testimonials, ...testimonials].map((t, i) => (
              <div key={i} className="flex-shrink-0 w-[300px] rounded-2xl border border-border/40 bg-card p-5 transition-all duration-200 hover:shadow-md hover:border-primary/10">
                <div className="flex gap-0.5 mb-3">{[...Array(5)].map((_, j) => <Star key={j} size={11} className="fill-yellow-400 text-yellow-400" />)}</div>
                <p className="text-[13px] leading-relaxed text-foreground/90">"{t.quote}"</p>
                <div className="mt-4 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full gradient-bg flex items-center justify-center text-white text-[10px] font-bold">{t.name[0]}</div>
                  <div><p className="text-[12px] font-medium">{t.name}</p><p className="text-[10px] text-muted-foreground">{t.role}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ — with smooth animations */}
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

      <BackToTop />
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
  const contentRef = useRef<HTMLDivElement>(null)

  return (
    <div className="rounded-xl border border-border/40 bg-card overflow-hidden transition-all duration-200">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium hover:bg-accent/30 transition-colors duration-200">
        {question}
        <ChevronDown size={16} className={`text-muted-foreground transition-transform duration-300 ease-out ${open ? 'rotate-180' : ''}`} />
      </button>
      <div
        className="transition-all duration-300 ease-out overflow-hidden"
        style={{
          maxHeight: open ? `${contentRef.current?.scrollHeight || 200}px` : '0px',
          opacity: open ? 1 : 0,
        }}
      >
        <div ref={contentRef}>
          <p className="px-5 pb-4 text-[13px] text-muted-foreground leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  )
}

function AnimatedStat({ value, suffix = '', prefix = '', label, delay = 0, decimals = 0 }: { value: number; suffix?: string; prefix?: string; label: string; delay?: number; decimals?: number }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const animated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !animated.current) {
        animated.current = true
        const duration = 1500
        const start = performance.now()
        function tick(now: number) {
          const progress = Math.min((now - start) / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setDisplay(parseFloat((eased * value).toFixed(decimals)))
          if (progress < 1) requestAnimationFrame(tick)
        }
        setTimeout(() => requestAnimationFrame(tick), delay)
      }
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [value, delay, decimals])

  return (
    <div ref={ref} className="animate-slide-up" style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}>
      <p className="text-2xl font-bold gradient-text">{prefix}{decimals ? display.toFixed(decimals) : display.toLocaleString()}{suffix}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  )
}

function BackToTop() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    function onScroll() { setShow(window.scrollY > 600) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed bottom-8 right-8 z-50 w-10 h-10 rounded-full gradient-bg text-white shadow-lg shadow-primary/25 flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-75 pointer-events-none'}`}
      aria-label="Back to top"
    >
      <ArrowUp size={16} />
    </button>
  )
}

function AppMockup() {
  return (
    <div className="relative rounded-2xl border border-border/50 bg-card shadow-2xl shadow-black/10 overflow-hidden">
      {/* Fake browser chrome */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border/30 bg-muted/40">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
        <div className="flex-1 mx-4 h-5 rounded-full bg-muted/80 flex items-center px-3">
          <span className="text-[9px] text-muted-foreground/60">docvault.app/dashboard</span>
        </div>
      </div>

      {/* App UI */}
      <div className="flex h-72">
        {/* Mini sidebar */}
        <div className="w-14 border-r border-border/30 bg-muted/20 flex flex-col items-center py-4 gap-3">
          <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M7 18h10V6H7v12zM5 4h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1zm4 4h6v2h-6V8zm0 4h6v2h-6v-2z"/></svg>
          </div>
          {[['oklch(0.55 0.22 264)', true], ['oklch(0.6 0.15 155)', false], ['oklch(0.6 0.2 300)', false]].map(([color, active], i) => (
            <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? 'gradient-bg' : 'bg-muted/60'}`}>
              <div className="w-3.5 h-3.5 rounded-sm" style={{ background: active ? 'white' : String(color), opacity: active ? 1 : 0.4 }} />
            </div>
          ))}
        </div>

        {/* Main area */}
        <div className="flex-1 p-4 flex flex-col gap-3 overflow-hidden">
          {/* Mini topbar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-6 rounded-full bg-muted/60 flex items-center px-3 gap-2">
              <div className="w-3 h-3 rounded-full bg-muted-foreground/20" />
              <div className="w-16 h-2 rounded bg-muted-foreground/15" />
              <div className="ml-auto w-8 h-3 rounded bg-muted-foreground/20 text-[7px] text-muted-foreground/40 flex items-center justify-center font-mono">⌘K</div>
            </div>
            <div className="w-14 h-6 rounded-full gradient-bg flex items-center justify-center">
              <span className="text-[8px] text-white font-semibold">Upload</span>
            </div>
          </div>

          {/* Doc cards */}
          <div className="grid grid-cols-2 gap-2 flex-1">
            {[
              { color: 'bg-blue-400/20', title: 'Samsung Manual', type: 'Appliance', w: 'w-14' },
              { color: 'bg-purple-400/20', title: 'Lease Agreement', type: 'Legal', w: 'w-16' },
              { color: 'bg-green-400/20', title: 'Warranty Card', type: 'Warranty', w: 'w-12' },
              { color: 'bg-amber-400/20', title: 'IKEA Instructions', type: 'Manual', w: 'w-14' },
            ].map((d, i) => (
              <div key={i} className="rounded-xl border border-border/30 bg-background/80 p-3 flex flex-col gap-2" style={{ animationDelay: `${i * 100}ms` }}>
                <div className={`w-8 h-8 rounded-lg ${d.color} flex items-center justify-center`}>
                  <div className="w-3.5 h-4 rounded-sm bg-current opacity-30" />
                </div>
                <div>
                  <div className={`h-2 ${d.w} rounded bg-foreground/20 mb-1`} />
                  <div className="h-1.5 w-10 rounded bg-muted-foreground/20" />
                </div>
                <div className="mt-auto">
                  <span className="text-[8px] text-primary/70 font-medium bg-primary/[0.08] px-1.5 py-0.5 rounded-full">{d.type}</span>
                </div>
              </div>
            ))}
          </div>

          {/* AI chat preview */}
          <div className="rounded-xl border border-border/30 bg-muted/20 p-3 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full gradient-bg flex items-center justify-center shrink-0">
              <div className="w-3 h-3 rounded-sm bg-white/70" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="h-1.5 w-full rounded bg-muted-foreground/20" />
              <div className="h-1.5 w-3/4 rounded bg-muted-foreground/15" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
