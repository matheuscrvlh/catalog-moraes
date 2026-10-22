"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatPrice, formatVolume } from "@/lib/format";
import type { ProductDetail } from "@/lib/catalog/types";
import { FavoriteButton } from "../product-actions";
import { QuantityStepper } from "../quantity-stepper";
import { useCart } from "../providers/cart";

export function PurchasePanel({ product }: { product: ProductDetail }) {
  const { add, setOpen } = useCart();
  const [variantId, setVariantId] = useState(
    () => product.variants.find((variant) => variant.stock > 0)?.id ?? product.variants[0]?.id,
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const variant = product.variants.find((entry) => entry.id === variantId);
  if (!variant) return <p className="text-sm text-stone">Rótulo indisponível no momento.</p>;

  const price = variant.promoPrice ?? variant.price;
  const soldOut = variant.stock <= 0;
  const lowStock = !soldOut && variant.stock <= 6;

  const handleAdd = () => {
    add(
      {
        variantId: variant.id,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        label: variant.label,
        price,
        imagePath: product.imagePath,
        accent: product.accent,
      },
      quantity,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
    setTimeout(() => setOpen(true), 350);
  };

  return (
    <div className="space-y-7">
      <div className="flex items-end gap-4">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={variant.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="leading-none"
          >
            {variant.promoPrice != null && variant.price != null && (
              <span className="mb-2 block text-sm text-pebble line-through">{formatPrice(variant.price)}</span>
            )}
            <span
              className={cn(
                "font-medium tracking-tight",
                price == null ? "text-[26px]" : "text-[34px]",
                variant.promoPrice != null ? "text-red" : "text-navy",
              )}
            >
              {formatPrice(price)}
            </span>
          </motion.div>
        </AnimatePresence>
        <span className="pb-1.5 text-sm text-stone">
          {[price != null && "por unidade", variant.volumeMl && formatVolume(variant.volumeMl)]
            .filter(Boolean)
            .join(" · ")}
        </span>
      </div>

      {product.variants.length > 1 && (
        <fieldset>
          <legend className="caps mb-3 text-[12px] text-navy">Versão</legend>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((entry) => {
              const active = entry.id === variantId;
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setVariantId(entry.id)}
                  className={cn(
                    "border px-4 py-2.5 text-left transition",
                    active ? "border-navy bg-navy text-white" : "border-line bg-white text-ink hover:border-navy",
                    entry.stock <= 0 && "opacity-50",
                  )}
                  aria-pressed={active}
                >
                  <span className="block text-sm">{entry.label}</span>
                  {entry.volumeMl && (
                    <span className="block text-[11px] opacity-70">{formatVolume(entry.volumeMl)}</span>
                  )}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <p className="flex items-center gap-2 text-[13px] text-stone">
        <span className={cn("size-2 rounded-full", soldOut ? "bg-pebble" : lowStock ? "bg-[#d99a1a]" : "bg-success")} />
        {soldOut
          ? "Sem estoque no momento"
          : lowStock
            ? `Últimas ${variant.stock} unidades em estoque`
            : "Disponível para pedido"}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <QuantityStepper value={quantity} onChange={setQuantity} max={Math.max(1, Math.min(999, variant.stock))} />
        <button
          type="button"
          onClick={handleAdd}
          disabled={soldOut}
          className={cn(
            "inline-flex h-12 min-w-56 flex-1 items-center justify-center gap-2.5 text-[12px] font-medium tracking-[0.2em] text-white uppercase transition disabled:bg-pebble",
            added ? "bg-success" : "bg-navy hover:bg-navy-900",
          )}
        >
          {added ? <Check className="size-4" /> : <ShoppingBag className="size-4" />}
          {added ? "Adicionado ao pedido" : "Adicionar ao pedido"}
        </button>
        <FavoriteButton productId={product.id} className="size-12 border border-line shadow-none" />
      </div>
      <p className="text-xs text-pebble">
        Valores e condições finais confirmados pelo vendedor no fechamento do pedido.
      </p>
    </div>
  );
}
