'use client'

import { useEffect, useState, useCallback } from 'react'
import { ClientTable } from '@/components/client-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Plus, Search, X, Loader2 } from 'lucide-react'
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

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<ClientResponse[] | null>(null)

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

  const handleSearch = useCallback(async () => {
    if (!token || !searchQuery.trim()) {
      clearSearch()
      return
    }

    try {
      setSearching(true)
      const results = await ClientService.search(searchQuery.trim(), token)
      setSearchResults(results)
      if (results.length === 0) {
        toast.info('Nenhum cliente encontrado')
      }
    } catch (error: any) {
      setSearchResults(null)
      toast.error(error.message || 'Falha ao buscar clientes')
    } finally {
      setSearching(false)
    }
  }, [token, searchQuery])

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults(null)
  }

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
      if (searchResults) {
        setSearchResults(prev => prev ? prev.map(c => c.id === id ? updatedClient : c) : null)
      }
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
      if (searchResults) {
        setSearchResults(prev => prev ? prev.filter(c => c.id !== id) : null)
      }
      toast.success('Cliente removido com sucesso')
    } catch (error) {
      console.error('Error deleting client:', error)
      toast.error('Falha ao remover cliente')
      throw error
    }
  }

  const displayClients = searchResults !== null ? searchResults : clients

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

      {/* Search by CPF or Name */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por CPF ou nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          onClick={handleSearch}
          disabled={searching || !searchQuery.trim()}
          variant="secondary"
        >
          {searching ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Search className="mr-2 h-4 w-4" />
          )}
          Buscar
        </Button>
        {searchResults !== null && (
          <Button variant="outline" onClick={clearSearch}>
            <X className="mr-2 h-4 w-4" />
            Limpar
          </Button>
        )}
      </div>

      {searchResults !== null && (
        <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
          {searchResults.length} resultado(s) para &quot;{searchQuery}&quot;.{' '}
          <button onClick={clearSearch} className="text-primary font-medium hover:underline">Mostrar todos</button>
        </div>
      )}

      <ClientTable
        clients={displayClients}
        loading={loading && searchResults === null}
        onUpdate={handleUpdateClient}
        onDelete={handleDeleteClient}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />
    </div>
  )
}