"use client";

import { useTransition } from "react";
import { Check } from "lucide-react";
import { updateOrderStatus } from "@/lib/admin/order-actions";
import { cn } from "@/lib/cn";
import { ORDER_FLOW, ORDER_STATUS, type OrderStatus } from "@/lib/format";
import { useToast } from "./toaster";

export function StatusStepper({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const notify = useToast();
  const [pending, startTransition] = useTransition();
  const current = ORDER_FLOW.indexOf(status);

  const change = (next: OrderStatus) =>
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, next);
      notify(result.message ?? "", result.ok ? "success" : "error");
    });

  return (
    <div className={cn("space-y-4", pending && "pointer-events-none opacity-60")}>
      <ol className="grid grid-cols-4 gap-2">
        {ORDER_FLOW.map((step, index) => {
          const done = status !== "cancelado" && index <= current;
          return (
            <li key={step}>
              <button
                type="button"
                onClick={() => change(step)}
                disabled={step === status}
                className={cn(
                  "group w-full rounded-2xl border p-3 text-left transition",
                  done ? "border-transparent text-white" : "border-ink/10 hover:border-ink/30",
                )}
                style={done ? { background: ORDER_STATUS[step].tone } : undefined}
              >
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full text-[11px]",
                    done ? "bg-white/25" : "bg-cloud text-ink/50",
                  )}
                >
                  {done ? <Check className="size-3.5" /> : index + 1}
                </span>
                <span className="mt-3 block text-[13px] font-medium">{ORDER_STATUS[step].label}</span>
              </button>
            </li>
          );
        })}
      </ol>
      {status === "cancelado" ? (
        <button type="button" onClick={() => change("novo")} className="text-[13px] text-navy hover:underline">
          Reabrir pedido
        </button>
      ) : (
        <button
          type="button"
          onClick={() => window.confirm("Cancelar este pedido?") && change("cancelado")}
          className="text-[13px] text-ink/50 hover:text-red"
        >
          Cancelar pedido
        </button>
      )}
    </div>
  );
}
