import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { stripAccents } from "@/lib/text";
import { PAGE_SIZE, type CatalogFilters } from "./filters";
import { CARD_COLUMNS, toCard, withoutPrices, type CardRow } from "./mappers";
import type { Banner, CatalogOverview, Category, Facet, ProductDetail, StoreSettings } from "./types";

function countBy(values: string[]): Facet[] {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value, "pt-BR"));
}

function escapeLike(term: string) {
  return term.replace(/[\\%_]/g, (char) => `\\${char}`);
}

export async function getStoreSettings(): Promise<StoreSettings> {
  "use cache";
  cacheLife("days");
  cacheTag("settings");

  const { data } = await createPublicClient().from("store_settings").select("*").eq("id", 1).maybeSingle();

  return {
    storeName: data?.store_name ?? "Moraes Comercial",
    whatsapp: data?.whatsapp ?? null,
    phone: data?.phone ?? null,
    email: data?.email ?? null,
    instagram: data?.instagram ?? null,
    address: data?.address ?? null,
    about: data?.about ?? null,
    showPrices: data?.show_prices ?? true,
  };
}

async function toCards(rows: CardRow[] | null) {
  const { showPrices } = await getStoreSettings();
  const cards = (rows ?? []).map((row) => toCard(row));
  return showPrices ? cards : cards.map(withoutPrices);
}

export async function getCatalogOverview(): Promise<CatalogOverview> {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");

  const supabase = createPublicClient();
  const [{ data: categories }, { data: rows }] = await Promise.all([
    supabase.from("categories").select("id, slug, name, description, accent, image_path").order("position"),
    supabase
      .from("catalog_products")
      .select("category_slug, country, grapes, producer_id, image_path, featured")
      .eq("active", true)
      .order("featured", { ascending: false })
      .order("total_stock", { ascending: false }),
  ]);

  const products = rows ?? [];
  const perCategory = countBy(products.map((row) => row.category_slug!));

  return {
    categories: (categories ?? []).map((category): Category => ({
      id: category.id,
      slug: category.slug,
      name: category.name,
      description: category.description,
      accent: category.accent,
      imagePath: category.image_path,
      count: perCategory.find((facet) => facet.value === category.slug)?.count ?? 0,
      cover: products.find((row) => row.category_slug === category.slug && row.image_path)?.image_path ?? null,
    })),
    countries: countBy(products.flatMap((row) => (row.country ? [row.country] : []))),
    grapes: countBy(products.flatMap((row) => row.grapes ?? [])),
    producers: new Set(products.map((row) => row.producer_id).filter(Boolean)).size,
    products: products.length,
  };
}

export async function searchCatalog(filters: CatalogFilters) {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");

  let query = createPublicClient().from("catalog_products").select(CARD_COLUMNS, { count: "exact" }).eq("active", true);

  if (filters.categoria) query = query.eq("category_slug", filters.categoria);
  if (filters.pais) query = query.eq("country", filters.pais);
  if (filters.uva) query = query.contains("grapes", [filters.uva]);
  if (filters.docura) query = query.eq("sweetness", filters.docura);
  if (filters.min !== undefined) query = query.gte("min_price", filters.min);
  if (filters.max !== undefined) query = query.lte("min_price", filters.max);
  if (filters.busca) {
    for (const term of stripAccents(filters.busca).toLowerCase().split(/\s+/).filter(Boolean).slice(0, 5)) {
      query = query.ilike("search_text", `%${escapeLike(term)}%`);
    }
  }

  switch (filters.ordem) {
    case "menor-preco":
      query = query.order("min_price", { ascending: true, nullsFirst: false });
      break;
    case "maior-preco":
      query = query.order("min_price", { ascending: false, nullsFirst: false });
      break;
    case "novidades":
      query = query.order("created_at", { ascending: false });
      break;
    case "nome":
      query = query.order("name");
      break;
    default:
      query = query.order("featured", { ascending: false }).order("total_stock", { ascending: false });
  }

  const { data, count, error } = await query.order("id").range(0, filters.pagina * PAGE_SIZE - 1);
  if (error) throw error;

  return { items: await toCards(data), total: count ?? 0 };
}

export async function getFeaturedProducts(limit = 10) {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");

  const { data } = await createPublicClient()
    .from("catalog_products")
    .select(CARD_COLUMNS)
    .eq("active", true)
    .eq("featured", true)
    .order("min_price", { ascending: false })
    .limit(limit);

  return toCards(data);
}

