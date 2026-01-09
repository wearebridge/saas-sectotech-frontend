"use client"

import { useEffect, useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { PlusIcon, Trash2 } from "lucide-react"
import { useKeycloak } from "@/lib/keycloak"

const scriptItemSchema = z.object({
  question: z.string().min(1, "O item é obrigatório"),
})

const formSchema = z.object({
  name: z.string().min(2, "Nome do script deve ter pelo menos 2 caracteres"),
  status: z.boolean().default(true),
  scriptItems: z.array(scriptItemSchema).optional(),
})

type FormValues = z.infer<typeof formSchema>

interface ScriptFormProps {
  serviceSubTypeId?: string
  scriptId?: string
  initialData?: FormValues
  onSuccess: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ScriptForm({ serviceSubTypeId, scriptId, initialData, onSuccess, open: controlledOpen, onOpenChange: setControlledOpen }: ScriptFormProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const { token } = useKeycloak()

  // Use controlled state if provided, otherwise internal
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen

  const defaultValues: FormValues = initialData || {
    name: "",
    status: true,
    scriptItems: [],
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const isEditing = !!scriptId

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "scriptItems",
  })
  
  // Update form values if initialData changes (important for edit mode switching)
  useEffect(() => {
      if (initialData) {
          form.reset(initialData)
      }
  }, [initialData, form])

  async function onSubmit(values: FormValues) {
    if (!token) {
      toast.error("Você não está autenticado")
      return
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL
      const url = isEditing
        ? `${apiUrl}/scripts/${scriptId}`
        : `${apiUrl}/scripts/byServiceSubType/${serviceSubTypeId}`
      
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error(`Falha ao ${isEditing ? "atualizar" : "criar"} script`)
      }

      toast.success(`Script ${isEditing ? "atualizado" : "criado"} com sucesso`)
      if (!isEditing) {
          form.reset()
      }
      setOpen(false)
      onSuccess()
    } catch (error) {
      console.error(error)
      toast.error(`Ocorreu um erro ao ${isEditing ? "atualizar" : "criar"} o script`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
      <DialogTrigger asChild>
        {isEditing ? (
            <Button variant="outline" size="sm">Editar</Button>
        ) : (
            <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Novo Script
            </Button>
        )}
      </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Script" : "Criar Script"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Edite os detalhes do script." : "Adicione um novo script para este subtipo de serviço."}
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
                    <Input placeholder="Ex: Script de vendas" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Ativo
                    </FormLabel>
                    <FormDescription>
                      Este script estará disponível para uso.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Itens do Script</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ question: "" })}
                >
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Adicionar Item
                </Button>
              </div>
              
              <div className="h-[200px] w-full rounded-md border p-4 overflow-y-auto">
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 items-start border-b pb-4 last:border-0 last:pb-0">
                      <div className="grid gap-2 flex-1">
                        <FormField
                          control={form.control}
                          name={`scriptItems.${index}.question`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="Item do Script" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="mt-0"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  {fields.length === 0 && (
                     <p className="text-sm text-muted-foreground text-center py-4">
                       Nenhum item adicionado.
                     </p>
                  )}
                </div>
              </div>
            </div>

            <Button type="submit" disabled={form.formState.isSubmitting}>
              {isEditing ? "Salvar Alterações" : "Criar Script"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
