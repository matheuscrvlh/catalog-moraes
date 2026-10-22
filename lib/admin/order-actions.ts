"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { authorize } from "@/lib/auth/viewer";
import { ORDER_STATUS, type OrderStatus } from "@/lib/format";
import { formText, type FormState } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";
import { dbMessage, FORBIDDEN } from "./errors";

const statusSchema = z.enum(Object.keys(ORDER_STATUS) as [OrderStatus, ...OrderStatus[]]);

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<FormState> {
  const viewer = await authorize("orders.manage");
  if (!viewer) return FORBIDDEN;
  if (!statusSchema.safeParse(status).success) return { message: "Status inválido." };

  const supabase = await createClient();
  const { error } = await supabase.from("orders").update({ status, handled_by: viewer.id }).eq("id", orderId);
  if (error) return dbMessage(error);

  refresh();
  return { ok: true, message: `Pedido marcado como ${ORDER_STATUS[status].label.toLowerCase()}.` };
}

export async function saveInternalNotes(_: FormState, formData: FormData): Promise<FormState> {
  if (!(await authorize("orders.manage"))) return FORBIDDEN;
  const orderId = z.uuid().safeParse(formText(formData, "orderId"));
  const notes = formText(formData, "internalNotes").slice(0, 2000);
  if (!orderId.success) return { message: "Pedido inválido." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ internal_notes: notes || null })
    .eq("id", orderId.data);
  if (error) return dbMessage(error);

  refresh();
  return { ok: true, message: "Anotação salva." };
}
