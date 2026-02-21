"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  ChangeOwnPasswordFormValues,
  changeOwnPasswordSchema,
} from "@/lib/validators/user-validator";
import { changeOwnPassword } from "@/service/users";
import { useKeycloak } from "@/lib/keycloak";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function ChangePasswordSection() {
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useKeycloak();

  const form = useForm<ChangeOwnPasswordFormValues>({
    resolver: zodResolver(changeOwnPasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  const handleChangePassword = async (data: ChangeOwnPasswordFormValues) => {
    if (!token) {
      toast.error("Token de autenticação não encontrado");
      return;
    }

    try {
      setIsLoading(true);

      const response = await changeOwnPassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        token,
      });

      if (response instanceof Error) {
        toast.error(response.message);
        setIsLoading(false);
        return;
      }

      toast.success("Senha alterada com sucesso!");
      form.reset();
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      toast.error("Erro ao alterar senha");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Alterar Senha</h3>
        <p className="text-sm text-muted-foreground">
          Altere sua senha de acesso ao sistema.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleChangePassword)}
          className="space-y-4 max-w-md"
        >
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha Atual</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nova Senha</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            isLoading={isLoading}
            variant={"sectotech"}
            className="cursor-pointer"
          >
            {isLoading ? "Alterando..." : "Alterar Senha"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
