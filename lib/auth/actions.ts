"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { landingFor } from "@/lib/admin/nav";
import { env } from "@/lib/env";
import { BUSINESS_TYPES, type BusinessType } from "@/lib/format";
import { fieldErrors, formText, safeRedirectPath, type FormState } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";

const credentials = z.object({
  email: z.email("Informe um e-mail válido").max(160),
  password: z.string().min(1, "Informe a senha").max(72),
});

const signUpSchema = z.object({
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
  email: z.email("Informe um e-mail válido").max(160),
  password: z.string().min(8, "A senha precisa ter ao menos 8 caracteres").max(72),
});

function authMessage(message: string) {
  if (/invalid login credentials/i.test(message)) return "E-mail ou senha incorretos.";
  if (/email not confirmed/i.test(message)) return "Confirme seu e-mail antes de entrar.";
  if (/already registered|already exists/i.test(message)) return "Este e-mail já possui cadastro.";
  if (/rate limit|too many/i.test(message)) return "Muitas tentativas. Aguarde alguns minutos.";
  return "Não foi possível concluir agora. Tente novamente.";
}

export async function signIn(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = credentials.safeParse({ email: formText(formData, "email"), password: formData.get("password") });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { message: authMessage(error.message) };

  redirect(safeRedirectPath(formData.get("next"), "/conta"));
}

export async function signUp(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = signUpSchema.safeParse({
    companyName: formText(formData, "companyName"),
    taxId: formText(formData, "taxId"),
    businessType: formText(formData, "businessType"),
    fullName: formText(formData, "fullName"),
    phone: formText(formData, "phone"),
    email: formText(formData, "email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const { companyName, taxId, businessType, fullName, phone, email, password } = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, phone, company_name: companyName, tax_id: taxId, business_type: businessType },
      emailRedirectTo: `${env.siteUrl}/auth/confirmar`,
    },
  });
  if (error) return { message: authMessage(error.message) };

  if (!data.session) {
    return { ok: true, message: "Enviamos um link de confirmação para o seu e-mail. Confirme para entrar." };
  }

  redirect(safeRedirectPath(formData.get("next"), "/conta"));
}

export async function signInStaff(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = credentials.safeParse({ email: formText(formData, "email"), password: formData.get("password") });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { message: authMessage(error.message) };

  const { data: profile } = await supabase
    .from("profiles")
    .select("active, role:roles(permissions)")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile?.active || !profile.role) {
    await supabase.auth.signOut();
    return { message: "Este acesso não tem permissão para o painel." };
  }

  redirect(safeRedirectPath(formData.get("next"), landingFor(profile.role.permissions)));
}

export async function signOut(formData: FormData) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(safeRedirectPath(formData.get("next"), "/"));
}
