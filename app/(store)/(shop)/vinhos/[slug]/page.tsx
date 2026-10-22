import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BottleImage } from "@/components/store/bottle-image";
import { ProductCard } from "@/components/store/product-card";
import { PurchasePanel } from "@/components/store/product/purchase-panel";
import { SensoryProfile } from "@/components/store/product/sensory-profile";
import { ViewTracker } from "@/components/store/product/view-tracker";
import { SectionTitle } from "@/components/store/home/section-title";
import { Reveal } from "@/components/ui/reveal";
import { WINE_CATEGORIES } from "@/lib/catalog/filters";
import { getProduct, getProductSlugs, getRelatedProducts } from "@/lib/catalog/queries";
import { cn } from "@/lib/cn";
import { env } from "@/lib/env";
import { formatVolume, SWEETNESS } from "@/lib/format";
import { mediaUrl } from "@/lib/media";

type Params = PageProps<"/vinhos/[slug]">["params"];

export async function generateStaticParams() {
  const slugs = await getProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/vinhos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Vinho não encontrado" };

  const image = mediaUrl(product.imagePath);
  return {
    title: product.name,
    description: product.tagline ?? product.description?.slice(0, 160) ?? undefined,
    openGraph: { title: product.name, images: image ? [image] : undefined },
  };
}

export default function ProductPage({ params }: PageProps<"/vinhos/[slug]">) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductView params={params} />
    </Suspense>
  );
}

