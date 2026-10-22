import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/product-form/product-form";
import { PageHeader, PanelSkeleton } from "@/components/admin/ui";
import { getProductForForm, getProductFormOptions } from "@/lib/admin/products";
import { requireStaff } from "@/lib/auth/viewer";

export const metadata: Metadata = { title: "Editar produto" };

export default function EditProductPage({ params }: PageProps<"/admin/produtos/[id]">) {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <EditProduct params={params} />
    </Suspense>
  );
}

async function EditProduct({ params }: { params: PageProps<"/admin/produtos/[id]">["params"] }) {
  await requireStaff("products.manage");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const [product, options] = await Promise.all([getProductForForm(id), getProductFormOptions()]);
  if (!product) notFound();

  return (
    <>
      <Link
        href="/admin/produtos"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-ink/50 hover:text-ink"
      >
        <ArrowLeft className="size-4" /> Produtos
      </Link>
      <PageHeader eyebrow="Editar produto" title={product.name} />
      <ProductForm key={product.id} product={product} {...options} />
    </>
  );
}
