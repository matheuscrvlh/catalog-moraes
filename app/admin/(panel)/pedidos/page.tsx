import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Badge, EmptyState, PageHeader, PanelSkeleton, table } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth/viewer";
import { cn } from "@/lib/cn";
import { formatDateTime, formatPrice, ORDER_STATUS, type OrderStatus } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Pedidos" };

const PER_PAGE = 25;

export default function OrdersPage({ searchParams }: PageProps<"/admin/pedidos">) {
  return (
    <>
      <PageHeader
        eyebrow="Vendas"
        title="Pedidos"
        description="Pedidos enviados pela sacola do site. Atualize o status conforme o atendimento."
      />
      <Suspense fallback={<PanelSkeleton />}>
        <OrdersTable searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function OrdersTable({ searchParams }: { searchParams: PageProps<"/admin/pedidos">["searchParams"] }) {
  await requireStaff("orders.manage");
  const search = await searchParams;
  const pick = (key: string) => {
    const value = search[key];
    return (Array.isArray(value) ? value[0] : value)?.trim() || undefined;
  };
  const status = pick("status") as OrderStatus | undefined;
  const term = pick("q");
  const page = Math.max(1, Number(pick("pagina")) || 1);

  const supabase = await createClient();
  const counts = await Promise.all(
    (Object.keys(ORDER_STATUS) as OrderStatus[]).map(async (key) => {
      const { count } = await supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", key);
      return [key, count ?? 0] as const;
    }),
  );

  let query = supabase
    .from("orders")
    .select(
      "id, number, customer_name, customer_company, customer_phone, status, subtotal, created_at, order_items(quantity)",
      {
        count: "exact",
      },
    );
  if (status && status in ORDER_STATUS) query = query.eq("status", status);
  if (term) {
    const like = `%${term.replace(/[\\%_,()]/g, "")}%`;
    query = /^\d+$/.test(term)
      ? query.eq("number", Number(term))
      : query.or(`customer_name.ilike.${like},customer_company.ilike.${like}`);
  }

  const { data: orders, count } = await query
    .order("created_at", { ascending: false })
    .range((page - 1) * PER_PAGE, page * PER_PAGE - 1);

  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const href = (patch: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    Object.entries({ status, q: term, ...patch }).forEach(([key, value]) => value && params.set(key, String(value)));
    return `/admin/pedidos${params.size ? `?${params}` : ""}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1.5">
          <Link
            href={href({ status: undefined, pagina: undefined })}
            className={cn(
              "rounded-full px-3.5 py-2 text-[13px]",
              !status ? "bg-ink text-white" : "bg-white text-ink/65",
            )}
          >
            Todos
          </Link>
          {counts.map(([key, value]) => (
            <Link
              key={key}
              href={href({ status: key, pagina: undefined })}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[13px]",
                status === key ? "bg-ink text-white" : "bg-white text-ink/65 hover:text-ink",
              )}
            >
              <span className="size-2 rounded-full" style={{ background: ORDER_STATUS[key].tone }} />
              {ORDER_STATUS[key].label}
              <span className="font-mono text-[11px] opacity-60">{value}</span>
            </Link>
          ))}
        </div>
        <form action="/admin/pedidos" className="relative w-full max-w-xs">
          {status && <input type="hidden" name="status" value={status} />}
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink/35" />
          <input
            name="q"
            defaultValue={term}
            placeholder="Nº do pedido, empresa ou contato"
            className="h-11 w-full rounded-full border border-ink/10 bg-white pr-4 pl-11 text-sm outline-none focus:border-royal"
          />
        </form>
      </div>

      {!orders?.length ? (
        <EmptyState title="Nenhum pedido" description="Os pedidos feitos pelo site aparecem aqui." />
      ) : (
        <div className={table.wrap}>
          <table className={table.table}>
            <thead className={table.head}>
              <tr>
                <th className={table.th}>Pedido</th>
                <th className={table.th}>Cliente</th>
                <th className={table.th}>Itens</th>
                <th className={table.th}>Subtotal</th>
                <th className={table.th}>Status</th>
                <th className={table.th} />
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className={table.row}>
                  <td className={table.td}>
                    <Link href={`/admin/pedidos/${order.id}`} className="font-mono font-medium hover:text-royal">
                      #{order.number}
                    </Link>
                    <span className="block text-xs text-ink/45">{formatDateTime(order.created_at)}</span>
                  </td>
                  <td className={table.td}>
                    <span className="block font-medium">{order.customer_company ?? order.customer_name}</span>
                    <span className="text-xs text-ink/45">
                      {order.customer_company ? `${order.customer_name} · ` : ""}
                      {order.customer_phone}
                    </span>
                  </td>
                  <td className={`${table.td} tabular-nums`}>
                    {order.order_items.reduce((sum, item) => sum + item.quantity, 0)}
                  </td>
                  <td className={`${table.td} font-medium tabular-nums`}>{formatPrice(order.subtotal)}</td>
                  <td className={table.td}>
                    <Badge tone={ORDER_STATUS[order.status].tone}>{ORDER_STATUS[order.status].label}</Badge>
                  </td>
                  <td className={`${table.td} text-right`}>
                    <Link
                      href={`/admin/pedidos/${order.id}`}
                      className="inline-flex rounded-xl p-2 text-ink/45 hover:bg-cloud hover:text-ink"
                      aria-label={`Abrir pedido ${order.number}`}
                    >
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-end gap-2 text-sm text-ink/55">
          {page > 1 && (
            <Link
              href={href({ pagina: page - 1 })}
              className="rounded-full bg-white p-2 hover:bg-ink hover:text-white"
              aria-label="Anterior"
            >
              <ChevronLeft className="size-4" />
            </Link>
          )}
          <span className="tabular-nums">
            {page} / {pages}
          </span>
          {page < pages && (
            <Link
              href={href({ pagina: page + 1 })}
              className="rounded-full bg-white p-2 hover:bg-ink hover:text-white"
              aria-label="Próxima"
            >
              <ChevronRight className="size-4" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
