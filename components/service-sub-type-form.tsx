"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { PlusIcon } from "lucide-react"
import { useKeycloak } from "@/lib/keycloak"

const formSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface ServiceSubTypeFormProps {
  serviceTypeId: string
  onSuccess: () => void
}

export function ServiceSubTypeForm({ serviceTypeId, onSuccess }: ServiceSubTypeFormProps) {
  const [open, setOpen] = useState(false)
  const { token } = useKeycloak()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  async function onSubmit(values: FormValues) {
    if (!token) {
      toast.error("Você não está autenticado")
      return
    }

    try {
      // POST /service-sub-types/byServiceType/{serviceTypeId}
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL
      const response = await fetch(
        `${apiUrl}/service-sub-types/byServiceType/${serviceTypeId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(values),
        }
      )

      if (!response.ok) {
        throw new Error("Falha ao criar subtipo de serviço")
      }

      toast.success("Subtipo criado com sucesso")
      form.reset()
      setOpen(false)
      onSuccess()
    } catch (error) {
      console.error(error)
      toast.error("Ocorreu um erro ao criar o subtipo")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Novo Subtipo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Subtipo de Serviço</DialogTitle>
          <DialogDescription>
            Adicione um novo subtipo para este serviço.
          </DialogDescription>
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
                    <Input placeholder="Ex: Manutenção Preventiva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o subtipo de serviço..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              Criar Subtipo
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
