"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowDown,
  Building2,
  Check,
  Minus,
  PackageSearch,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  UserPlus,
} from "lucide-react";
import { BottleImage } from "@/components/store/bottle-image";
import { Button } from "@/components/ui/button";
import { FormMessage, Textarea } from "@/components/ui/field";
import type { OrderProduct } from "@/lib/admin/order-catalog";
import { createStaffOrder, searchCustomers, type CustomerOption } from "@/lib/admin/sales-actions";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { stripAccents } from "@/lib/text";
import { CustomerSheet } from "./customer-sheet";
import { useToast } from "./toaster";
import { Card, CardTitle } from "./ui";

type Quantities = Record<string, number>;
type Line = { product: OrderProduct; variant: OrderProduct["variants"][number]; quantity: number };

const normalize = (value: string) => stripAccents(value).toLowerCase();

function useSearch<T>(term: string, search: (term: string) => Promise<T[]>) {
  const [response, setResponse] = useState<{ term: string; results: T[] } | null>(null);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      const results = await search(term);
      if (active) setResponse({ term, results });
    }, 200);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [term, search]);

  return { results: response?.results ?? [], loading: response?.term !== term };
}

const field =
  "h-12 w-full rounded-2xl border border-ink/10 bg-cloud/60 pr-4 pl-11 text-[14px] text-ink transition outline-none placeholder:text-mist focus:border-royal/40 focus:bg-white focus:ring-4 focus:ring-royal/10";