async function ProductView({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.categorySlug, product.id, 4);
  const sweetness = product.sweetness ? SWEETNESS[product.sweetness] : null;
  const isWine = WINE_CATEGORIES.includes(product.categorySlug);
  const hasProfile = Object.values(product.profile).some((value) => value != null);
  const hasAbout = Boolean(product.description || product.aromaNotes || product.palateNotes || product.pairing.length);
  const highlights = [
    {
      value: sweetness ? `${product.categoryName.replace(/s$/, "")} ${sweetness.toLowerCase()}` : product.categoryName,
      label: "Estilo",
    },
    {
      value: product.vintage ? String(product.vintage) : (formatVolume(product.variants[0]?.volumeMl) ?? "—"),
      label: product.vintage ? "Safra" : "Volume",
    },
    { value: product.country ?? "—", label: "País" },
  ];
  const sheet = [
    { label: product.grapes.length > 1 ? "Uvas" : "Uva", value: product.grapes.join(", ") },
    { label: isWine ? "Vinícola" : "Marca", value: product.producer },
    { label: "Origem", value: [product.region, product.country].filter(Boolean).join(", ") },
    { label: "Doçura", value: sweetness },
    { label: "Teor alcoólico", value: product.alcohol != null ? `${product.alcohol.toLocaleString("pt-BR")}%` : null },
    { label: "Servir a", value: product.servingTemp },
    {
      label: "Volumes",
      value: [...new Set(product.variants.map((variant) => formatVolume(variant.volumeMl)).filter(Boolean))].join(", "),
    },
  ].filter((row) => row.value);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: mediaUrl(product.imagePath)?.replace(/^\//, `${env.siteUrl}/`),
    brand: product.producer ? { "@type": "Brand", name: product.producer } : undefined,
    offers: product.variants
      .filter((variant) => variant.price != null)
      .map((variant) => ({
        "@type": "Offer",
        priceCurrency: "BRL",
        price: variant.promoPrice ?? variant.price,
        availability: variant.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ViewTracker productId={product.id} />

      <div className="border-b border-line bg-white">
        <nav
          aria-label="Trilha"
          className="mx-auto max-w-7xl px-5 py-4 text-[11px] tracking-[0.18em] text-stone uppercase md:px-8"
        >
          <Link href="/" className="hover:text-navy">
            Início
          </Link>
          <span className="mx-2 text-pebble">/</span>
          <Link href="/vinhos" className="hover:text-navy">
            Catálogo
          </Link>
          <span className="mx-2 text-pebble">/</span>
          <Link href={`/vinhos?categoria=${product.categorySlug}`} className="hover:text-navy">
            {product.categoryName}
          </Link>
          <span className="mx-2 text-pebble">/</span>
          <span className="text-navy">{product.name}</span>
        </nav>
      </div>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-12 md:px-8 lg:grid-cols-2 lg:gap-16">
        <Reveal className="relative aspect-square overflow-hidden bg-linen" y={20}>
          <div
            className="absolute inset-x-[15%] bottom-[8%] h-1/3 rounded-[50%] opacity-35 blur-3xl"
            style={{ background: product.accent }}
          />
          <BottleImage
            path={product.imagePath}
            alt={product.name}
            sizes="(min-width: 1024px) 560px, 90vw"
            priority
            className="absolute inset-x-[16%] top-[7%] bottom-[7%] drop-shadow-[0_30px_30px_rgba(23,25,43,0.25)]"
          />
          {product.badge && (
            <span className="absolute top-5 left-5 bg-white px-3 py-1.5 text-[10px] font-medium tracking-[0.2em] text-navy uppercase">
              {product.badge}
            </span>
          )}
          <span aria-hidden className="absolute right-5 bottom-4 font-script text-4xl text-bronze/60">
            {product.producer}
          </span>
        </Reveal>

        <div>
          <p className="text-[11px] font-medium tracking-[0.24em] text-bronze uppercase">
            {product.producer ?? product.categoryName}
          </p>
          <h1 className="mt-3 font-display text-[clamp(2.4rem,4.4vw,3.6rem)] leading-[1.02] font-medium text-navy">
            {product.name}
          </h1>
          {product.tagline && <p className="mt-4 font-display text-xl text-stone italic">{product.tagline}</p>}
          <span className="mt-6 block h-px w-14 bg-red" />

          <div className="mt-7 grid grid-cols-3 gap-3">
            {highlights.map((item, index) => (
              <div
                key={item.label}
                className={cn("px-4 py-4", index === 2 ? "bg-navy text-white" : "border border-line bg-white")}
              >
                <p className={cn("truncate text-[15px] font-medium", index === 2 ? "text-white" : "text-ink")}>
                  {item.value}
                </p>
                <p
                  className={cn(
                    "mt-1 text-[11px] tracking-[0.16em] uppercase",
                    index === 2 ? "text-white/60" : "text-pebble",
                  )}
                >
                  {item.label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 border-t border-line pt-8">
            <PurchasePanel product={product} />
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-white">
        <div
          className={cn(
            "mx-auto grid max-w-7xl gap-14 px-5 py-20 md:px-8",
            hasAbout && hasProfile
              ? "lg:grid-cols-[1.2fr_1fr_0.9fr]"
              : hasAbout || hasProfile
                ? "lg:grid-cols-2"
                : "max-w-3xl",
          )}
        >
          {hasAbout && (
            <Reveal>
              <h2 className="caps text-xl text-navy">{isWine ? "Sobre o vinho" : "Sobre o produto"}</h2>
              {product.description && (
                <p className="mt-5 text-[15.5px] leading-relaxed text-stone">{product.description}</p>
              )}
              <dl className="mt-8 space-y-5">
                {product.aromaNotes && (
                  <div className="border-l-2 border-red pl-5">
                    <dt className="text-[11px] tracking-[0.2em] text-pebble uppercase">Aroma</dt>
                    <dd className="mt-1 font-display text-lg text-ink">{product.aromaNotes}</dd>
                  </div>
                )}
                {product.palateNotes && (
                  <div className="border-l-2 border-navy pl-5">
                    <dt className="text-[11px] tracking-[0.2em] text-pebble uppercase">Paladar</dt>
                    <dd className="mt-1 font-display text-lg text-ink">{product.palateNotes}</dd>
                  </div>
                )}
              </dl>
              {product.pairing.length > 0 && (
                <div className="mt-8">
                  <p className="text-[11px] tracking-[0.2em] text-pebble uppercase">Harmoniza com</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {product.pairing.map((item) => (
                      <span key={item} className="bg-linen px-3.5 py-1.5 text-sm text-ink">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Reveal>
          )}

          <Reveal delay={0.08}>
            <h2 className="caps text-xl text-navy">Ficha técnica</h2>
            <dl className="mt-5 divide-y divide-line border-y border-line">
              {sheet.map((row) => (
                <div key={row.label} className="flex justify-between gap-6 py-3 text-sm">
                  <dt className="text-stone">{row.label}</dt>
                  <dd className="text-right text-ink">{row.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          {hasProfile && (
            <Reveal delay={0.16} className="bg-ivory p-7">
              <h2 className="caps text-xl text-navy">Perfil sensorial</h2>
              <p className="mt-1 mb-7 text-sm text-stone">Como esse vinho se comporta na taça.</p>
              <SensoryProfile profile={product.profile} />
            </Reveal>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-24 md:px-8">
          <SectionTitle eyebrow="Da mesma prateleira" title="Você também pode gostar" />
          <div className="mt-12 grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function ProductSkeleton() {
  return (
    <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:px-8 lg:grid-cols-2">
      <div className="skeleton aspect-square" />
      <div className="space-y-5 pt-4">
        <div className="skeleton h-3 w-32" />
        <div className="skeleton h-14 w-4/5" />
        <div className="skeleton h-5 w-2/3" />
        <div className="skeleton mt-10 h-20 w-full" />
        <div className="skeleton h-12 w-full" />
      </div>
    </div>
  );
}
