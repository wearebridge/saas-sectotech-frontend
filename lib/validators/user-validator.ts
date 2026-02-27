import { z } from "zod";

export const userSchema = z.object({
  firstName: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  lastName: z
    .string()
    .min(1, "Sobrenome é obrigatório")
    .max(100, "Sobrenome deve ter no máximo 100 caracteres"),
  email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
  username: z
    .string()
    .min(3, "Username deve ter no mínimo 3 caracteres")
    .max(50, "Username deve ter no máximo 50 caracteres")
    .regex(
      /^[a-zA-Z0-9_.-]+$/,
      "Username deve conter apenas letras, números, hífens, underscores e pontos",
    ),
  password: z
    .string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
    .regex(/[0-9]/, "Senha deve conter pelo menos um número")
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Senha deve conter pelo menos um caractere especial",
    ),
  isAdmin: z.boolean().default(false),
});

export type UserFormValues = z.infer<typeof userSchema>;

export const userEditSchema = z.object({
  firstName: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  lastName: z
    .string()
    .min(1, "Sobrenome é obrigatório")
    .max(100, "Sobrenome deve ter no máximo 100 caracteres"),
  email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
  isAdmin: z.boolean().default(false),
});

export type UserEditFormValues = z.infer<typeof userEditSchema>;

export const passwordResetSchema = z.object({
  newPassword: z
    .string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
    .regex(/[0-9]/, "Senha deve conter pelo menos um número")
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Senha deve conter pelo menos um caractere especial",
    ),
});

export type PasswordResetFormValues = z.infer<typeof passwordResetSchema>;

export const changeOwnPasswordSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual é obrigatória"),
  newPassword: z
    .string()
    .min(8, "Nova senha deve ter no mínimo 8 caracteres")
    .regex(/[A-Z]/, "Nova senha deve conter pelo menos uma letra maiúscula")
    .regex(/[0-9]/, "Nova senha deve conter pelo menos um número")
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Nova senha deve conter pelo menos um caractere especial",
    ),
});

export type ChangeOwnPasswordFormValues = z.infer<typeof changeOwnPasswordSchema>;
