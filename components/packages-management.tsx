"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useKeycloak } from "@/lib/keycloak"
import { CreditPackage } from "@/types/package"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { Loader2, Pencil, Trash2, Plus } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  identifier: z.string().min(2, "Identificador deve ter pelo menos 2 caracteres").regex(/^[a-z0-9_]+$/, "Use apenas letras minúsculas, números e underline"),
  priceInCents: z.coerce.number().min(1, "Preço deve ser maior que 0"),
  credits: z.coerce.number().min(1, "Créditos devem ser maior que 0"),
  active: z.boolean().default(true),
})

export function PackagesManagement() {
  const { token } = useKeycloak()
  const [packages, setPackages] = useState<CreditPackage[]>([])
  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<CreditPackage | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      identifier: "",
      priceInCents: 0,
      credits: 0,
      active: true,
    },
  })

  // Fetch packages on mount
  const fetchPackages = async () => {
    if (!token) return
    setLoading(true)
    try {
      console.log("Fetching admin packages from:", `${process.env.NEXT_PUBLIC_API_BASE_URL}/packages/admin`);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/packages/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setPackages(await res.json())
      } else {
        toast.error("Erro ao carregar pacotes")
      }
    } catch (error) {
      toast.error("Erro de conexão")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPackages()
  }, [token])

  // Handle open dialog for Create or Edit
  const handleOpenDialog = (pkg?: CreditPackage) => {
    if (pkg) {
      setEditingPackage(pkg)
      form.reset({
        name: pkg.name,
        identifier: pkg.identifier,
        priceInCents: pkg.priceInCents,
        credits: pkg.credits,
        active: pkg.active,
      })
    } else {
      setEditingPackage(null)
      form.reset({
        name: "",
        identifier: "",
        priceInCents: 0,
        credits: 0,
        active: true,
      })
    }
    setIsDialogOpen(true)
  }

  // Submit Handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!token) return

    try {
      const url = editingPackage
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/packages/${editingPackage.id}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/packages`
      
      const method = editingPackage ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      })

      if (res.ok) {
        toast.success(editingPackage ? "Pacote atualizado!" : "Pacote criado!")
        setIsDialogOpen(false)
        fetchPackages()
      } else {
        toast.error("Erro ao salvar pacote")
      }
    } catch (error) {
      toast.error("Erro de conexão")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este pacote?")) return
    if (!token) return

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/packages/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        toast.success("Pacote excluído")
        fetchPackages()
      } else {
        toast.error("Erro ao excluir")
      }
    } catch (error) {
      toast.error("Erro de conexão")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Gestão de Pacotes</h2>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Novo Pacote
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPackage ? "Editar Pacote" : "Novo Pacote"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Pacote Básico" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Identificador (Único)</FormLabel>
                    <FormControl>
                      <Input placeholder="basic_plan" {...field} />
                    </FormControl>
                    <FormDescription>Usado internamente e no código.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priceInCents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço (Centavos)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>Ex: 5000 = R$ 50,00</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="credits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Créditos</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>Quantidade de créditos do pacote</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-4 border rounded-md">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Ativo</FormLabel>
                      <FormDescription>
                        Disponível para compra
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Identificador</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Créditos</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : packages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  Nenhum pacote encontrado.
                </TableCell>
              </TableRow>
            ) : (
              packages.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell className="font-medium">{pkg.name}</TableCell>
                  <TableCell>{pkg.identifier}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(pkg.priceInCents / 100)}
                  </TableCell>
                  <TableCell>{pkg.credits}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${pkg.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {pkg.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(pkg)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(pkg.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
