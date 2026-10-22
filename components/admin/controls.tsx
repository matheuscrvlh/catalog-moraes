"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Trash2, X } from "lucide-react";
import { cn } from "@/lib/cn";
import type { FormState } from "@/lib/forms";
import { useToast } from "./toaster";

export function Sheet({
  trigger,
  title,
  description,
  children,
  wide,
}: {
  trigger: (open: () => void) => ReactNode;
  title: string;
  description?: string;
  children: (close: () => void) => ReactNode;
  wide?: boolean;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {trigger(() => setOpen(true))}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-70 bg-ink/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label={title}
              className={cn(
                "absolute inset-y-0 right-0 flex w-full flex-col bg-white text-ink shadow-2xl",
                wide ? "max-w-2xl" : "max-w-lg",
              )}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 320 }}
              onClick={(event) => event.stopPropagation()}
            >
              <header className="flex items-start justify-between border-b border-ink/6 px-7 py-6">
                <div>
                  <h2 className="font-display text-3xl leading-none">{title}</h2>
                  {description && <p className="mt-2 text-[13px] text-ink/50">{description}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl p-2 text-ink/50 hover:bg-cloud hover:text-ink"
                  aria-label="Fechar"
                >
                  <X className="size-5" />
                </button>
              </header>
              <div className="flex-1 overflow-y-auto px-7 py-6">{children(() => setOpen(false))}</div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition disabled:opacity-50",
        checked ? "bg-[#2f9e6e]" : "bg-ink/15",
      )}
    >
      <motion.span
        layout
        transition={{ type: "spring", damping: 25, stiffness: 400 }}
        className={cn("size-5 rounded-full bg-white shadow", checked ? "ml-[22px]" : "ml-0.5")}
      />
    </button>
  );
}

export function ActionSwitch({
  checked,
  label,
  action,
}: {
  checked: boolean;
  label: string;
  action: (value: boolean) => Promise<FormState>;
}) {
  const notify = useToast();
  const [value, setValue] = useState(checked);
  const [pending, startTransition] = useTransition();

  return (
    <Switch
      checked={value}
      label={label}
      disabled={pending}
      onChange={(next) => {
        setValue(next);
        startTransition(async () => {
          const result = await action(next);
          if (!result.ok) {
            setValue(!next);
            notify(result.message ?? "Não foi possível alterar.", "error");
          } else if (result.message) notify(result.message);
        });
      }}
    />
  );
}

export function DeleteButton({
  action,
  label,
  confirmText,
}: {
  action: () => Promise<FormState>;
  label: string;
  confirmText: string;
}) {
  const notify = useToast();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(confirmText)) return;
        startTransition(async () => {
          const result = await action();
          notify(
            result.message ?? (result.ok ? "Removido." : "Não foi possível remover."),
            result.ok ? "success" : "error",
          );
        });
      }}
      className="rounded-xl p-2 text-ink/40 transition hover:bg-red/10 hover:text-red disabled:opacity-40"
      aria-label={label}
    >
      <Trash2 className="size-4" />
    </button>
  );
}
