import { Camera, Search, MessageSquare, Shield, Cloud, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Landing({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">DocVault</h1>
          <Button variant="outline" size="sm" onClick={onGetStarted}>Sign in</Button>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium mb-6">
          ✨ AI-Powered Document Intelligence
        </div>
        <h2 className="text-5xl font-bold tracking-tight leading-tight max-w-3xl mx-auto">
          Snap it. Store it.<br />Ask it anything.
        </h2>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Digitise your physical documents — manuals, warranties, guides — and query them with AI. 
          Never lose a manual again, and never flip through 60 pages to find one answer.
        </p>
        <div className="mt-10 flex gap-4 justify-center">
          <Button size="lg" onClick={onGetStarted}>Get started free</Button>
          <Button size="lg" variant="outline" onClick={onGetStarted}>See how it works</Button>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h3 className="text-2xl font-bold text-center mb-12">Everything you need to go paperless</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Feature icon={<Camera />} title="Snap & Digitise" description="Photograph any document. AI extracts the text, detects the brand, and organises it for you." />
            <Feature icon={<Search />} title="Search by Meaning" description="Find information across all your documents with semantic search — not just keywords." />
            <Feature icon={<MessageSquare />} title="Ask AI Questions" description="'What temperature for delicates?' Get instant answers grounded in your actual documents." />
            <Feature icon={<Shield />} title="Private & Secure" description="Your documents are encrypted and isolated. No one else can access your data." />
            <Feature icon={<Cloud />} title="Access Anywhere" description="Cloud-synced across all your devices. Web, mobile, or tablet — always available." />
            <Feature icon={<Zap />} title="Instant Processing" description="Upload takes seconds. OCR, categorisation, and indexing happen automatically." />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h3 className="text-3xl font-bold">Ready to ditch the paper?</h3>
          <p className="mt-3 text-muted-foreground">Start digitising your documents in seconds.</p>
          <Button size="lg" className="mt-8" onClick={onGetStarted}>Create free account</Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-muted-foreground">
          DocVault — AI Cloud Document Vault © 2027
        </div>
      </footer>
    </div>
  )
}

function Feature({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
        {icon}
      </div>
      <h4 className="font-semibold mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}
