"use client";

import { useActionState, useEffect, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/field";
import type { FormState } from "@/lib/forms";
import { useToast } from "./toaster";

type Props = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  children: (errors: Record<string, string>) => ReactNode;
  submitLabel?: string;
  onDone?: () => void;
  className?: string;
};

export function ActionForm({ action, children, submitLabel = "Salvar", onDone, className }: Props) {
  const notify = useToast();
  const [state, formAction, pending] = useActionState(action, {} as FormState);
  const handled = useRef<FormState | null>(null);

  useEffect(() => {
    if (!state.ok || handled.current === state) return;
    handled.current = state;
    if (state.message) notify(state.message);
    onDone?.();
  }, [state, notify, onDone]);

  return (
    <form action={formAction} className={className ?? "space-y-5"} noValidate>
      {!state.ok && <FormMessage message={state.message} />}
      {children(state.errors ?? {})}
      <div className="flex justify-end pt-2">
        <Button type="submit" variant="dark" pending={pending}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
