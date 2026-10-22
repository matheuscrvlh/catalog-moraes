"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Check, Send, ShieldCheck, Trash2 } from "lucide-react";
import { placeOrder } from "@/lib/orders/actions";
import { formatPrice } from "@/lib/format";
import { ButtonLink } from "@/components/ui/button";
import { FormMessage, Textarea } from "@/components/ui/field";
import { BottleImage } from "../bottle-image";
import { QuantityStepper } from "../quantity-stepper";
import { useCart } from "../providers/cart";
import { useSession } from "../providers/session";

export function BagView() {
  const { items, ready, update, remove, subtotal, hasPriced, hasUnpriced, clear, count } = useCart();
  const { user } = useSession();
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const result = await placeOrder({
        items: items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
        notes,
      });
      if (!result.ok) {
        if (result.reason === "auth") router.push("/entrar?next=/sacola");
        else setError(result.message);
        return;
      }
      setPlaced(result.number);
      clear();
    });
  };

  if (placed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-xl border border-line bg-white px-8 py-14 text-center"
      >
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-success-100 text-success">
          <Check className="size-7" />
        </span>
        <p className="mt-6 font-script text-4xl text-bronze">Pedido recebido</p>
        <h2 className="caps mt-1 text-5xl text-navy">Nº {placed}</h2>
        <p className="mx-auto mt-5 max-w-sm text-stone">
          Nossa equipe comercial já recebeu o pedido e vai entrar em contato para confirmar valores, frete e prazo.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/conta" size="lg">
            Acompanhar pedido
          </ButtonLink>
          <ButtonLink href="/vinhos" variant="outline" size="lg">
            Continuar no catálogo
          </ButtonLink>
        </div>
      </motion.div>
    );
  }

  if (ready && items.length === 0) {
    return (
      <div className="flex flex-col items-center border border-dashed border-line bg-white px-6 py-24 text-center">
        <p className="font-script text-5xl text-bronze">Pedido vazio</p>
        <p className="mt-3 max-w-sm text-stone">
          Escolha os rótulos no catálogo e volte aqui para enviar o pedido ao vendedor.
        </p>
        <ButtonLink href="/vinhos" className="mt-8">
          Ir para o catálogo
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <div className="bg-white">
        <div className="hidden grid-cols-[1fr_140px_120px_40px] gap-4 border-b border-line px-6 py-4 text-[11px] tracking-[0.18em] text-pebble uppercase md:grid">
          <span>Produto</span>
          <span>Quantidade</span>
          <span className="text-right">Total</span>
          <span />
        </div>
        <ul className="divide-y divide-line">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.li
                key={item.variantId}
                layout
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-5 md:grid-cols-[1fr_140px_120px_40px] md:px-6"
              >
                <Link href={`/vinhos/${item.slug}`} className="col-span-3 flex items-center gap-4 md:col-span-1">
                  <span className="flex h-24 w-18 shrink-0 items-center justify-center bg-linen">
                    <BottleImage path={item.imagePath} alt={item.name} sizes="72px" className="h-20 w-12" />
                  </span>
                  <span>
                    <span className="block font-display text-xl leading-tight font-medium text-ink">{item.name}</span>
                    <span className="mt-0.5 block text-sm text-stone">{item.label}</span>
                    <span className="mt-1 block text-xs text-pebble">
                      {item.price != null ? `${formatPrice(item.price)} / un.` : "Sob consulta"}
                    </span>
                  </span>
                </Link>
                <QuantityStepper
                  value={item.quantity}
                  min={0}
                  onChange={(quantity) => update(item.variantId, quantity)}
                />
                <span className="text-right font-medium text-navy">
                  {item.price != null ? formatPrice(item.price * item.quantity) : "—"}
                </span>
                <button
                  type="button"
                  onClick={() => remove(item.variantId)}
                  className="justify-self-end p-2 text-pebble transition hover:text-red"
                  aria-label={`Remover ${item.name}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        <div className="border-t border-line px-6 py-4">
          <Link href="/vinhos" className="inline-flex items-center gap-2 text-sm text-stone hover:text-navy">
            <ArrowLeft className="size-4" /> Continuar escolhendo
          </Link>
        </div>
      </div>

      <aside className="h-fit space-y-6 bg-white p-7 lg:sticky lg:top-28">
        <h2 className="caps text-xl text-navy">Resumo do pedido</h2>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between text-stone">
            <dt>Unidades</dt>
            <dd>{count}</dd>
          </div>
          <div className="flex justify-between text-stone">
            <dt>Frete e prazo</dt>
            <dd>Combinados com o vendedor</dd>
          </div>
          {hasPriced && (
            <div className="flex items-baseline justify-between border-t border-line pt-4">
              <dt className="text-ink">Subtotal estimado</dt>
              <dd className="text-2xl font-medium text-navy">{formatPrice(subtotal)}</dd>
            </div>
          )}
        </dl>
        {hasUnpriced && (
          <p className="text-xs text-stone">
            {hasPriced
              ? "Itens sob consulta têm o valor confirmado pelo vendedor."
              : "Os valores são confirmados pelo vendedor após o envio do pedido."}
          </p>
        )}

        <label className="block">
          <span className="mb-2 block text-[13px] text-ink/70">Observações para o vendedor</span>
          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            maxLength={500}
            placeholder="Ex.: entrega até sexta, emitir nota no CNPJ da filial…"
            className="rounded-xs"
          />
        </label>

        <FormMessage message={error} />

        <button
          type="button"
          onClick={submit}
          disabled={!ready || items.length === 0 || pending}
          className="flex h-13 w-full items-center justify-center gap-2.5 bg-navy text-[12px] font-medium tracking-[0.2em] text-white uppercase transition hover:bg-navy-900 disabled:opacity-60"
        >
          <Send className="size-4" />
          {pending ? "Enviando…" : user ? "Enviar pedido" : "Entrar e enviar pedido"}
        </button>
        <p className="flex items-start gap-2 text-xs leading-relaxed text-stone">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-navy" />
          Os preços são conferidos no sistema no momento do envio. Pagamento, nota fiscal e entrega são combinados com a
          equipe comercial.
        </p>
      </aside>
    </div>
  );
}
