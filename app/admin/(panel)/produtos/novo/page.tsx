import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductForm } from "@/components/admin/product-form/product-form";
import { PageHeader, PanelSkeleton } from "@/components/admin/ui";
import { getProductFormOptions } from "@/lib/admin/products";
import { requireStaff } from "@/lib/auth/viewer";

export const metadata: Metadata = { title: "Novo produto" };

export default function NewProductPage() {
  return (
    <>
      <PageHeader
        eyebrow="Produtos"
        title="Novo produto"
        description="Cadastre o rótulo, as versões vendáveis e as fotos."
      />
      <Suspense fallback={<PanelSkeleton />}>
        <NewProductForm />
      </Suspense>
    </>
  );
}

async function NewProductForm() {
  await requireStaff("products.manage");
  const options = await getProductFormOptions();
  return <ProductForm {...options} />;
}
