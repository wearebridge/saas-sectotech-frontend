"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ClientRequest, ClientResponse } from "@/types/client";
import { clientSchema } from "@/lib/validators/client-validator";
import { InputMaskForm } from "@/components/ui/mask-input-form";
import { PhoneFormatter } from "@/lib/formatters/phone";
import { CPFFormatter } from "@/lib/formatters/cpf";

interface ClientFormProps {
  client?: ClientResponse;
  onSubmit: (data: ClientRequest) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export function ClientForm({
  client,
  onSubmit,
  onCancel,
  loading = false,
}: ClientFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ClientRequest>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      fullName: client?.fullName || "",
      birthDate: client?.birthDate
        ? new Date(client.birthDate).toISOString().split("T")[0]
        : "",
      cpf: client?.cpf || "",
      rg: client?.rg || "",
      address: client?.address || "",
      phone: client?.phone || "",
      email: client?.email || "",
      gender: client?.gender || undefined,
      status: client ? (client.status ? "active" : "inactive") : "active",
    },
  });

  const handleSubmit = async (data: ClientRequest) => {
    if (isSubmitting || loading) return;

    try {
      setIsSubmitting(true);
      await onSubmit(data);
      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao salvar cliente",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo *</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o nome completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="email@exemplo.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <InputMaskForm
              form={form}
              name="phone"
              label="Telefone *"
              placeholder="(00) 00000-0000"
              formatter={PhoneFormatter}
              maxLength={15}
            />
          </div>

          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Nascimento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <InputMaskForm
              form={form}
              name="cpf"
              label="CPF *"
              placeholder="000.000.000-00"
              formatter={CPFFormatter}
              maxLength={14}
            />

            <FormField
              control={form.control}
              name="rg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RG</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o RG" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o endereço" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sexo</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o sexo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="MALE">Masculino</SelectItem>
                    <SelectItem value="FEMALE">Feminino</SelectItem>
                    <SelectItem value="OTHER">Outro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {client && (
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
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
          )}
        </form>
      </Form>
      <div className="flex justify-end gap-2 pt-4 w-full flex-col">
        <Button
          onClick={form.handleSubmit(handleSubmit)}
          variant={"sectotech"}
          isLoading={isSubmitting || loading}
          className="w-full"
        >
          {isSubmitting || loading
            ? "Salvando..."
            : client
              ? "Atualizar"
              : "Criar"}
        </Button>

        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting || loading}
          >
            Cancelar
          </Button>
        )}
      </div>
    </div>
  );
}
