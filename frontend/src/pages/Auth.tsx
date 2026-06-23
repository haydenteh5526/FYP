import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-purple-200/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative animate-scale-in">
        {/* Back to home */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to home
        </Link>

        <Card className="shadow-xl border-border/50">
          <CardHeader className="text-center space-y-4 pb-2">
            <div className="mx-auto w-12 h-12 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-primary/25">
              <span className="text-white text-lg font-bold">D</span>
            </div>
            <div>
              <CardTitle className="text-2xl">
                {isLogin ? 'Welcome back' : 'Create your account'}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {isLogin ? 'Sign in to access your documents' : 'Start digitising in seconds'}
              </p>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <Input
                  placeholder="Display name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11"
                />
              )}
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-11"
              />
              {error && (
                <p className="text-sm text-destructive animate-fade-in">{error}</p>
              )}
              <Button type="submit" className="w-full h-11 gradient-bg border-0 text-white hover:opacity-90 transition-opacity" disabled={loading}>
                {loading ? 'Loading...' : isLogin ? 'Sign in' : 'Create account'}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-6">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
              <Link
                to={isLogin ? '/register' : '/login'}
                className="text-primary font-medium hover:underline"
                onClick={() => { setIsLogin(!isLogin); setError('') }}
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
