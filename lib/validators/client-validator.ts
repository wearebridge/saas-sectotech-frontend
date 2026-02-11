import { z } from "zod";

export const clientSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  surname: z
    .string()
    .min(1, "Sobrenome é obrigatório")
    .max(100, "Sobrenome deve ter no máximo 100 caracteres"),
  birthDate: z.string().optional(),
  cpf: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{11}$/.test(val),
      "CPF deve conter exatamente 11 dígitos"
    ),
  rg: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length <= 20,
      "RG deve ter no máximo 20 caracteres"
    ),
  address: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length <= 255,
      "Endereço deve ter no máximo 255 caracteres"
    ),
  status: z.enum(["active", "inactive"]),
});

export type ClientFormValues = z.infer<typeof clientSchema>;