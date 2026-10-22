import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { InternalNotes, StatusStepper } from "@/components/admin/order-controls";
import { Badge, Card, CardTitle, PageHeader, PanelSkeleton } from "@/components/admin/ui";
import { WhatsappIcon } from "@/components/ui/brand-icons";
import { requireStaff } from "@/lib/auth/viewer";
import { formatDateTime, formatPrice, ORDER_STATUS, whatsappLink } from "@/lib/format";
import { mediaUrl } from "@/lib/media";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Pedido" };

export default function OrderPage({ params }: PageProps<"/admin/pedidos/[id]">) {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <OrderDetail params={params} />
    </Suspense>
  );
}

async function OrderDetail({ params }: { params: PageProps<"/admin/pedidos/[id]">["params"] }) {
  await requireStaff("orders.manage");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select(
      `id, number, status, subtotal, notes, internal_notes, customer_name, customer_company, customer_phone, created_at, updated_at, customer_id,
       customer:profiles!orders_customer_id_fkey(email),
       handler:profiles!orders_handled_by_fkey(full_name),
       order_items(id, product_id, product_name, variant_label, unit_price, quantity, line_total)`,
    )
    .eq("id", id)
    .maybeSingle();

  if (!order) notFound();

  const productIds = order.order_items.map((item) => item.product_id).filter(Boolean) as string[];
  const { data: images } = productIds.length
    ? await supabase.from("catalog_products").select("id, image_path").in("id", productIds)
    : { data: [] };
  const imageFor = new Map((images ?? []).map((row) => [row.id, row.image_path]));
  const status = ORDER_STATUS[order.status];
  const greeting = `Olá, ${order.customer_name.split(" ")[0]}! Aqui é da Moraes Comercial sobre o seu pedido #${order.number}.`;
  const whatsapp = whatsappLink(order.customer_phone, greeting);

  return (
    <>
      <Link
        href="/admin/pedidos"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-ink/50 hover:text-ink"
      >
        <ArrowLeft className="size-4" /> Pedidos
      </Link>
      <PageHeader
        eyebrow={formatDateTime(order.created_at)}
        title={`Pedido #${order.number}`}
        actions={<Badge tone={status.tone}>{status.label}</Badge>}
      />

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-5">
          <Card>
            <CardTitle
              title="Andamento"
              description={order.handler ? `Último atendimento: ${order.handler.full_name}` : undefined}
            />
            <StatusStepper orderId={order.id} status={order.status} />
          </Card>

          <Card>
            <CardTitle title="Itens" />
            <ul className="divide-y divide-ink/5">
              {order.order_items.map((item) => {
                const src = mediaUrl(item.product_id ? imageFor.get(item.product_id) : null);
                return (
                  <li key={item.id} className="flex items-center gap-4 py-3">
                    <span className="relative h-14 w-10 shrink-0 rounded-xl bg-cloud">
                      {src && <Image src={src} alt="" fill sizes="40px" className="object-contain p-1" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      {item.product_id ? (
                        <Link
                          href={`/admin/produtos/${item.product_id}`}
                          className="block truncate font-medium hover:text-royal"
                        >
                          {item.product_name}
                        </Link>
                      ) : (
                        <span className="block truncate font-medium">{item.product_name}</span>
                      )}
                      <span className="text-xs text-ink/45">
                        {item.variant_label} · {formatPrice(item.unit_price)} un.
                      </span>
                    </span>
                    <span className="font-mono text-sm text-ink/60">×{item.quantity}</span>
                    <span className="w-24 text-right font-medium tabular-nums">{formatPrice(item.line_total)}</span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-2 flex items-baseline justify-between border-t border-ink/8 pt-4">
              <span className="text-sm text-ink/55">Subtotal</span>
              <span className="text-2xl font-semibold">{formatPrice(order.subtotal)}</span>
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardTitle title="Cliente" />
            <p className="text-xl font-bold">{order.customer_company ?? order.customer_name}</p>
            {order.customer_company && <p className="mt-1 text-sm text-ink/60">Contato: {order.customer_name}</p>}
            <ul className="mt-4 space-y-2 text-sm text-ink/65">
              {order.customer_phone && (
                <li className="flex items-center gap-2">
                  <Phone className="size-4" /> {order.customer_phone}
                </li>
              )}
              {order.customer?.email && (
                <li className="flex items-center gap-2">
                  <Mail className="size-4" /> {order.customer.email}
                </li>
              )}
            </ul>
            {whatsapp && (
              <a
                href={whatsapp}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-[#25d366] px-5 text-sm font-medium text-ink"
              >
                <WhatsappIcon className="size-4" /> Chamar no WhatsApp
              </a>
            )}
          </Card>

          {order.notes && (
            <Card>
              <CardTitle title="Observação do cliente" />
              <p className="text-sm whitespace-pre-line text-ink/75">{order.notes}</p>
            </Card>
          )}

          <Card>
            <CardTitle title="Anotações internas" description="Visível apenas para a equipe." />
            <InternalNotes orderId={order.id} notes={order.internal_notes} />
          </Card>
        </div>
      </div>
    </>
  );
}
