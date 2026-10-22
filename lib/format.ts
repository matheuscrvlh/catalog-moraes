import type { Database } from "@/lib/supabase/database.types";

export type Sweetness = Database["public"]["Enums"]["wine_sweetness"];
export type OrderStatus = Database["public"]["Enums"]["order_status"];
export type BusinessType = Database["public"]["Enums"]["business_type"];

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const compact = new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 });
const integer = new Intl.NumberFormat("pt-BR");
const dateShort = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", timeZone: "America/Sao_Paulo" });
const dateTime = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Sao_Paulo",
});

export const formatPrice = (value: number | null | undefined) =>
  value == null ? "Sob consulta" : currency.format(value);

export const formatCompact = (value: number) => compact.format(value);
export const formatInteger = (value: number) => integer.format(value);
export const formatDay = (value: string | Date) => dateShort.format(new Date(value)).replace(".", "");
export const formatDateTime = (value: string | Date) => dateTime.format(new Date(value));

export function formatVolume(ml: number | null | undefined) {
  if (!ml) return null;
  if (ml < 1000) return `${ml} ml`;
  return `${(ml / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} L`;
}

export function formatRelative(value: string | Date) {
  const diff = (Date.now() - new Date(value).getTime()) / 1000;
  if (diff < 60) return "agora";
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`;
  if (diff < 86400 * 7) return `há ${Math.floor(diff / 86400)} d`;
  return formatDay(value);
}

export const SWEETNESS: Record<Sweetness, string> = {
  seco: "Seco",
  meio_seco: "Meio seco",
  suave: "Suave",
  doce: "Doce",
  brut: "Brut",
  extra_brut: "Extra brut",
  demi_sec: "Demi-sec",
  nature: "Nature",
};

export const ORDER_STATUS: Record<OrderStatus, { label: string; tone: string }> = {
  novo: { label: "Novo", tone: "#e3262e" },
  em_atendimento: { label: "Em atendimento", tone: "#23b4ee" },
  confirmado: { label: "Confirmado", tone: "#d6b36a" },
  entregue: { label: "Entregue", tone: "#2f9e6e" },
  cancelado: { label: "Cancelado", tone: "#8a8fa8" },
};

export const ORDER_FLOW: OrderStatus[] = ["novo", "em_atendimento", "confirmado", "entregue"];

export function whatsappLink(phone: string | null | undefined, message?: string) {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return null;
  const number = digits.length <= 11 ? `55${digits}` : digits;
  return `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

export const BUSINESS_TYPES: Record<BusinessType, string> = {
  adega: "Adega",
  mercado: "Mercado / supermercado",
  restaurante: "Restaurante / bar",
  vinicola: "Vinícola",
  distribuidor: "Distribuidor",
  outro: "Outro",
};

export function formatTaxId(value: string | null | undefined) {
  if (!value) return null;
  if (value.length === 14) return value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  if (value.length === 11) return value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
  return value;
}
