"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Heart, Search, ShoppingBag, UserRound } from "lucide-react";
import { Logo } from "@/components/brand/brand-mark";
import { cn } from "@/lib/cn";
import { initials } from "@/lib/text";
import { useCart } from "./providers/cart";
import { useSession } from "./providers/session";
import { SearchOverlay } from "./search-overlay";

const NAV = [
  { href: "/", label: "Início" },
  { href: "/vinhos", label: "Catálogo" },
  { href: "/vinhos?categoria=espumantes", label: "Espumantes" },
  { href: "/vinhos?busca=exclusivo", label: "Exclusivos" },
  { href: "/#para-empresas", label: "Para empresas" },
];

const isActive = (href: string, pathname: string) =>
  href === "/" ? pathname === "/" : href === "/vinhos" && pathname.startsWith("/vinhos");

export function SiteHeader() {
  const pathname = usePathname();
  const { count, setOpen } = useCart();
  const { user } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearching(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const icon =
    "flex size-10 items-center justify-center rounded-full text-ink/75 transition hover:bg-linen hover:text-navy";

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 border-b bg-white/95 backdrop-blur-md transition-shadow duration-300",
          scrolled ? "border-line shadow-[0_12px_30px_-24px_rgba(23,25,43,0.35)]" : "border-transparent",
        )}
      >
        <div className="mx-auto grid h-[76px] max-w-7xl grid-cols-[1fr_auto] items-center gap-6 px-5 md:px-8 lg:grid-cols-[1fr_auto_1fr]">
          <Link href="/" aria-label="Moraes Comercial — início">
            <Logo tone="light" />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Principal">
            {NAV.map((item) => {
              const active = isActive(item.href, pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-2 text-[12px] font-medium tracking-[0.2em] uppercase transition",
                    active ? "text-navy" : "text-ink/65 hover:text-navy",
                  )}
                >
                  <span className={cn("h-px w-3 bg-red transition-all", active ? "opacity-100" : "w-0 opacity-0")} />
                  {item.label}
                  <span className={cn("h-px w-3 bg-red transition-all", active ? "opacity-100" : "w-0 opacity-0")} />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center justify-end gap-0.5">
            <button type="button" onClick={() => setSearching(true)} className={icon} aria-label="Buscar produtos">
              <Search className="size-[18px]" strokeWidth={1.7} />
            </button>
            <Link href="/conta?aba=favoritos" className={cn(icon, "hidden md:flex")} aria-label="Favoritos">
              <Heart className="size-[18px]" strokeWidth={1.7} />
            </Link>
            <Link
              href={user ? "/conta" : "/entrar"}
              className={cn(icon, "hidden md:flex")}
              aria-label={user ? "Minha conta" : "Entrar"}
            >
              {user ? (
                <span className="flex size-7 items-center justify-center rounded-full bg-navy text-[10px] font-medium text-white">
                  {initials(user.name) || "•"}
                </span>
              ) : (
                <UserRound className="size-[18px]" strokeWidth={1.7} />
              )}
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className={cn(icon, "relative")}
              aria-label={`Abrir pedido (${count} itens)`}
            >
              <ShoppingBag className="size-[18px]" strokeWidth={1.7} />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    className="absolute top-0.5 right-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red px-1 text-[10px] font-medium text-white"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>
      <SearchOverlay open={searching} onClose={() => setSearching(false)} />
    </>
  );
}
