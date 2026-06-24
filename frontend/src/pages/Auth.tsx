import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Layers, Loader2, Code2, Mail, CheckCircle, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordStrength } from '@/components/PasswordStrength'
import { useAuth } from '@/lib/auth'
import { loginUser, registerUser, verify2FA } from '@/lib/api'

export default function AuthPage({ mode = 'login' }: { mode?: 'login' | 'register' }) {
  const isRegister = mode === 'register'
  const [step, setStep] = useState<'email' | 'credentials' | 'verify-sent' | '2fa'>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  // Reset state when switching between login/register
  useEffect(() => {
    setStep('email')
    setError('')
    setPassword('')
    setName('')
  }, [mode])

  async function handleEmailContinue(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setError('')
    setStep('credentials')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isRegister) {
        await registerUser(email, password, name || undefined)
        setStep('verify-sent')
      } else {
        const data = await loginUser(email, password)
        if (data.requires_2fa) {
          setStep('2fa')
        } else if (data.access_token) {
          login(data.access_token)
          navigate('/app')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left pane */}
      <div className="hidden lg:flex lg:w-1/2 gradient-bg relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/[0.05] rounded-full blur-[120px] pointer-events-none" />

        <div className="relative">
          <Link to="/" className="flex items-center gap-2">
            <Layers size={20} className="text-white/70" />
            <span className="text-white/80 font-semibold">DocVault</span>
          </Link>
        </div>

        <div className="relative">
          <blockquote className="text-white/80 text-xl font-medium leading-relaxed max-w-md">
            {isRegister
              ? '"Scanned all my manuals in one afternoon. Now I just ask the app when something breaks."'
              : '"The AI found the exact page I needed in 2 seconds. No more flipping through 60 pages."'
            }
          </blockquote>
          <p className="mt-5 text-white/40 text-sm">{isRegister ? '— Mark T., Homeowner' : '— Sarah K., Product Designer'}</p>
        </div>

        <p className="relative text-white/20 text-xs">© 2027 DocVault. All rights reserved.</p>
      </div>

      {/* Right pane */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 relative bg-background">
        <Link to="/" className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
          <ArrowLeft size={15} /> Home
        </Link>
        <Link to={isRegister ? '/login' : '/register'} className="absolute top-6 right-6 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
          {isRegister ? 'Sign in' : 'Create account'}
        </Link>

        <div className="w-full max-w-sm mx-auto animate-fade-in">

          {/* Verification sent screen */}
          {step === 'verify-sent' ? (
            <div className="text-center animate-scale-in">
              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="h-7 w-7 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
                We sent a verification link to <span className="font-medium text-foreground">{email}</span>. Click the link to activate your account.
              </p>
              <div className="mt-8 space-y-3">
                <Button variant="outline" className="w-full h-10" asChild>
                  <Link to="/login">Go to sign in</Link>
                </Button>
                <p className="text-xs text-muted-foreground">
                  Didn't receive it? Check your spam folder.
                </p>
              </div>
            </div>
          ) : step === '2fa' ? (
            <div className="text-center animate-scale-in">
              <div className="w-14 h-14 rounded-2xl bg-primary/[0.07] flex items-center justify-center mx-auto mb-5">
                <ShieldCheck className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Two-factor authentication</h1>
              <p className="text-sm text-muted-foreground mt-2">Enter the 6-digit code from your authenticator app.</p>
              <form onSubmit={async (e) => {
                e.preventDefault()
                setError('')
                setLoading(true)
                try {
                  const data = await verify2FA(email, password, totpCode)
                  login(data.access_token)
                  navigate('/app')
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Invalid code')
                } finally { setLoading(false) }
              }} className="mt-6 space-y-4">
                <Input value={totpCode} onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" className="h-12 text-center text-2xl tracking-[0.5em] font-mono" maxLength={6} autoFocus />
                {error && <p className="text-sm text-destructive animate-fade-in">{error}</p>}
                <Button type="submit" className="w-full h-11 gradient-bg border-0 text-white" disabled={loading || totpCode.length !== 6}>
                  {loading ? <Loader2 size={16} className="animate-spin" /> : 'Verify'}
                </Button>
              </form>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight">
                  {isRegister ? 'Create an account' : 'Welcome back'}
                </h1>
                <p className="text-sm text-muted-foreground mt-1.5">
                  {step === 'email'
                    ? 'Enter your email to get started'
                    : isRegister ? 'Set up your password' : 'Enter your password to sign in'
                  }
                </p>
              </div>

              {step === 'email' ? (
                <form onSubmit={handleEmailContinue} className="space-y-4">
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required autoFocus className="h-11" />
                  <Button type="submit" className="w-full h-11 gradient-bg border-0 text-white shadow-md shadow-primary/20 transition-all duration-200">
                    <Mail size={15} className="mr-2" /> Continue with Email
                  </Button>
                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/50" /></div>
                    <div className="relative flex justify-center"><span className="bg-background px-3 text-xs text-muted-foreground">or</span></div>
                  </div>
                  <Button variant="outline" className="w-full h-11 transition-all duration-200 hover:bg-accent/50" type="button" disabled>
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Continue with Google
                  </Button>
                  <Button variant="outline" className="w-full h-11 transition-all duration-200 hover:bg-accent/50" type="button" disabled>
                    <Code2 size={16} className="mr-2" /> Continue with GitHub
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border/40">
                    <Mail size={14} className="text-muted-foreground" />
                    <span className="text-sm">{email}</span>
                    <button type="button" onClick={() => setStep('email')} className="ml-auto text-xs text-primary hover:underline">Change</button>
                  </div>

                  {isRegister && (
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="h-11" />
                  )}

                  <div>
                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required minLength={6} autoFocus className="h-11" />
                    {isRegister && <div className="mt-2"><PasswordStrength password={password} /></div>}
                  </div>

                  {error && <p className="text-sm text-destructive animate-fade-in">{error}</p>}

                  <Button type="submit" className="w-full h-11 gradient-bg border-0 text-white shadow-md shadow-primary/20 transition-all duration-200 disabled:opacity-70" disabled={loading}>
                    {loading ? <Loader2 size={16} className="animate-spin" /> : isRegister ? 'Create account' : 'Sign in'}
                  </Button>

                  {!isRegister && (
                    <p className="text-center text-xs text-muted-foreground">
                      <Link to="/register" className="text-primary hover:underline">Forgot password?</Link>
                    </p>
                  )}
                </form>
              )}

              <p className="text-center text-[11px] text-muted-foreground/60 mt-8">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
