import Link from "next/link";
import { BottleImage } from "@/components/store/bottle-image";
import { Reveal } from "@/components/ui/reveal";
import { formatPrice } from "@/lib/format";
import type { ProductCard } from "@/lib/catalog/types";
import { SectionTitle } from "./section-title";

export function Spotlight({ products }: { products: ProductCard[] }) {
  if (!products.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-5 pt-28 md:px-8">
      <Reveal>
        <SectionTitle eyebrow="Curadoria Moraes" title="Rótulos em destaque" />
      </Reveal>
      <div className="mt-16 grid gap-x-8 gap-y-14 md:grid-cols-3">
        {products.slice(0, 3).map((product, index) => (
          <Reveal key={product.id} delay={index * 0.1}>
            <Link href={`/vinhos/${product.slug}`} className="group relative flex h-[380px] items-stretch">
              <div className="relative z-10 w-[46%]">
                <BottleImage
                  path={product.imagePath}
                  alt={product.name}
                  sizes="220px"
                  className="absolute inset-y-0 left-0 w-full drop-shadow-[0_24px_24px_rgba(23,25,43,0.25)] transition duration-700 ease-out-expo group-hover:-translate-y-2"
                />
              </div>
              <div className="relative -ml-[18%] flex flex-1 flex-col bg-linen py-10 pr-6 pl-[24%] transition duration-500 group-hover:bg-parchment">
                <span className="h-px w-8 bg-bronze" />
                <p className="mt-5 text-[10px] tracking-[0.22em] text-bronze uppercase">{product.producer}</p>
                <h3 className="caps mt-2 text-[17px] leading-snug text-navy">{product.name}</h3>
                {product.tagline && (
                  <p className="mt-3 line-clamp-3 text-[13px] leading-relaxed text-stone">{product.tagline}</p>
                )}
                <p className="mt-4 text-[17px] font-medium text-navy">{formatPrice(product.price)}</p>
                {product.badge && (
                  <span className="absolute right-5 bottom-5 flex size-[68px] rotate-[-12deg] items-center justify-center rounded-full border border-dashed border-navy/50 p-2 text-center text-[8.5px] leading-tight font-semibold tracking-[0.14em] text-navy uppercase">
                    {product.badge}
                  </span>
                )}
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
