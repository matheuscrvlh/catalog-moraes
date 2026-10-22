import { z } from "zod";
import { SWEETNESS, type Sweetness } from "@/lib/format";

export const PAGE_SIZE = 24;

export const SORTS = {
  destaque: "Destaques",
  "menor-preco": "Menor preço",
  "maior-preco": "Maior preço",
  novidades: "Novidades",
  nome: "Nome (A–Z)",
} as const;

export type Sort = keyof typeof SORTS;

const text = z.string().trim().min(1).max(60).optional().catch(undefined);
const price = z.coerce.number().min(0).max(100000).optional().catch(undefined);

const schema = z.object({
  busca: text,
  categoria: text,
  pais: text,
  uva: text,
  docura: z
    .enum(Object.keys(SWEETNESS) as [Sweetness, ...Sweetness[]])
    .optional()
    .catch(undefined),
  min: price,
  max: price,
  ordem: z
    .enum(Object.keys(SORTS) as [Sort, ...Sort[]])
    .default("destaque")
    .catch("destaque"),
  pagina: z.coerce.number().int().min(1).max(40).default(1).catch(1),
});

export type CatalogFilters = z.infer<typeof schema>;

type RawParams = Record<string, string | string[] | undefined>;

export function parseFilters(params: RawParams): CatalogFilters {
  const flat = Object.fromEntries(
    Object.entries(params)
      .map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
      .filter(([, value]) => value !== undefined && value !== ""),
  );
  return schema.parse(flat);
}

export function buildQuery(filters: Partial<CatalogFilters>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === "") continue;
    if (key === "ordem" && value === "destaque") continue;
    if (key === "pagina" && value === 1) continue;
    params.set(key, String(value));
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function activeFilterCount(filters: CatalogFilters) {
  return [filters.busca, filters.categoria, filters.pais, filters.uva, filters.docura, filters.min, filters.max].filter(
    (value) => value !== undefined,
  ).length;
}
