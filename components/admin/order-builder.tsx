"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Building2,
  Check,
  ChevronDown,
  Minus,
  PackageSearch,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  UserPlus,
  X,
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
import { Card } from "./ui";

type Quantities = Record<string, number>;
type Line = { product: OrderProduct; variant: OrderProduct["variants"][number]; quantity: number };

const normalize = (value: string) => stripAccents(value).toLowerCase();

const field =
  "h-12 w-full rounded-2xl border border-ink/10 bg-cloud/60 pr-4 pl-11 text-[14px] text-ink transition outline-none placeholder:text-mist focus:border-royal/40 focus:bg-white focus:ring-4 focus:ring-royal/10";

function useCustomerSearch(term: string, enabled: boolean) {
  const [response, setResponse] = useState<{ term: string; results: CustomerOption[] } | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    const timer = setTimeout(async () => {
      const results = await searchCustomers(term);
      if (active) setResponse({ term, results });
    }, 180);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [term, enabled]);

  return { results: response?.results ?? [], loading: response?.term !== term };
}

function CustomerSelect({
  value,
  onChange,
}: {
  value: CustomerOption | null;
  onChange: (customer: CustomerOption) => void;
}) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const { results, loading } = useCustomerSearch(term, open);

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          className={cn(
            "flex h-14 min-w-0 flex-1 items-center gap-3 rounded-2xl border bg-white px-4 text-left transition",
            open ? "border-royal/40 ring-4 ring-royal/10" : "border-ink/10 hover:border-ink/25",
          )}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-cloud text-royal">
            <Building2 className="size-4" />
          </span>
          <span className="min-w-0 flex-1">
            {value ? (
              <>
                <span className="block truncate text-[14.5px] font-semibold text-ink">{value.company}</span>
                <span className="block truncate text-[12px] text-mist">
                  {[value.contact, value.email].filter(Boolean).join(" · ")}
                </span>
              </>
            ) : (
              <span className="text-[14px] text-mist">Selecione o cliente</span>
            )}
          </span>
          <ChevronDown className={cn("size-4 shrink-0 text-mist transition", open && "rotate-180")} />
        </button>
        <CustomerSheet
          trigger={(openSheet) => (
            <Button type="button" variant="line" onClick={openSheet} className="h-14 shrink-0">
              <UserPlus className="size-4" /> Novo cliente
            </Button>
          )}
        />
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 rounded-2xl border border-ink/8 bg-white p-2 shadow-[0_18px_40px_-24px_rgba(23,25,43,0.35)]">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-mist" />
                <input
                  autoFocus
                  value={term}
                  onChange={(event) => setTerm(event.target.value)}
                  placeholder="Digite empresa, contato, e-mail ou CNPJ"
                  className="h-11 w-full rounded-xl bg-cloud/70 pr-3 pl-10 text-[14px] outline-none placeholder:text-mist focus:bg-cloud"
                  autoComplete="off"
                />
              </div>
              <ul className="mt-1.5 max-h-64 overflow-y-auto">
                {results.map((option) => (
                  <li key={option.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(option);
                        setOpen(false);
                        setTerm("");
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-cloud"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-medium text-ink">{option.company}</span>
                        <span className="block truncate text-[12px] text-mist">
                          {[option.contact, option.email].filter(Boolean).join(" · ")}
                        </span>
                      </span>
                      {value?.id === option.id && <Check className="size-4 text-royal" />}
                    </button>
                  </li>
                ))}
                {!results.length && (
                  <li className="px-3 py-4 text-center text-[13px] text-mist">
                    {loading ? "Carregando clientes…" : "Nenhum cliente encontrado."}
                  </li>
                )}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
  summary,
}: {
  products: OrderProduct[];
  quantities: Quantities;
  setQuantity: (variantId: string, quantity: number) => void;
  summary: { units: number; subtotal: number; open: () => void };
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
              ...product.variants.map((variant) => variant.label),
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
      "inline-flex h-10 items-center gap-2 rounded-full px-4 text-[13.5px] font-medium transition",
      active ? "bg-ink text-white" : "bg-cloud text-ink/70 hover:text-ink",
    );

  return (
    <Card className="@container p-5 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
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
        <button
          type="button"
          onClick={summary.open}
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2.5 rounded-2xl bg-navy px-5 text-[14px] font-semibold text-white shadow-[0_10px_24px_-12px_rgba(27,42,120,0.8)] transition hover:bg-navy-900"
        >
          <ShoppingBag className="size-4" />
          Pedido
          {summary.units > 0 && (
            <span className="rounded-full bg-white/15 px-2 py-0.5 text-[12px] tabular-nums">
              {summary.units} · {formatPrice(summary.subtotal)}
            </span>
          )}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
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

function OrderDialog({
  open,
  onClose,
  lines,
  units,
  subtotal,
  setQuantity,
}: {
  open: boolean;
  onClose: () => void;
  lines: Line[];
  units: number;
  subtotal: number;
  setQuantity: (variantId: string, quantity: number) => void;
}) {
  const router = useRouter();
  const notify = useToast();
  const [customer, setCustomer] = useState<CustomerOption | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const unpriced = lines.some((line) => line.variant.price == null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const submit = () => {
    setError(null);
    if (!customer) return setError("Selecione o cliente do pedido.");
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
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-60 flex items-end justify-center bg-ink/40 backdrop-blur-[2px] md:items-center md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label="Pedido"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            onClick={(event) => event.stopPropagation()}
            className="flex max-h-[94svh] w-full flex-col overflow-hidden rounded-t-[28px] bg-white text-ink shadow-2xl md:max-h-[88svh] md:max-w-2xl md:rounded-[28px]"
          >
            <header className="flex items-start justify-between gap-4 border-b border-ink/6 px-6 py-5">
              <div>
                <h2 className="text-[22px] font-bold">Pedido</h2>
                <p className="mt-0.5 text-[13px] text-mist">
                  {lines.length} {lines.length === 1 ? "rótulo" : "rótulos"} · {units} un.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-2 text-mist hover:bg-cloud hover:text-ink"
                aria-label="Fechar"
              >
                <X className="size-5" />
              </button>
            </header>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
              <section>
                <h3 className="mb-2 text-[13px] font-semibold text-ink/70">Cliente</h3>
                <CustomerSelect value={customer} onChange={setCustomer} />
              </section>

              <section>
                <h3 className="mb-1 text-[13px] font-semibold text-ink/70">Itens</h3>
                {lines.length ? (
                  <ul className="divide-y divide-ink/6">
                    {lines.map((line) => (
                      <li key={line.variant.id} className="flex items-center gap-3 py-3">
                        <BottleImage path={line.product.imagePath} alt="" sizes="32px" className="h-12 w-8 shrink-0" />
                        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[14px] font-medium text-ink">{line.product.name}</span>
                            <span className="block text-[12px] text-mist">
                              {line.variant.label} · {formatPrice(line.variant.price)} / un.
                            </span>
                          </span>
                          <span className="flex items-center gap-2">
                            <Stepper
                              size="sm"
                              value={line.quantity}
                              onChange={(value) => setQuantity(line.variant.id, value)}
                            />
                            <span className="flex-1 text-right text-[14px] font-semibold tabular-nums sm:w-24 sm:flex-none">
                              {line.variant.price == null ? "—" : formatPrice(line.variant.price * line.quantity)}
                            </span>
                            <button
                              type="button"
                              onClick={() => setQuantity(line.variant.id, 0)}
                              className="rounded-lg p-2 text-mist transition hover:bg-red-100 hover:text-red"
                              aria-label={`Remover ${line.product.name}`}
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-2xl bg-cloud/70 px-4 py-6 text-center text-[13px] text-mist">
                    Nenhum vinho no pedido. Feche e toque em Adicionar no catálogo.
                  </p>
                )}
              </section>

              <label className="block">
                <span className="mb-2 block text-[13px] font-semibold text-ink/70">Observações</span>
                <Textarea
                  tone="light"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="Entrega, pagamento, nota fiscal…"
                />
              </label>
            </div>

            <footer className="space-y-3 border-t border-ink/6 bg-cloud/40 px-6 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <FormMessage message={error} />
              {unpriced && <p className="text-[12.5px] text-mist">Itens sem preço entram com valor a confirmar.</p>}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-[12px] text-mist">Subtotal</p>
                  <p className="text-2xl font-bold tabular-nums">{formatPrice(subtotal)}</p>
                </div>
                <Button type="button" variant="dark" className="h-12 px-8" pending={pending} onClick={submit}>
                  Criar pedido
                </Button>
              </div>
            </footer>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function OrderBuilder({ products }: { products: OrderProduct[] }) {
  const [quantities, setQuantities] = useState<Quantities>({});
  const [open, setOpen] = useState(false);

  const lines: Line[] = products.flatMap((product) =>
    product.variants
      .filter((variant) => quantities[variant.id])
      .map((variant) => ({ product, variant, quantity: quantities[variant.id] })),
  );
  const units = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = lines.reduce((sum, line) => sum + (line.variant.price ?? 0) * line.quantity, 0);

  const setQuantity = (variantId: string, quantity: number) =>
    setQuantities((current) => {
      const next = { ...current };
      if (quantity <= 0) delete next[variantId];
      else next[variantId] = Math.min(999, quantity);
      return next;
    });

  return (
    <div className="pb-24">
      <Catalog
        products={products}
        quantities={quantities}
        setQuantity={setQuantity}
        summary={{ units, subtotal, open: () => setOpen(true) }}
      />

      <AnimatePresence>
        {lines.length > 0 && !open && (
          <motion.button
            type="button"
            onClick={() => setOpen(true)}
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-xl items-center gap-4 rounded-2xl bg-navy px-5 py-3.5 text-left text-white shadow-[0_20px_40px_-16px_rgba(27,42,120,0.8)] lg:left-[calc(248px+2.25rem)]"
          >
            <ShoppingBag className="size-5 shrink-0" />
            <span className="flex-1 text-[14px]">
              <span className="font-semibold">{units} un.</span>
              <span className="text-white/70">
                {" "}
                · {lines.length} {lines.length === 1 ? "rótulo" : "rótulos"}
              </span>
            </span>
            <span className="text-[16px] font-bold tabular-nums">{formatPrice(subtotal)}</span>
            <span className="rounded-xl bg-white/15 px-3 py-1.5 text-[13px] font-semibold">Revisar pedido</span>
          </motion.button>
        )}
      </AnimatePresence>

      <OrderDialog
        open={open}
        onClose={() => setOpen(false)}
        lines={lines}
        units={units}
        subtotal={subtotal}
        setQuantity={setQuantity}
      />
    </div>
  );
}
