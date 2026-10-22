"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ClipboardList, Trash2, X } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { ButtonLink } from "@/components/ui/button";
import { BottleImage } from "./bottle-image";
import { QuantityStepper } from "./quantity-stepper";
import { useCart } from "./providers/cart";

export function CartDrawer() {
  const { items, open, setOpen, update, remove, subtotal, count, hasUnpriced } = useCart();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-55 bg-ink/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            className="fixed inset-y-0 right-0 z-56 flex w-full max-w-md flex-col bg-white shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            aria-label="Pedido"
          >
            <header className="flex items-center justify-between border-b border-line px-7 py-6">
              <div>
                <p className="font-script text-2xl leading-none text-earth">Seu pedido</p>
                <h2 className="caps mt-1 text-xl text-navy">
                  {count} {count === 1 ? "unidade" : "unidades"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-2.5 text-ink/50 transition hover:bg-linen hover:text-ink"
                aria-label="Fechar pedido"
              >
                <X className="size-5" />
              </button>
            </header>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-10 text-center">
                <span className="flex size-16 items-center justify-center rounded-full bg-linen text-earth">
                  <ClipboardList className="size-6" strokeWidth={1.5} />
                </span>
                <p className="text-sm text-stone">
                  Seu pedido está vazio. Navegue pelo catálogo e adicione os rótulos que quer para o seu negócio.
                </p>
                <ButtonLink href="/vinhos" variant="outline" size="sm" onClick={() => setOpen(false)}>
                  Ver catálogo
                </ButtonLink>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-line overflow-y-auto px-7">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li key={item.variantId} layout exit={{ opacity: 0, x: 40 }} className="flex gap-4 py-5">
                        <Link
                          href={`/vinhos/${item.slug}`}
                          onClick={() => setOpen(false)}
                          className="flex h-24 w-18 shrink-0 items-center justify-center bg-linen"
                        >
                          <BottleImage path={item.imagePath} alt={item.name} sizes="64px" className="h-20 w-12" />
                        </Link>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-display text-lg leading-tight text-ink">{item.name}</p>
                              <p className="text-xs text-stone">{item.label}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => remove(item.variantId)}
                              className="p-1.5 text-pebble transition hover:text-red"
                              aria-label={`Remover ${item.name}`}
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                          <div className="mt-auto flex items-end justify-between">
                            <QuantityStepper
                              size="sm"
                              value={item.quantity}
                              min={0}
                              onChange={(quantity) => update(item.variantId, quantity)}
                            />
                            <span className="text-sm font-medium text-navy">
                              {item.price == null ? "Sob consulta" : formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>

                <footer className="space-y-4 border-t border-line bg-ivory px-7 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-stone">Subtotal estimado</span>
                    <span className="text-xl font-medium text-navy">{formatPrice(subtotal)}</span>
                  </div>
                  {hasUnpriced && (
                    <p className="text-xs text-stone">Itens sob consulta têm o valor confirmado pelo vendedor.</p>
                  )}
                  <ButtonLink href="/sacola" className="w-full" size="lg" onClick={() => setOpen(false)}>
                    Revisar e enviar pedido
                  </ButtonLink>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
