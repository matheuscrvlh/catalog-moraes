import Image from "next/image";
import { Reveal } from "@/components/ui/reveal";
import { WhatsappIcon } from "@/components/ui/brand-icons";

export function About({ whatsapp, producers }: { whatsapp: string | null; producers: string[] }) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-28 md:px-8">
      <div className="grid items-center gap-14 lg:grid-cols-[0.85fr_1.15fr]">
        <Reveal className="relative mx-auto w-full max-w-md">
          <div className="relative aspect-4/5 overflow-hidden">
            <Image
              src="/brand/sommelier.webp"
              alt="Equipe Moraes Comercial brindando com uma taça de vinho tinto"
              fill
              sizes="(min-width: 1024px) 440px, 90vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -right-5 -bottom-5 -z-10 h-full w-full border border-bronze/40" />
        </Reveal>

        <Reveal delay={0.1}>
          <p className="font-script text-4xl text-bronze">Quem somos</p>
          <h2 className="mt-3 font-display text-[clamp(2.2rem,4vw,3.2rem)] leading-[1.05] font-medium tracking-[0.04em] text-navy uppercase">
            Distribuidora Moraes Comercial
          </h2>
          <span className="mt-5 block h-px w-14 bg-red" />
          <p className="mt-6 max-w-xl text-[15.5px] leading-relaxed text-stone">
            Trabalhamos com vinícolas e importadoras do Brasil e do mundo para levar às adegas, mercados e restaurantes
            da região uma seleção que gira na prateleira: dos tintos de mesa aos rótulos de guarda, dos espumantes de
            fim de ano aos importados exclusivos.
          </p>

          <div className="mt-8">
            <p className="eyebrow text-[10px]! text-pebble">Algumas das marcas que distribuímos</p>
            <p className="mt-3 font-display text-xl leading-relaxed text-ink/70 italic">
              {producers.slice(0, 12).join(" · ")}
            </p>
          </div>

          {whatsapp && (
            <a
              href={whatsapp}
              target="_blank"
              rel="noreferrer"
              className="mt-10 inline-flex h-12 items-center gap-3 bg-navy px-8 text-[12px] font-medium tracking-[0.2em] text-white uppercase transition hover:bg-navy-900"
            >
              <WhatsappIcon className="size-4" /> Solicitar tabela de preços
            </a>
          )}
        </Reveal>
      </div>
    </section>
  );
}
