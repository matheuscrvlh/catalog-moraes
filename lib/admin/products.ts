import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ProductFormData } from "@/components/admin/product-form/product-form";

export async function getProductFormOptions() {
  const supabase = await createClient();
  const [{ data: categories }, { data: producers }, { data: grapes }] = await Promise.all([
    supabase.from("categories").select("id, name, accent").order("position"),
    supabase.from("producers").select("id, name, country, region").order("name"),
    supabase.from("products").select("grapes"),
  ]);

  const counts = new Map<string, number>();
  (grapes ?? []).flatMap((row) => row.grapes).forEach((grape) => counts.set(grape, (counts.get(grape) ?? 0) + 1));

  return {
    categories: categories ?? [],
    producers: producers ?? [],
    grapeSuggestions: [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([grape]) => grape),
  };
}

export async function getProductForForm(id: string): Promise<ProductFormData | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(
      `id, slug, name, tagline, description, category_id, producer_id, country, region, grapes, pairing, sweetness,
       vintage, alcohol, serving_temp, aroma_notes, palate_notes, body, acidity, tannin, sweetness_level, badge, featured, active,
       variants:product_variants(id, label, volume_ml, sku, price, promo_price, stock, active, position),
       images:product_images(path, alt, position)`,
    )
    .eq("id", id)
    .maybeSingle();

  if (!data) return null;
  return {
    ...data,
    variants: [...data.variants].sort((a, b) => a.position - b.position),
    images: [...data.images].sort((a, b) => a.position - b.position),
  };
}
