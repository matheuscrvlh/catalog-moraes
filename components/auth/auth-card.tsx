import Image from "next/image";
import type { ReactNode } from "react";
import { BrandMark, Logo } from "@/components/brand/brand-mark";

type Props = {
  title: ReactNode;
  subtitle: string;
  image: string;
  quote: string;
  quoteAuthor: string;
  badge: { title: string; subtitle: string; thumbs: string[] };
  children: ReactNode;
};

export function AuthCard({ title, subtitle, image, quote, quoteAuthor, badge, children }: Props) {
  return (
    <div className="grid w-full max-w-6xl overflow-hidden rounded-[34px] bg-white p-2.5 shadow-[0_40px_100px_-50px_rgba(23,25,43,0.45)] lg:grid-cols-[0.92fr_1.08fr]">
      <div className="flex flex-col rounded-[28px] bg-ivory px-7 py-10 md:px-14 md:py-14">
        <div className="flex justify-center">
          <Logo tone="light" />
        </div>
        <div className="mt-10 text-center">
          <h1 className="font-admin text-[clamp(1.9rem,3vw,2.5rem)] leading-tight font-semibold tracking-tight text-ink">
            {title}
          </h1>
          <p className="mt-3 text-[15px] text-stone">{subtitle}</p>
        </div>
        <div className="mt-9 flex-1">{children}</div>
      </div>

      <div className="relative hidden min-h-[640px] overflow-hidden rounded-[28px] lg:block">
        <Image src={image} alt="" fill priority sizes="600px" className="object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-black/20" />

        <div className="absolute top-6 right-6 rounded-2xl border border-white/20 bg-white/15 p-4 text-white backdrop-blur-md">
          <div className="flex -space-x-3">
            {badge.thumbs.map((thumb) => (
              <span
                key={thumb}
                className="relative size-11 overflow-hidden rounded-full border-2 border-white/80 bg-ivory"
              >
                <Image src={thumb} alt="" fill sizes="44px" className="object-contain p-1" />
              </span>
            ))}
          </div>
          <p className="mt-3 text-[13px] font-medium">{badge.title}</p>
          <p className="text-[12px] text-white/70">{badge.subtitle}</p>
        </div>

        <div className="absolute top-1/2 right-6 flex -translate-y-1/2 flex-col gap-2">
          {[0, 1, 2, 3].map((dot) => (
            <span
              key={dot}
              className={dot === 1 ? "h-8 w-1.5 rounded-full bg-white" : "size-1.5 rounded-full bg-white/50"}
            />
          ))}
        </div>

        <figure className="absolute inset-x-8 bottom-8 text-white">
          <span className="font-display text-6xl leading-none text-white/90">“</span>
          <blockquote className="-mt-4 max-w-sm text-[17px] leading-relaxed">{quote}</blockquote>
          <figcaption className="mt-5 flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-white">
              <BrandMark tone="light" className="h-5 w-auto" />
            </span>
            <span>
              <span className="block text-sm font-medium">{quoteAuthor}</span>
              <span className="block text-xs text-white/65">Distribuidora de vinhos</span>
            </span>
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
