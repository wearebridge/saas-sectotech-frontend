"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useKeycloak } from "@/lib/keycloak";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createServiceSubType,
  updateServiceSubType,
} from "@/service/services-sub-type";

const formSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  status: z.enum(["active", "inactive"]),
});

type FormValues = z.infer<typeof formSchema>;

interface ServiceSubTypeFormProps {
  subTypeId?: string;
  initialData?: FormValues;
  onSuccess: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function ServiceSubTypeForm({
  subTypeId,
  initialData,
  onSuccess,
  open: propOpen,
  onOpenChange: propOnOpenChange,
  trigger,
}: ServiceSubTypeFormProps) {
  const [internalOpen, setInternalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { token } = useKeycloak();

  const open = propOpen ?? internalOpen;
  const setOpen = propOnOpenChange ?? setInternalOpen;
  const isEditing = !!subTypeId;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      status: "active",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    } else {
      form.reset({
        name: "",
        description: "",
        status: "active",
      });
    }
  }, [initialData, form, open]);

  async function onSubmit(values: FormValues) {
    if (!token) {
      toast.error("Você não está autenticado");
      return;
    }

    setIsLoading(true);

    try {
      if (isEditing) {
        if (!subTypeId) {
          return toast.error("ID do serviço é necessário para edição.");
        }

        const response = await updateServiceSubType({
          id: subTypeId,
          name: values.name,
          description: values.description,
          status: values.status,
          token,
        });

        if (response instanceof Error) {
          toast.error(response.message);
          return;
        }

        toast.success("Subtipo de serviço atualizado com sucesso");
      } else {
        const response = await createServiceSubType({
          name: values.name,
          description: values.description,
          token,
        });

        if (response instanceof Error) {
          toast.error(response.message);
          return;
        }

        toast.success("Subtipo de serviço criado com sucesso");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        `Ocorreu um erro ao ${isEditing ? "atualizar" : "criar"} o subtipo de serviço.`,
      );
    } finally {
      setIsLoading(false);
      form.reset();
      setOpen(false);
      onSuccess();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Subtipo" : "Criar Subtipo"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Edite as informações do subtipo."
              : "Adicione um novo subtipo de serviço."}
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
                    <Input placeholder="Ex: Direito Trabalhista" {...field} />
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
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
              variant="sectotech"
            >
              {isEditing ? "Salvar Alterações" : "Criar Subtipo"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
