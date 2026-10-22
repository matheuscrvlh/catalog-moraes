"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Heart, House, ShoppingBag, UserRound, Wine } from "lucide-react";
import { cn } from "@/lib/cn";
import { useCart } from "./providers/cart";
import { useSession } from "./providers/session";

export function MobileNav() {
  const pathname = usePathname();
  const { count, setOpen } = useCart();
  const { user } = useSession();

  const left = [
    { href: "/", label: "Início", icon: House, active: pathname === "/" },
    { href: "/vinhos", label: "Catálogo", icon: Wine, active: pathname.startsWith("/vinhos") },
  ];
  const right = [
    { href: "/conta?aba=favoritos", label: "Favoritos", icon: Heart, active: false },
    {
      href: user ? "/conta" : "/entrar",
      label: user ? "Conta" : "Entrar",
      icon: UserRound,
      active: pathname.startsWith("/conta") || pathname === "/entrar",
    },
  ];

  const item = (entry: (typeof left)[number]) => (
    <Link
      key={entry.label}
      href={entry.href}
      className={cn(
        "flex flex-1 flex-col items-center gap-1 pt-3 pb-2.5 text-[10px] tracking-wide transition",
        entry.active ? "text-navy" : "text-pebble",
      )}
    >
      <entry.icon className="size-5" strokeWidth={entry.active ? 2 : 1.6} />
      {entry.label}
    </Link>
  );

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 md:hidden" aria-label="Navegação inferior">
      <div className="relative">
        <div className="absolute inset-0 rounded-t-[28px] bg-white [mask-image:radial-gradient(circle_38px_at_50%_0,transparent_37px,black_38px)] shadow-[0_-10px_30px_-12px_rgba(23,25,43,0.25)]" />
        <div className="relative flex items-stretch pb-[env(safe-area-inset-bottom)]">
          {left.map(item)}
          <div className="w-20 shrink-0" />
          {right.map(item)}
        </div>
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={() => setOpen(true)}
          className="absolute -top-7 left-1/2 flex size-14 -translate-x-1/2 items-center justify-center rounded-full bg-red text-white shadow-[0_12px_24px_-8px_rgba(227,38,46,0.8)]"
          aria-label={`Abrir pedido (${count} itens)`}
        >
          <ShoppingBag className="size-5" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-navy px-1 text-[10px] text-white">
              {count}
            </span>
          )}
        </motion.button>
      </div>
    </nav>
  );
}
