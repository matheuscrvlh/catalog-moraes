"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { Check, Heart, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ProductCard } from "@/lib/catalog/types";
import { useCart } from "./providers/cart";
import { useFavorites } from "./providers/favorites";

export function FavoriteButton({ productId, className }: { productId: string; className?: string }) {
  const { ids, toggle } = useFavorites();
  const active = ids.has(productId);

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.85 }}
      onClick={() => toggle(productId)}
      className={cn(
        "flex size-9 items-center justify-center rounded-full bg-white/90 shadow-sm transition",
        active ? "text-red" : "text-ink/45 hover:text-red",
        className,
      )}
      aria-pressed={active}
      aria-label={active ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      <Heart className="size-4" fill={active ? "currentColor" : "none"} strokeWidth={1.7} />
    </motion.button>
  );
}

export function QuickAdd({ product, className }: { product: ProductCard; className?: string }) {
  const { add, setOpen } = useCart();
  const [added, setAdded] = useState(false);
  const variant = product.defaultVariant;
  const base = cn(
    "flex h-11 w-full items-center justify-center gap-2 text-[11px] font-medium tracking-[0.2em] uppercase transition",
    className,
  );

  if (!variant || product.variantCount > 1) {
    return (
      <Link href={`/vinhos/${product.slug}`} className={cn(base, "bg-navy text-white hover:bg-navy-900")}>
        <Plus className="size-3.5" /> Escolher<span className="hidden sm:inline">&nbsp;versão</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled={product.stock <= 0}
      onClick={() => {
        add({
          variantId: variant.id,
          productId: product.id,
          slug: product.slug,
          name: product.name,
          label: variant.label,
          price: variant.price,
          imagePath: product.imagePath,
          accent: product.accent,
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 1400);
        setTimeout(() => setOpen(true), 300);
      }}
      className={cn(
        base,
        added ? "bg-success text-white" : "bg-navy text-white hover:bg-navy-900",
        "disabled:bg-pebble",
      )}
    >
      {added ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
      {product.stock <= 0 ? (
        "Esgotado"
      ) : added ? (
        "Adicionado"
      ) : (
        <>
          Adicionar<span className="hidden sm:inline">&nbsp;ao pedido</span>
        </>
      )}
    </button>
  );
}
