"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Input } from "@/components/ui/input";
import { isValidPassword } from "@/lib/validators/password";
import { useState } from "react";
import { PasswordRequirement } from "@/components/ui/password-requirement";
import { IconInput } from "@/components/ui/icon-input";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { registerCompany } from "@/service/auth/register";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const CompanyRegistrationScheme = z.object({
  companyName: z.string().min(1, "O nome da empresa é obrigatório."),
  adminFirstName: z.string().min(1, "O nome do administrador é obrigatório."),
  adminLastName: z
    .string()
    .min(1, "O sobrenome do administrador é obrigatório."),
  adminEmail: z.email("Email inválido."),
  adminUsername: z
    .string()
    .min(3, "O nome de usuário deve ter pelo menos 3 caracteres."),
  adminPassword: z
    .string()
    .refine(isValidPassword, { message: "Coloque uma senha válida" }),
});

export function CompanyRegistrationForm() {
  const router = useRouter();
  const [viewPass, setViewPass] = useState<boolean>(false);
  const [minLength, setMinLength] = useState<boolean>(false);
  const [hasUpperCase, setHasUpperCase] = useState<boolean>(false);
  const [hasLowerCase, setHasLowerCase] = useState<boolean>(false);
  const [hasNumber, setHasNumber] = useState<boolean>(false);
  const [hasSpecialChar, setHasSpecialChar] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const validatePassword = (password: string) => {
    setMinLength(password.length >= 8);
    setHasUpperCase(/[A-Z]/.test(password));
    setHasLowerCase(/[a-z]/.test(password));
    setHasNumber(/[0-9]/.test(password));
    setHasSpecialChar(/[!@#$%^&*(),.?":{}|<>]/.test(password));
  };

  const form = useForm<z.infer<typeof CompanyRegistrationScheme>>({
    resolver: zodResolver(CompanyRegistrationScheme),
    defaultValues: {
      adminEmail: "",
      adminFirstName: "",
      adminLastName: "",
      adminPassword: "",
      adminUsername: "",
      companyName: "",
    },
  });

  const handleSubmit = form.handleSubmit(
    async ({
      adminEmail,
      adminFirstName,
      adminLastName,
      adminPassword,
      adminUsername,
      companyName,
    }: z.infer<typeof CompanyRegistrationScheme>) => {
      setIsLoading(true);
      const created = await registerCompany({
        adminEmail,
        adminFirstName,
        adminLastName,
        adminPassword,
        adminUsername,
        companyName,
      });

      if (created instanceof Error) {
        toast.error(created.message);
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      toast.success("Empresa registrada com sucesso!", {
        description: "Verifique seu email para ativação.",
      });

      router.push("/");
      return;
    },
  );

  return (
    <Card className=" sm:w-[70%] xl:w-[70%] max-w-lg">
      <CardHeader>
        <CardTitle>Registrar Empresa</CardTitle>
        <CardDescription>
          Crie uma nova conta de empresa e configure o administrador inicial.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="flex gap-4 flex-col" onSubmit={handleSubmit}>
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Empresa</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Tech Solutions" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-row gap-2 w-full">
              <FormField
                control={form.control}
                name="adminFirstName"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Nome do Admin</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: João" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="adminLastName"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Sobrenome do Admin</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="adminEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email do Admin</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: joao.silva@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="adminUsername"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuário (Login)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: joao.silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="adminPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha do Admin</FormLabel>
                  <FormControl>
                    <div className="flex gap-2 flex-col">
                      <IconInput
                        ButtonIcon={{
                          onClick: () => setViewPass(!viewPass),
                          icon: viewPass ? EyeOff : Eye,
                        }}
                        placeholder="Ex: Senha@1345!"
                        type={viewPass ? "text" : "password"}
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          validatePassword(e.target.value);
                        }}
                      />

                      <div className="flex justify-center items-start w-full flex-col">
                        <PasswordRequirement
                          isValid={minLength}
                          text="no mínimo 8 caracteres"
                        />
                        <PasswordRequirement
                          isValid={hasUpperCase}
                          text="no mínimo 1 letra maiúscula"
                        />
                        <PasswordRequirement
                          isValid={hasLowerCase}
                          text="no mínimo 1 letra minúscula"
                        />
                        <PasswordRequirement
                          isValid={hasNumber}
                          text="no mínimo 1 número"
                        />
                        <PasswordRequirement
                          isValid={hasSpecialChar}
                          text="no mínimo 1 caractere especial"
                        />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <div className="flex flex-col gap-3 mt-1 mb-2 ">
          <Button
            onClick={handleSubmit}
            isLoading={isLoading}
            size="lg"
            variant={"sectotech"}
            className="mt-3"
            // className="text-white mt-3 cursor-pointer bg-brand hover:bg-brand/90 active:bg-brand/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
          >
            Cadastrar
          </Button>
          <Button className="cursor-pointer" variant={"link"} onClick={() => {
            const redirectUri = encodeURIComponent(window.location.origin + "/");
            const loginUrl = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/auth?client_id=${process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=openid`;
            window.location.href = loginUrl;
          }}>
            Já possui uma conta? Faça login
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
