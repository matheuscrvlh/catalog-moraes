"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bell, ChevronDown, ExternalLink, LogOut, Search, UserRound } from "lucide-react";
import { signOut } from "@/lib/auth/actions";
import { initials } from "@/lib/text";

type Props = { name: string; email: string; role: string; pendingOrders: number; canSearchProducts: boolean };

export function AdminTopbar({ name, email, role, pendingOrders, canSearchProducts }: Props) {
  const router = useRouter();
  const [searching, setSearching] = useState(false);
  const [menu, setMenu] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searching) input.current?.focus();
  }, [searching]);

  const circle =
    "relative flex size-11 items-center justify-center rounded-full bg-white text-ink/70 shadow-[0_1px_2px_rgba(23,25,43,0.05)] transition hover:text-ink";

  return (
    <div className="mb-6 flex items-center justify-end gap-3 pl-14 lg:pl-0">
      {canSearchProducts && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const term = input.current?.value.trim();
            if (term) router.push(`/admin/produtos?q=${encodeURIComponent(term)}`);
          }}
          className="flex items-center"
        >
          <AnimatePresence>
            {searching && (
              <motion.input
                ref={input}
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 240, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                onBlur={() => setSearching(false)}
                placeholder="Buscar produto…"
                className="mr-2 h-11 rounded-full bg-white px-5 text-sm shadow-[0_1px_2px_rgba(23,25,43,0.05)] outline-none"
              />
            )}
          </AnimatePresence>
          <button type="button" onClick={() => setSearching(true)} className={circle} aria-label="Buscar produto">
            <Search className="size-[18px]" />
          </button>
        </form>
      )}

      <Link href="/admin/pedidos?status=novo" className={circle} aria-label={`${pendingOrders} pedidos em aberto`}>
        <Bell className="size-[18px]" />
        {pendingOrders > 0 && (
          <span className="absolute top-2.5 right-2.5 flex size-2.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-red/70" />
            <span className="relative size-2.5 rounded-full border-2 border-white bg-red" />
          </span>
        )}
      </Link>

      <div className="relative">
        <button
          type="button"
          onClick={() => setMenu((value) => !value)}
          className="flex items-center gap-3 rounded-full bg-white py-1.5 pr-4 pl-1.5 shadow-[0_1px_2px_rgba(23,25,43,0.05)]"
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-linear-to-br from-red to-wine text-xs font-bold text-white">
            {initials(name || email)}
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-[13.5px] leading-tight font-bold text-ink">{name || email}</span>
            <span className="block text-[11.5px] text-mist">{role}</span>
          </span>
          <ChevronDown className="size-4 text-mist" />
        </button>
        <AnimatePresence>
          {menu && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="absolute right-0 z-40 mt-2 w-56 rounded-2xl bg-white p-2 shadow-[0_20px_50px_-20px_rgba(23,25,43,0.35)]"
              onMouseLeave={() => setMenu(false)}
            >
              <p className="flex items-center gap-2 px-3 py-2 text-xs text-mist">
                <UserRound className="size-3.5" /> {email}
              </p>
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-ink hover:bg-cloud"
              >
                <ExternalLink className="size-4" /> Ver loja
              </Link>
              <form action={signOut}>
                <input type="hidden" name="next" value="/admin/login" />
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-red hover:bg-red-100"
                >
                  <LogOut className="size-4" /> Sair
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
