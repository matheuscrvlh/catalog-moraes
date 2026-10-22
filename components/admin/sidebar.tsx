"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Bell,
  Building2,
  ExternalLink,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Receipt,
  Search,
  Settings2,
  ShieldCheck,
  Tags,
  UsersRound,
  UserRoundCog,
  X,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/brand/brand-mark";
import { signOut } from "@/lib/auth/actions";
import { cn } from "@/lib/cn";
import { initials, stripAccents } from "@/lib/text";
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
  user: { name: string; email: string; role: string };
  canSeeOrders: boolean;
};

const revealActive = (node: HTMLAnchorElement | null) => node?.scrollIntoView({ block: "nearest" });

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

function GlassArt() {
  return (
    <svg viewBox="0 0 80 110" className="h-14 w-auto" aria-hidden>
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

const normalize = (value: string) => stripAccents(value).toLowerCase();

function score(item: NavItem, group: string, words: string[]) {
  const label = normalize(item.label);
  const rest = normalize(`${group} ${item.keywords ?? ""}`);
  if (!words.every((word) => label.includes(word) || rest.includes(word))) return 0;
  return words.every((word) => label.includes(word)) ? 2 : 1;
}

function filterNav(groups: Props["groups"], query: string) {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (!words.length) return { groups, best: null };

  const ranked = groups.map((group) => ({
    group,
    items: group.items.map((item) => ({ item, score: score(item, group.group, words) })).filter((entry) => entry.score),
  }));
  const best = ranked.flatMap((entry) => entry.items).sort((a, b) => b.score - a.score)[0]?.item ?? null;
  const visible = ranked
    .filter((entry) => entry.items.length)
    .map((entry) => ({ ...entry.group, items: entry.items.map(({ item }) => item) }));
  return { groups: visible, best };
}

function ScreenSearch({
  value,
  onChange,
  onSubmit,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div role="search" className="relative mb-4">
      <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-mist" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onSubmit();
          }
          if (event.key === "Escape") onChange("");
        }}
        placeholder="Ir para…"
        aria-label="Buscar tela do painel"
        className="h-10 w-full rounded-2xl bg-cloud pr-3 pl-10 text-[13.5px] text-ink transition outline-none placeholder:text-mist focus:bg-white focus:ring-2 focus:ring-royal/25"
      />
    </div>
  );
}

function UserPanel({ user, pendingOrders, canSeeOrders, onNavigate }: Props & { onNavigate?: () => void }) {
  return (
    <div className="mt-2.5 rounded-[22px] border border-cloud p-1.5">
      {canSeeOrders && (
        <>
          <Link
            href="/admin/pedidos?status=novo"
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-2xl px-2.5 py-1.5 text-[13.5px] font-medium text-ink/70 transition hover:bg-cloud hover:text-ink"
          >
            <span className="relative">
              <Bell className="size-[18px]" strokeWidth={1.8} />
              {pendingOrders > 0 && (
                <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full border border-white bg-red" />
              )}
            </span>
            <span className="flex-1">Notificações</span>
            {pendingOrders > 0 && (
              <span className="rounded-full bg-red px-2 py-0.5 text-[10.5px] font-semibold text-white">
                {pendingOrders}
              </span>
            )}
          </Link>
          <div className="mx-2 my-1 h-px bg-cloud" />
        </>
      )}
      <div className="flex items-center gap-3 px-1 py-0.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-red to-wine text-xs font-bold text-white">
          {initials(user.name || user.email)}
        </span>
        <span className="min-w-0 flex-1" title={user.email}>
          <span className="block truncate text-[13.5px] leading-tight font-bold text-ink">
            {user.name || user.email}
          </span>
          <span className="block truncate text-[11.5px] text-mist">{user.role}</span>
        </span>
        <form action={signOut}>
          <input type="hidden" name="next" value="/admin/login" />
          <button
            type="submit"
            className="flex size-8 items-center justify-center rounded-xl text-mist transition hover:bg-red-100 hover:text-red"
            aria-label="Sair"
          >
            <LogOut className="size-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

function NavContent(props: Props & { onNavigate?: () => void }) {
  const { groups, pendingOrders, activeProducts, onNavigate } = props;
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { groups: visible, best } = filterNav(groups, query);

  return (
    <div className="flex h-full flex-col">
      <Link href="/admin" onClick={onNavigate} className="px-2 pt-1 pb-4">
        <Logo tone="light" />
      </Link>

      <ScreenSearch
        value={query}
        onChange={setQuery}
        onSubmit={() => {
          if (!best) return;
          router.push(best.href);
          setQuery("");
          onNavigate?.();
        }}
      />

      <nav className="min-h-0 flex-1 scrollbar-none space-y-3.5 overflow-y-auto" aria-label="Painel">
        {!visible.length && <p className="px-3 py-2 text-[13px] text-mist">Nenhuma tela encontrada.</p>}
        {visible.map((group) => (
          <div key={group.group}>
            <p className="mb-1.5 px-3 text-[11px] font-semibold tracking-[0.12em] text-mist uppercase">{group.group}</p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = ICONS[item.key];
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      ref={active ? revealActive : undefined}
                      onClick={() => {
                        setQuery("");
                        onNavigate?.();
                      }}
                      className={cn(
                        "relative flex items-center gap-3 rounded-2xl px-3.5 py-[7px] text-[14px] font-medium transition",
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

      <Link
        href="/"
        target="_blank"
        className="group mt-3 flex items-center gap-3 overflow-hidden rounded-[20px] bg-linear-to-br from-navy-950 via-navy-900 to-navy py-2 pr-4 pl-3 text-white"
      >
        <GlassArt />
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] leading-tight font-bold">Ver loja</span>
          <span className="block truncate text-[11.5px] text-white/65">{activeProducts} rótulos no ar</span>
        </span>
        <ExternalLink className="size-4 text-white/70 transition group-hover:text-white" />
      </Link>

      <UserPanel {...props} />

      <p className="mt-2 text-center text-[11px] text-mist">
        Desenvolvido por{" "}
        <a
          href="https://www.mthcode.com.br/"
          target="_blank"
          rel="noopener"
          className="font-semibold text-navy transition hover:text-red"
        >
          mthcode
        </a>
      </p>
    </div>
  );
}

export function AdminSidebar(props: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="sticky top-4 hidden h-[calc(100svh-2rem)] w-[248px] shrink-0 rounded-[28px] bg-white p-4 shadow-[0_1px_2px_rgba(23,25,43,0.04)] lg:block">
        <NavContent {...props} />
      </aside>

      <div className="flex items-center justify-between rounded-[22px] bg-white py-2 pr-2 pl-4 shadow-[0_1px_2px_rgba(23,25,43,0.04)] lg:hidden">
        <Link href="/admin" aria-label="Painel">
          <Logo tone="light" />
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative flex size-11 items-center justify-center rounded-2xl text-ink hover:bg-cloud"
          aria-label="Abrir menu"
        >
          <Menu className="size-5" />
          {props.canSeeOrders && props.pendingOrders > 0 && (
            <span className="absolute top-2.5 right-2.5 size-2 rounded-full border border-white bg-red" />
          )}
        </button>
      </div>

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
              className="h-full w-[290px] max-w-[85vw] bg-white p-4"
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
