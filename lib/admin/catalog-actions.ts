"use server";

import { refresh, updateTag } from "next/cache";
import { z } from "zod";
import { authorize } from "@/lib/auth/viewer";
import { fieldErrors, formText, type FormState } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/text";
import { dbMessage, FORBIDDEN, optional } from "./errors";

const id = z
  .uuid()
  .optional()
  .or(z.literal("").transform(() => undefined));
const slug = z
  .string()
  .trim()
  .max(80)
  .regex(/^[a-z0-9]*(-[a-z0-9]+)*$/, "Use apenas letras minúsculas, números e hífens");

const categorySchema = z.object({
  id,
  name: z.string().trim().min(2, "Informe o nome").max(60),
  slug,
  description: z.string().trim().max(240),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida"),
  imagePath: z.string().max(300),
  position: z.coerce.number().int().min(0).max(999),
});

const producerSchema = z.object({
  id,
  name: z.string().trim().min(2, "Informe o nome").max(80),
  slug,
  country: z.string().trim().max(60),
  region: z.string().trim().max(80),
  description: z.string().trim().max(600),
});

const bannerSchema = z
  .object({
    id,
    eyebrow: z.string().trim().max(40),
    title: z.string().trim().min(2, "Informe o título").max(90),
    subtitle: z.string().trim().max(220),
    ctaLabel: z.string().trim().max(30),
    ctaHref: z
      .string()
      .trim()
      .max(300)
      .refine(
        (value) => value === "" || value.startsWith("/") || /^https:\/\//.test(value),
        "Use um caminho do site ou link https",
      ),
    imagePath: z.string().max(300),
    theme: z.enum(["wine", "navy", "gold"]),
    position: z.coerce.number().int().min(0).max(999),
    startsAt: z.string().trim(),
    endsAt: z.string().trim(),
  })
  .refine((banner) => !banner.startsAt || !banner.endsAt || banner.endsAt > banner.startsAt, {
    path: ["endsAt"],
    message: "O fim precisa ser depois do início",
  });

function read<T extends string>(formData: FormData, keys: readonly T[]) {
  return Object.fromEntries(keys.map((key) => [key, formText(formData, key)])) as Record<T, string>;
}

function invalidate(...tags: string[]) {
  tags.forEach((tag) => updateTag(tag));
  refresh();
}

const toTimestamp = (value: string) => (value ? new Date(`${value}:00-03:00`).toISOString() : null);

export async function saveCategory(_: FormState, formData: FormData): Promise<FormState> {
  if (!(await authorize("catalog.manage"))) return FORBIDDEN;
  const parsed = categorySchema.safeParse(
    read(formData, ["id", "name", "slug", "description", "accent", "imagePath", "position"] as const),
  );
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const { id, name, description, accent, imagePath, position } = parsed.data;
  const record = {
    name,
    slug: parsed.data.slug || slugify(name),
    description: optional(description),
    accent: accent.toLowerCase(),
    image_path: optional(imagePath),
    position,
  };

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("categories").update(record).eq("id", id)
    : await supabase.from("categories").insert(record);
  if (error) return dbMessage(error);

  invalidate("catalog");
  return { ok: true, message: id ? "Categoria atualizada." : "Categoria criada." };
}

export async function setCategoryActive(categoryId: string, active: boolean): Promise<FormState> {
  if (!(await authorize("catalog.manage"))) return FORBIDDEN;
  const supabase = await createClient();
  const { error } = await supabase.from("categories").update({ active }).eq("id", categoryId);
  if (error) return dbMessage(error);
  invalidate("catalog");
  return { ok: true, message: active ? "Categoria visível na loja." : "Categoria oculta da loja." };
}

export async function deleteCategory(categoryId: string): Promise<FormState> {
  if (!(await authorize("catalog.manage"))) return FORBIDDEN;
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", categoryId);
  if (error) return dbMessage(error, "Não foi possível remover.");
  invalidate("catalog");
  return { ok: true, message: "Categoria removida." };
}

export async function saveProducer(_: FormState, formData: FormData): Promise<FormState> {
  if (!(await authorize("catalog.manage"))) return FORBIDDEN;
  const parsed = producerSchema.safeParse(
    read(formData, ["id", "name", "slug", "country", "region", "description"] as const),
  );
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const { id, name, country, region, description } = parsed.data;
  const record = {
    name,
    slug: parsed.data.slug || slugify(name),
    country: optional(country),
    region: optional(region),
    description: optional(description),
  };

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("producers").update(record).eq("id", id)
    : await supabase.from("producers").insert(record);
  if (error) return dbMessage(error);

  invalidate("catalog");
  return { ok: true, message: id ? "Vinícola atualizada." : "Vinícola criada." };
}

export async function setProducerActive(producerId: string, active: boolean): Promise<FormState> {
  if (!(await authorize("catalog.manage"))) return FORBIDDEN;
  const supabase = await createClient();
  const { error } = await supabase.from("producers").update({ active }).eq("id", producerId);
  if (error) return dbMessage(error);
  invalidate("catalog");
  return { ok: true };
}

export async function deleteProducer(producerId: string): Promise<FormState> {
  if (!(await authorize("catalog.manage"))) return FORBIDDEN;
  const supabase = await createClient();
  const { error } = await supabase.from("producers").delete().eq("id", producerId);
  if (error) return dbMessage(error, "Não foi possível remover.");
  invalidate("catalog");
  return { ok: true, message: "Vinícola removida." };
}

export async function saveBanner(_: FormState, formData: FormData): Promise<FormState> {
  if (!(await authorize("catalog.manage"))) return FORBIDDEN;
  const parsed = bannerSchema.safeParse(
    read(formData, [
      "id",
      "eyebrow",
      "title",
      "subtitle",
      "ctaLabel",
      "ctaHref",
      "imagePath",
      "theme",
      "position",
      "startsAt",
      "endsAt",
    ] as const),
  );
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const banner = parsed.data;
  const record = {
    eyebrow: optional(banner.eyebrow),
    title: banner.title,
    subtitle: optional(banner.subtitle),
    cta_label: optional(banner.ctaLabel),
    cta_href: optional(banner.ctaHref),
    image_path: optional(banner.imagePath),
    theme: banner.theme,
    position: banner.position,
    starts_at: toTimestamp(banner.startsAt),
    ends_at: toTimestamp(banner.endsAt),
  };

  const supabase = await createClient();
  const { error } = banner.id
    ? await supabase.from("banners").update(record).eq("id", banner.id)
    : await supabase.from("banners").insert(record);
  if (error) return dbMessage(error);

  invalidate("banners");
  return { ok: true, message: banner.id ? "Banner atualizado." : "Banner criado." };
}

export async function setBannerActive(bannerId: string, active: boolean): Promise<FormState> {
  if (!(await authorize("catalog.manage"))) return FORBIDDEN;
  const supabase = await createClient();
  const { error } = await supabase.from("banners").update({ active }).eq("id", bannerId);
  if (error) return dbMessage(error);
  invalidate("banners");
  return { ok: true };
}

export async function deleteBanner(bannerId: string): Promise<FormState> {
  if (!(await authorize("catalog.manage"))) return FORBIDDEN;
  const supabase = await createClient();
  const { error } = await supabase.from("banners").delete().eq("id", bannerId);
  if (error) return dbMessage(error, "Não foi possível remover.");
  invalidate("banners");
  return { ok: true, message: "Banner removido." };
}
