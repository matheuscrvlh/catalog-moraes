import type { Database } from "@/lib/supabase/database.types";
import type { ProductCard } from "./types";

type CatalogRow = Database["public"]["Views"]["catalog_products"]["Row"];

export const CARD_COLUMNS =
  "id, slug, name, tagline, country, region, grapes, badge, category_slug, category_name, category_accent, producer_name, image_path, min_price, min_regular_price, total_stock, variant_count, default_variant_id, default_variant_label, default_variant_price";

export type CardRow = Pick<
  CatalogRow,
  | "id"
  | "slug"
  | "name"
  | "tagline"
  | "country"
  | "region"
  | "grapes"
  | "badge"
  | "category_slug"
  | "category_name"
  | "category_accent"
  | "producer_name"
  | "image_path"
  | "min_price"
  | "min_regular_price"
  | "total_stock"
  | "variant_count"
  | "default_variant_id"
  | "default_variant_label"
  | "default_variant_price"
>;

export function toCard(row: CardRow): ProductCard {
  return {
    id: row.id!,
    slug: row.slug!,
    name: row.name!,
    tagline: row.tagline,
    producer: row.producer_name,
    country: row.country,
    region: row.region,
    grapes: row.grapes ?? [],
    badge: row.badge,
    categorySlug: row.category_slug!,
    categoryName: row.category_name!,
    accent: row.category_accent ?? "#7d1230",
    imagePath: row.image_path,
    price: row.min_price,
    regularPrice: row.min_regular_price,
    stock: row.total_stock ?? 0,
    variantCount: row.variant_count ?? 0,
    defaultVariant: row.default_variant_id
      ? { id: row.default_variant_id, label: row.default_variant_label!, price: row.default_variant_price }
      : null,
  };
}
