import { z } from "zod";
import { BUSINESS_TYPES, type BusinessType } from "@/lib/format";

export const companySchema = z.object({
  companyName: z.string().trim().min(2, "Informe o nome da empresa").max(120),
  taxId: z
    .string()
    .transform((value) => value.replace(/\D/g, ""))
    .refine((value) => value.length === 14 || value.length === 11, "Informe um CNPJ (ou CPF) válido"),
  businessType: z.enum(Object.keys(BUSINESS_TYPES) as [BusinessType, ...BusinessType[]], {
    error: "Escolha o tipo de negócio",
  }),
  fullName: z.string().trim().min(3, "Informe o nome do responsável").max(120),
  phone: z
    .string()
    .trim()
    .regex(/^[\d\s()+-]{10,20}$/, "Informe um telefone com DDD"),
});

export const COMPANY_FIELDS = ["companyName", "taxId", "businessType", "fullName", "phone"] as const;
