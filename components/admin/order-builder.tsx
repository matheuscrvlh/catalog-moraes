"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Building2, Minus, PackageSearch, Plus, Search, Trash2, UserPlus } from "lucide-react";
import { BottleImage } from "@/components/store/bottle-image";
import { Button } from "@/components/ui/button";
import { FormMessage, Textarea } from "@/components/ui/field";
import {
  createStaffOrder,
  searchCustomers,
  searchVariants,
  type CustomerOption,
  type VariantOption,
} from "@/lib/admin/sales-actions";
import { formatPrice } from "@/lib/format";
import { CustomerSheet } from "./customer-sheet";
import { useToast } from "./toaster";
import { Card, CardTitle } from "./ui";

type Line = VariantOption & { quantity: number };

function useSearch<T>(term: string, search: (term: string) => Promise<T[]>, allowEmpty = false) {
  const [response, setResponse] = useState<{ term: string; results: T[] } | null>(null);

  useEffect(() => {
    if (!allowEmpty && !term.trim()) return;
    let active = true;
    const timer = setTimeout(async () => {
      const results = await search(term);
      if (active) setResponse({ term, results });
    }, 200);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [term, search, allowEmpty]);

  if (!allowEmpty && !term.trim()) return { results: [] as T[], loading: false };
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
  const { results, loading } = useSearch(term, searchCustomers, true);

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

function ProductPicker({ onAdd }: { onAdd: (variant: VariantOption) => void }) {
  const [term, setTerm] = useState("");
  const { results, loading } = useSearch(term, searchVariants);

  return (
    <SearchBox
      value={term}
      onChange={setTerm}
      placeholder="Buscar vinho por nome, uva ou vinícola"
      open={term.trim().length > 0 && !loading}
    >
      {results.length ? (
        results.map((variant) => (
          <li key={variant.id}>
            <button
              type="button"
              onClick={() => {
                onAdd(variant);
                setTerm("");
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-cloud"
            >
              <BottleImage path={variant.imagePath} alt="" sizes="32px" className="h-11 w-8 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-medium text-ink">{variant.product}</span>
                <span className="block truncate text-[12px] text-mist">
                  {[variant.label, variant.producer].filter(Boolean).join(" · ")}
                </span>
              </span>
              <span className="text-right">
                <span className="block text-[13.5px] font-semibold text-ink tabular-nums">
                  {formatPrice(variant.price)}
                </span>
                <span className={variant.stock > 0 ? "text-[11.5px] text-mist" : "text-[11.5px] text-red"}>
                  {variant.stock > 0 ? `${variant.stock} em estoque` : "Sem estoque"}
                </span>
              </span>
            </button>
          </li>
        ))
      ) : (
        <li className="px-3.5 py-3 text-[13px] text-mist">Nenhum vinho encontrado.</li>
      )}
    </SearchBox>
  );
}

function Stepper({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const button =
    "flex size-8 items-center justify-center rounded-lg text-ink/60 transition hover:bg-white hover:text-ink";
  return (
    <div className="inline-flex items-center rounded-xl bg-cloud p-0.5">
      <button type="button" className={button} onClick={() => onChange(value - 1)} aria-label="Diminuir">
        <Minus className="size-3.5" />
      </button>
      <input
        value={value}
        inputMode="numeric"
        onChange={(event) => onChange(Number(event.target.value.replace(/\D/g, "")) || 1)}
        className="w-10 bg-transparent text-center text-[14px] font-medium tabular-nums outline-none"
        aria-label="Quantidade"
      />
      <button type="button" className={button} onClick={() => onChange(value + 1)} aria-label="Aumentar">
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}

export function OrderBuilder() {
  const router = useRouter();
  const notify = useToast();
  const [customer, setCustomer] = useState<CustomerOption | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const units = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = lines.reduce((sum, line) => sum + (line.price ?? 0) * line.quantity, 0);
  const unpriced = lines.some((line) => line.price == null);

  const add = (variant: VariantOption) =>
    setLines((current) =>
      current.some((line) => line.id === variant.id)
        ? current.map((line) =>
            line.id === variant.id ? { ...line, quantity: Math.min(999, line.quantity + 1) } : line,
          )
        : [...current, { ...variant, quantity: 1 }],
    );

  const setQuantity = (id: string, quantity: number) =>
    setLines((current) =>
      quantity <= 0
        ? current.filter((line) => line.id !== id)
        : current.map((line) => (line.id === id ? { ...line, quantity: Math.min(999, quantity) } : line)),
    );

  const submit = () => {
    setError(null);
    if (!customer) return setError("Escolha o cliente do pedido.");
    if (!lines.length) return setError("Adicione ao menos um produto.");
    startTransition(async () => {
      const result = await createStaffOrder({
        customerId: customer.id,
        items: lines.map((line) => ({ variantId: line.id, quantity: line.quantity })),
        notes,
      });
      if (!result.ok) return setError(result.message);
      notify("Pedido criado.");
      router.push(`/admin/pedidos/${result.id}`);
    });
  };

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-5">
        <Card className="p-6 md:p-7">
          <CardTitle title="Cliente" description="Empresa que vai receber o pedido." />
          <CustomerPicker customer={customer} onSelect={setCustomer} />
        </Card>

        <Card className="p-6 md:p-7">
          <CardTitle title="Produtos" description="Busque os rótulos e ajuste as quantidades." />
          <ProductPicker onAdd={add} />

          {lines.length ? (
            <ul className="mt-5 divide-y divide-ink/6">
              <AnimatePresence initial={false}>
                {lines.map((line) => (
                  <motion.li
                    key={line.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-wrap items-center gap-x-4 gap-y-3 py-3.5"
                  >
                    <BottleImage path={line.imagePath} alt="" sizes="40px" className="h-14 w-10 shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14.5px] font-medium text-ink">{line.product}</span>
                      <span className="block text-[12.5px] text-mist">
                        {line.label} · {formatPrice(line.price)} / un.
                      </span>
                    </span>
                    <Stepper value={line.quantity} onChange={(value) => setQuantity(line.id, value)} />
                    <span className="w-24 text-right text-[14px] font-semibold text-ink tabular-nums">
                      {line.price == null ? "—" : formatPrice(line.price * line.quantity)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(line.id, 0)}
                      className="rounded-xl p-2 text-mist transition hover:bg-red-100 hover:text-red"
                      aria-label={`Remover ${line.product}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          ) : (
            <div className="mt-5 flex flex-col items-center rounded-2xl border border-dashed border-ink/10 px-6 py-12 text-center">
              <PackageSearch className="size-8 text-mist" strokeWidth={1.5} />
              <p className="mt-3 text-[14px] font-medium text-ink">Nenhum produto no pedido</p>
              <p className="mt-1 text-[13px] text-mist">Use a busca acima para adicionar os vinhos.</p>
            </div>
          )}
        </Card>
      </div>

      <Card className="h-fit space-y-5 p-6 md:p-7 xl:sticky xl:top-4">
        <CardTitle title="Resumo" />
        <dl className="space-y-3 text-[14px]">
          <div className="flex justify-between gap-4">
            <dt className="text-mist">Cliente</dt>
            <dd className="truncate text-right font-medium text-ink">{customer?.company ?? "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-mist">Rótulos</dt>
            <dd className="font-medium text-ink tabular-nums">{lines.length}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-mist">Unidades</dt>
            <dd className="font-medium text-ink tabular-nums">{units}</dd>
          </div>
          <div className="flex items-baseline justify-between border-t border-ink/6 pt-4">
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
            placeholder="Entrega, pagamento, nota fiscal…"
          />
        </label>

        <FormMessage message={error} />

        <Button type="button" variant="dark" className="w-full" pending={pending} onClick={submit}>
          Criar pedido
        </Button>
        <p className="text-[12px] leading-relaxed text-mist">
          Os preços são conferidos no sistema ao salvar. O pedido entra como “Em atendimento” e fica no histórico do
          cliente.
        </p>
      </Card>
    </div>
  );
}
