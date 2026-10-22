import Link from "next/link";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import type { ProductCard as Product } from "@/lib/catalog/types";
import { BottleImage } from "./bottle-image";
import { FavoriteButton, QuickAdd } from "./product-actions";

type Props = { product: Product; priority?: boolean; className?: string };

export function ProductCard({ product, priority, className }: Props) {
  const onSale = product.price != null && product.regularPrice != null && product.price < product.regularPrice;

  return (
    <article
      className={cn(
        "group relative flex flex-col bg-white transition duration-500 hover:shadow-[0_30px_60px_-35px_rgba(23,25,43,0.45)]",
        className,
      )}
    >
      <Link href={`/vinhos/${product.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-4/5 overflow-hidden bg-linen">
          <div
            className="absolute inset-x-[20%] bottom-[6%] h-[30%] rounded-[50%] opacity-0 blur-2xl transition duration-700 group-hover:opacity-40"
            style={{ background: product.accent }}
          />
          <BottleImage
            path={product.imagePath}
            alt={product.name}
            sizes="(min-width: 1280px) 20vw, (min-width: 768px) 30vw, 45vw"
            priority={priority}
            className="absolute inset-x-[18%] top-[8%] bottom-[8%] transition duration-700 ease-out-expo group-hover:-translate-y-2 group-hover:scale-[1.03]"
          />
          <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
            {onSale && (
              <span className="bg-red px-2 py-1 text-[9.5px] font-medium tracking-[0.18em] text-white uppercase">
                Oferta
              </span>
            )}
            {product.badge && (
              <span className="bg-white px-2 py-1 text-[9.5px] font-medium tracking-[0.18em] text-navy uppercase">
                {product.badge}
              </span>
            )}
          </div>
          {product.stock <= 0 && (
            <span className="absolute inset-x-0 bottom-0 bg-ink/70 py-1.5 text-center text-[10px] tracking-[0.2em] text-white uppercase">
              Esgotado
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col items-center px-4 pt-5 pb-4 text-center">
          <p className="truncate text-[10.5px] font-medium tracking-[0.22em] text-bronze uppercase">
            {product.producer ?? product.categoryName}
          </p>
          <h3 className="mt-2 line-clamp-2 font-display text-[21px] leading-[1.15] font-medium text-ink">
            {product.name}
          </h3>
          <p className="mt-1.5 line-clamp-1 text-xs text-stone">
            {[product.country, product.grapes.slice(0, 2).join(", ")].filter(Boolean).join(" · ")}
          </p>
          <div className="mt-auto pt-3">
            {product.variantCount > 1 && product.price != null && (
              <span className="mr-1.5 text-[10px] tracking-wide text-pebble uppercase">a partir de</span>
            )}
            {onSale && (
              <span className="mr-2 text-xs text-pebble line-through">{formatPrice(product.regularPrice)}</span>
            )}
            {product.price == null ? (
              <span className="text-[11px] tracking-[0.18em] text-pebble uppercase">Preço sob consulta</span>
            ) : (
              <span className={cn("text-[17px] font-medium", onSale ? "text-red" : "text-navy")}>
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>
      </Link>
      <div className="md:pointer-events-none md:absolute md:inset-x-0 md:bottom-0 md:translate-y-2 md:opacity-0 md:transition md:duration-300 md:group-hover:pointer-events-auto md:group-hover:translate-y-0 md:group-hover:opacity-100">
        <QuickAdd product={product} />
      </div>
      <FavoriteButton
        productId={product.id}
        className="absolute top-3 right-3 md:opacity-0 md:group-hover:opacity-100"
      />
    </article>
  );
}
