"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { mediaUrl } from "@/lib/media";
import type { Banner } from "@/lib/catalog/types";

const OVERLAY: Record<Banner["theme"], string> = {
  gold: "bg-ivory/80 md:bg-transparent md:bg-linear-to-r md:from-ivory md:via-ivory/85 md:to-ivory/0",
  navy: "bg-navy-950/70 md:bg-transparent md:bg-linear-to-r md:from-navy-950/90 md:via-navy-900/55 md:to-transparent",
  wine: "bg-[#22060f]/70 md:bg-transparent md:bg-linear-to-r md:from-[#22060f]/90 md:via-[#3a0a18]/55 md:to-transparent",
};

const DURATION = 7000;
const ease = [0.16, 1, 0.3, 1] as const;

export function HeroSlider({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = banners.length;
  const go = useCallback((next: number) => setIndex((next + total) % total), [total]);

  useEffect(() => {
    if (paused || total < 2) return;
    const timer = setTimeout(() => go(index + 1), DURATION);
    return () => clearTimeout(timer);
  }, [index, paused, total, go]);

  if (!total) return null;
  const banner = banners[index];
  const image = mediaUrl(banner.imagePath);
  const light = banner.theme === "gold";

  return (
    <section
      className="relative mx-auto max-w-7xl md:px-8 md:pt-6"
      aria-roledescription="carrossel"
      aria-label="Destaques"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative h-[560px] overflow-hidden bg-linen md:h-[600px]">
        <AnimatePresence initial={false}>
          <motion.div
            key={banner.id}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease }}
          >
            {image && (
              <motion.div
                className="absolute inset-0"
                initial={{ scale: 1.08 }}
                animate={{ scale: 1 }}
                transition={{ duration: DURATION / 1000 + 1.5, ease: "linear" }}
              >
                <Image
                  src={image}
                  alt=""
                  fill
                  priority={index === 0}
                  sizes="(min-width: 1280px) 1216px, 100vw"
                  className="object-cover"
                />
              </motion.div>
            )}
            <div className={cn("absolute inset-0", OVERLAY[banner.theme])} />

            <div className="relative flex h-full max-w-xl flex-col justify-center px-8 md:px-16">
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.8, ease }}
                className={cn("font-script text-[42px] leading-none", light ? "text-bronze" : "text-white/85")}
              >
                {banner.eyebrow}
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.9, ease }}
                className={cn(
                  "mt-4 font-display text-[clamp(2.6rem,5.4vw,4.6rem)] leading-[0.98] font-medium tracking-[0.02em] uppercase",
                  light ? "text-navy" : "text-white",
                )}
              >
                {banner.title}
              </motion.h1>
              {banner.subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, duration: 0.9, ease }}
                  className={cn("mt-5 max-w-md text-[15.5px] leading-relaxed", light ? "text-stone" : "text-white/80")}
                >
                  {banner.subtitle}
                </motion.p>
              )}
              {banner.ctaHref && banner.ctaLabel && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  <Link
                    href={banner.ctaHref}
                    className={cn(
                      "group mt-9 inline-flex h-12 items-center gap-3 px-8 text-[12px] font-medium tracking-[0.2em] uppercase transition",
                      light ? "bg-navy text-white hover:bg-navy-900" : "bg-white text-navy hover:bg-ivory",
                    )}
                  >
                    {banner.ctaLabel}
                    <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {total > 1 && (
          <>
            <div className="absolute bottom-7 left-1/2 flex -translate-x-1/2 gap-2.5">
              {banners.map((item, position) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => go(position)}
                  className="relative h-[3px] w-9 overflow-hidden bg-white/50"
                  aria-label={`Ir para destaque ${position + 1}`}
                  aria-current={position === index}
                >
                  {position === index && (
                    <motion.span
                      key={`${item.id}-${paused}`}
                      className="absolute inset-y-0 left-0 bg-red"
                      initial={{ width: paused ? "100%" : "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: paused ? 0 : DURATION / 1000, ease: "linear" }}
                    />
                  )}
                </button>
              ))}
            </div>
            <div
              className={cn(
                "absolute right-6 bottom-5 hidden items-center gap-1 md:flex",
                light ? "text-navy" : "text-white",
              )}
            >
              <button
                type="button"
                onClick={() => go(index - 1)}
                className="p-2 opacity-70 transition hover:opacity-100"
                aria-label="Anterior"
              >
                <ChevronLeft className="size-5" strokeWidth={1.4} />
              </button>
              <span className="h-6 w-px bg-current opacity-30" />
              <button
                type="button"
                onClick={() => go(index + 1)}
                className="p-2 opacity-70 transition hover:opacity-100"
                aria-label="Próximo"
              >
                <ChevronRight className="size-5" strokeWidth={1.4} />
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
