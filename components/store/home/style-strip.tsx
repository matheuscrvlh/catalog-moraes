import Image from "next/image";
import Link from "next/link";
import { BottleImage } from "@/components/store/bottle-image";
import type { Category } from "@/lib/catalog/types";
import { SectionTitle } from "./section-title";

const BACKDROPS = [
  "/images/cellar-shelves.webp",
  "/images/tasting-barrel.webp",
  "/images/rose-pour.webp",
  "/images/toast-sparkling.webp",
  "/images/white-grapes.webp",
  "/images/bottles-shelf.webp",
];

export function StyleStrip({ categories }: { categories: Category[] }) {
  const visible = categories.filter((category) => category.count > 0).slice(0, 6);

  return (
    <section className="pt-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionTitle eyebrow="Escolha pelo estilo" title="Do tinto ao espumante" />
      </div>
      <div className="mx-auto mt-14 grid max-w-7xl grid-cols-2 md:grid-cols-3 md:px-8 lg:grid-cols-6">
        {visible.map((category, index) => (
          <Link key={category.id} href={`/vinhos?categoria=${category.slug}`} className="group relative block">
            <div className="relative h-64 overflow-hidden">
              <Image
                src={BACKDROPS[index % BACKDROPS.length]}
                alt=""
                fill
                sizes="(min-width: 1024px) 16vw, 50vw"
                className="object-cover grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-white/45 transition duration-700 group-hover:bg-white/10" />
              <BottleImage
                path={category.cover}
                alt=""
                sizes="140px"
                className="absolute inset-x-[22%] top-[12%] bottom-0 drop-shadow-[0_18px_18px_rgba(23,25,43,0.35)] transition duration-700 ease-out-expo group-hover:-translate-y-2"
              />
            </div>
            <div className="bg-linen py-5 text-center transition group-hover:bg-navy">
              <p className="caps text-[14px] tracking-[0.24em] text-navy transition group-hover:text-white">
                {category.name}
              </p>
              <p className="mt-1 text-[11px] text-stone transition group-hover:text-white/70">
                {category.count} rótulos
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
