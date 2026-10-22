import { env } from "@/lib/env";

export const CATALOG_BUCKET = "catalog";

export function mediaUrl(path: string | null | undefined) {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("/")) return path;
  return `${env.supabaseUrl}/storage/v1/object/public/${CATALOG_BUCKET}/${path}`;
}
