import "server-only";
import type { PostgrestError } from "@supabase/supabase-js";
import type { FormState } from "@/lib/forms";

export const FORBIDDEN: FormState = { message: "Você não tem permissão para esta ação." };

export function dbMessage(error: PostgrestError | null, fallback = "Não foi possível salvar agora."): FormState {
  if (!error) return { message: fallback };
  if (error.code === "23505") return { message: "Já existe um registro com esse nome ou endereço." };
  if (error.code === "23503") return { message: "Este registro está em uso e não pode ser removido." };
  if (error.code === "42501") return { message: error.message || FORBIDDEN.message };
  if (error.code === "23514") return { message: error.message };
  return { message: fallback };
}

export const optional = (value: string) => (value === "" ? null : value);
