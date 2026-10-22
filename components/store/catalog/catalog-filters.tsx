import Link from "next/link";
import { Check, Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { SWEETNESS, type Sweetness } from "@/lib/format";
import { buildQuery, type CatalogFilters } from "@/lib/catalog/filters";
import type { CatalogOverview } from "@/lib/catalog/types";

const SWEETNESS_OPTIONS: Sweetness[] = ["seco", "meio_seco", "suave", "doce", "brut"];

const PRICE_RANGES = [
  { label: "Até R$ 40", min: undefined, max: 40 },
  { label: "R$ 40 a R$ 80", min: 40, max: 80 },
  { label: "R$ 80 a R$ 150", min: 80, max: 150 },
  { label: "Acima de R$ 150", min: 150, max: undefined },
];

type Props = { filters: CatalogFilters; overview: CatalogOverview; showPrices: boolean };

function hrefWith(filters: CatalogFilters, patch: Partial<CatalogFilters>) {
  return `/vinhos${buildQuery({ ...filters, ...patch, pagina: 1 })}`;
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-line py-6 first:border-t-0 first:pt-0">
      <p className="caps mb-4 text-[13px] text-navy">{title}</p>
      {children}
    </div>
  );
}

function Option({
  href,
  active,
  children,
  dot,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  dot?: string;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      className={cn(
        "flex items-center gap-3 py-1.5 text-sm transition",
        active ? "font-medium text-navy" : "text-stone hover:text-navy",
      )}
    >
      {dot ? (
        <span
          className={cn("size-2.5 shrink-0 rounded-full", active && "ring-2 ring-navy/30 ring-offset-2")}
          style={{ background: dot }}
        />
      ) : (
        <span
          className={cn(
            "flex size-4 shrink-0 items-center justify-center rounded-[3px] border",
            active ? "border-navy bg-navy text-white" : "border-ink/25",
          )}
        >
          {active && <Check className="size-3" strokeWidth={3} />}
        </span>
      )}
      <span className="flex flex-1 justify-between gap-2">{children}</span>
    </Link>
  );
}

const pill = (active: boolean, tone: "navy" | "red" = "navy") =>
  cn(
    "border px-3 py-1.5 text-[12.5px] transition",
    active
      ? tone === "navy"
        ? "border-navy bg-navy text-white"
        : "border-red bg-red text-white"
      : "border-line bg-white text-stone hover:border-navy hover:text-navy",
  );

export function CatalogFilters({ filters, overview, showPrices }: Props) {
  return (
    <div>
      <Group title="Buscar">
        <form action="/vinhos" className="relative">
          {filters.categoria && <input type="hidden" name="categoria" value={filters.categoria} />}
          {filters.pais && <input type="hidden" name="pais" value={filters.pais} />}
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-pebble" />
          <input
            name="busca"
            defaultValue={filters.busca}
            placeholder="Nome, uva, vinícola…"
            maxLength={60}
            className="h-11 w-full border border-line bg-white pr-4 pl-10 text-sm text-ink transition outline-none placeholder:text-pebble focus:border-navy"
          />
        </form>
      </Group>

      <Group title="Estilo">
        <Option href={hrefWith(filters, { categoria: undefined })} active={!filters.categoria} dot="#a3a5b0">
          Todos <span className="text-xs text-pebble">{overview.products}</span>
        </Option>
        {overview.categories
          .filter((category) => category.count > 0)
          .map((category) => (
            <Option
              key={category.id}
              href={hrefWith(filters, { categoria: filters.categoria === category.slug ? undefined : category.slug })}
              active={filters.categoria === category.slug}
              dot={category.accent}
            >
              {category.name}
              <span className="text-xs text-pebble">{category.count}</span>
            </Option>
          ))}
      </Group>

      <Group title="País">
        {overview.countries.map((country) => (
          <Option
            key={country.value}
            href={hrefWith(filters, { pais: filters.pais === country.value ? undefined : country.value })}
            active={filters.pais === country.value}
          >
            {country.value}
            <span className="text-xs text-pebble">{country.count}</span>
          </Option>
        ))}
      </Group>

      <Group title="Doçura">
        <div className="flex flex-wrap gap-2">
          {SWEETNESS_OPTIONS.map((value) => {
            const active = filters.docura === value;
            return (
              <Link
                key={value}
                scroll={false}
                href={hrefWith(filters, { docura: active ? undefined : value })}
                className={pill(active)}
              >
                {SWEETNESS[value]}
              </Link>
            );
          })}
        </div>
      </Group>

      {showPrices && (
        <Group title="Preço">
          {PRICE_RANGES.map((range) => {
            const active = filters.min === range.min && filters.max === range.max;
            return (
              <Option
                key={range.label}
                href={hrefWith(
                  filters,
                  active ? { min: undefined, max: undefined } : { min: range.min, max: range.max },
                )}
                active={active}
              >
                {range.label}
              </Option>
            );
          })}
        </Group>
      )}

      <Group title="Uva">
        <div className="flex flex-wrap gap-2">
          {overview.grapes.slice(0, 16).map((grape) => {
            const active = filters.uva === grape.value;
            return (
              <Link
                key={grape.value}
                scroll={false}
                href={hrefWith(filters, { uva: active ? undefined : grape.value })}
                className={pill(active, "red")}
              >
                {grape.value}
              </Link>
            );
          })}
        </div>
      </Group>
    </div>
  );
}
