import type { Metadata } from "next";
import { Suspense } from "react";
import { ProducerSheet } from "@/components/admin/catalog-forms";
import { ActionSwitch, DeleteButton } from "@/components/admin/controls";
import { EmptyState, PageHeader, PanelSkeleton, table } from "@/components/admin/ui";
import { deleteProducer, setProducerActive } from "@/lib/admin/catalog-actions";
import { requireStaff } from "@/lib/auth/viewer";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Vinícolas" };

export default function ProducersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Catálogo"
        title="Vinícolas"
        description="Produtores e marcas. Aparecem nos cards, na busca e no letreiro da página inicial."
        actions={<ProducerSheet />}
      />
      <Suspense fallback={<PanelSkeleton />}>
        <ProducersTable />
      </Suspense>
    </>
  );
}

async function ProducersTable() {
  await requireStaff("catalog.manage");
  const supabase = await createClient();
  const [{ data: producers }, { data: products }] = await Promise.all([
    supabase.from("producers").select("*").order("name"),
    supabase.from("products").select("producer_id"),
  ]);

  if (!producers?.length) return <EmptyState title="Nenhuma vinícola" description="Cadastre o primeiro produtor." />;

  const counts = new Map<string, number>();
  (products ?? []).forEach(
    (product) => product.producer_id && counts.set(product.producer_id, (counts.get(product.producer_id) ?? 0) + 1),
  );

  return (
    <div className={table.wrap}>
      <table className={table.table}>
        <thead className={table.head}>
          <tr>
            <th className={table.th}>Vinícola</th>
            <th className={table.th}>Origem</th>
            <th className={table.th}>Produtos</th>
            <th className={table.th}>Ativa</th>
            <th className={table.th} />
          </tr>
        </thead>
        <tbody>
          {producers.map((producer) => (
            <tr key={producer.id} className={table.row}>
              <td className={table.td}>
                <span className="block font-medium">{producer.name}</span>
                <span className="font-mono text-xs text-ink/45">/{producer.slug}</span>
              </td>
              <td className={`${table.td} text-ink/70`}>
                {[producer.region, producer.country].filter(Boolean).join(", ") || "—"}
              </td>
              <td className={`${table.td} tabular-nums`}>{counts.get(producer.id) ?? 0}</td>
              <td className={table.td}>
                <ActionSwitch
                  checked={producer.active}
                  label={`Ativar ${producer.name}`}
                  action={setProducerActive.bind(null, producer.id)}
                />
              </td>
              <td className={`${table.td} text-right`}>
                <span className="inline-flex items-center gap-1">
                  <ProducerSheet producer={producer} />
                  <DeleteButton
                    label={`Remover ${producer.name}`}
                    confirmText={`Remover "${producer.name}"? Os produtos ficam sem vinícola vinculada.`}
                    action={deleteProducer.bind(null, producer.id)}
                  />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
