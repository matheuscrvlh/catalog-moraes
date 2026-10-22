"use server";

import { z } from "zod";
import { getViewer } from "@/lib/auth/viewer";
import { createClient } from "@/lib/supabase/server";

const orderSchema = z.object({
  items: z
    .array(z.object({ variantId: z.uuid(), quantity: z.number().int().min(1).max(999) }))
    .min(1, "Sua sacola está vazia")
    .max(50),
  notes: z.string().trim().max(500).optional(),
});

export type PlaceOrderResult =
  | { ok: true; number: number; company: string | null }
  | { ok: false; reason: "auth" | "invalid" | "error"; message: string };

export async function placeOrder(input: z.input<typeof orderSchema>): Promise<PlaceOrderResult> {
  const viewer = await getViewer();
  if (!viewer) return { ok: false, reason: "auth", message: "Entre na sua conta para enviar o pedido." };

  const parsed = orderSchema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: "invalid", message: "Revise os itens da sacola." };

  const merged = new Map<string, number>();
  for (const item of parsed.data.items) {
    merged.set(item.variantId, Math.min(999, (merged.get(item.variantId) ?? 0) + item.quantity));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("place_order", {
    items: [...merged].map(([variant_id, quantity]) => ({ variant_id, quantity })),
    notes: parsed.data.notes ?? "",
  });

  if (error || !data?.[0]) {
    const known = error && ["P0002", "54000", "22023"].includes(error.code ?? "");
    return { ok: false, reason: "error", message: known ? error.message : "Não foi possível enviar o pedido agora." };
  }

  return { ok: true, number: data[0].order_number, company: viewer.companyName };
}
