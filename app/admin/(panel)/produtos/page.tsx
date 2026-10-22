import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ChevronLeft, ChevronRight, Pencil, Plus, Search, Star } from "lucide-react";
import { ActionSwitch, DeleteButton } from "@/components/admin/controls";
import { Badge, EmptyState, PageHeader, PanelSkeleton, table } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/button";
import { deleteProduct, setProductFlag } from "@/lib/admin/product-actions";
import { requireStaff } from "@/lib/auth/viewer";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { mediaUrl } from "@/lib/media";
import { createClient } from "@/lib/supabase/server";
import { stripAccents } from "@/lib/text";

export const metadata: Metadata = { title: "Produtos" };

const PER_PAGE = 20;
const STOCK_FILTERS = { baixo: "Estoque baixo", zerado: "Esgotados" } as const;

type Search = Awaited<PageProps<"/admin/produtos">["searchParams"]>;

const param = (search: Search, key: string) => {
  const value = search[key];
  return (Array.isArray(value) ? value[0] : value)?.trim() || undefined;
};

export default function ProductsPage({ searchParams }: PageProps<"/admin/produtos">) {
  return (
    <>
      <PageHeader
        eyebrow="Catálogo"
        title="Produtos"
        description="Rótulos, versões, preços e estoque."
        actions={
          <ButtonLink href="/admin/produtos/novo" variant="dark">
            <Plus className="size-4" /> Novo produto
          </ButtonLink>
        }
      />
      <Suspense fallback={<PanelSkeleton />}>
        <ProductsTable searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function ProductsTable({ searchParams }: { searchParams: PageProps<"/admin/produtos">["searchParams"] }) {
  await requireStaff("products.manage");
  const search = await searchParams;
  const term = param(search, "q");
  const category = param(search, "categoria");
  const stock = param(search, "estoque") as keyof typeof STOCK_FILTERS | undefined;
  const page = Math.max(1, Number(param(search, "pagina")) || 1);

  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("slug, name, accent").order("position");

  let query = supabase
    .from("catalog_products")
    .select(
      "id, slug, name, producer_name, category_name, category_accent, image_path, min_price, total_stock, variant_count, featured, active",
      {
        count: "exact",
      },
    );

  if (term) {
    for (const word of stripAccents(term).toLowerCase().split(/\s+/).slice(0, 4)) {
      query = query.ilike("search_text", `%${word.replace(/[\\%_]/g, (char) => `\\${char}`)}%`);
    }
  }
  if (category) query = query.eq("category_slug", category);
  if (stock === "zerado") query = query.eq("total_stock", 0);
  if (stock === "baixo") {
    const { data: low } = await supabase
      .from("product_variants")
      .select("product_id")
      .eq("active", true)
      .gte("stock", 1)
      .lte("stock", 6);
    query = query.in("id", [...new Set((low ?? []).map((row) => row.product_id))]);
  }

  const { data: products, count } = await query.order("name").range((page - 1) * PER_PAGE, page * PER_PAGE - 1);

  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const href = (patch: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    const merged = { q: term, categoria: category, estoque: stock, ...patch };
    Object.entries(merged).forEach(([key, value]) => value && params.set(key, String(value)));
    const query = params.toString();
    return `/admin/produtos${query ? `?${query}` : ""}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <form action="/admin/produtos" className="relative w-full max-w-sm">
          {category && <input type="hidden" name="categoria" value={category} />}
          {stock && <input type="hidden" name="estoque" value={stock} />}
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink/35" />
          <input
            name="q"
            defaultValue={term}
            placeholder="Buscar por nome, uva, vinícola…"
            className="h-11 w-full rounded-full border border-ink/10 bg-white pr-4 pl-11 text-sm outline-none focus:border-royal"
          />
        </form>
        <div className="flex flex-wrap gap-1.5">
          <FilterLink href={href({ categoria: undefined, pagina: undefined })} active={!category}>
            Todas
          </FilterLink>
          {(categories ?? []).map((entry) => (
            <FilterLink
              key={entry.slug}
              href={href({ categoria: entry.slug, pagina: undefined })}
              active={category === entry.slug}
            >
              <span className="size-2 rounded-full" style={{ background: entry.accent }} /> {entry.name}
            </FilterLink>
          ))}
          <span className="mx-1 w-px bg-ink/10" />
          {(Object.keys(STOCK_FILTERS) as (keyof typeof STOCK_FILTERS)[]).map((key) => (
            <FilterLink
              key={key}
              href={href({ estoque: stock === key ? undefined : key, pagina: undefined })}
              active={stock === key}
            >
              {STOCK_FILTERS[key]}
            </FilterLink>
          ))}
        </div>
      </div>

      {!products?.length ? (
        <EmptyState title="Nenhum produto encontrado" description="Ajuste os filtros ou cadastre um novo rótulo." />
      ) : (
        <div className={table.wrap}>
          <table className={table.table}>
            <thead className={table.head}>
              <tr>
                <th className={table.th}>Produto</th>
                <th className={table.th}>Estilo</th>
                <th className={table.th}>A partir de</th>
                <th className={table.th}>Estoque</th>
                <th className={table.th}>Destaque</th>
                <th className={table.th}>Ativo</th>
                <th className={table.th} />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const src = mediaUrl(product.image_path);
                const stockLevel = product.total_stock ?? 0;
                return (
                  <tr key={product.id} className={table.row}>
                    <td className={table.td}>
                      <Link href={`/admin/produtos/${product.id}`} className="group flex items-center gap-3">
                        <span className="relative h-14 w-10 shrink-0 rounded-xl bg-cloud">
                          {src && <Image src={src} alt="" fill sizes="40px" className="object-contain p-1" />}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium group-hover:text-royal">{product.name}</span>
                          <span className="block truncate text-xs text-ink/45">
                            {product.producer_name ?? "Sem vinícola"} · {product.variant_count}{" "}
                            {product.variant_count === 1 ? "versão" : "versões"}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className={table.td}>
                      <Badge tone={product.category_accent ?? undefined}>{product.category_name}</Badge>
                    </td>
                    <td className={`${table.td} tabular-nums`}>{formatPrice(product.min_price)}</td>
                    <td className={table.td}>
                      <span className="flex items-center gap-2.5">
                        <span className="h-1.5 w-16 overflow-hidden rounded-full bg-cloud">
                          <span
                            className={cn(
                              "block h-full rounded-full",
                              stockLevel === 0 ? "bg-transparent" : stockLevel <= 6 ? "bg-red" : "bg-[#2f9e6e]",
                            )}
                            style={{ width: `${Math.min(stockLevel / 60, 1) * 100}%` }}
                          />
                        </span>
                        <span className={cn("tabular-nums", stockLevel === 0 && "text-ink/40")}>
                          {stockLevel === 0 ? "Esgotado" : stockLevel}
                        </span>
                      </span>
                    </td>
                    <td className={table.td}>
                      <ActionSwitch
                        checked={Boolean(product.featured)}
                        label={`Destacar ${product.name}`}
                        action={setProductFlag.bind(null, product.id!, "featured")}
                      />
                    </td>
                    <td className={table.td}>
                      <ActionSwitch
                        checked={Boolean(product.active)}
                        label={`Publicar ${product.name}`}
                        action={setProductFlag.bind(null, product.id!, "active")}
                      />
                    </td>
                    <td className={`${table.td} text-right`}>
                      <span className="inline-flex items-center gap-1">
                        {product.featured && (
                          <Star className="size-4 fill-[#d99a1a] text-[#d99a1a]" aria-label="Em destaque" />
                        )}
                        <Link
                          href={`/admin/produtos/${product.id}`}
                          className="rounded-xl p-2 text-ink/45 transition hover:bg-cloud hover:text-ink"
                          aria-label={`Editar ${product.name}`}
                        >
                          <Pencil className="size-4" />
                        </Link>
                        <DeleteButton
                          label={`Remover ${product.name}`}
                          confirmText={`Remover "${product.name}" do catálogo? Pedidos antigos mantêm o histórico.`}
                          action={deleteProduct.bind(null, product.id!)}
                        />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-ink/55">
        <span>
          {total} {total === 1 ? "produto" : "produtos"}
        </span>
        {pages > 1 && (
          <span className="flex items-center gap-2">
            <PageLink href={href({ pagina: page - 1 })} disabled={page <= 1} label="Anterior">
              <ChevronLeft className="size-4" />
            </PageLink>
            <span className="tabular-nums">
              {page} / {pages}
            </span>
            <PageLink href={href({ pagina: page + 1 })} disabled={page >= pages} label="Próxima">
              <ChevronRight className="size-4" />
            </PageLink>
          </span>
        )}
      </div>
    </div>
  );
}

function FilterLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] transition",
        active ? "bg-ink text-white" : "bg-white text-ink/65 hover:text-ink",
      )}
    >
      {children}
    </Link>
  );
}

function PageLink({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  if (disabled) return <span className="rounded-full bg-white p-2 opacity-40">{children}</span>;
  return (
    <Link href={href} aria-label={label} className="rounded-full bg-white p-2 transition hover:bg-ink hover:text-white">
      {children}
    </Link>
  );
}
