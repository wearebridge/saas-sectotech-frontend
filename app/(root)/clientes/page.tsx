'use client'

import { useEffect, useState } from 'react'
import { ClientTable } from '@/components/client-table'
import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import { ClientForm } from '@/components/client-form'
import { toast } from 'sonner'
import { ClientService } from '@/service/client/client-service'
import { ClientRequest, ClientResponse } from '@/types/client'
import { useKeycloak } from '@/lib/keycloak'

export default function ClientsPage() {
  const { token } = useKeycloak()
  const [clients, setClients] = useState<ClientResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')


  const loadClients = async () => {
    if (!token) return
    
    try {
      setLoading(true)
      const data = await ClientService.findAll(token)
      setClients(data)
    } catch (error) {
      console.error('Error loading clients:', error)
      toast.error('Falha ao carregar clientes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      loadClients()
    }
  }, [token])

  const handleCreateClient = async (data: ClientRequest) => {
    if (!token) return
    
    try {
      const newClient = await ClientService.create(data, token)
      setClients(prev => [...prev, newClient])
      setIsDialogOpen(false)
      toast.success('Cliente criado com sucesso')
    } catch (error) {
      console.error('Error creating client:', error)
      toast.error('Falha ao criar cliente')
      throw error
    }
  }

  const handleUpdateClient = async (id: string, data: ClientRequest) => {
    if (!token) return
    
    try {
      const updatedClient = await ClientService.update(id, data, token)
      setClients(prev => prev.map(client => 
        client.id === id ? updatedClient : client
      ))
      toast.success('Cliente atualizado com sucesso')
    } catch (error) {
      console.error('Error updating client:', error)
      toast.error('Falha ao atualizar cliente')
      throw error
    }
  }

  const handleDeleteClient = async (id: string) => {
    if (!token) return
    
    try {
      await ClientService.delete(id, token)
      setClients(prev => prev.filter(client => client.id !== id))
      toast.success('Cliente removido com sucesso')
    } catch (error) {
      console.error('Error deleting client:', error)
      toast.error('Falha ao remover cliente')
      throw error
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie seus clientes
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Cliente</DialogTitle>
            </DialogHeader>
            <ClientForm 
              onSubmit={handleCreateClient}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <ClientTable
        clients={clients}
        loading={loading}
        onUpdate={handleUpdateClient}
        onDelete={handleDeleteClient}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />
    </div>
  )
}