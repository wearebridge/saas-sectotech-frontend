"use client"

import React from 'react'
import { PackagesManagement } from '@/components/packages-management'
import { useKeycloak } from '@/lib/keycloak'
import { useRouter } from 'next/navigation'

export default function PackagesPage() {
  const { keycloak, authenticated } = useKeycloak()
  const router = useRouter()
  const isAdmin = keycloak?.hasRealmRole('SYSTEM_ADMIN')

  // Protect the route
  React.useEffect(() => {
    if (authenticated && !isAdmin) {
      router.push('/')
    }
  }, [authenticated, isAdmin, router])

  if (!isAdmin) {
    return null // or a loading spinner/access denied message
  }

  return (
    <div className="container max-w-5xl mx-auto py-10 space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Pacotes</h1>
        <p className="text-muted-foreground">
            Crie, edite ou remova pacotes de créditos disponíveis para compra.
        </p>
      </div>

      <PackagesManagement />
    </div>
  )
}
