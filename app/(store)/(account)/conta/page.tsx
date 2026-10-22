import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LogOut } from "lucide-react";
import { ProfileForm } from "@/components/store/account/profile-form";
import { ProductCard } from "@/components/store/product-card";
import { ButtonLink } from "@/components/ui/button";
import { signOut } from "@/lib/auth/actions";
import { requireCustomer, type Viewer } from "@/lib/auth/viewer";
import { CARD_COLUMNS, toCard } from "@/lib/catalog/mappers";
import { cn } from "@/lib/cn";
import { BUSINESS_TYPES, formatDateTime, formatPrice, ORDER_FLOW, ORDER_STATUS, type BusinessType } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Minha conta" };

const TABS = [
  { id: "pedidos", label: "Pedidos" },
  { id: "favoritos", label: "Favoritos" },
  { id: "dados", label: "Dados da empresa" },
] as const;

type Tab = (typeof TABS)[number]["id"];

export default function AccountPage({ searchParams }: PageProps<"/conta">) {
  return (
    <div className="mx-auto max-w-7xl px-5 pt-12 pb-32 md:px-8 md:pb-16">
      <Suspense fallback={<div className="skeleton h-40" />}>
        <Account searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Account({ searchParams }: { searchParams: PageProps<"/conta">["searchParams"] }) {
  const { aba } = await searchParams;
  const tab: Tab = TABS.some((entry) => entry.id === aba) ? (aba as Tab) : "pedidos";
  const viewer = await requireCustomer(`/conta?aba=${tab}`);

  return (
    <>
      <header className="flex flex-col justify-between gap-6 border-b border-line pb-8 md:flex-row md:items-end">
        <div>
          <p className="font-script text-4xl text-bronze">Olá, {viewer.fullName.split(" ")[0] || "bem-vindo"}</p>
          <h1 className="caps mt-1 text-[clamp(2rem,4vw,2.8rem)] text-navy">{viewer.companyName ?? "Minha conta"}</h1>
          {viewer.businessType && (
            <p className="mt-2 text-sm text-stone">{BUSINESS_TYPES[viewer.businessType as BusinessType]}</p>
          )}
        </div>
        <div className="flex gap-2">
          {viewer.role && (
            <ButtonLink href="/admin" variant="outline" size="sm">
              Painel
            </ButtonLink>
          )}
          <form action={signOut}>
            <button
              type="submit"
              className="inline-flex h-9 items-center gap-2 px-3.5 text-[12px] tracking-[0.18em] text-stone uppercase transition hover:text-red"
            >
              <LogOut className="size-4" /> Sair
            </button>
          </form>
        </div>
      </header>

      <nav className="mt-8 flex gap-8" aria-label="Seções da conta">
        {TABS.map((entry) => (
          <Link
            key={entry.id}
            href={`/conta?aba=${entry.id}`}
            className={cn(
              "relative pb-3 text-[12px] font-medium tracking-[0.2em] uppercase transition",
              tab === entry.id ? "text-red" : "text-ink/55 hover:text-navy",
            )}
          >
            {entry.label}
            {tab === entry.id && <span className="absolute inset-x-0 bottom-0 h-px bg-red" />}
          </Link>
        ))}
      </nav>

      <div className="mt-10">
        {tab === "pedidos" && <Orders />}
        {tab === "favoritos" && <Favorites />}
        {tab === "dados" && <Profile viewer={viewer} />}
      </div>
    </>
  );
}

async function Orders() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select(
      "id, number, status, subtotal, created_at, order_items(id, product_name, variant_label, quantity, line_total)",
    )
    .order("created_at", { ascending: false })
    .limit(30);

  if (!orders?.length) {
    return (
      <Empty title="Nenhum pedido ainda" text="Os pedidos enviados pelo catálogo aparecem aqui com o andamento." />
    );
  }

  return (
    <ul className="space-y-4">
      {orders.map((order) => {
        const step = ORDER_FLOW.indexOf(order.status);
        const status = ORDER_STATUS[order.status];
        return (
          <li key={order.id} className="bg-white p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="caps text-2xl text-navy">Pedido nº {order.number}</p>
                <p className="mt-1 text-xs text-pebble">{formatDateTime(order.created_at)}</p>
              </div>
              <span
                className="inline-flex items-center gap-2 px-3 py-1 text-[11px] tracking-[0.14em] uppercase"
                style={{ background: `${status.tone}1a`, color: status.tone }}
              >
                <span className="size-1.5 rounded-full" style={{ background: status.tone }} />
                {status.label}
              </span>
            </div>

            {order.status !== "cancelado" && (
              <ol className="mt-6 grid grid-cols-4 gap-2">
                {ORDER_FLOW.map((entry, index) => (
                  <li key={entry}>
                    <span className={cn("block h-[3px]", index <= step ? "bg-navy" : "bg-parchment")} />
                    <span className={cn("mt-2 block text-[11px]", index <= step ? "text-navy" : "text-pebble")}>
                      {ORDER_STATUS[entry].label}
                    </span>
                  </li>
                ))}
              </ol>
            )}

            <ul className="mt-6 divide-y divide-line border-t border-line text-sm">
              {order.order_items.map((item) => (
                <li key={item.id} className="flex justify-between gap-4 py-3">
                  <span className="text-ink">
                    {item.quantity}× {item.product_name} <span className="text-pebble">· {item.variant_label}</span>
                  </span>
                  <span className="text-stone">{formatPrice(item.line_total)}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between border-t border-line pt-4">
              <span className="text-sm text-stone">Subtotal</span>
              <span className="font-medium text-navy">{formatPrice(order.subtotal)}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

async function Favorites() {
  const supabase = await createClient();
  const { data: favorites } = await supabase
    .from("favorites")
    .select("product_id")
    .order("created_at", { ascending: false });
  const ids = (favorites ?? []).map((favorite) => favorite.product_id);
  if (!ids.length) {
    return <Empty title="Nenhum favorito" text="Marque o coração dos rótulos que você quer acompanhar." />;
  }

  const { data: rows } = await supabase.from("catalog_products").select(CARD_COLUMNS).in("id", ids);
  const products = (rows ?? []).map(toCard);

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function Profile({ viewer }: { viewer: Viewer }) {
  return (
    <div className="bg-white p-6 md:p-10">
      <ProfileForm
        email={viewer.email}
        fullName={viewer.fullName}
        phone={viewer.phone}
        companyName={viewer.companyName}
        taxId={viewer.taxId}
        businessType={viewer.businessType}
      />
    </div>
  );
}

function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex flex-col items-center border border-dashed border-line bg-white px-6 py-20 text-center">
      <p className="font-script text-4xl text-bronze">{title}</p>
      <p className="mt-3 max-w-sm text-sm text-stone">{text}</p>
      <ButtonLink href="/vinhos" variant="outline" className="mt-8">
        Ver catálogo
      </ButtonLink>
    </div>
  );
}
