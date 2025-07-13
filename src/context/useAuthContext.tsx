import { deleteCookie, getCookie, hasCookie, setCookie } from 'cookies-next'
import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ChildrenType } from '../types/component-props'
import { UsersType } from '@/types/auth'
import { sessionManager } from '@/utils/sessionManager'
import { apiClient } from '@/helpers/apiClient'
import Swal from 'sweetalert2'

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
    
    // Refresh session monitoring when new session is saved
    sessionManager.refreshMonitoring()
  }

  const removeSession = () => {
    deleteCookie(authSessionKey)
    setUser(undefined)
    sessionManager.stopMonitoring()
    navigate('/auth/login')
  }

  const handleSessionExpired = () => {
    Swal.fire({
      title: 'Sesión Expirada',
      text: 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.',
      icon: 'warning',
      confirmButtonText: 'Ir al Login',
      allowOutsideClick: false,
      allowEscapeKey: false,
    }).then(() => {
      removeSession()
    })
  }

  const handleSessionExpiringSoon = (timeLeft: number) => {
    const minutes = Math.ceil(timeLeft / (1000 * 60))
    
    Swal.fire({
      title: 'Sesión por Expirar',
      text: `Su sesión expirará en ${minutes} minuto(s). ¿Desea extender la sesión?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Extender Sesión',
      cancelButtonText: 'Cerrar Sesión',
      timer: timeLeft,
      timerProgressBar: true,
    }).then((result) => {
      if (result.isConfirmed) {
        // Here you could implement session refresh logic
        // For now, we just refresh the monitoring
        sessionManager.refreshMonitoring()
        
        Swal.fire({
          title: 'Sesión Extendida',
          text: 'Su sesión ha sido extendida.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        })
      } else if (result.dismiss === Swal.DismissReason.cancel || result.dismiss === Swal.DismissReason.timer) {
        removeSession()
      }
    })
  }

  // Initialize session management on mount
  useEffect(() => {
    if (user && user.token) {
      // Set up API client logout callback
      apiClient.setLogoutCallback(handleSessionExpired)
      
      // Initialize session monitoring
      sessionManager.initialize({
        warningTimeMs: 5 * 60 * 1000, // 5 minutes warning
        onExpired: handleSessionExpired,
        onExpiringSoon: handleSessionExpiringSoon,
      })
    }

    // Cleanup on unmount
    return () => {
      sessionManager.stopMonitoring()
    }
  }, [user])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: hasCookie(authSessionKey) && sessionManager.isSessionValid(),
        saveSession,
        removeSession,
      }}>
      {children}
    </AuthContext.Provider>
  )
}
