import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen flex-col bg-background p-8">
      <header className="flex items-center justify-between pb-8 border-b border-border/40 mb-8">
        <h1 className="text-3xl font-bold">DocVault Dashboard</h1>
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">Logged in as {user.email}</p>
          <form action="/auth/signout" method="post">
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <LogOut size={16} /> Sign out
            </button>
          </form>
        </div>
      </header>
      
      <main className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 p-6 rounded-2xl bg-card border border-border/40 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Recent Documents</h2>
          <div className="text-muted-foreground text-sm">You have no documents yet. Start uploading!</div>
        </div>
        <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between"><span>Total Documents</span><span className="font-medium">0</span></li>
            <li className="flex justify-between"><span>Storage Used</span><span className="font-medium">0 MB</span></li>
          </ul>
        </div>
      </main>
    </div>
  )
}
