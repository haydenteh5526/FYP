import { login, signup } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 p-4">
      <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-2xl shadow-xl border border-border/40">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-primary/25 mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M7 18h10V6H7v12zM5 4h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1zm4 4h6v2h-6V8zm0 4h6v2h-6v-2z" fill="currentColor"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Sign in to DocVault</h2>
          <p className="text-sm text-muted-foreground mt-2">Manage your documents intelligently.</p>
        </div>

        <form className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">Email</label>
              <Input id="email" name="email" type="email" required className="mt-1" placeholder="you@example.com" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground">Password</label>
              <Input id="password" name="password" type="password" required className="mt-1" />
            </div>
          </div>

          <div className="flex gap-3">
            <Button formAction={login} className="flex-1 gradient-bg text-white hover:shadow-lg transition-all border-0">Sign In</Button>
            <Button formAction={signup} variant="outline" className="flex-1">Sign Up</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
