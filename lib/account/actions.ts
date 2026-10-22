"use server";

import { refresh } from "next/cache";
import { getViewer } from "@/lib/auth/viewer";
import { companySchema } from "@/lib/customers/schema";
import { fieldErrors, formText, type FormState } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";

const profileSchema = companySchema;

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
