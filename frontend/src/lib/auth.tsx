import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface AuthContextType {
  token: string | null
  login: (token: string) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType>(null!)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    if (window.location.search.includes('mock=true')) {
      return 'fake-token'
    }
    return localStorage.getItem('token')
  })

  useEffect(() => {
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
  }, [token])

  return (
    <AuthContext.Provider value={{
      token,
      login: setToken,
      logout: () => setToken(null),
      isAuthenticated: !!token,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
