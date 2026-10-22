"use client";

import { RotateCcw } from "lucide-react";
import { BrandMark } from "@/components/brand/brand-mark";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ivory px-6 text-center text-ink">
      <BrandMark tone="light" className="h-12 w-auto" />
      <h1 className="caps mt-8 text-4xl text-navy">Algo saiu do previsto.</h1>
      <p className="mt-3 max-w-sm text-stone">
        Não conseguimos carregar esta página agora. Tente novamente em instantes.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 inline-flex items-center gap-2 rounded-full border border-ink/20 px-6 py-3 text-sm transition hover:border-navy hover:text-navy"
      >
        <RotateCcw className="size-4" /> Tentar de novo
      </button>
    </main>
  );
}
