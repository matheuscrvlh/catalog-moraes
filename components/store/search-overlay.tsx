"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, CornerDownLeft, Search, X } from "lucide-react";
import { getBrowserClient } from "@/lib/supabase/browser";
import { formatPrice } from "@/lib/format";
import { stripAccents } from "@/lib/text";
import { BottleImage } from "./bottle-image";
import { useCart } from "./providers/cart";

type Result = {
  slug: string;
  name: string;
  producer: string | null;
  country: string | null;
  price: number | null;
  imagePath: string | null;
};

const SUGGESTIONS = ["Malbec", "Espumante brut", "Portugal", "Cabernet Sauvignon", "Moscatel", "Exclusivo"];

const escapeLike = (value: string) => value.replace(/[\\%_]/g, (char) => `\\${char}`);

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { showPrices } = useCart();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [term, setTerm] = useState("");
  const [response, setResponse] = useState<{ term: string; results: Result[] }>({ term: "", results: [] });
  const results = term && response.term === term ? response.results : [];
  const loading = Boolean(term) && response.term !== term;

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 80);
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    const words = stripAccents(term).toLowerCase().split(/\s+/).filter(Boolean).slice(0, 4);
    if (!words.length) return;
    const timer = setTimeout(async () => {
      let query = getBrowserClient()
        .from("catalog_products")
        .select("slug, name, producer_name, country, min_price, image_path")
        .eq("active", true);
      for (const word of words) query = query.ilike("search_text", `%${escapeLike(word)}%`);
      const { data } = await query.order("featured", { ascending: false }).limit(6);
      setResponse({
        term,
        results: (data ?? []).map((row) => ({
          slug: row.slug!,
          name: row.name!,
          producer: row.producer_name,
          country: row.country,
          price: showPrices ? row.min_price : null,
          imagePath: row.image_path,
        })),
      });
    }, 180);
    return () => clearTimeout(timer);
  }, [term, showPrices]);

  const submit = (value: string) => {
    if (!value.trim()) return;
    onClose();
    router.push(`/vinhos?busca=${encodeURIComponent(value.trim())}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-60 flex items-start justify-center bg-ink/30 px-4 pt-[12vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Buscar produtos"
        >
          <motion.div
            initial={{ y: -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="w-full max-w-2xl overflow-hidden rounded-md bg-white shadow-[0_40px_120px_-30px_rgba(23,25,43,0.5)]"
            onClick={(event) => event.stopPropagation()}
          >
            <form
              className="flex items-center gap-3 border-b border-line px-6"
              onSubmit={(event) => {
                event.preventDefault();
                submit(term);
              }}
            >
              <Search className="size-5 text-navy" strokeWidth={1.6} />
              <input
                ref={inputRef}
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder="Vinho, uva, país ou vinícola…"
                className="h-16 flex-1 bg-transparent font-display text-2xl text-ink outline-none placeholder:text-pebble"
                maxLength={60}
              />
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-stone hover:bg-linen"
                aria-label="Fechar"
              >
                <X className="size-4" />
              </button>
            </form>

            <div className="max-h-[60vh] overflow-y-auto p-3">
              {!term && (
                <div className="p-3">
                  <p className="eyebrow mb-3 text-bronze">Sugestões</p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => setTerm(suggestion)}
                        className="rounded-full border border-line px-3.5 py-1.5 text-sm text-ink/75 transition hover:border-navy hover:text-navy"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {term && !loading && results.length === 0 && (
                <p className="px-3 py-8 text-center text-sm text-stone">Nenhum rótulo encontrado para “{term}”.</p>
              )}

              <ul>
                {results.map((result) => (
                  <li key={result.slug}>
                    <Link
                      href={`/vinhos/${result.slug}`}
                      onClick={onClose}
                      className="group flex items-center gap-4 rounded-md p-2.5 transition hover:bg-ivory"
                    >
                      <span className="flex h-16 w-12 shrink-0 items-center justify-center bg-linen">
                        <BottleImage path={result.imagePath} alt="" sizes="48px" className="h-14 w-10" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-display text-lg text-ink">{result.name}</span>
                        <span className="block truncate text-xs text-stone">
                          {[result.producer, result.country].filter(Boolean).join(" · ")}
                        </span>
                      </span>
                      {result.price != null && (
                        <span className="text-sm font-medium text-navy">{formatPrice(result.price)}</span>
                      )}
                      <ArrowUpRight className="size-4 text-pebble transition group-hover:text-red" />
                    </Link>
                  </li>
                ))}
              </ul>

              {term && results.length > 0 && (
                <button
                  type="button"
                  onClick={() => submit(term)}
                  className="mt-1 flex w-full items-center justify-between rounded-md px-4 py-3 text-sm text-navy transition hover:bg-ivory"
                >
                  Ver todos os resultados para “{term}”
                  <CornerDownLeft className="size-4" />
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
