import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Layers, Loader2, Code2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth'
import { loginUser, registerUser } from '@/lib/api'

export default function AuthPage({ mode = 'login' }: { mode?: 'login' | 'register' }) {
  const [isLogin, setIsLogin] = useState(mode === 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = isLogin
        ? await loginUser(email, password)
        : await registerUser(email, password, name || undefined)
      login(data.access_token)
      navigate('/app')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left pane — dark brand pitch */}
      <div className="hidden lg:flex lg:w-1/2 gradient-bg relative overflow-hidden flex-col justify-between p-12">
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/[0.04] rounded-full blur-3xl" />

        <div className="relative">
          <Link to="/" className="flex items-center gap-2">
            <Layers size={20} className="text-white/80" />
            <span className="text-white/90 font-semibold">DocVault</span>
          </Link>
        </div>

        <div className="relative">
          <blockquote className="text-white/90 text-2xl font-medium leading-relaxed max-w-md">
            {isLogin
              ? '"I never thought I\u2019d enjoy managing documents. DocVault made it feel effortless."'
              : '"Scanned all my manuals in one afternoon. Now I just ask the app when something breaks."'
            }
          </blockquote>
          <p className="mt-5 text-white/50 text-sm">— {isLogin ? 'Sarah K., Product Designer' : 'Mark T., Homeowner'}</p>
        </div>

        <div className="relative">
          <p className="text-white/30 text-xs">© 2027 DocVault. All rights reserved.</p>
        </div>
      </div>

      {/* Right pane — form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 relative">
        {/* Back link */}
        <Link to="/" className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
          <ArrowLeft size={15} /> Home
        </Link>

        <div className="w-full max-w-sm mx-auto animate-fade-in">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              {isLogin ? 'Sign in to access your document vault.' : 'Start digitising your documents for free.'}
            </p>
          </div>

          {/* Social login */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button variant="outline" className="h-10 text-sm transition-all duration-200 hover:bg-accent/50" disabled>
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </Button>
            <Button variant="outline" className="h-10 text-sm transition-all duration-200 hover:bg-accent/50" disabled>
              <Code2 size={16} className="mr-2" /> GitHub
            </Button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/50" /></div>
            <div className="relative flex justify-center"><span className="bg-background px-3 text-xs text-muted-foreground">or continue with email</span></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-sm font-medium mb-1.5 block">Full name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="h-10" />
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="h-10" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="h-10" />
            </div>

            {error && <p className="text-sm text-destructive animate-fade-in">{error}</p>}

            <Button type="submit" className="w-full h-10 gradient-bg border-0 text-white shadow-md shadow-primary/20 transition-all duration-200 hover:shadow-lg disabled:opacity-70" disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : isLogin ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          {/* Toggle */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <Link
              to={isLogin ? '/register' : '/login'}
              className="text-primary font-medium hover:underline transition-colors duration-200"
              onClick={() => { setIsLogin(!isLogin); setError('') }}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
