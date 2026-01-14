"use client"

import * as React from "react"
import { useState, useEffect } from "react"
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
  IconPlus,
  IconDotsVertical,
  IconChevronsLeft,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsRight,
  IconChevronDown,
} from "@tabler/icons-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useKeycloak } from "@/lib/keycloak"
import { toast } from "sonner"

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
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  username: string
  enabled: boolean
  createdTimestamp: number
}

interface NewUserForm {
  firstName: string
  lastName: string
  email: string
  username: string
  password: string
}

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "firstName",
    header: "Nome",
    cell: ({ row }) => (
      <span className="font-medium">
        {row.original.firstName} {row.original.lastName}
      </span>
    ),
  },
  {
    accessorKey: "email",
    header: "E-mail",
  },
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "enabled",
    header: "Status",
    cell: ({ row }) => (
      <span className={cn(
        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
        row.original.enabled
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800"
      )}>
        {row.original.enabled ? "Ativo" : "Inativo"}
      </span>
    ),
  },
  {
    accessorKey: "createdTimestamp",
    header: "Criado em",
    cell: ({ row }) => {
      const date = new Date(row.original.createdTimestamp)
      return date.toLocaleDateString("pt-BR")
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <IconDotsVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Editar</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">
            Desabilitar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

export function UsersTable() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { token } = useKeycloak()

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [nameSearch, setNameSearch] = React.useState(
    searchParams.get("name") ?? ""
  )
  const [emailSearch, setEmailSearch] = React.useState(
    searchParams.get("email") ?? ""
  )
  const [pageSize, setPageSize] = React.useState(
    Number(searchParams.get("pageSize") ?? 10)
  )
  const [pageIndex, setPageIndex] = React.useState(
    Number(searchParams.get("page") ?? 0)
  )
  const [openDialog, setOpenDialog] = React.useState(false)
  const [newUser, setNewUser] = React.useState<NewUserForm>({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
  })
  const [creating, setCreating] = React.useState(false)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL
      const response = await fetch(`${apiUrl}/companies/current/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        throw new Error('Falha ao carregar usuários')
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      toast.error("Erro ao carregar usuários da empresa")
    } finally {
      setLoading(false)
    }
  }

  const createUser = async () => {
    try {
      setCreating(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL
      const response = await fetch(`${apiUrl}/company/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      })

      if (response.ok) {
        toast.success("Usuário criado com sucesso!")
        setOpenDialog(false)
        setNewUser({
          firstName: "",
          lastName: "",
          email: "",
          username: "",
          password: "",
        })
        fetchUsers() // Recarregar a lista
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Falha ao criar usuário')
      }
    } catch (error) {
      console.error('Erro ao criar usuário:', error)
      toast.error("Erro ao criar usuário: " + (error as Error).message)
    } finally {
      setCreating(false)
    }
  }

  React.useEffect(() => {
    const params = new URLSearchParams()
    if (nameSearch) params.set("name", nameSearch)
    if (emailSearch) params.set("email", emailSearch)
    params.set("page", String(pageIndex))
    params.set("pageSize", String(pageSize))
    router.replace(`?${params.toString()}`)
  }, [nameSearch, emailSearch, pageIndex, pageSize, router])

  React.useEffect(() => {
    if (token) {
      fetchUsers()
    }
  }, [token])

  // Filtrar usuários baseado na busca
  const filteredUsers = React.useMemo(() => {
    return users.filter((user) => {
      const nameMatch = nameSearch === "" || 
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(nameSearch.toLowerCase())
      const emailMatch = emailSearch === "" || 
        user.email.toLowerCase().includes(emailSearch.toLowerCase())
      return nameMatch && emailMatch
    })
  }, [users, nameSearch, emailSearch])

  const table = useReactTable({
    data: filteredUsers,
    columns,
    state: {
      pagination: { pageIndex, pageSize },
    },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater
      setPageIndex(next.pageIndex)
      setPageSize(next.pageSize)
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="animate-pulse space-y-4">
          <div className="flex justify-between">
            <div className="flex gap-2">
              <div className="h-8 bg-muted rounded w-[220px]"></div>
              <div className="h-8 bg-muted rounded w-[220px]"></div>
            </div>
            <div className="h-8 bg-muted rounded w-[120px]"></div>
          </div>
          <div className="h-[400px] bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <IconSearch className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={nameSearch}
                onChange={(e) => setNameSearch(e.target.value)}
                placeholder="Buscar nome"
                className="h-8 w-[220px] pl-8 text-sm"
              />
            </div>

            <div className="relative">
              <IconSearch className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={emailSearch}
                onChange={(e) => setEmailSearch(e.target.value)}
                placeholder="Buscar e-mail"
                className="h-8 w-[220px] pl-8 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <IconLayoutColumns className="h-4 w-4" />
                  <span className="hidden lg:inline">Colunas</span>
                  <IconChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {table
                  .getAllColumns()
                  .filter(
                    (column) =>
                      column.getCanHide() && column.id !== "actions"
                  )
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {String(column.columnDef.header)}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" size="sm" onClick={() => setOpenDialog(true)}>
              <IconPlus className="h-4 w-4" />
              <span className="hidden lg:inline">Novo usuário</span>
            </Button>
          </div>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="px-4 font-medium">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-end gap-8 px-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span>Linhas por página</span>
            <Select
              value={`${pageSize}`}
              onValueChange={(v) => setPageSize(Number(v))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20].map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-sm font-medium">
              Página {pageIndex + 1} de {Math.max(table.getPageCount(), 1)}
            </span>

            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" onClick={() => setPageIndex(0)} disabled={pageIndex === 0}>
                <IconChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPageIndex((p) => Math.max(p - 1, 0))}
                disabled={pageIndex === 0}
              >
                <IconChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setPageIndex((p) =>
                    Math.min(p + 1, table.getPageCount() - 1)
                  )
                }
                disabled={pageIndex >= table.getPageCount() - 1}
              >
                <IconChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setPageIndex(table.getPageCount() - 1)
                }
                disabled={pageIndex >= table.getPageCount() - 1}
              >
                <IconChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nome</Label>
                <Input
                  id="firstName"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Nome"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Sobrenome</Label>
                <Input
                  id="lastName"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Sobrenome"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@exemplo.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={newUser.username}
                onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                placeholder="username"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                placeholder="••••••••"
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={createUser}
                disabled={creating || !newUser.firstName || !newUser.lastName || !newUser.email || !newUser.username || !newUser.password}
              >
                {creating ? "Criando..." : "Criar usuário"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
