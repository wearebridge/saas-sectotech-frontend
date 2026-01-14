"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { z } from "zod"
import { SubTypeSelect } from "./subtype-select"

type NewServiceDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const serviceSchema = z.object({
  name: z.string().min(1, "Nome do serviço é obrigatório"),
  subtypeId: z.string().min(1, "Selecione um sub-tipo"),
})

export type ServiceFormValues = z.infer<typeof serviceSchema>

export function ServiceForm({
  open,
  onOpenChange,
}: NewServiceDialogProps) {
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      subtypeId: "",
    },
  })

  const onSubmit = (data: ServiceFormValues) => {
    console.log(data)
    onOpenChange(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md space-y-8">
        <DialogHeader>
          <DialogTitle>Novo serviço</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do serviço</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Aposentadoria por Tempo de Contribuição" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subtypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sub-tipo</FormLabel>
                  <FormControl>
                    <SubTypeSelect
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                className="bg-brand text-white hover:bg-brand/90"
              >
                Criar serviço
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
