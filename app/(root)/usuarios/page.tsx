"use client"

import React from 'react'
import { UsersTable } from '@/components/users-table'
import { ClientCredentialsSection } from '@/components/client-credentials-section'
import { Separator } from '@/components/ui/separator'

function Page() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Gestão de Usuários</h1>
        <p className="text-muted-foreground">
          Gerencie os usuários da empresa e as credenciais de acesso à API.
        </p>
      </div>
      
      <ClientCredentialsSection />
      
      <Separator />
      
      <div>
        <h2 className="text-lg font-medium mb-4">Usuários da Empresa</h2>
        <UsersTable />
      </div>
    </div>
  )
}

export default Page