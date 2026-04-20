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
    .refine((val) => {
      const digits = (val || "").replace(/\D/g, "");

      if (!/^\d{11}$/.test(digits)) return false;
      // Reject CPFs with all identical digits
      if (/^(\d)\1{10}$/.test(digits)) return false;

      const calcCheckDigit = (cpfDigits: string, factorStart: number) => {
        let total = 0;
        for (let i = 0; i < cpfDigits.length; i++) {
          total += parseInt(cpfDigits.charAt(i), 10) * (factorStart - i);
        }
        const remainder = total % 11;
        return remainder < 2 ? 0 : 11 - remainder;
      };

      const firstNine = digits.substr(0, 9);
      const firstCheck = calcCheckDigit(firstNine, 10);
      if (firstCheck !== parseInt(digits.charAt(9), 10)) return false;

      const firstTen = digits.substr(0, 10);
      const secondCheck = calcCheckDigit(firstTen, 11);
      if (secondCheck !== parseInt(digits.charAt(10), 10)) return false;

      return true;
    }, "CPF inválido"),
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
  representativeName: z
    .string()
    .max(200, "Nome do representante deve ter no máximo 200 caracteres")
    .optional()
    .or(z.literal("")),
  representativeCpf: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => {
      if (!val || val.trim() === "") return true;
      const digits = val.replace(/\D/g, "");
      if (!/^\d{11}$/.test(digits)) return false;
      if (/^(\d)\1{10}$/.test(digits)) return false;

      const calcCheckDigit = (cpfDigits: string, factorStart: number) => {
        let total = 0;
        for (let i = 0; i < cpfDigits.length; i++) {
          total += parseInt(cpfDigits.charAt(i), 10) * (factorStart - i);
        }
        const remainder = total % 11;
        return remainder < 2 ? 0 : 11 - remainder;
      };

      const firstNine = digits.substr(0, 9);
      const firstCheck = calcCheckDigit(firstNine, 10);
      if (firstCheck !== parseInt(digits.charAt(9), 10)) return false;

      const firstTen = digits.substr(0, 10);
      const secondCheck = calcCheckDigit(firstTen, 11);
      if (secondCheck !== parseInt(digits.charAt(10), 10)) return false;

      return true;
    }, "CPF do representante inválido"),
  status: z.enum(["active", "inactive"]),
});

export type ClientFormValues = z.infer<typeof clientSchema>;
