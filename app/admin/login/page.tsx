import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { AdminLoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = { title: "Painel", robots: { index: false } };

const THUMBS = [
  "/products/marques-de-riscal-reserva.webp",
  "/products/nova-speciale-150-anos.webp",
  "/products/lourinho-tinto-meio-seco.webp",
];

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cloud px-3 py-10 font-admin md:px-8">
      <AuthCard
        title={
          <>
            Painel <span className="text-red">Moraes</span>
          </>
        }
        subtitle="Gestão de catálogo, pedidos e equipe da distribuidora."
        image="/images/fluid-red.webp"
        quote="Estoque, pedidos e clientes da distribuidora em um só lugar, atualizados em tempo real."
        quoteAuthor="Moraes Comercial"
        badge={{ title: "Catálogo ao vivo", subtitle: "o que você publica aparece na loja", thumbs: THUMBS }}
      >
        <Suspense>
          <AdminLoginForm />
        </Suspense>
      </AuthCard>
    </div>
  );
}
