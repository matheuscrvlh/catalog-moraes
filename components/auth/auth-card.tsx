import Image from "next/image";
import type { ReactNode } from "react";
import { BrandMark, Logo } from "@/components/brand/brand-mark";
import { cn } from "@/lib/cn";

type Showcase = {
  quote: string;
  quoteAuthor: string;
  badge: { title: string; subtitle: string; thumbs: string[] };
};

type Props = Showcase & {
  title: ReactNode;
  subtitle: string;
  image: string;
  className?: string;
  children: ReactNode;
};

export function AuthShowcase({ quote, quoteAuthor, badge }: Showcase) {
  return (
    <>
      <div className="absolute top-4 right-4 rounded-2xl border border-white/20 bg-white/10 p-4 text-white backdrop-blur-md">
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

      <figure className="absolute top-10 left-12 max-w-sm text-white">
        <span className="font-display text-6xl leading-none text-white/90">“</span>
        <blockquote className="-mt-4 text-[18px] leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
          {quote}
        </blockquote>
        <figcaption className="mt-5 flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-white">
            <BrandMark tone="light" className="h-5 w-auto" />
          </span>
          <span>
            <span className="block text-sm font-medium">{quoteAuthor}</span>
            <span className="block text-xs text-white/70">Distribuidora de vinhos</span>
          </span>
        </figcaption>
      </figure>
    </>
  );
}

export function AuthScreen({ title, subtitle, image, quote, quoteAuthor, badge, className, children }: Props) {
  return (
    <div className={cn("relative isolate flex overflow-hidden bg-ink", className)}>
      <Image src={image} alt="" fill priority sizes="100vw" className="-z-20 object-cover object-right" />
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-black/45 via-black/10 to-black/30" />

      <div className="flex w-full p-3 md:p-5">
        <div className="relative isolate flex w-full flex-col overflow-hidden rounded-[32px] border border-white/70 bg-white/65 px-6 py-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_40px_100px_-40px_rgba(0,0,0,0.85)] backdrop-blur-2xl backdrop-saturate-150 sm:px-12 md:max-w-[540px] md:px-14 md:py-12">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-white/80 via-white/30 to-white/60"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 -left-24 -z-10 size-80 rounded-full bg-white/70 blur-3xl"
          />
          <div className="flex justify-center">
            <Logo tone="light" />
          </div>
          <div className="my-auto py-8 md:py-10 [@media(max-height:700px)]:py-4">
            <div className="text-center">
              <h1 className="font-admin text-[clamp(1.9rem,3vw,2.5rem)] leading-tight font-semibold tracking-tight text-ink">
                {title}
              </h1>
              <p className="mt-3 text-[15px] text-stone [@media(max-height:700px)]:hidden">{subtitle}</p>
            </div>
            <div className="mt-7 md:mt-9">{children}</div>
          </div>
          <p className="text-center text-[11.5px] text-stone [@media(max-height:700px)]:hidden">
            Distribuidora Moraes Comercial
          </p>
        </div>

        <div className="relative hidden flex-1 lg:block">
          <AuthShowcase quote={quote} quoteAuthor={quoteAuthor} badge={badge} />
        </div>
      </div>
    </div>
  );
}
