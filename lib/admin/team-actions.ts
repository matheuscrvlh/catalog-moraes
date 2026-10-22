"use server";

import { refresh, updateTag } from "next/cache";
import { z } from "zod";
import { authorize } from "@/lib/auth/viewer";
import { PERMISSION_KEYS, type Grant } from "@/lib/auth/permissions";
import { fieldErrors, formText, type FormState } from "@/lib/forms";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { dbMessage, FORBIDDEN } from "./errors";

const memberSchema = z.object({
  fullName: z.string().trim().min(3, "Informe o nome").max(120),
  email: z.email("E-mail inválido").max(160),
  password: z.string().max(72),
  roleId: z.uuid("Escolha um cargo"),
});

export async function inviteMember(_: FormState, formData: FormData): Promise<FormState> {
  if (!(await authorize("users.manage"))) return FORBIDDEN;
  const parsed = memberSchema.safeParse({
    fullName: formText(formData, "fullName"),
    email: formText(formData, "email").toLowerCase(),
    password: formData.get("password") ?? "",
    roleId: formText(formData, "roleId"),
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const { fullName, email, password, roleId } = parsed.data;
  const supabase = await createClient();
  const { data: existing } = await supabase.from("profiles").select("id").eq("email", email).maybeSingle();
  let userId = existing?.id;

  if (!userId) {
    if (password.length < 8) return { errors: { password: "Defina uma senha inicial com ao menos 8 caracteres" } };
    const { data, error } = await createAdminClient().auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (error || !data.user) return { message: "Não foi possível criar o acesso. Verifique o e-mail." };
    userId = data.user.id;
  }

  const { error } = await supabase.rpc("admin_update_member", { target: userId, new_role: roleId, is_active: true });
  if (error) return dbMessage(error);

  refresh();
  return { ok: true, message: existing ? "Cargo atribuído ao usuário existente." : "Membro adicionado." };
}

export async function updateMember(memberId: string, roleId: string | null, active: boolean): Promise<FormState> {
  if (!(await authorize("users.manage"))) return FORBIDDEN;
  if (!z.uuid().safeParse(memberId).success || (roleId && !z.uuid().safeParse(roleId).success)) {
    return { message: "Dados inválidos." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_update_member", {
    target: memberId,
    new_role: roleId as string,
    is_active: active,
  });
  if (error) return dbMessage(error);

  refresh();
  return { ok: true, message: roleId ? "Acesso atualizado." : "Acesso ao painel removido." };
}

const roleSchema = z.object({
  id: z.union([z.literal(""), z.uuid()]),
  name: z.string().trim().min(2, "Informe o nome").max(60),
  description: z.string().trim().max(200),
  permissions: z.array(z.enum(["*", ...PERMISSION_KEYS] as [Grant, ...Grant[]])).max(20),
});

export async function saveRole(_: FormState, formData: FormData): Promise<FormState> {
  if (!(await authorize("roles.manage"))) return FORBIDDEN;
  const parsed = roleSchema.safeParse({
    id: formText(formData, "id"),
    name: formText(formData, "name"),
    description: formText(formData, "description"),
    permissions: formData.getAll("permissions").map(String),
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const { id, name, description, permissions } = parsed.data;
  const supabase = await createClient();
  const record = { name, description: description || null, permissions };
  const { error } = id
    ? await supabase.from("roles").update(record).eq("id", id)
    : await supabase.from("roles").insert(record);
  if (error) return dbMessage(error);

  refresh();
  return { ok: true, message: id ? "Cargo atualizado." : "Cargo criado." };
}

export async function deleteRole(roleId: string): Promise<FormState> {
  if (!(await authorize("roles.manage"))) return FORBIDDEN;
  const supabase = await createClient();
  const { error } = await supabase.from("roles").delete().eq("id", roleId);
  if (error) return dbMessage(error, "Não foi possível remover.");
  refresh();
  return { ok: true, message: "Cargo removido." };
}

const settingsSchema = z.object({
  storeName: z.string().trim().min(2, "Informe o nome da loja").max(80),
  whatsapp: z
    .string()
    .trim()
    .regex(/^\d{12,13}$/, "Use DDI + DDD + número, só dígitos. Ex.: 5522992358186")
    .or(z.literal("")),
  phone: z.string().trim().max(30),
  email: z.email("E-mail inválido").or(z.literal("")),
  instagram: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9._]*$/, "Informe só o usuário, sem @")
    .max(30),
  address: z.string().trim().max(200),
  about: z.string().trim().max(400),
});

export async function saveSettings(_: FormState, formData: FormData): Promise<FormState> {
  if (!(await authorize("settings.manage"))) return FORBIDDEN;
  const parsed = settingsSchema.safeParse(
    Object.fromEntries(
      ["storeName", "whatsapp", "phone", "email", "instagram", "address", "about"].map((key) => [
        key,
        formText(formData, key),
      ]),
    ),
  );
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const settings = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("store_settings")
    .update({
      store_name: settings.storeName,
      whatsapp: settings.whatsapp || null,
      phone: settings.phone || null,
      email: settings.email || null,
      instagram: settings.instagram || null,
      address: settings.address || null,
      about: settings.about || null,
    })
    .eq("id", 1);
  if (error) return dbMessage(error);

  updateTag("settings");
  return { ok: true, message: "Configurações salvas." };
}

export async function setStorePrices(visible: boolean): Promise<FormState> {
  if (!(await authorize("settings.manage"))) return FORBIDDEN;
  const supabase = await createClient();
  const { error } = await supabase
    .from("store_settings")
    .update({ show_prices: z.boolean().parse(visible) })
    .eq("id", 1);
  if (error) return dbMessage(error);

  updateTag("settings");
  updateTag("catalog");
  return { ok: true, message: visible ? "Preços visíveis na loja." : "Preços ocultos na loja." };
}
