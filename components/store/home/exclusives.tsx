import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BottleImage } from "@/components/store/bottle-image";
import { Reveal } from "@/components/ui/reveal";
import { formatPrice } from "@/lib/format";
import type { ProductCard } from "@/lib/catalog/types";

export function Exclusives({ products }: { products: ProductCard[] }) {
  if (!products.length) return null;

  return (
    <section className="relative mt-28 overflow-hidden">
      <Image src="/images/vineyard-golden.webp" alt="" fill sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-linear-to-r from-navy-950/90 via-navy-950/70 to-navy-950/30" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-24 md:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <Reveal className="text-white">
          <p className="font-script text-4xl text-white/80">Distribuição exclusiva</p>
          <h2 className="mt-3 font-display text-[clamp(2.4rem,4.4vw,3.6rem)] leading-[1.02] font-medium tracking-[0.04em] uppercase">
            Portugal na sua prateleira
          </h2>
          <span className="mt-6 block h-px w-14 bg-red" />
          <p className="mt-6 max-w-md text-[15.5px] leading-relaxed text-white/75">
            Lourinho, Vindimeiro, Pedra do Urso e Monte Seco: rótulos portugueses que a Moraes traz com exclusividade,
            do branco fresco de Lisboa ao tinto alentejano em bag-in-box.
          </p>
          <Link
            href="/vinhos?busca=exclusivo"
            className="group mt-9 inline-flex h-12 items-center gap-3 bg-white px-8 text-[12px] font-medium tracking-[0.2em] text-navy uppercase transition hover:bg-ivory"
          >
            Ver os exclusivos <ArrowRight className="size-4 transition group-hover:translate-x-1" />
          </Link>
        </Reveal>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {products.slice(0, 4).map((product, index) => (
            <Reveal key={product.id} delay={index * 0.08}>
              <Link
                href={`/vinhos/${product.slug}`}
                className="group flex h-full flex-col bg-white/95 p-4 text-center backdrop-blur transition hover:-translate-y-1 hover:bg-white"
              >
                <BottleImage
                  path={product.imagePath}
                  alt={product.name}
                  sizes="140px"
                  className="h-44 w-full transition duration-700 ease-out-expo group-hover:-translate-y-1.5"
                />
                <p className="mt-4 font-display text-lg leading-tight font-medium text-ink">{product.name}</p>
                <p className="mt-auto pt-2 text-sm font-medium text-navy">{formatPrice(product.price)}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
