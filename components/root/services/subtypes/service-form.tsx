"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { useKeycloak } from "@/lib/keycloak";
import { toast } from "sonner";
import { SubTypeSelect } from "../../../forms/subtype-select";
import { createService, updateService } from "@/service/services-type";

type ServiceFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  defaultSubTypeId?: string;
  serviceId?: string;
  initialData?: ServiceFormValues;
};

export const serviceSchema = z.object({
  name: z.string().min(1, "Nome do serviço é obrigatório"),
  description: z.string().optional(),
  subtypeId: z.string().min(1, "Selecione um sub-tipo"),
  status: z.enum(["active", "inactive"], {
    message: "Selecione um status",
  }),
});

export type ServiceFormValues = z.infer<typeof serviceSchema>;

export function ServiceForm({
  open,
  onOpenChange,
  onSuccess,
  defaultSubTypeId,
  serviceId,
  initialData,
}: ServiceFormProps) {
  const { token } = useKeycloak();
  const isEditing = !!serviceId;

  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      subtypeId: defaultSubTypeId || "",
      status: "active",
    },
  });

  // Update default value if prop changes
  React.useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    } else {
      if (defaultSubTypeId) {
        form.setValue("subtypeId", defaultSubTypeId);
      }
      if (!isEditing && !initialData) {
        // Reset to defaults if opening as new
        form.reset({
          name: "",
          description: "",
          subtypeId: defaultSubTypeId || "",
          status: "active",
        });
      }
    }
  }, [defaultSubTypeId, form, initialData, isEditing, open]);

  const onSubmit = async (data: ServiceFormValues) => {
    if (!token) return;

    setIsLoading(true);

    try {
      if (isEditing) {
        const result = await updateService({
          name: data.name,
          serviceId: serviceId,
          status: data.status,
          description: data.description,
          token: token,
        });

        if (result instanceof Error) {
          toast.error(result.message);
          setIsLoading(false);
          return;
        }

        toast.success("Serviço alterado com sucesso!");
      } else {
        const result = await createService({
          name: data.name,
          subtypeId: data.subtypeId,
          token: token,
          description: data.description,
        });

        if (result instanceof Error) {
          toast.error(result.message);
          setIsLoading(false);
          return;
        }

        toast.success("Serviço criado com sucesso!");
      }

      onSuccess?.();
      onOpenChange(false);
      form.reset();
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error(error);
      toast.error("Erro ao salvar serviço");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Serviço" : "Novo Serviço"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Serviço</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Aposentadoria por Idade"
                      {...field}
                    />
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
                      onValueChange={field.onChange}
                      disabled={!!defaultSubTypeId}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Descrição do serviço" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 flex-col">
              <Button variant={"sectotech"} type="submit" isLoading={isLoading}>
                Salvar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