export async function getProductsByBadge(badge: string, limit = 8) {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");

  const { data } = await createPublicClient()
    .from("catalog_products")
    .select(CARD_COLUMNS)
    .eq("active", true)
    .eq("badge", badge)
    .order("name")
    .limit(limit);

  return toCards(data);
}

export async function getProductsOnSale(limit = 8) {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");

  const { data } = await createPublicClient()
    .from("catalog_products")
    .select(CARD_COLUMNS)
    .eq("active", true)
    .gt("total_stock", 0)
    .not("min_price", "is", null)
    .order("min_regular_price", { ascending: false })
    .limit(60);

  return (await toCards(data))
    .filter((product) => product.price != null && product.regularPrice != null && product.price < product.regularPrice)
    .slice(0, limit);
}

export async function getNewestProducts(limit = 8) {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");

  const { data } = await createPublicClient()
    .from("catalog_products")
    .select(CARD_COLUMNS)
    .eq("active", true)
    .gt("total_stock", 0)
    .order("created_at", { ascending: false })
    .order("name", { ascending: false })
    .limit(limit);

  return toCards(data);
}

export async function getRelatedProducts(categorySlug: string, excludeId: string, limit = 8) {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");

  const { data } = await createPublicClient()
    .from("catalog_products")
    .select(CARD_COLUMNS)
    .eq("active", true)
    .eq("category_slug", categorySlug)
    .neq("id", excludeId)
    .order("featured", { ascending: false })
    .order("total_stock", { ascending: false })
    .limit(limit);

  return toCards(data);
}

export async function getProductSlugs() {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");

  const { data } = await createPublicClient().from("products").select("slug").eq("active", true);
  return (data ?? []).map((row) => row.slug);
}

export async function getProduct(slug: string): Promise<ProductDetail | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog", `product:${slug}`);

  const supabase = createPublicClient();
  const [{ data: product }, { data: card }] = await Promise.all([
    supabase
      .from("products")
      .select(
        `id, description, sweetness, vintage, alcohol, serving_temp, pairing, aroma_notes, palate_notes,
         body, acidity, tannin, sweetness_level,
         producer:producers(slug),
         product_images(path, alt, position),
         product_variants(id, label, volume_ml, price, promo_price, stock, position)`,
      )
      .eq("slug", slug)
      .eq("active", true)
      .order("position", { referencedTable: "product_images" })
      .order("position", { referencedTable: "product_variants" })
      .maybeSingle(),
    supabase.from("catalog_products").select(CARD_COLUMNS).eq("slug", slug).eq("active", true).maybeSingle(),
  ]);

  if (!product || !card) return null;
  const [summary] = await toCards([card]);
  const { showPrices } = await getStoreSettings();

  return {
    ...summary,
    description: product.description,
    sweetness: product.sweetness,
    vintage: product.vintage,
    alcohol: product.alcohol,
    servingTemp: product.serving_temp,
    pairing: product.pairing,
    aromaNotes: product.aroma_notes,
    palateNotes: product.palate_notes,
    profile: {
      body: product.body,
      acidity: product.acidity,
      tannin: product.tannin,
      sweetness: product.sweetness_level,
    },
    images: product.product_images.map(({ path, alt }) => ({ path, alt })),
    variants: product.product_variants.map((variant) => ({
      id: variant.id,
      label: variant.label,
      volumeMl: variant.volume_ml,
      price: showPrices ? variant.price : null,
      promoPrice: showPrices ? variant.promo_price : null,
      stock: variant.stock,
    })),
    producerSlug: product.producer?.slug ?? null,
  };
}

export async function getProducerNames() {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");

  const { data } = await createPublicClient().from("producers").select("name").eq("active", true).order("name");
  return (data ?? []).map((row) => row.name);
}

export async function getBanners(): Promise<Banner[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("banners");

  const { data } = await createPublicClient()
    .from("banners")
    .select("id, eyebrow, title, subtitle, cta_label, cta_href, image_path, theme")
    .order("position");

  return (data ?? []).map((banner) => ({
    id: banner.id,
    eyebrow: banner.eyebrow,
    title: banner.title,
    subtitle: banner.subtitle,
    ctaLabel: banner.cta_label,
    ctaHref: banner.cta_href,
    imagePath: banner.image_path,
    theme: banner.theme as Banner["theme"],
  }));
}
