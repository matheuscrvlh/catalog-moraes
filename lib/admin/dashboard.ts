import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/format";

export type DashboardData = {
  period_days: number;
  kpis: {
    revenue: number;
    revenue_prev: number;
    orders: number;
    orders_prev: number;
    customers: number;
    customers_prev: number;
    views: number;
    views_prev: number;
    active_products: number;
    low_stock: number;
    out_of_stock: number;
    pending_orders: number;
  };
  series: { day: string; orders: number; revenue: number; views: number }[];
  status: Partial<Record<OrderStatus, number>>;
  categories: { name: string; accent: string; products: number; stock: number }[];
  top_viewed: { id: string; name: string; slug: string; image_path: string | null; accent: string; views: number }[];
  top_sold: {
    id: string;
    name: string;
    image_path: string | null;
    accent: string;
    quantity: number;
    revenue: number;
  }[];
  cellar: {
    id: string;
    name: string;
    slug: string;
    category: string;
    accent: string;
    stock: number;
    image_path: string | null;
  }[];
  heatmap: { dow: number; hour: number; orders: number }[];
  weekday: { dow: number; current: number; previous: number }[];
  style_sales: { name: string; accent: string; bottles: number; bottles_prev: number; revenue: number }[];
  origins: { country: string; bottles: number; revenue: number }[];
  recent_orders: {
    id: string;
    number: number;
    customer_name: string;
    contact_name: string;
    status: OrderStatus;
    subtotal: number;
    created_at: string;
    items: number;
  }[];
  activity: {
    id: number;
    action: string;
    entity: string;
    summary: string | null;
    created_at: string;
    actor: string | null;
  }[];
};

export const PERIODS = [7, 30, 90] as const;
export type Period = (typeof PERIODS)[number];

export function parsePeriod(value: unknown): Period {
  const number = Number(value);
  return PERIODS.includes(number as Period) ? (number as Period) : 30;
}

export async function getDashboard(period: Period) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("dashboard_metrics", { period_days: period });
  if (error) throw error;
  return data as unknown as DashboardData;
}