function SearchBox({
  value,
  onChange,
  placeholder,
  children,
  open,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  children: ReactNode;
  open: boolean;
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-mist" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={field}
        autoComplete="off"
      />
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute inset-x-0 top-full z-20 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-ink/6 bg-white p-1.5 shadow-[0_24px_50px_-20px_rgba(23,25,43,0.35)]"
          >
            {children}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function CustomerPicker({
  customer,
  onSelect,
}: {
  customer: CustomerOption | null;
  onSelect: (customer: CustomerOption | null) => void;
}) {
  const [term, setTerm] = useState("");
  const [focused, setFocused] = useState(false);
  const { results, loading } = useSearch(term, searchCustomers);

  if (customer) {
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-royal/20 bg-royal/5 p-4">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-white text-royal">
          <Building2 className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-ink">{customer.company}</span>
          <span className="block truncate text-[13px] text-mist">
            {[customer.contact, customer.email].filter(Boolean).join(" · ")}
          </span>
        </span>
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="rounded-xl px-3 py-2 text-[13px] font-medium text-royal hover:bg-white"
        >
          Trocar
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-3 sm:flex-row"
      onFocus={() => setFocused(true)}
      onBlur={() => setTimeout(() => setFocused(false), 150)}
    >
      <div className="flex-1">
        <SearchBox
          value={term}
          onChange={setTerm}
          placeholder="Buscar por empresa, contato, e-mail ou CNPJ"
          open={focused && (results.length > 0 || !loading)}
        >
          {results.length ? (
            results.map((option) => (
              <li key={option.id}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => onSelect(option)}
                  className="flex w-full flex-col rounded-xl px-3.5 py-2.5 text-left hover:bg-cloud"
                >
                  <span className="text-[14px] font-medium text-ink">{option.company}</span>
                  <span className="text-[12px] text-mist">
                    {[option.contact, option.email].filter(Boolean).join(" · ")}
                  </span>
                </button>
              </li>
            ))
          ) : (
            <li className="px-3.5 py-3 text-[13px] text-mist">Nenhum cliente encontrado.</li>
          )}
        </SearchBox>
      </div>
      <CustomerSheet
        trigger={(open) => (
          <Button type="button" variant="line" onClick={open} className="h-12 shrink-0">
            <UserPlus className="size-4" /> Cadastrar cliente
          </Button>
        )}
      />
    </div>
  );
}

function Stepper({
  value,
  onChange,
  size = "md",
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  size?: "sm" | "md";
  className?: string;
}) {
  const button = cn(
    "flex items-center justify-center rounded-lg text-ink/60 transition hover:bg-white hover:text-ink active:scale-95",
    size === "md" ? "size-10" : "size-8",
  );
  return (
    <div className={cn("inline-flex items-center justify-between rounded-xl bg-cloud p-0.5", className)}>
      <button type="button" className={button} onClick={() => onChange(value - 1)} aria-label="Diminuir">
        <Minus className="size-4" />
      </button>
      <input
        value={value}
        inputMode="numeric"
        onChange={(event) => onChange(Number(event.target.value.replace(/\D/g, "")) || 1)}
        className="w-9 bg-transparent text-center text-[15px] font-semibold tabular-nums outline-none"
        aria-label="Quantidade"
      />
      <button type="button" className={button} onClick={() => onChange(value + 1)} aria-label="Aumentar">
        <Plus className="size-4" />
      </button>
    </div>
  );
}

function ProductTile({
  product,
  quantities,
  setQuantity,
}: {
  product: OrderProduct;
  quantities: Quantities;
  setQuantity: (variantId: string, quantity: number) => void;
}) {
  const units = product.variants.reduce((sum, variant) => sum + (quantities[variant.id] ?? 0), 0);

  return (
    <article
      className={cn(
        "@container relative flex flex-col overflow-hidden rounded-[22px] border bg-white transition",
        units ? "border-royal/40 shadow-[0_18px_40px_-24px_rgba(47,67,184,0.55)]" : "border-ink/6",
      )}
    >
      <div className="relative flex h-44 items-end justify-center bg-linear-to-b from-cloud/40 to-cloud pt-4">
        <span
          className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-ink/70"
          title={product.category.name}
        >
          <span className="size-1.5 rounded-full" style={{ background: product.category.accent }} />
          {product.category.name}
        </span>
        <AnimatePresence>
          {units > 0 && (
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-royal px-2.5 py-1 text-[11px] font-semibold text-white"
            >
              <Check className="size-3" /> {units} no pedido
            </motion.span>
          )}
        </AnimatePresence>
        <BottleImage path={product.imagePath} alt={product.name} sizes="120px" className="h-36 w-24" />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="truncate text-[11px] font-semibold tracking-[0.12em] text-mist uppercase">
          {product.producer ?? product.country ?? " "}
        </p>
        <h3 className="mt-1 line-clamp-2 text-[15.5px] leading-snug font-semibold text-ink">{product.name}</h3>
        <p className="mt-0.5 truncate text-[12.5px] text-mist">
          {[product.country, product.grapes.slice(0, 2).join(", ")].filter(Boolean).join(" · ")}
        </p>

        <ul className="mt-auto space-y-2 pt-4">
          {product.variants.map((variant) => {
            const quantity = quantities[variant.id] ?? 0;
            return (
              <li
                key={variant.id}
                className="flex flex-col gap-2 @[17rem]:flex-row @[17rem]:items-center @[17rem]:justify-between @[17rem]:gap-3"
              >
                <span className="min-w-0">
                  <span className="block text-[14px] font-semibold text-ink tabular-nums">
                    {formatPrice(variant.price)}
                  </span>
                  <span className={cn("block truncate text-[12px]", variant.stock > 0 ? "text-mist" : "text-red")}>
                    {variant.label} · {variant.stock > 0 ? `${variant.stock} em estoque` : "sem estoque"}
                  </span>
                </span>
                {quantity ? (
                  <Stepper
                    value={quantity}
                    onChange={(value) => setQuantity(variant.id, value)}
                    className="w-full @[17rem]:w-auto"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setQuantity(variant.id, 1)}
                    className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-1.5 rounded-xl bg-navy px-4 text-[13.5px] font-semibold text-white transition hover:bg-navy-900 active:scale-95 @[17rem]:w-auto"
                  >
                    <Plus className="size-4" /> Adicionar
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </article>
  );
}

const ORDERED = "__pedido";

function Catalog({
  products,
  quantities,
  setQuantity,
}: {
  products: OrderProduct[];
  quantities: Quantities;
  setQuantity: (variantId: string, quantity: number) => void;
}) {
  const [term, setTerm] = useState("");
  const [filter, setFilter] = useState<string | null>(null);

  const categories = useMemo(() => {
    const map = new Map<string, OrderProduct["category"] & { count: number }>();
    for (const { category } of products) {
      const entry = map.get(category.slug) ?? { ...category, count: 0 };
      entry.count += 1;
      map.set(category.slug, entry);
    }
    return [...map.values()].sort((a, b) => a.position - b.position);
  }, [products]);

  const searchable = useMemo(
    () =>
      new Map(
        products.map((product) => [
          product.id,
          normalize(
            [
              product.name,
              product.producer,
              product.country,
              product.category.name,
              ...product.grapes,
              ...product.variants.map((v) => v.label),
            ].join(" "),
          ),
        ]),
      ),
    [products],
  );

  const ordered = (product: OrderProduct) => product.variants.some((variant) => quantities[variant.id]);
  const orderedCount = products.filter(ordered).length;
  const words = normalize(term).split(/\s+/).filter(Boolean);
  const visible = products.filter(
    (product) =>
      (filter === null || (filter === ORDERED ? ordered(product) : product.category.slug === filter)) &&
      words.every((word) => searchable.get(product.id)!.includes(word)),
  );

  const chip = (active: boolean) =>
    cn(
      "inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[13.5px] font-medium transition",
      active ? "bg-ink text-white" : "bg-cloud text-ink/70 hover:text-ink",
    );

  return (
    <Card className="@container p-5 md:p-6">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-mist" />
          <input
            type="search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Buscar por nome, uva, país ou vinícola"
            className={field}
            autoComplete="off"
          />
        </div>
        <div className="-mx-1 flex scrollbar-none gap-2 overflow-x-auto px-1 pb-1">
          <button type="button" onClick={() => setFilter(null)} className={chip(filter === null)}>
            Todos <span className="text-[12px] opacity-60">{products.length}</span>
          </button>
          {categories.map((category) => (
            <button
              key={category.slug}
              type="button"
              onClick={() => setFilter(filter === category.slug ? null : category.slug)}
              className={chip(filter === category.slug)}
            >
              <span className="size-2 rounded-full" style={{ background: category.accent }} />
              {category.name}
              <span className="text-[12px] opacity-60">{category.count}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setFilter(filter === ORDERED ? null : ORDERED)}
            className={cn(chip(filter === ORDERED), filter !== ORDERED && orderedCount > 0 && "bg-royal/10 text-royal")}
          >
            <ShoppingBag className="size-4" /> No pedido
            <span className="text-[12px] opacity-60">{orderedCount}</span>
          </button>
        </div>
      </div>

      {visible.length ? (
        <div className="mt-5 grid grid-cols-1 gap-4 @sm:grid-cols-2 @3xl:grid-cols-3 @6xl:grid-cols-4">
          {visible.map((product) => (
            <ProductTile key={product.id} product={product} quantities={quantities} setQuantity={setQuantity} />
          ))}
        </div>
      ) : (
        <div className="mt-5 flex flex-col items-center rounded-2xl border border-dashed border-ink/10 px-6 py-16 text-center">
          <PackageSearch className="size-8 text-mist" strokeWidth={1.5} />
          <p className="mt-3 text-[14px] font-medium text-ink">
            {filter === ORDERED ? "Nenhum produto no pedido ainda" : "Nenhum vinho encontrado"}
          </p>
          <p className="mt-1 text-[13px] text-mist">
            {filter === ORDERED ? "Toque em Adicionar nos rótulos do catálogo." : "Tente outro termo ou estilo."}
          </p>
        </div>
      )}
    </Card>
  );
}

export function OrderBuilder({ products }: { products: OrderProduct[] }) {
  const router = useRouter();
  const notify = useToast();
  const [customer, setCustomer] = useState<CustomerOption | null>(null);
  const [quantities, setQuantities] = useState<Quantities>({});
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const lines: Line[] = products.flatMap((product) =>
    product.variants
      .filter((variant) => quantities[variant.id])
      .map((variant) => ({ product, variant, quantity: quantities[variant.id] })),
  );
  const units = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = lines.reduce((sum, line) => sum + (line.variant.price ?? 0) * line.quantity, 0);
  const unpriced = lines.some((line) => line.variant.price == null);

  const setQuantity = (variantId: string, quantity: number) =>
    setQuantities((current) => {
      const next = { ...current };
      if (quantity <= 0) delete next[variantId];
      else next[variantId] = Math.min(999, quantity);
      return next;
    });

  const submit = () => {
    setError(null);
    if (!customer) return setError("Escolha o cliente do pedido.");
    if (!lines.length) return setError("Adicione ao menos um produto.");
    startTransition(async () => {
      const result = await createStaffOrder({
        customerId: customer.id,
        items: lines.map((line) => ({ variantId: line.variant.id, quantity: line.quantity })),
        notes,
      });
      if (!result.ok) return setError(result.message);
      notify("Pedido criado.");
      router.push(`/admin/pedidos/${result.id}`);
    });
  };

  return (
    <div className="grid grid-cols-1 gap-5 pb-24 min-[1140px]:grid-cols-[minmax(0,1fr)_350px] min-[1140px]:pb-0">
      <div className="min-w-0 space-y-5">
        <Card className="p-5 md:p-6">
          <CardTitle title="Cliente" description="Empresa que vai receber o pedido." />
          <CustomerPicker customer={customer} onSelect={setCustomer} />
        </Card>
        <Catalog products={products} quantities={quantities} setQuantity={setQuantity} />
      </div>

      <Card
        id="resumo"
        className="h-fit scroll-mt-4 space-y-5 p-5 min-[1140px]:sticky min-[1140px]:top-4 min-[1140px]:max-h-[calc(100svh-2rem)] min-[1140px]:overflow-y-auto md:p-6"
      >
        <CardTitle title="Pedido" description={customer ? customer.company : "Escolha o cliente para finalizar."} />

        {lines.length ? (
          <ul className="divide-y divide-ink/6">
            <AnimatePresence initial={false}>
              {lines.map((line) => (
                <motion.li
                  key={line.variant.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-3 py-3"
                >
                  <BottleImage path={line.product.imagePath} alt="" sizes="32px" className="h-12 w-8 shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-medium text-ink">{line.product.name}</span>
                    <span className="block text-[12px] text-mist">
                      {line.variant.label} ·{" "}
                      {line.variant.price == null ? "a confirmar" : formatPrice(line.variant.price * line.quantity)}
                    </span>
                    <span className="mt-1.5 flex items-center gap-1">
                      <Stepper
                        size="sm"
                        value={line.quantity}
                        onChange={(value) => setQuantity(line.variant.id, value)}
                      />
                      <button
                        type="button"
                        onClick={() => setQuantity(line.variant.id, 0)}
                        className="rounded-lg p-2 text-mist transition hover:bg-red-100 hover:text-red"
                        aria-label={`Remover ${line.product.name}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </span>
                  </span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        ) : (
          <p className="rounded-2xl bg-cloud/70 px-4 py-6 text-center text-[13px] text-mist">
            Os vinhos adicionados aparecem aqui.
          </p>
        )}

        <dl className="space-y-2 border-t border-ink/6 pt-4 text-[14px]">
          <div className="flex justify-between">
            <dt className="text-mist">Rótulos · unidades</dt>
            <dd className="font-medium text-ink tabular-nums">
              {lines.length} · {units}
            </dd>
          </div>
          <div className="flex items-baseline justify-between">
            <dt className="text-ink">Subtotal</dt>
            <dd className="text-2xl font-bold text-ink tabular-nums">{formatPrice(subtotal)}</dd>
          </div>
        </dl>
        {unpriced && <p className="text-[12.5px] text-mist">Itens sem preço entram com valor a confirmar.</p>}

        <label className="block">
          <span className="mb-2 block text-[13px] font-medium text-ink/70">Observações do pedido</span>
          <Textarea
            tone="light"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Entrega, pagamento, nota fiscal…"
          />
        </label>

        <FormMessage message={error} />

        <Button type="button" variant="dark" className="h-12 w-full" pending={pending} onClick={submit}>
          Criar pedido
        </Button>
        <p className="text-[12px] leading-relaxed text-mist">
          Os preços são conferidos no sistema ao salvar. O pedido entra como “Em atendimento” e fica no histórico do
          cliente.
        </p>
      </Card>

      <AnimatePresence>
        {lines.length > 0 && (
          <motion.a
            href="#resumo"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed inset-x-4 bottom-4 z-40 flex items-center gap-4 rounded-2xl bg-navy px-5 py-3.5 text-white shadow-[0_20px_40px_-16px_rgba(27,42,120,0.8)] min-[1140px]:hidden"
          >
            <ShoppingBag className="size-5" />
            <span className="flex-1 text-[14px]">
              <span className="font-semibold">{units} un.</span>
              <span className="text-white/70"> · {lines.length} rótulos</span>
            </span>
            <span className="text-[16px] font-bold tabular-nums">{formatPrice(subtotal)}</span>
            <span className="inline-flex items-center gap-1 text-[13px] font-medium text-white/80">
              Ver pedido <ArrowDown className="size-4" />
            </span>
          </motion.a>
        )}
      </AnimatePresence>
    </div>
  );
}
