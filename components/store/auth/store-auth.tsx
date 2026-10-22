import type { ReactNode } from "react";
import { AuthCard } from "@/components/auth/auth-card";

const THUMBS = [
  "/products/aurora-gran-reserva.webp",
  "/products/alianca-champenoise-brut.webp",
  "/products/pedra-do-urso-tinto.webp",
];

export function StoreAuth({ title, subtitle, children }: { title: ReactNode; subtitle: string; children: ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-113px)] items-center justify-center bg-cloud px-3 py-10 md:px-8 md:py-16">
      <AuthCard
        title={title}
        subtitle={subtitle}
        image="/images/red-swirl.webp"
        quote="Monte o pedido da sua empresa pelo catálogo e finalize com o vendedor, com preço de distribuidora."
        quoteAuthor="Moraes Comercial"
        badge={{ title: "Mais de 100 rótulos", subtitle: "nacionais e importados", thumbs: THUMBS }}
      >
        {children}
      </AuthCard>
    </div>
  );
}
