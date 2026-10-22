"use server";

import { redirect } from "next/navigation";
import { refresh, updateTag } from "next/cache";
import { z } from "zod";
import { authorize } from "@/lib/auth/viewer";
import { SWEETNESS, type Sweetness } from "@/lib/format";
import { fieldErrors, formText, type FormState } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/text";
import { dbMessage, FORBIDDEN } from "./errors";

const money = z.union([z.literal(""), z.coerce.number().min(0).max(99999)]);
const scale = z.union([z.literal(""), z.coerce.number().int().min(1).max(5)]);

const variantSchema = z
  .object({
    id: z.string().optional(),
    label: z.string().trim().min(1, "Informe o rótulo").max(60),
    volumeMl: z.union([z.literal(""), z.coerce.number().int().min(1).max(50000)]),
    sku: z.string().trim().max(40),
    price: money,
    promoPrice: money,
    stock: z.coerce.number().int().min(0).max(999999),
    active: z.boolean(),
  })
  .refine((variant) => variant.promoPrice === "" || variant.price === "" || variant.promoPrice < variant.price, {
    message: "O preço promocional deve ser menor que o preço",
    path: ["promoPrice"],
  });

const productSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(2, "Informe o nome").max(120),
  slug: z
    .string()
    .trim()
    .max(120)
    .regex(/^[a-z0-9]*(-[a-z0-9]+)*$/, "Use apenas letras minúsculas, números e hífens"),
  tagline: z.string().trim().max(160),
  description: z.string().trim().max(4000),
  categoryId: z.uuid("Escolha a categoria"),
  producerId: z.union([z.literal(""), z.uuid()]),
  country: z.string().trim().max(60),
  region: z.string().trim().max(80),
  grapes: z.array(z.string().trim().min(1).max(40)).max(12),
  pairing: z.array(z.string().trim().min(1).max(40)).max(12),
  sweetness: z.union([z.literal(""), z.enum(Object.keys(SWEETNESS) as [Sweetness, ...Sweetness[]])]),
  vintage: z.union([z.literal(""), z.coerce.number().int().min(1900).max(2100)]),
  alcohol: z.union([z.literal(""), z.coerce.number().min(0).max(25)]),
  servingTemp: z.string().trim().max(30),
  aromaNotes: z.string().trim().max(300),
  palateNotes: z.string().trim().max(300),
  body: scale,
  acidity: scale,
  tannin: scale,
  sweetnessLevel: scale,
  badge: z.string().trim().max(24),
  featured: z.boolean(),
  active: z.boolean(),
  variants: z.array(variantSchema).min(1, "Cadastre ao menos uma variação").max(30),
  images: z.array(z.object({ path: z.string().min(1).max(300), alt: z.string().max(160) })).max(12),
});

function json<T>(formData: FormData, key: string, fallback: T): T {
  try {
    return JSON.parse(formText(formData, key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}

const blank = <T>(value: T | "") => (value === "" ? null : value);

export async function saveProduct(_: FormState, formData: FormData): Promise<FormState> {
  if (!(await authorize("products.manage"))) return FORBIDDEN;

  const parsed = productSchema.safeParse({
    ...Object.fromEntries(
      [
        "id",
        "name",
        "slug",
        "tagline",
        "description",
        "categoryId",
        "producerId",
        "country",
        "region",
        "sweetness",
        "vintage",
        "alcohol",
        "servingTemp",
        "aromaNotes",
        "palateNotes",
        "body",
        "acidity",
        "tannin",
        "sweetnessLevel",
        "badge",
      ].map((key) => [key, formText(formData, key)]),
    ),
    featured: formData.get("featured") === "on",
    active: formData.get("active") === "on",
    grapes: json(formData, "grapes", []),
    pairing: json(formData, "pairing", []),
    variants: json(formData, "variants", []),
    images: json(formData, "images", []),
  });

  if (!parsed.success) {
    const errors = fieldErrors(parsed.error);
    return {
      errors,
      message: Object.keys(errors).some((key) => key.startsWith("variants")) ? "Revise as variações." : undefined,
    };
  }

  const product = parsed.data;
  const supabase = await createClient();
  const { data: id, error } = await supabase.rpc("admin_save_product", {
    payload: {
      id: product.id,
      product: {
        slug: product.slug || slugify(product.name),
        name: product.name,
        tagline: product.tagline || null,
        description: product.description || null,
        category_id: product.categoryId,
        producer_id: blank(product.producerId),
        country: product.country || null,
        region: product.region || null,
        grapes: product.grapes,
        pairing: product.pairing,
        sweetness: blank(product.sweetness),
        vintage: blank(product.vintage),
        alcohol: blank(product.alcohol),
        serving_temp: product.servingTemp || null,
        aroma_notes: product.aromaNotes || null,
        palate_notes: product.palateNotes || null,
        body: blank(product.body),
        acidity: blank(product.acidity),
        tannin: blank(product.tannin),
        sweetness_level: blank(product.sweetnessLevel),
        badge: product.badge || null,
        featured: product.featured,
        active: product.active,
      },
      variants: product.variants.map((variant) => ({
        id: variant.id ?? "",
        label: variant.label,
        volume_ml: variant.volumeMl,
        sku: variant.sku,
        price: variant.price,
        promo_price: variant.promoPrice,
        stock: variant.stock,
        active: variant.active,
      })),
      images: product.images,
    },
  });

  if (error) return dbMessage(error);

  updateTag("catalog");
  if (!product.id) redirect(`/admin/produtos/${id}?criado=1`);
  refresh();
  return { ok: true, message: "Produto salvo." };
}

export async function setProductFlag(
  productId: string,
  flag: "active" | "featured",
  value: boolean,
): Promise<FormState> {
  if (!(await authorize("products.manage"))) return FORBIDDEN;
  const supabase = await createClient();
  const changes = flag === "active" ? { active: value } : { featured: value };
  const { error } = await supabase.from("products").update(changes).eq("id", productId);
  if (error) return dbMessage(error);
  updateTag("catalog");
  return { ok: true };
}

export async function deleteProduct(productId: string): Promise<FormState> {
  if (!(await authorize("products.manage"))) return FORBIDDEN;
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) return dbMessage(error, "Não foi possível remover.");
  updateTag("catalog");
  refresh();
  return { ok: true, message: "Produto removido." };
}

export async function adjustStock(variantId: string, quantity: number): Promise<FormState> {
  if (!(await authorize("products.manage"))) return FORBIDDEN;
  if (!Number.isInteger(quantity) || quantity < 0 || quantity > 999999) return { message: "Quantidade inválida." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_adjust_stock", { variant: variantId, quantity });
  if (error) return dbMessage(error);
  updateTag("catalog");
  return { ok: true, message: "Estoque atualizado." };
}
