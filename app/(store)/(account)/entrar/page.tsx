import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInForm } from "@/components/store/auth/auth-forms";
import { StoreAuth } from "@/components/store/auth/store-auth";

export const metadata: Metadata = { title: "Entrar" };

export default function SignInPage() {
  return (
    <StoreAuth
      title={
        <>
          Entre na sua <span className="text-red">conta</span>
        </>
      }
      subtitle="Acesse o catálogo com seus pedidos e favoritos."
    >
      <Suspense>
        <SignInForm />
      </Suspense>
    </StoreAuth>
  );
}
