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
import { IconInput } from "@/components/ui/icon-input";
import { Eye, EyeOff } from "lucide-react";
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
import { getErrorMessage } from "@/lib/errors/error-utils";

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
  const [viewPassword, setViewPassword] = useState(false);
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

      const errorMessage = getErrorMessage(response);
      if (errorMessage) {
        toast.error(errorMessage);
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
                <IconInput
                  ButtonIcon={{
                    onClick: () => setViewPassword(!viewPassword),
                    icon: viewPassword ? EyeOff : Eye,
                  }}
                  placeholder="••••••••"
                  type={viewPassword ? "text" : "password"}
                  {...field}
                />
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
