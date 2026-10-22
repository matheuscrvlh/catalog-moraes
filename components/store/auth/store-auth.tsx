import Image from "next/image";
import type { ReactNode } from "react";
import { AuthShowcase } from "@/components/auth/auth-card";

const THUMBS = [
  "/products/aurora-gran-reserva.webp",
  "/products/alianca-champenoise-brut.webp",
  "/products/pedra-do-urso-tinto.webp",
];

export function StoreAuth({ title, subtitle, children }: { title: ReactNode; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      <section className="flex flex-col justify-center px-5 pt-6 pb-20 sm:px-10 md:py-14 lg:px-14 xl:px-24">
        <div className="mx-auto w-full max-w-110">
          <p className="mb-3 text-[11px] font-semibold tracking-[0.24em] text-red uppercase [@media(max-height:700px)]:hidden">
            Área do cliente
          </p>
          <h1 className="font-admin text-[clamp(1.85rem,3vw,2.5rem)] leading-tight font-semibold tracking-tight text-ink">
            {title}
          </h1>
          <p className="mt-2 text-[15px] text-stone [@media(max-height:620px)]:hidden">{subtitle}</p>
          <div className="mt-8 [@media(max-height:700px)]:mt-6">{children}</div>
        </div>
      </section>

      <div className="relative isolate hidden overflow-hidden bg-ink lg:block">
        <Image
          src="/images/login-pour.webp"
          alt=""
          fill
          priority
          sizes="55vw"
          className="-z-20 object-cover object-[85%_center]"
        />
        <div className="absolute inset-0 -z-10 bg-linear-to-br from-black/50 via-black/10 to-black/30" />
        <AuthShowcase
          quote="Monte o pedido da sua empresa pelo catálogo e finalize com o vendedor, com preço de distribuidora."
          quoteAuthor="Moraes Comercial"
          badge={{ title: "Mais de 100 rótulos", subtitle: "nacionais e importados", thumbs: THUMBS }}
        />
      </div>
    </div>
  );
}
