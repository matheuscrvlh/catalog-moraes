"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { getViewer, isStaff } from "@/lib/auth/viewer";
import { fieldErrors, formText, type FormState } from "@/lib/forms";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";

const EXPIRED: FormState = { message: "Sua sessão expirou. Entre novamente." };

const detailsSchema = z.object({
  fullName: z.string().trim().min(3, "Informe o nome").max(120),
  phone: z
    .string()
    .trim()
    .regex(/^[\d\s()+-]{10,20}$/, "Informe um telefone com DDD")
    .or(z.literal("")),
});

export async function updateOwnDetails(_: FormState, formData: FormData): Promise<FormState> {
  const viewer = await getViewer();
  if (!isStaff(viewer)) return EXPIRED;
  const parsed = detailsSchema.safeParse({
    fullName: formText(formData, "fullName"),
    phone: formText(formData, "phone"),
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.fullName, phone: parsed.data.phone || null })
    .eq("id", viewer.id);
  if (error) return { message: "Não foi possível salvar agora." };

  refresh();
  return { ok: true, message: "Seus dados foram atualizados." };
}

const accessSchema = z
  .object({
    email: z.email("E-mail inválido").max(160),
    password: z.union([z.literal(""), z.string().min(8, "Use ao menos 8 caracteres").max(72)]),
    confirm: z.string().max(72),
    current: z.string().min(1, "Confirme com sua senha atual").max(72),
  })
  .refine((data) => data.password === data.confirm, { path: ["confirm"], message: "As senhas não conferem" });

export async function updateOwnAccess(_: FormState, formData: FormData): Promise<FormState> {
  const viewer = await getViewer();
  if (!isStaff(viewer)) return EXPIRED;
  const parsed = accessSchema.safeParse({
    email: formText(formData, "email").toLowerCase(),
    password: formData.get("password") ?? "",
    confirm: formData.get("confirm") ?? "",
    current: formData.get("current") ?? "",
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const { email, password, current } = parsed.data;
  const emailChanged = email !== viewer.email;
  if (!emailChanged && !password) return { message: "Nada para alterar: informe um novo e-mail ou uma nova senha." };

  const { error: wrong } = await createPublicClient().auth.signInWithPassword({
    email: viewer.email,
    password: current,
  });
  if (wrong) return { errors: { current: "Senha atual incorreta" } };

  const { error } = await createAdminClient().auth.admin.updateUserById(viewer.id, {
    ...(emailChanged && { email, email_confirm: true }),
    ...(password && { password }),
  });
  if (error) {
    return /already|exists|registered/i.test(error.message)
      ? { errors: { email: "Já existe um cadastro com este e-mail" } }
      : { message: "Não foi possível atualizar o acesso agora." };
  }

  refresh();
  if (emailChanged && password) return { ok: true, message: "E-mail e senha atualizados." };
  return { ok: true, message: emailChanged ? "E-mail de acesso atualizado." : "Senha alterada." };
}
