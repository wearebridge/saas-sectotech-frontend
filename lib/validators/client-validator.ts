import { z } from "zod";

export const clientSchema = z.object({
  fullName: z
    .string()
    .min(1, "Nome completo é obrigatório")
    .max(200, "Nome completo deve ter no máximo 200 caracteres"),
  birthDate: z.string().optional(),
  cpf: z
    .string()
    .min(1, "CPF é obrigatório")
    .refine(
      (val) => /^\d{11}$/.test(val),
      "CPF deve conter exatamente 11 dígitos",
    ),
  rg: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length <= 20,
      "RG deve ter no máximo 20 caracteres",
    ),
  address: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length <= 255,
      "Endereço deve ter no máximo 255 caracteres",
    ),
  phone: z
    .string()
    .min(1, "Telefone é obrigatório")
    .refine((val) => {
      const digits = val.replace(/\D/g, "");
      return digits.length === 10 || digits.length === 11;
    }, "Telefone deve ter 10 dígitos (fixo) ou 11 dígitos (celular)"),
  email: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      "E-mail inválido",
    ),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  status: z.enum(["active", "inactive"]),
});

export type ClientFormValues = z.infer<typeof clientSchema>;
