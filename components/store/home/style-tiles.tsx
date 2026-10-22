import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/cn";

const TILES = [
  { href: "/vinhos?categoria=tintos", script: "Encorpados", title: "Vinhos tintos", image: "/images/red-grapes.webp" },
  {
    href: "/vinhos?categoria=brancos",
    script: "Leves e frescos",
    title: "Vinhos brancos",
    image: "/images/white-wine-glass.webp",
  },
  {
    href: "/vinhos?categoria=espumantes",
    script: "Para brindar",
    title: "Espumantes",
    image: "/images/champagne-rows.webp",
  },
];

export function StyleTiles() {
  return (
    <section className="mx-auto grid max-w-7xl gap-4 px-5 pt-6 md:grid-cols-3 md:px-8">
      {TILES.map((tile, index) => (
        <Reveal key={tile.href} delay={index * 0.08}>
          <Link href={tile.href} className="group relative block h-60 overflow-hidden bg-linen md:h-64">
            <Image
              src={tile.image}
              alt=""
              fill
              sizes="(min-width: 768px) 33vw, 100vw"
              className="object-cover transition duration-[1.4s] ease-out-expo group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-linear-to-t from-ink/75 via-ink/15 to-transparent" />
            <div className="absolute inset-x-6 bottom-6 flex items-end justify-between text-white">
              <span>
                <span className="block font-script text-3xl leading-none text-white/85">{tile.script}</span>
                <span className="caps mt-1 block text-[19px] tracking-[0.22em]">{tile.title}</span>
              </span>
              <ArrowRight className="size-5 -translate-x-2 opacity-0 transition duration-500 group-hover:translate-x-0 group-hover:opacity-100" />
            </div>
          </Link>
        </Reveal>
      ))}
    </section>
  );
}

export function Highlights({ items }: { items: { value: string; label: string }[] }) {
  return (
    <section className="mx-auto max-w-7xl px-5 pt-14 md:px-8">
      <dl className="grid grid-cols-2 border-y border-line md:grid-cols-4">
        {items.map((item, index) => (
          <div
            key={item.label}
            className={cn("flex flex-col py-7 text-center", index > 0 && "border-line md:border-l")}
          >
            <dt className="order-2 mt-1 text-[11px] tracking-[0.2em] text-stone uppercase">{item.label}</dt>
            <dd className="font-display text-4xl font-medium text-navy">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
