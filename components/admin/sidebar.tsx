"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Building2,
  ExternalLink,
  Images,
  LayoutDashboard,
  Menu,
  Package,
  Receipt,
  Settings2,
  ShieldCheck,
  Tags,
  UsersRound,
  UserRoundCog,
  X,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/brand/brand-mark";
import { cn } from "@/lib/cn";
import type { NavItem, NavKey } from "@/lib/admin/nav";

const ICONS: Record<NavKey, LucideIcon> = {
  dashboard: LayoutDashboard,
  products: Package,
  categories: Tags,
  producers: Building2,
  banners: Images,
  orders: Receipt,
  customers: UsersRound,
  users: UserRoundCog,
  roles: ShieldCheck,
  settings: Settings2,
};

type Props = {
  groups: { group: string; items: NavItem[] }[];
  pendingOrders: number;
  activeProducts: number;
};

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

function GlassArt() {
  return (
    <svg viewBox="0 0 80 110" className="h-24 w-auto" aria-hidden>
      <defs>
        <linearGradient id="side-wine" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#ff4b55" />
          <stop offset="100%" stopColor="#7d1230" />
        </linearGradient>
        <clipPath id="side-bowl">
          <path d="M14 6 H66 C66 40 58 60 40 64 C22 60 14 40 14 6 Z" />
        </clipPath>
      </defs>
      <g clipPath="url(#side-bowl)">
        <rect x="0" y="30" width="80" height="40" fill="url(#side-wine)" />
      </g>
      <path
        d="M14 6 H66 C66 40 58 60 40 64 C22 60 14 40 14 6 Z"
        fill="none"
        stroke="rgba(255,255,255,0.75)"
        strokeWidth="2"
      />
      <rect x="38.5" y="64" width="3" height="32" rx="1.5" fill="rgba(255,255,255,0.75)" />
      <ellipse cx="40" cy="98" rx="17" ry="3.5" fill="rgba(255,255,255,0.75)" />
      <circle cx="58" cy="70" r="3" fill="#ff4b55" className="animate-drip" />
    </svg>
  );
}

function NavContent({ groups, pendingOrders, activeProducts, onNavigate }: Props & { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <Link href="/admin" onClick={onNavigate} className="px-2 pt-1 pb-8">
        <Logo tone="light" />
      </Link>

      <nav className="flex-1 scrollbar-none space-y-6 overflow-y-auto" aria-label="Painel">
        {groups.map((group) => (
          <div key={group.group}>
            <p className="mb-2 px-3 text-[11px] font-semibold tracking-[0.12em] text-mist uppercase">{group.group}</p>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = ICONS[item.key];
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "relative flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[14px] font-medium transition",
                        active ? "text-white" : "text-ink/60 hover:bg-cloud hover:text-ink",
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="admin-nav-active"
                          className="absolute inset-0 rounded-2xl bg-linear-to-br from-navy to-royal shadow-[0_12px_24px_-10px_rgba(47,67,184,0.75)]"
                          transition={{ type: "spring", damping: 30, stiffness: 340 }}
                        />
                      )}
                      <Icon className="relative size-[18px]" strokeWidth={1.8} />
                      <span className="relative flex-1">{item.label}</span>
                      {item.key === "orders" && pendingOrders > 0 && (
                        <span className="relative rounded-full bg-red px-2 py-0.5 text-[10.5px] font-semibold text-white">
                          {pendingOrders}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="relative mt-6 overflow-hidden rounded-[22px] bg-linear-to-br from-navy-950 via-navy-900 to-navy p-5 text-white [@media(max-height:900px)]:hidden">
        <div className="absolute -top-2 right-1 opacity-90">
          <GlassArt />
        </div>
        <p className="relative mt-10 text-[17px] leading-tight font-bold">Catálogo no ar</p>
        <p className="relative mt-1 text-[12px] text-white/65">{activeProducts} rótulos visíveis para os clientes.</p>
        <Link
          href="/"
          target="_blank"
          className="relative mt-4 flex h-10 items-center justify-center gap-2 rounded-xl bg-white text-[13px] font-semibold text-navy transition hover:bg-cloud"
        >
          Ver loja <ExternalLink className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}

export function AdminSidebar(props: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-[248px] shrink-0 rounded-[28px] bg-white p-4 shadow-[0_1px_2px_rgba(23,25,43,0.04)] lg:block">
        <NavContent {...props} />
      </aside>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-30 flex size-11 items-center justify-center rounded-2xl bg-white text-ink shadow-sm lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="size-5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.aside
              className="h-full w-72 bg-white p-4"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 rounded-xl p-2 text-mist hover:bg-cloud"
                aria-label="Fechar menu"
              >
                <X className="size-5" />
              </button>
              <NavContent {...props} onNavigate={() => setOpen(false)} />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
