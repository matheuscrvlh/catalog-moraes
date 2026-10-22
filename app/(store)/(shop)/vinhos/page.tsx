import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowDown, X } from "lucide-react";
import { CatalogFilters } from "@/components/store/catalog/catalog-filters";
import { FilterSheet, SortSelect } from "@/components/store/catalog/catalog-controls";
import { ProductCard } from "@/components/store/product-card";
import { ButtonLink } from "@/components/ui/button";
import {
  activeFilterCount,
  buildQuery,
  PAGE_SIZE,
  parseFilters,
  withoutPriceFilters,
  type CatalogFilters as Filters,
} from "@/lib/catalog/filters";
import { getCatalogOverview, getStoreSettings, searchCatalog } from "@/lib/catalog/queries";
import { formatPrice, SWEETNESS } from "@/lib/format";

export const metadata: Metadata = {
  title: "Catálogo de vinhos",
  description: "Catálogo de vinhos tintos, brancos, rosés e espumantes para adegas, mercados e restaurantes.",
};

export default function CatalogPage({ searchParams }: PageProps<"/vinhos">) {
  return (
    <>
      <section className="relative overflow-hidden">
        <Image src="/images/bottles-shelf.webp" alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-navy-950/75" />
        <div className="relative mx-auto max-w-7xl px-5 py-20 text-center text-white md:px-8">
          <p className="font-script text-4xl text-white/80">Catálogo</p>
          <h1 className="mt-2 font-display text-[clamp(2.6rem,5vw,4rem)] leading-none font-medium tracking-[0.12em] uppercase">
            Nossos vinhos
          </h1>
          <nav aria-label="Trilha" className="mt-5 text-[11px] tracking-[0.2em] text-white/60 uppercase">
            <Link href="/" className="hover:text-white">
              Início
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white">Vinhos</span>
          </nav>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-5 pt-12 pb-28 md:px-8">
        <Suspense fallback={<CatalogSkeleton />}>
          <Catalog searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function Catalog({ searchParams }: { searchParams: PageProps<"/vinhos">["searchParams"] }) {
  const [params, { showPrices }] = await Promise.all([searchParams, getStoreSettings()]);
  const filters = showPrices ? parseFilters(params) : withoutPriceFilters(parseFilters(params));
  const [overview, { items, total }] = await Promise.all([getCatalogOverview(), searchCatalog(filters)]);
  const category = overview.categories.find((entry) => entry.slug === filters.categoria);
  const chips = describeFilters(filters, category?.name);
  const hasMore = items.length < total;
  const title = filters.busca ? `Resultados para “${filters.busca}”` : (category?.name ?? "Todos os vinhos");

  return (
    <div className="grid gap-12 lg:grid-cols-[240px_1fr]">
      <aside className="hidden lg:block">
        <div className="sticky top-28 max-h-[calc(100vh-8rem)] scrollbar-none overflow-y-auto pr-2">
          <CatalogFilters filters={filters} overview={overview} showPrices={showPrices} />
        </div>
      </aside>

      <div>
        <header className="flex flex-col gap-4 border-b border-line pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="caps text-2xl text-navy">{title}</h2>
            <p className="mt-1 text-sm text-stone">
              {total} {total === 1 ? "rótulo encontrado" : "rótulos encontrados"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <FilterSheet activeCount={activeFilterCount(filters)}>
              <CatalogFilters filters={filters} overview={overview} showPrices={showPrices} />
            </FilterSheet>
            <SortSelect filters={filters} showPrices={showPrices} />
          </div>
        </header>

        {chips.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {chips.map((chip) => (
              <Link
                key={chip.label}
                href={`/vinhos${buildQuery({ ...filters, ...chip.clear, pagina: 1 })}`}
                scroll={false}
                className="group inline-flex items-center gap-2 border border-line bg-white py-1.5 pr-2.5 pl-3.5 text-[13px] text-ink transition hover:border-red"
              >
                {chip.label}
                <X className="size-3.5 text-pebble transition group-hover:text-red" />
              </Link>
            ))}
            <Link
              href="/vinhos"
              className="ml-1 text-[13px] text-stone underline-offset-4 hover:text-navy hover:underline"
            >
              Limpar filtros
            </Link>
          </div>
        )}

        {items.length === 0 ? (
          <div className="mt-8 flex flex-col items-center border border-dashed border-line bg-white px-6 py-24 text-center">
            <p className="font-script text-4xl text-bronze">Nada por aqui</p>
            <p className="mt-3 max-w-sm text-sm text-stone">
              Nenhum rótulo combina com esses filtros. Tente ampliar a busca ou fale com o seu vendedor.
            </p>
            <ButtonLink href="/vinhos" variant="outline" className="mt-8">
              Ver todos os vinhos
            </ButtonLink>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6">
            {items.map((product, index) => (
              <ProductCard key={product.id} product={product} priority={index < 3} />
            ))}
          </div>
        )}

        {hasMore && (
          <div className="mt-14 flex flex-col items-center gap-3">
            <p className="text-xs text-pebble">
              Exibindo {items.length} de {total}
            </p>
            <ButtonLink
              href={`/vinhos${buildQuery({ ...filters, pagina: filters.pagina + 1 })}`}
              scroll={false}
              variant="outline"
            >
              Carregar mais {Math.min(PAGE_SIZE, total - items.length)} <ArrowDown className="size-4" />
            </ButtonLink>
          </div>
        )}
      </div>
    </div>
  );
}

function describeFilters(filters: Filters, categoryName?: string) {
  const chips: { label: string; clear: Partial<Filters> }[] = [];
  if (filters.busca) chips.push({ label: `“${filters.busca}”`, clear: { busca: undefined } });
  if (filters.categoria) chips.push({ label: categoryName ?? filters.categoria, clear: { categoria: undefined } });
  if (filters.pais) chips.push({ label: filters.pais, clear: { pais: undefined } });
  if (filters.uva) chips.push({ label: filters.uva, clear: { uva: undefined } });
  if (filters.docura) chips.push({ label: SWEETNESS[filters.docura], clear: { docura: undefined } });
  if (filters.min !== undefined || filters.max !== undefined) {
    const label =
      filters.min !== undefined && filters.max !== undefined
        ? `${formatPrice(filters.min)} – ${formatPrice(filters.max)}`
        : filters.max !== undefined
          ? `Até ${formatPrice(filters.max)}`
          : `Acima de ${formatPrice(filters.min)}`;
    chips.push({ label, clear: { min: undefined, max: undefined } });
  }
  return chips;
}

function CatalogSkeleton() {
  return (
    <div className="grid gap-12 lg:grid-cols-[240px_1fr]">
      <div className="hidden space-y-3 lg:block">
        {Array.from({ length: 10 }, (_, index) => (
          <div key={index} className="skeleton h-6" />
        ))}
      </div>
      <div>
        <div className="skeleton h-10 w-64" />
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="bg-white">
              <div className="skeleton aspect-4/5" />
              <div className="skeleton mx-auto mt-5 h-3 w-1/3" />
              <div className="skeleton mx-auto mt-3 mb-5 h-5 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
