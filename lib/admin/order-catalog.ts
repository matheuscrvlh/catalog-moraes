import "server-only";
import { createClient } from "@/lib/supabase/server";

export type OrderVariant = { id: string; label: string; price: number | null; stock: number };

export type OrderProduct = {
  id: string;
  name: string;
  producer: string | null;
  country: string | null;
  grapes: string[];
  category: { slug: string; name: string; accent: string; position: number };
  imagePath: string | null;
  variants: OrderVariant[];
};

export async function getOrderCatalog(): Promise<OrderProduct[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(
      `id, name, country, grapes,
       category:categories(slug, name, accent, position),
       producer:producers(name),
       product_images(path, position),
       product_variants(id, label, price, promo_price, stock, active, position)`,
    )
    .eq("active", true)
    .order("name");

  return (data ?? []).flatMap((product) => {
    const variants = [...product.product_variants]
      .filter((variant) => variant.active)
      .sort((a, b) => a.position - b.position)
      .map((variant) => ({
        id: variant.id,
        label: variant.label,
        price: variant.promo_price ?? variant.price,
        stock: variant.stock,
      }));
    if (!variants.length || !product.category) return [];

    return [
      {
        id: product.id,
        name: product.name,
        producer: product.producer?.name ?? null,
        country: product.country,
        grapes: product.grapes,
        category: product.category,
        imagePath: [...product.product_images].sort((a, b) => a.position - b.position)[0]?.path ?? null,
        variants,
      },
    ];
  });
}
