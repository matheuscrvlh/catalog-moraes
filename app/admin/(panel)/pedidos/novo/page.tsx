import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { OrderBuilder } from "@/components/admin/order-builder";
import { PageHeader, PanelSkeleton } from "@/components/admin/ui";
import { getOrderCatalog } from "@/lib/admin/order-catalog";
import { requireStaff } from "@/lib/auth/viewer";

export const metadata: Metadata = { title: "Novo pedido" };

export default function NewOrderPage() {
  return (
    <>
      <Link
        href="/admin/pedidos"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-ink/50 hover:text-ink"
      >
        <ArrowLeft className="size-4" /> Pedidos
      </Link>
      <PageHeader
        title="Novo pedido"
        description="Navegue pelo catálogo com o cliente, adicione os vinhos e finalize em Pedido."
      />
      <Suspense fallback={<PanelSkeleton />}>
        <Builder />
      </Suspense>
    </>
  );
}

async function Builder() {
  await requireStaff("orders.manage");
  return <OrderBuilder products={await getOrderCatalog()} />;
}
