"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { buildQuery, SORTS, type CatalogFilters, type Sort } from "@/lib/catalog/filters";

export function SortSelect({ filters }: { filters: CatalogFilters }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">Ordenar por</span>
      <select
        value={filters.ordem}
        disabled={pending}
        onChange={(event) =>
          startTransition(() =>
            router.push(`/vinhos${buildQuery({ ...filters, ordem: event.target.value as Sort, pagina: 1 })}`, {
              scroll: false,
            }),
          )
        }
        className="h-10 appearance-none border border-line bg-white pr-10 pl-4 text-[13px] text-ink transition outline-none hover:border-navy focus:border-navy"
      >
        {Object.entries(SORTS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 size-4 text-stone" />
    </label>
  );
}

export function FilterSheet({ children, activeCount }: { children: ReactNode; activeCount: number }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center gap-2 border border-line bg-white px-4 text-[13px] text-ink lg:hidden"
      >
        <SlidersHorizontal className="size-4" /> Filtros
        {activeCount > 0 && (
          <span className="flex size-5 items-center justify-center rounded-full bg-red text-[10px] text-white">
            {activeCount}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-60 bg-ink/40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-[24px] bg-white px-6 pt-4 pb-10"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              onClick={(event) => {
                event.stopPropagation();
                if ((event.target as HTMLElement).closest("a")) setOpen(false);
              }}
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink/15" />
              <div className="mb-6 flex items-center justify-between">
                <p className="caps text-xl text-navy">Filtros</p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full p-2 text-stone"
                  aria-label="Fechar"
                >
                  <X className="size-5" />
                </button>
              </div>
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
