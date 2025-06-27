import { deleteCookie, getCookie, hasCookie, setCookie } from 'cookies-next'
import { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ChildrenType } from '../types/component-props'
import { UsersType } from '@/types/auth'

export type AuthContextType = {
  user: UsersType | undefined
  isAuthenticated: boolean
  saveSession: (session: UsersType) => void
  removeSession: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

const authSessionKey = '_FLACTO_AUTH_KEY_'

export function AuthProvider({ children }: ChildrenType) {
  const navigate = useNavigate()

  const getSession = (): AuthContextType['user'] => {
    const fetchedCookie = getCookie(authSessionKey)?.toString()
    if (!fetchedCookie) return
    else return JSON.parse(fetchedCookie)
  }

  const [user, setUser] = useState<UsersType | undefined>(getSession())

  const saveSession = (user: UsersType) => {
    setCookie(authSessionKey, JSON.stringify(user))
    setUser(user)
  }

  const removeSession = () => {
    deleteCookie(authSessionKey)
    setUser(undefined)
    navigate('/auth/login')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: hasCookie(authSessionKey),
        saveSession,
        removeSession,
      }}>
      {children}
    </AuthContext.Provider>
  )
}
