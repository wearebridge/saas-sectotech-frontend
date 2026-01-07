"use client"

import Keycloak from 'keycloak-js'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { usePathname } from 'next/navigation'

interface KeycloakContextType {
  keycloak: Keycloak | null
  authenticated: boolean
  loading: boolean
  token: string | undefined
  login: () => void
  logout: () => void
}

const KeycloakContext = createContext<KeycloakContextType | undefined>(undefined)

interface KeycloakProviderProps {
  children: ReactNode
}

export function KeycloakProvider({ children }: KeycloakProviderProps) {
  const pathname = usePathname()
  const [keycloak, setKeycloak] = useState<Keycloak | null>(null)
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | undefined>()

  useEffect(() => {
    const kc = new Keycloak({
      url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || '',
      realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || '',
      clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || '',
    })

    kc.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html'
    }).then((auth) => {
      setKeycloak(kc)
      setAuthenticated(auth)
      setToken(kc.token)
      setLoading(false)

      if (auth) {
        // Auto refresh token
        setInterval(() => {
          kc.updateToken(30).then((refreshed) => {
            if (refreshed) {
              setToken(kc.token)
            }
          }).catch(() => {
            console.log('Failed to refresh token')
          })
        }, 30000)
      }
    }).catch(() => {
      setLoading(false)
      console.log('Authenticated: false')
    })
  }, [])
useEffect(() => {
    if (!loading && !authenticated && pathname !== '/') {
      keycloak?.login()
    }
  }, [loading, authenticated, pathname, keycloak])

  
  const login = () => {
    keycloak?.login()
  }

  const logout = () => {
    keycloak?.logout()
  }

  if (loading || (!authenticated && pathname !== '/')) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <KeycloakContext.Provider value={{
      keycloak,
      authenticated,
      loading,
      token,
      login,
      logout
    }}>
      {children}
    </KeycloakContext.Provider>
  )
}

export const useKeycloak = () => {
  const context = useContext(KeycloakContext)
  if (context === undefined) {
    throw new Error('useKeycloak must be used within a KeycloakProvider')
  }
  return context
}