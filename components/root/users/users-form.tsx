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
  UserFormValues,
  UserEditFormValues,
  userSchema,
  userEditSchema,
} from "@/lib/validators/user-validator";
import { createUsers, updateUser } from "@/service/users";
import { getErrorMessage } from "@/lib/errors/error-utils";
import { User } from "@/types/users";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface UsersFormProps {
  setOpenDialog: (open: boolean) => void;
  loadUsers: () => void;
  token: string | undefined;
  initalData?: User | null;
  onSuccess: () => void;
}

export default function UsersForm({
  setOpenDialog,
  loadUsers,
  token,
  onSuccess,
  initalData,
}: UsersFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!initalData;

  const createForm = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: "",
    },
  });

  const editForm = useForm<UserEditFormValues>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      firstName: initalData?.firstName || "",
      lastName: initalData?.lastName || "",
      email: initalData?.email || "",
    },
  });

  const form = isEditing ? editForm : createForm;

  const handleCreateUser = async (data: UserFormValues) => {
    if (!token) {
      toast.error("Token de autenticação não encontrado");
      return;
    }

    try {
      setIsLoading(true);

      const response = await createUsers({ ...data, token });

      const errorMessage = getErrorMessage(response);
      if (errorMessage) {
        toast.error(errorMessage);
        setIsLoading(false);
        return;
      }

      toast.success("Usuário criado com sucesso!");
      setOpenDialog(false);
      form.reset();
      loadUsers();
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      toast.error("Erro ao criar usuário");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async (data: UserEditFormValues) => {
    if (!token || !initalData) {
      toast.error("Token de autenticação não encontrado");
      return;
    }

    try {
      setIsLoading(true);

      const response = await updateUser({
        userId: initalData.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        token,
      });

      const errorMessage = getErrorMessage(response);
      if (errorMessage) {
        toast.error(errorMessage);
        setIsLoading(false);
        return;
      }

      toast.success("Usuário atualizado com sucesso!");
      setOpenDialog(false);
      form.reset();
      onSuccess();
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      toast.error("Erro ao atualizar usuário");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = isEditing
    ? editForm.handleSubmit(handleUpdateUser)
    : createForm.handleSubmit(handleCreateUser);

  return (
    <Form {...createForm}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={createForm.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Nome" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={createForm.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sobrenome</FormLabel>
                <FormControl>
                  <Input placeholder="Sobrenome" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={createForm.control}
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

        {!isEditing && (
          <>
            <FormField
              control={createForm.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={createForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <div className="flex w-full gap-2 pt-1 flex-col">
          <Button
            type="submit"
            isLoading={isLoading}
            variant={"sectotech"}
            className="cursor-pointer"
          >
            {isLoading
              ? isEditing
                ? "Atualizando..."
                : "Criando..."
              : isEditing
                ? "Atualizar usuário"
                : "Criar usuário"}
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
