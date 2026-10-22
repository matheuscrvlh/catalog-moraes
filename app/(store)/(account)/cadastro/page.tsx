import type { Metadata } from "next";
import { Suspense } from "react";
import { SignUpForm } from "@/components/store/auth/auth-forms";
import { StoreAuth } from "@/components/store/auth/store-auth";

export const metadata: Metadata = { title: "Cadastro de empresa" };

export default function SignUpPage() {
  return (
    <StoreAuth
      title={
        <>
          Cadastre sua <span className="text-red">empresa</span>
        </>
      }
      subtitle="Adegas, mercados e restaurantes compram direto da distribuidora."
    >
      <Suspense>
        <SignUpForm />
      </Suspense>
    </StoreAuth>
  );
}
