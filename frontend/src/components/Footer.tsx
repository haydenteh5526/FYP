import { Layers, ExternalLink } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/20 py-16 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-10">
        {/* Brand */}
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <Layers size={18} className="text-primary" />
            <span className="font-semibold gradient-text">DocVault</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            Digitise, search, and understand your physical documents with AI. Built for the paperless future.
          </p>
          <div className="flex gap-3 mt-5">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors duration-200"><ExternalLink size={16} /></a>
          </div>
        </div>

        {/* Links */}
        <FooterCol title="Product" links={['Features', 'Pricing', 'Changelog', 'Integrations']} />
        <FooterCol title="Resources" links={['Documentation', 'API Reference', 'Status', 'Support']} />
        <FooterCol title="Company" links={['About', 'Blog', 'Careers', 'Privacy']} />
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground/60">© 2027 DocVault. All rights reserved.</p>
        <p className="text-xs text-muted-foreground/60">Built with ❤️ for the paperless generation.</p>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="text-sm font-medium mb-3">{title}</h4>
      <ul className="space-y-2">
        {links.map(link => (
          <li key={link}>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">{link}</a>
          </li>
        ))}
      </ul>
    </div>
  )
}
