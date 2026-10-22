"use client";

import { useState } from "react";
import { WINE_RAMP } from "@/lib/charts";
import type { DashboardData } from "@/lib/admin/dashboard";

const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const HOURS = Array.from({ length: 15 }, (_, index) => index + 8);

export function OrderHeatmap({ heatmap }: { heatmap: DashboardData["heatmap"] }) {
  const [hover, setHover] = useState<{ dow: number; hour: number; orders: number } | null>(null);
  const lookup = new Map(heatmap.map((cell) => [`${cell.dow}-${cell.hour}`, cell.orders]));
  const max = Math.max(...heatmap.map((cell) => cell.orders), 1);
  const bin = (value: number) =>
    value ? Math.min(WINE_RAMP.length - 1, Math.ceil((value / max) * (WINE_RAMP.length - 1))) : -1;
  const peak = heatmap.reduce((best, cell) => (cell.orders > (best?.orders ?? 0) ? cell : best), heatmap[0]);

  return (
    <div>
      <p className="mb-4 h-5 text-[13px] text-ink/55">
        {hover
          ? `${DAYS[hover.dow - 1]}, ${hover.hour}h: ${hover.orders} ${hover.orders === 1 ? "pedido" : "pedidos"}`
          : peak
            ? `Pico: ${DAYS[peak.dow - 1]} às ${peak.hour}h`
            : "Sem pedidos no período"}
      </p>
      <div className="grid grid-cols-[32px_1fr] gap-x-2">
        <div className="grid grid-rows-7 gap-[3px]">
          {DAYS.map((day) => (
            <span key={day} className="flex items-center text-[11px] text-ink/45">
              {day}
            </span>
          ))}
        </div>
        <div className="grid grid-rows-7 gap-[3px]" onPointerLeave={() => setHover(null)}>
          {DAYS.map((_, dayIndex) => (
            <div key={dayIndex} className="grid grid-cols-15 gap-[3px]">
              {HOURS.map((hour) => {
                const orders = lookup.get(`${dayIndex + 1}-${hour}`) ?? 0;
                const level = bin(orders);
                return (
                  <span
                    key={hour}
                    onPointerEnter={() => setHover({ dow: dayIndex + 1, hour, orders })}
                    className="aspect-square rounded-[5px] transition hover:outline-2 hover:outline-ink"
                    style={{ background: level < 0 ? "#f1eee9" : WINE_RAMP[level] }}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <span />
        <div className="mt-2 flex justify-between text-[10.5px] text-ink/40">
          <span>8h</span>
          <span>12h</span>
          <span>16h</span>
          <span>22h</span>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end gap-2 text-[11px] text-ink/45">
        Menos
        {WINE_RAMP.map((color) => (
          <span key={color} className="size-3 rounded-[3px]" style={{ background: color }} />
        ))}
        Mais
      </div>
    </div>
  );
}
