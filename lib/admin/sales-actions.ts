"use server";

import { randomBytes } from "node:crypto";
import { refresh } from "next/cache";
import { z } from "zod";
import { authorize } from "@/lib/auth/viewer";
import { COMPANY_FIELDS, companySchema } from "@/lib/customers/schema";
import { fieldErrors, formText, type FormState } from "@/lib/forms";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { stripAccents } from "@/lib/text";
import { FORBIDDEN } from "./errors";

const customerSchema = companySchema.extend({
  email: z.email("Informe um e-mail válido").max(160),
  password: z.union([z.literal(""), z.string().min(8, "Use ao menos 8 caracteres").max(72)]),
});

export async function createCustomer(_: FormState, formData: FormData): Promise<FormState> {
  if (!(await authorize("orders.manage"))) return FORBIDDEN;
  const parsed = customerSchema.safeParse({
    ...Object.fromEntries(COMPANY_FIELDS.map((key) => [key, formText(formData, key)])),
    email: formText(formData, "email").toLowerCase(),
    password: formData.get("password") ?? "",
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const { email, password, companyName, taxId, businessType, fullName, phone } = parsed.data;
  const { error } = await createAdminClient().auth.admin.createUser({
    email,
    password: password || randomBytes(24).toString("base64url"),
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      phone,
      company_name: companyName,
      tax_id: taxId,
      business_type: businessType,
    },
  });
  if (error) {
    return /already|exists|registered/i.test(error.message)
      ? { errors: { email: "Já existe um cadastro com este e-mail" } }
      : { message: "Não foi possível cadastrar o cliente agora." };
  }

  refresh();
  return { ok: true, message: `${companyName} cadastrada.` };
}

export type CustomerOption = { id: string; company: string; contact: string; email: string };

export async function searchCustomers(term: string): Promise<CustomerOption[]> {
  if (!(await authorize("customers.view"))) return [];
  const clean = term
    .replace(/[\\%_,()]/g, "")
    .trim()
    .slice(0, 60);

  const supabase = await createClient();
  let query = supabase
    .from("customer_summaries")
    .select("id, company_name, full_name, email, tax_id")
    .eq("active", true);
  if (clean) {
    const like = `%${clean}%`;
    const digits = clean.replace(/\D/g, "");
    query = query.or(
      [`company_name.ilike.${like}`, `full_name.ilike.${like}`, `email.ilike.${like}`]
        .concat(digits.length >= 3 ? [`tax_id.ilike.%${digits}%`] : [])
        .join(","),
    );
  }
  const { data } = await query.order("company_name", { nullsFirst: false }).limit(8);

  return (data ?? []).map((row) => ({
    id: row.id!,
    company: row.company_name || row.full_name || row.email || "Sem nome",
    contact: row.full_name ?? "",
    email: row.email ?? "",
  }));
}

export type VariantOption = {
  id: string;
  product: string;
  producer: string | null;
  label: string;
  price: number | null;
  stock: number;
  imagePath: string | null;
};

export async function searchVariants(term: string): Promise<VariantOption[]> {
  if (!(await authorize("orders.manage"))) return [];
  const words = stripAccents(term).toLowerCase().split(/\s+/).filter(Boolean).slice(0, 5);
  if (!words.length) return [];

  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select(
      "name, producer:producers(name), product_images(path, position), product_variants(id, label, price, promo_price, stock, active, position)",
    )
    .eq("active", true);
  for (const word of words) query = query.ilike("search_text", `%${word.replace(/[\\%_]/g, "")}%`);
  const { data } = await query.order("name").limit(10);

  return (data ?? []).flatMap((product) => {
    const image = [...product.product_images].sort((a, b) => a.position - b.position)[0]?.path ?? null;
    return [...product.product_variants]
      .filter((variant) => variant.active)
      .sort((a, b) => a.position - b.position)
      .map((variant) => ({
        id: variant.id,
        product: product.name,
        producer: product.producer?.name ?? null,
        label: variant.label,
        price: variant.promo_price ?? variant.price,
        stock: variant.stock,
        imagePath: image,
      }));
  });
}

const staffOrderSchema = z.object({
  customerId: z.uuid("Escolha o cliente"),
  items: z
    .array(z.object({ variantId: z.uuid(), quantity: z.number().int().min(1).max(999) }))
    .min(1, "Adicione ao menos um produto")
    .max(50, "Limite de 50 itens por pedido"),
  notes: z.string().trim().max(500),
});

export type StaffOrderResult = { ok: true; id: string } | { ok: false; message: string };

export async function createStaffOrder(input: z.input<typeof staffOrderSchema>): Promise<StaffOrderResult> {
  if (!(await authorize("orders.manage"))) return { ok: false, message: FORBIDDEN.message! };
  const parsed = staffOrderSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Revise o pedido." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_create_order", {
    customer: parsed.data.customerId,
    items: parsed.data.items.map((item) => ({ variant_id: item.variantId, quantity: item.quantity })),
    notes: parsed.data.notes,
  });

  if (error || !data?.[0]) {
    const known = error && ["P0002", "42501", "22023"].includes(error.code ?? "");
    return { ok: false, message: known ? error.message : "Não foi possível criar o pedido agora." };
  }

  refresh();
  return { ok: true, id: data[0].order_id };
}
