"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { controlClass } from "@/components/ui/field";
import { Switch } from "../controls";

export type VariantDraft = {
  key: string;
  id?: string;
  label: string;
  volumeMl: string;
  sku: string;
  price: string;
  promoPrice: string;
  stock: string;
  active: boolean;
};

export const emptyVariant = (): VariantDraft => ({
  key: crypto.randomUUID(),
  label: "750 ml",
  volumeMl: "750",
  sku: "",
  price: "",
  promoPrice: "",
  stock: "0",
  active: true,
});

const cell = (error?: string) => controlClass("light", cn("h-10 rounded-xl px-3 text-sm", error && "border-red/60"));

export function VariantsEditor({
  variants,
  onChange,
  errors,
}: {
  variants: VariantDraft[];
  onChange: (variants: VariantDraft[]) => void;
  errors: Record<string, string>;
}) {
  const update = (index: number, patch: Partial<VariantDraft>) =>
    onChange(variants.map((variant, position) => (position === index ? { ...variant, ...patch } : variant)));

  const move = (index: number, direction: -1 | 1) => {
    const next = [...variants];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="hidden grid-cols-[1.4fr_0.8fr_1fr_1fr_1fr_0.8fr_auto] gap-2 px-[13px] text-[11px] tracking-wide text-ink/45 uppercase md:grid">
        <span>Versão</span>
        <span>Volume (ml)</span>
        <span>SKU / código</span>
        <span>Preço</span>
        <span>Promocional</span>
        <span>Estoque</span>
        <span className="w-[150px]" />
      </div>
      {variants.map((variant, index) => {
        const error = (field: string) => errors[`variants.${index}.${field}`];
        const rowErrors = ["label", "volumeMl", "price", "promoPrice", "stock"].map(error).filter(Boolean);
        return (
          <div
            key={variant.key}
            className={cn(
              "rounded-2xl border p-3",
              variant.active ? "border-ink/8" : "border-dashed border-ink/15 opacity-70",
            )}
          >
            <div className="grid grid-cols-2 gap-2 md:grid-cols-[1.4fr_0.8fr_1fr_1fr_1fr_0.8fr_auto] md:items-center">
              <input
                aria-label="Versão"
                placeholder="Ex.: Malbec, Seco, 750 ml"
                className={cn(cell(error("label")), "col-span-2 md:col-span-1")}
                value={variant.label}
                onChange={(event) => update(index, { label: event.target.value })}
              />
              <input
                aria-label="Volume em ml"
                inputMode="numeric"
                className={cell(error("volumeMl"))}
                value={variant.volumeMl}
                onChange={(event) => update(index, { volumeMl: event.target.value.replace(/\D/g, "") })}
              />
              <input
                aria-label="SKU"
                className={cell()}
                value={variant.sku}
                onChange={(event) => update(index, { sku: event.target.value })}
              />
              <input
                aria-label="Preço"
                inputMode="decimal"
                placeholder="Sob consulta"
                className={cell(error("price"))}
                value={variant.price}
                onChange={(event) => update(index, { price: event.target.value.replace(",", ".") })}
              />
              <input
                aria-label="Preço promocional"
                inputMode="decimal"
                placeholder="—"
                className={cell(error("promoPrice"))}
                value={variant.promoPrice}
                onChange={(event) => update(index, { promoPrice: event.target.value.replace(",", ".") })}
              />
              <input
                aria-label="Estoque"
                inputMode="numeric"
                className={cell(error("stock"))}
                value={variant.stock}
                onChange={(event) => update(index, { stock: event.target.value.replace(/\D/g, "") })}
              />
              <div className="col-span-2 flex items-center justify-end gap-1 md:col-span-1">
                <Switch
                  checked={variant.active}
                  onChange={(active) => update(index, { active })}
                  label="Variação ativa"
                />
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                  className="rounded-lg p-1.5 text-ink/40 hover:bg-cloud disabled:opacity-30"
                  aria-label="Subir"
                >
                  <ArrowUp className="size-4" />
                </button>
                <button
                  type="button"
                  disabled={index === variants.length - 1}
                  onClick={() => move(index, 1)}
                  className="rounded-lg p-1.5 text-ink/40 hover:bg-cloud disabled:opacity-30"
                  aria-label="Descer"
                >
                  <ArrowDown className="size-4" />
                </button>
                <button
                  type="button"
                  disabled={variants.length === 1}
                  onClick={() => onChange(variants.filter((_, position) => position !== index))}
                  className="rounded-lg p-1.5 text-ink/40 hover:bg-red/10 hover:text-red disabled:opacity-30"
                  aria-label="Remover variação"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
            {rowErrors.length > 0 && <p className="mt-2 px-1 text-xs text-red">{rowErrors[0]}</p>}
          </div>
        );
      })}
      <button
        type="button"
        onClick={() => onChange([...variants, emptyVariant()])}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-ink/15 py-3 text-[13px] text-ink/55 transition hover:border-ink/40 hover:text-ink"
      >
        <Plus className="size-4" /> Adicionar variação
      </button>
    </div>
  );
}
