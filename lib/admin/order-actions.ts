"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { authorize } from "@/lib/auth/viewer";
import { ORDER_STATUS, type OrderStatus } from "@/lib/format";
import type { FormState } from "@/lib/forms";
import { ORDER_FILE_MAX_BYTES, ORDER_FILE_MAX_COUNT, ORDER_FILE_TYPES, ORDER_FILES_BUCKET } from "@/lib/orders/files";
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

const commentSchema = z
  .object({
    orderId: z.uuid(),
    body: z.string().trim().max(2000, "Comentário muito longo"),
    files: z
      .array(
        z.object({
          path: z.string().min(1).max(300),
          name: z.string().trim().min(1).max(200),
          type: z.enum(ORDER_FILE_TYPES as [string, ...string[]], { error: "Tipo de arquivo não permitido" }),
          size: z.number().int().min(1).max(ORDER_FILE_MAX_BYTES, "Arquivo acima de 10 MB"),
        }),
      )
      .max(ORDER_FILE_MAX_COUNT, `Envie até ${ORDER_FILE_MAX_COUNT} arquivos por vez`),
  })
  .refine((value) => value.body || value.files.length, "Escreva um comentário ou anexe um arquivo")
  .refine(
    (value) => value.files.every((file) => file.path.startsWith(`${value.orderId}/`)),
    "Arquivo inválido para este pedido",
  );

export async function addOrderComment(input: z.input<typeof commentSchema>): Promise<FormState> {
  const viewer = await authorize("orders.manage");
  if (!viewer) return FORBIDDEN;
  const parsed = commentSchema.safeParse(input);
  if (!parsed.success) return { message: parsed.error.issues[0]?.message ?? "Comentário inválido." };

  const { orderId, body, files } = parsed.data;
  const supabase = await createClient();
  const discard = () =>
    files.length ? supabase.storage.from(ORDER_FILES_BUCKET).remove(files.map((file) => file.path)) : Promise.resolve();

  const { data: event, error } = await supabase
    .from("order_events")
    .insert({ order_id: orderId, author_id: viewer.id, kind: "comment", body: body || null })
    .select("id")
    .single();
  if (error || !event) {
    await discard();
    return dbMessage(error, "Não foi possível registrar o comentário.");
  }

  if (files.length) {
    const { error: filesError } = await supabase.from("order_files").insert(
      files.map((file) => ({
        order_id: orderId,
        event_id: event.id,
        path: file.path,
        name: file.name,
        mime_type: file.type,
        size_bytes: file.size,
      })),
    );
    if (filesError) {
      await discard();
      return dbMessage(filesError, "Comentário salvo, mas os anexos falharam.");
    }
  }

  refresh();
  return { ok: true, message: files.length ? "Comentário e anexos adicionados." : "Comentário adicionado." };
}
