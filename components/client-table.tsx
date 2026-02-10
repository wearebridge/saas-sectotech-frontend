"use client"

import * as React from "react"
import { useState } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  IconSearch,
  IconLayoutColumns,
  IconDotsVertical,
  IconChevronsLeft,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsRight,
  IconChevronDown,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ClientForm } from '@/components/client-form'
import { ClientRequest, ClientResponse } from '@/types/client'

import { DataTable } from '@/components/ui/data-table'

// Helper function to format dates
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR')
}

interface ClientTableProps {
  clients?: ClientResponse[]
  loading?: boolean
  onUpdate?: (id: string, data: ClientRequest) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

const columns: ColumnDef<ClientResponse>[] = [
  {
    accessorKey: 'name',
    header: 'Nome',
    cell: ({ row }) => (
      <div className="font-medium">
        {row.getValue('name')} {row.original.surname}
      </div>
    ),
  },
  {
    accessorKey: 'cpf',
    header: 'CPF',
    cell: ({ row }) => {
      const cpf = row.getValue('cpf') as string
      return cpf ? (
        <span className="font-mono text-sm">
          {cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
        </span>
      ) : (
        <span className="text-muted-foreground">-</span>
      )
    },
  },
  {
    accessorKey: 'rg',
    header: 'RG',
    cell: ({ row }) => {
      const rg = row.getValue('rg') as string
      return rg || <span className="text-muted-foreground">-</span>
    },
  },
  {
    accessorKey: 'birthDate',
    header: 'Data de Nascimento',
    cell: ({ row }) => {
      const birthDate = row.getValue('birthDate') as string
      return birthDate ? formatDate(birthDate) : <span className="text-muted-foreground">-</span>
    },
  },
  {
    accessorKey: 'address',
    header: 'Endereço',
    cell: ({ row }) => {
      const address = row.getValue('address') as string
      return address ? (
        <div className="max-w-[200px] truncate" title={address}>
          {address}
        </div>
      ) : (
        <span className="text-muted-foreground">-</span>
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as boolean
      return (
        <Badge variant={status ? 'default' : 'secondary'}>
          {status ? 'Ativo' : 'Inativo'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Criado em',
    cell: ({ row }) => {
      const createdAt = row.getValue('createdAt') as string
      return formatDate(createdAt)
    },
  },
]

export function ClientTable({
  clients = [],
  loading = false,
  onUpdate,
  onDelete,
}: ClientTableProps) {
  const [selectedClient, setSelectedClient] = useState<ClientResponse | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [nameSearch, setNameSearch] = React.useState("")
  const [pageSize, setPageSize] = React.useState(10)
  const [pageIndex, setPageIndex] = React.useState(0)

  const handleEdit = (client: ClientResponse) => {
    setSelectedClient(client)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (client: ClientResponse) => {
    setSelectedClient(client)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (selectedClient && onDelete) {
      await onDelete(selectedClient.id)
      setIsDeleteDialogOpen(false)
      setSelectedClient(null)
    }
  }

  const handleUpdateClient = async (data: ClientRequest) => {
    if (selectedClient && onUpdate) {
      await onUpdate(selectedClient.id, data)
      setIsEditDialogOpen(false)
      setSelectedClient(null)
    }
  }

  const columns: ColumnDef<ClientResponse>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="font-medium">
          {row.getValue('name')} {row.original.surname}
        </div>
      ),
    },
    {
      accessorKey: 'cpf',
      header: 'CPF',
      cell: ({ row }) => {
        const cpf = row.getValue('cpf') as string
        return cpf ? (
          <span className="font-mono text-sm">
            {cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      },
    },
    {
      accessorKey: 'rg',
      header: 'RG',
      cell: ({ row }) => {
        const rg = row.getValue('rg') as string
        return rg || <span className="text-muted-foreground">-</span>
      },
    },
    {
      accessorKey: 'birthDate',
      header: 'Birth Date',
      cell: ({ row }) => {
        const birthDate = row.getValue('birthDate') as string
        return birthDate ? formatDate(birthDate) : <span className="text-muted-foreground">-</span>
      },
    },
    {
      accessorKey: 'address',
      header: 'Address',
      cell: ({ row }) => {
        const address = row.getValue('address') as string
        return address ? (
          <div className="max-w-[200px] truncate" title={address}>
            {address}
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as boolean
        return (
          <Badge variant={status ? 'default' : 'secondary'}>
            {status ? 'Active' : 'Inactive'}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => {
        const createdAt = row.getValue('createdAt') as string
        return formatDate(createdAt)
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const client = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <IconDotsVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEdit(client)}>
                <IconEdit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDelete(client)}
                className="text-destructive"
              >
                <IconTrash className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={clients}
        loading={loading}
        searchKey="name"
        searchPlaceholder="Search clients..."
      />

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <ClientForm
              client={selectedClient}
              onSubmit={handleUpdateClient}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setSelectedClient(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Tem certeza de que deseja excluir este cliente?</p>
            {selectedClient && (
              <div className="rounded-lg bg-muted p-4">
                <p className="font-medium">
                  {selectedClient.name} {selectedClient.surname}
                </p>
                {selectedClient.cpf && (
                  <p className="text-sm text-muted-foreground">
                    CPF: {selectedClient.cpf}
                  </p>
                )}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteDialogOpen(false)
                  setSelectedClient(null)
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
              >
                Excluir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}