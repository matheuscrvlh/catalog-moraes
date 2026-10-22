import type { Metadata } from "next";
import { Suspense } from "react";
import { CategorySheet } from "@/components/admin/catalog-forms";
import { ActionSwitch, DeleteButton } from "@/components/admin/controls";
import { EmptyState, PageHeader, PanelSkeleton, table } from "@/components/admin/ui";
import { deleteCategory, setCategoryActive } from "@/lib/admin/catalog-actions";
import { requireStaff } from "@/lib/auth/viewer";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Categorias" };

export default function CategoriesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Catálogo"
        title="Categorias"
        description="Os estilos que organizam a loja: cada um tem uma cor própria, usada nos filtros, nos cards e nos gráficos."
        actions={<CategorySheet />}
      />
      <Suspense fallback={<PanelSkeleton />}>
        <CategoriesTable />
      </Suspense>
    </>
  );
}

async function CategoriesTable() {
  await requireStaff("catalog.manage");
  const supabase = await createClient();
  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from("categories").select("*").order("position").order("name"),
    supabase.from("products").select("category_id"),
  ]);

  if (!categories?.length)
    return <EmptyState title="Nenhuma categoria" description="Crie o primeiro estilo do catálogo." />;

  const counts = new Map<string, number>();
  (products ?? []).forEach((product) => counts.set(product.category_id, (counts.get(product.category_id) ?? 0) + 1));

  return (
    <div className={table.wrap}>
      <table className={table.table}>
        <thead className={table.head}>
          <tr>
            <th className={table.th}>Categoria</th>
            <th className={table.th}>Endereço</th>
            <th className={table.th}>Produtos</th>
            <th className={table.th}>Ordem</th>
            <th className={table.th}>Na loja</th>
            <th className={table.th} />
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id} className={table.row}>
              <td className={table.td}>
                <span className="flex items-center gap-3">
                  <span className="size-8 rounded-xl" style={{ background: category.accent }} />
                  <span>
                    <span className="block font-medium">{category.name}</span>
                    <span className="block max-w-xs truncate text-xs text-ink/45">{category.description}</span>
                  </span>
                </span>
              </td>
              <td className={`${table.td} font-mono text-xs text-ink/55`}>/{category.slug}</td>
              <td className={`${table.td} tabular-nums`}>{counts.get(category.id) ?? 0}</td>
              <td className={`${table.td} tabular-nums`}>{category.position}</td>
              <td className={table.td}>
                <ActionSwitch
                  checked={category.active}
                  label={`Exibir ${category.name}`}
                  action={setCategoryActive.bind(null, category.id)}
                />
              </td>
              <td className={`${table.td} text-right`}>
                <span className="inline-flex items-center gap-1">
                  <CategorySheet category={category} />
                  <DeleteButton
                    label={`Remover ${category.name}`}
                    confirmText={`Remover a categoria "${category.name}"? Só é possível se não houver produtos nela.`}
                    action={deleteCategory.bind(null, category.id)}
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
