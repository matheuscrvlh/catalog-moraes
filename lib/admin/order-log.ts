import "server-only";
import type { OrderStatus } from "@/lib/format";
import { ORDER_FILES_BUCKET } from "@/lib/orders/files";
import { createClient } from "@/lib/supabase/server";

export type OrderFile = { id: string; name: string; mimeType: string; size: number; url: string | null };

export type OrderEvent = {
  id: string;
  kind: "created" | "status" | "comment";
  author: string | null;
  authorIsStaff: boolean;
  body: string | null;
  from: OrderStatus | null;
  to: OrderStatus | null;
  createdAt: string;
  files: OrderFile[];
};

export async function getOrderLog(orderId: string): Promise<OrderEvent[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("order_events")
    .select(
      "id, kind, body, from_status, to_status, created_at, author:profiles(full_name, email, role_id), order_files(id, path, name, mime_type, size_bytes)",
    )
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });

  const events = data ?? [];
  const paths = events.flatMap((event) => event.order_files.map((file) => file.path));
  const { data: signed } = paths.length
    ? await supabase.storage.from(ORDER_FILES_BUCKET).createSignedUrls(paths, 60 * 60)
    : { data: [] };
  const urlFor = new Map((signed ?? []).map((entry) => [entry.path, entry.signedUrl]));

  return events.map((event) => ({
    id: event.id,
    kind: event.kind,
    author: event.author ? event.author.full_name || event.author.email : null,
    authorIsStaff: Boolean(event.author?.role_id),
    body: event.body,
    from: event.from_status,
    to: event.to_status,
    createdAt: event.created_at,
    files: event.order_files.map((file) => ({
      id: file.id,
      name: file.name,
      mimeType: file.mime_type,
      size: file.size_bytes,
      url: urlFor.get(file.path) ?? null,
    })),
  }));
}
