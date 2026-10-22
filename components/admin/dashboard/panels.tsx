import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/admin/ui";
import type { DashboardData } from "@/lib/admin/dashboard";
import { formatInteger, formatPrice, formatRelative, ORDER_STATUS, type OrderStatus } from "@/lib/format";
import { mediaUrl } from "@/lib/media";

export function Composition({ categories }: { categories: DashboardData["categories"] }) {
  const total = categories.reduce((sum, category) => sum + category.products, 0) || 1;
  const visible = categories.filter((category) => category.products > 0);

  return (
    <div>
      <div className="flex h-3 gap-[2px] overflow-hidden rounded-full" role="img" aria-label="Produtos por estilo">
        {visible.map((category) => (
          <span
            key={category.name}
            style={{ width: `${(category.products / total) * 100}%`, background: category.accent }}
          />
        ))}
      </div>
      <table className="mt-5 w-full text-[13px]">
        <thead className="sr-only">
          <tr>
            <th>Estilo</th>
            <th>Rótulos</th>
            <th>Garrafas em estoque</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.name} className="border-b border-ink/5 last:border-0">
              <td className="py-2">
                <span className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full" style={{ background: category.accent }} />
                  {category.name}
                </span>
              </td>
              <td className="py-2 text-right text-ink/70 tabular-nums">{category.products} rótulos</td>
              <td className="w-28 py-2 text-right text-ink/45 tabular-nums">{formatInteger(category.stock)} un.</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StatusSummary({ status }: { status: DashboardData["status"] }) {
  const entries = (Object.keys(ORDER_STATUS) as OrderStatus[]).map((key) => ({ key, count: status[key] ?? 0 }));
  return (
    <ul className="grid grid-cols-2 gap-2">
      {entries.map(({ key, count }) => (
        <li key={key}>
          <Link
            href={`/admin/pedidos?status=${key}`}
            className="flex items-center justify-between rounded-2xl bg-cloud/70 px-3.5 py-3 transition hover:bg-cloud"
          >
            <Badge tone={ORDER_STATUS[key].tone}>{ORDER_STATUS[key].label}</Badge>
            <span className="text-lg font-semibold tabular-nums">{count}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

type RankItem = { id: string; name: string; image_path: string | null; value: number; detail: string; href: string };

export function Ranking({ items, unit }: { items: RankItem[]; unit: string }) {
  if (!items.length) return <p className="py-8 text-center text-sm text-ink/45">Sem dados no período.</p>;
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <ol className="space-y-3">
      {items.map((item, index) => {
        const src = mediaUrl(item.image_path);
        return (
          <li key={item.id}>
            <Link href={item.href} className="group flex items-center gap-3.5">
              <span className="w-4 font-mono text-[11px] text-ink/35">{index + 1}</span>
              <span className="relative flex h-12 w-9 shrink-0 items-center justify-center rounded-lg bg-cloud">
                {src && <Image src={src} alt="" fill sizes="36px" className="object-contain p-0.5" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-medium group-hover:text-royal">{item.name}</span>
                <span className="mt-1.5 block h-1.5 rounded-full bg-cloud">
                  <span
                    className="block h-full rounded-full bg-royal"
                    style={{ width: `${(item.value / max) * 100}%` }}
                  />
                </span>
              </span>
              <span className="w-20 text-right">
                <span className="block text-[13.5px] font-semibold tabular-nums">
                  {formatInteger(item.value)} <span className="text-[11px] font-normal text-ink/45">{unit}</span>
                </span>
                <span className="block text-[11px] text-ink/45">{item.detail}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

export function RecentOrders({ orders }: { orders: DashboardData["recent_orders"] }) {
  return (
    <ul className="divide-y divide-ink/5">
      {orders.map((order) => (
        <li key={order.id}>
          <Link href={`/admin/pedidos/${order.id}`} className="group flex items-center gap-4 py-3">
            <span className="w-14 font-mono text-[13px] text-ink/50">#{order.number}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13.5px] font-medium">{order.customer_name}</span>
              <span className="text-[11.5px] text-ink/45">
                {order.contact_name !== order.customer_name && `${order.contact_name} · `}
                {order.items} {order.items === 1 ? "item" : "itens"} · {formatRelative(order.created_at)}
              </span>
            </span>
            <Badge tone={ORDER_STATUS[order.status].tone}>{ORDER_STATUS[order.status].label}</Badge>
            <span className="hidden w-24 text-right text-[13.5px] font-semibold tabular-nums sm:block">
              {formatPrice(order.subtotal)}
            </span>
            <ArrowUpRight className="size-4 text-ink/30 transition group-hover:text-royal" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

const ACTIONS: Record<string, string> = { insert: "criou", update: "atualizou", delete: "removeu" };
const ENTITIES: Record<string, string> = {
  products: "o produto",
  categories: "a categoria",
  producers: "a vinícola",
  banners: "o banner",
  roles: "o cargo",
  orders: "o pedido",
  members: "o acesso de um membro",
  store_settings: "as configurações",
};

export function Activity({ activity }: { activity: DashboardData["activity"] }) {
  if (!activity.length) return <p className="py-8 text-center text-sm text-ink/45">Nenhuma alteração ainda.</p>;
  return (
    <ol className="relative space-y-5 before:absolute before:top-2 before:bottom-2 before:left-[5px] before:w-px before:bg-ink/8">
      {activity.map((entry) => (
        <li key={entry.id} className="relative pl-6">
          <span className="absolute top-1.5 left-0 size-[11px] rounded-full border-2 border-white bg-royal" />
          <p className="text-[13px] leading-snug">
            <span className="font-medium">{entry.actor ?? "Sistema"}</span>{" "}
            <span className="text-ink/55">
              {ACTIONS[entry.action] ?? entry.action} {ENTITIES[entry.entity] ?? entry.entity}
            </span>{" "}
            {entry.summary && <span className="font-medium">{entry.summary}</span>}
          </p>
          <p className="mt-0.5 text-[11.5px] text-ink/40">{formatRelative(entry.created_at)}</p>
        </li>
      ))}
    </ol>
  );
}
