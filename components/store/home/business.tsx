import Link from "next/link";
import { BadgePercent, Headset, ShieldCheck, Truck } from "lucide-react";
import { BottleImage } from "@/components/store/bottle-image";
import { DiamondRing } from "@/components/brand/brand-mark";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { WhatsappIcon } from "@/components/ui/brand-icons";
import type { ProductCard } from "@/lib/catalog/types";

const BENEFITS = [
  {
    icon: BadgePercent,
    title: "Preço de distribuidora",
    text: "Tabela pensada para revenda, com condições para volume.",
  },
  { icon: Headset, title: "Vendedor dedicado", text: "Atendimento direto para montar o mix certo para o seu ponto." },
  { icon: ShieldCheck, title: "Rótulos exclusivos", text: "Importados que só a Moraes distribui na região." },
  { icon: Truck, title: "Entrega combinada", text: "Prazos e frete acertados no fechamento do pedido." },
];

type Props = { bottles: ProductCard[]; stats: { products: number; countries: number }; whatsapp: string | null };

export function Business({ bottles, stats, whatsapp }: Props) {
  const [front, back] = bottles;

  return (
    <section id="para-empresas" className="mt-28 scroll-mt-24 overflow-hidden bg-white py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 md:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative mx-auto h-[460px] w-full max-w-md">
          <DiamondRing
            className="absolute top-1/2 left-1/2 size-[92%] -translate-x-1/2 -translate-y-1/2 text-navy/15"
            strokeWidth={1.2}
          />
          <div className="absolute top-[18%] left-[16%] size-0 border-x-[46px] border-b-[80px] border-x-transparent border-b-red/90" />
          <div className="absolute top-[8%] right-[18%] size-0 border-x-[22px] border-t-[30px] border-x-transparent border-t-navy" />
          <div className="absolute top-[30%] left-0 flex flex-col gap-3">
            {[0, 1, 2, 3].map((dash) => (
              <span key={dash} className={dash === 0 ? "h-6 w-px bg-red" : "h-6 w-px bg-ink/20"} />
            ))}
          </div>
          {back && (
            <Reveal className="absolute top-[4%] right-[10%] h-[70%] w-[34%] rotate-[24deg]" y={40}>
              <BottleImage
                path={back.imagePath}
                alt={back.name}
                sizes="200px"
                className="h-full w-full drop-shadow-[0_24px_30px_rgba(23,25,43,0.3)]"
              />
            </Reveal>
          )}
          {front && (
            <Reveal className="absolute bottom-0 left-[18%] h-[86%] w-[38%] -rotate-[28deg]" delay={0.15} y={60}>
              <BottleImage
                path={front.imagePath}
                alt={front.name}
                sizes="220px"
                className="h-full w-full drop-shadow-[0_30px_40px_rgba(23,25,43,0.35)]"
              />
            </Reveal>
          )}
        </div>

        <div>
          <Reveal>
            <p className="font-script text-4xl text-bronze">Para o seu negócio</p>
            <h2 className="mt-3 font-display text-[clamp(2.4rem,4.6vw,3.8rem)] leading-[1.02] font-medium text-navy italic">
              Mais de {Math.floor(stats.products / 10) * 10} rótulos de {stats.countries} países para abastecer adegas,
              mercados e restaurantes
            </h2>
            <p className="mt-6 max-w-lg text-[15.5px] leading-relaxed text-stone">
              A Moraes Comercial é distribuidora: atende quem revende e serve vinho. Crie a conta da sua empresa para
              montar pedidos pelo site, acompanhar o histórico e falar direto com o vendedor.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {BENEFITS.map((benefit, index) => (
              <Reveal key={benefit.title} delay={index * 0.06} className="flex gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-linen text-navy">
                  <benefit.icon className="size-5" strokeWidth={1.5} />
                </span>
                <span>
                  <span className="block text-[14px] font-medium text-ink">{benefit.title}</span>
                  <span className="mt-1 block text-[13px] leading-relaxed text-stone">{benefit.text}</span>
                </span>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.2} className="mt-10 flex flex-wrap items-center gap-3">
            <ButtonLink href="/cadastro" size="lg">
              Criar conta da empresa
            </ButtonLink>
            {whatsapp && (
              <a
                href={whatsapp}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-13 items-center gap-2.5 border border-ink/20 px-7 text-[12px] font-medium tracking-[0.18em] text-ink uppercase transition hover:border-[#1fae5b] hover:text-[#1fae5b]"
              >
                <WhatsappIcon className="size-4" /> Falar com vendedor
              </a>
            )}
            <Link href="/vinhos" className="ml-1 text-[13px] text-navy underline-offset-4 hover:underline">
              Ver catálogo ›
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
