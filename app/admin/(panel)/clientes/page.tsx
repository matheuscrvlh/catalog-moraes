import type { Metadata } from "next";
import { Suspense } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { CustomerSheet } from "@/components/admin/customer-sheet";
import { EmptyState, PageHeader, PanelSkeleton, table } from "@/components/admin/ui";
import { WhatsappIcon } from "@/components/ui/brand-icons";
import { can, requireStaff } from "@/lib/auth/viewer";
import { cn } from "@/lib/cn";
import { BUSINESS_TYPES, formatDay, formatPrice, formatRelative, formatTaxId, whatsappLink } from "@/lib/format";
import { initials } from "@/lib/text";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Clientes" };

const PER_PAGE = 25;
const SORTS = {
  recentes: { label: "Mais recentes", column: "created_at" },
  pedidos: { label: "Mais pedidos", column: "orders" },
  valor: { label: "Maior valor", column: "spent" },
} as const;

export default function CustomersPage({ searchParams }: PageProps<"/admin/clientes">) {
  return (
    <>
      <PageHeader
        eyebrow="Vendas"
        title="Clientes"
        description="Empresas cadastradas na loja ou pela equipe, com histórico de pedidos e valor comprado."
      />
      <Suspense fallback={<PanelSkeleton />}>
        <CustomersTable searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function CustomersTable({ searchParams }: { searchParams: PageProps<"/admin/clientes">["searchParams"] }) {
  const viewer = await requireStaff("customers.view");
  const search = await searchParams;
  const pick = (key: string) => {
    const value = search[key];
    return (Array.isArray(value) ? value[0] : value)?.trim() || undefined;
  };
  const term = pick("q");
  const sort = (pick("ordem") ?? "recentes") as keyof typeof SORTS;
  const page = Math.max(1, Number(pick("pagina")) || 1);
  const column = (SORTS[sort] ?? SORTS.recentes).column;

  const supabase = await createClient();
  let query = supabase.from("customer_summaries").select("*", { count: "exact" });
  if (term) {
    const like = `%${term.replace(/[\\%_,()]/g, "")}%`;
    query = query.or(`company_name.ilike.${like},full_name.ilike.${like},email.ilike.${like},phone.ilike.${like}`);
  }
  const { data: customers, count } = await query
    .order(column, { ascending: false, nullsFirst: false })
    .range((page - 1) * PER_PAGE, page * PER_PAGE - 1);

  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const href = (patch: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    Object.entries({ q: term, ordem: sort === "recentes" ? undefined : sort, ...patch }).forEach(
      ([key, value]) => value && params.set(key, String(value)),
    );
    return `/admin/clientes${params.size ? `?${params}` : ""}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <form action="/admin/clientes" className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink/35" />
          <input
            name="q"
            defaultValue={term}
            placeholder="Empresa, contato, e-mail ou telefone"
            className="h-11 w-full rounded-full border border-ink/10 bg-white pr-4 pl-11 text-sm outline-none focus:border-royal"
          />
        </form>
        <div className="flex flex-wrap items-center gap-1.5">
          {(Object.keys(SORTS) as (keyof typeof SORTS)[]).map((key) => (
            <Link
              key={key}
              href={href({ ordem: key === "recentes" ? undefined : key, pagina: undefined })}
              className={cn(
                "rounded-full px-3.5 py-2 text-[13px]",
                sort === key ? "bg-ink text-white" : "bg-white text-ink/65",
              )}
            >
              {SORTS[key].label}
            </Link>
          ))}
          {can(viewer, "orders.manage") && (
            <span className="ml-2">
              <CustomerSheet />
            </span>
          )}
        </div>
      </div>

      {!customers?.length ? (
        <EmptyState title="Nenhum cliente encontrado" />
      ) : (
        <div className={table.wrap}>
          <table className={table.table}>
            <thead className={table.head}>
              <tr>
                <th className={table.th}>Empresa</th>
                <th className={table.th}>Tipo</th>
                <th className={table.th}>Contato</th>
                <th className={table.th}>Pedidos</th>
                <th className={table.th}>Total comprado</th>
                <th className={table.th}>Último pedido</th>
                <th className={table.th}>Cliente desde</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => {
                const whatsapp = whatsappLink(customer.phone);
                return (
                  <tr key={customer.id} className={table.row}>
                    <td className={table.td}>
                      <span className="flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-full bg-cloud font-mono text-xs text-ink/60">
                          {initials(customer.company_name || customer.full_name || customer.email || "")}
                        </span>
                        <span>
                          <span className="block font-medium">
                            {customer.company_name || customer.full_name || "Sem nome"}
                          </span>
                          <span className="text-xs text-ink/45">
                            {customer.tax_id ? formatTaxId(customer.tax_id) : customer.email}
                          </span>
                        </span>
                      </span>
                    </td>
                    <td className={`${table.td} text-ink/70`}>
                      {customer.business_type ? BUSINESS_TYPES[customer.business_type] : "—"}
                    </td>
                    <td className={table.td}>
                      <span className="mb-0.5 block text-[13px]">{customer.full_name}</span>
                      {whatsapp ? (
                        <a
                          href={whatsapp}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-ink/70 hover:text-[#1f9d55]"
                        >
                          <WhatsappIcon className="size-4" /> {customer.phone}
                        </a>
                      ) : (
                        <span className="text-ink/40">—</span>
                      )}
                    </td>
                    <td className={`${table.td} tabular-nums`}>{customer.orders}</td>
                    <td className={`${table.td} font-medium tabular-nums`}>{formatPrice(customer.spent)}</td>
                    <td className={`${table.td} text-ink/60`}>
                      {customer.last_order_at ? formatRelative(customer.last_order_at) : "—"}
                    </td>
                    <td className={`${table.td} text-ink/60`}>
                      {customer.created_at ? formatDay(customer.created_at) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-ink/55">
        <span>{total} clientes</span>
        {pages > 1 && (
          <span className="flex items-center gap-2">
            {page > 1 && (
              <Link href={href({ pagina: page - 1 })} className="rounded-full bg-white p-2" aria-label="Anterior">
                <ChevronLeft className="size-4" />
              </Link>
            )}
            <span className="tabular-nums">
              {page} / {pages}
            </span>
            {page < pages && (
              <Link href={href({ pagina: page + 1 })} className="rounded-full bg-white p-2" aria-label="Próxima">
                <ChevronRight className="size-4" />
              </Link>
            )}
          </span>
        )}
      </div>
    </div>
  );
}
