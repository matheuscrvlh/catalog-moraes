"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { getViewer } from "@/lib/auth/viewer";
import { BUSINESS_TYPES, type BusinessType } from "@/lib/format";
import { fieldErrors, formText, type FormState } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";

const profileSchema = z.object({
  fullName: z.string().trim().min(3, "Informe o nome do responsável").max(120),
  phone: z
    .string()
    .trim()
    .regex(/^[\d\s()+-]{10,20}$/, "Informe um telefone com DDD"),
  companyName: z.string().trim().min(2, "Informe o nome da empresa").max(120),
  taxId: z
    .string()
    .transform((value) => value.replace(/\D/g, ""))
    .refine((value) => value.length === 14 || value.length === 11, "Informe um CNPJ (ou CPF) válido"),
  businessType: z.enum(Object.keys(BUSINESS_TYPES) as [BusinessType, ...BusinessType[]], {
    error: "Escolha o tipo de negócio",
  }),
});

export async function updateProfile(_: FormState, formData: FormData): Promise<FormState> {
  const viewer = await getViewer();
  if (!viewer) return { message: "Sua sessão expirou. Entre novamente." };

  const parsed = profileSchema.safeParse(
    Object.fromEntries(
      ["fullName", "phone", "companyName", "taxId", "businessType"].map((key) => [key, formText(formData, key)]),
    ),
  );
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const { fullName, phone, companyName, taxId, businessType } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, phone, company_name: companyName, tax_id: taxId, business_type: businessType })
    .eq("id", viewer.id);

  if (error) return { message: "Não foi possível salvar agora." };
  refresh();
  return { ok: true, message: "Dados atualizados." };
}
