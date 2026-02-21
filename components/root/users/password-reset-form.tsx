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
  PasswordResetFormValues,
  passwordResetSchema,
} from "@/lib/validators/user-validator";
import { resetUserPassword } from "@/service/users";
import { User } from "@/types/users";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface PasswordResetFormProps {
  user: User | null;
  token: string | undefined;
  setOpenDialog: (open: boolean) => void;
}

export default function PasswordResetForm({
  user,
  token,
  setOpenDialog,
}: PasswordResetFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<PasswordResetFormValues>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      newPassword: "",
    },
  });

  const handleResetPassword = async (data: PasswordResetFormValues) => {
    if (!token || !user) {
      toast.error("Token de autenticação não encontrado");
      return;
    }

    try {
      setIsLoading(true);

      const response = await resetUserPassword({
        userId: user.id,
        newPassword: data.newPassword,
        temporary: true,
        token,
      });

      if (response instanceof Error) {
        toast.error(response.message);
        setIsLoading(false);
        return;
      }

      toast.success("Senha resetada com sucesso!");
      setOpenDialog(false);
      form.reset();
    } catch (error) {
      console.error("Erro ao resetar senha:", error);
      toast.error("Erro ao resetar senha");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleResetPassword)}
        className="space-y-4"
      >
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

        <p className="text-sm text-muted-foreground">
          O usuário será obrigado a alterar a senha no próximo login.
        </p>

        <div className="flex w-full gap-2 pt-1 flex-col">
          <Button
            type="submit"
            isLoading={isLoading}
            variant={"sectotech"}
            className="cursor-pointer"
          >
            {isLoading ? "Resetando..." : "Resetar Senha"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={() => setOpenDialog(false)}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
}
