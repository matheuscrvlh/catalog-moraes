"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { niceTicks } from "@/lib/charts";
import { formatCompact, formatPrice } from "@/lib/format";
import type { DashboardData } from "@/lib/admin/dashboard";

const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const CURRENT = "#2f43b8";
const PREVIOUS = "#d9dce8";
const HEIGHT = 220;

export function WeekdayBars({ data }: { data: DashboardData["weekday"] }) {
  const [hover, setHover] = useState<number | null>(null);
  const ticks = niceTicks(Math.max(...data.flatMap((day) => [day.current, day.previous]), 1));
  const max = ticks[ticks.length - 1];
  const height = (value: number) => Math.max((value / max) * HEIGHT, value > 0 ? 6 : 0);

  return (
    <div>
      <div className="mb-6 flex items-center gap-5 text-[12.5px] text-mist">
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-full" style={{ background: PREVIOUS }} /> Período anterior
        </span>
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-full" style={{ background: CURRENT }} /> Período atual
        </span>
      </div>

      <div className="relative grid grid-cols-[48px_1fr] gap-3">
        <div className="relative" style={{ height: HEIGHT }}>
          {ticks.map((tick) => (
            <span
              key={tick}
              className="absolute right-0 -translate-y-1/2 text-[11px] text-mist tabular-nums"
              style={{ bottom: `${(tick / max) * 100}%` }}
            >
              {formatCompact(tick)}
            </span>
          ))}
        </div>

        <div className="relative" style={{ height: HEIGHT }} onPointerLeave={() => setHover(null)}>
          {ticks.map((tick) => (
            <span
              key={tick}
              className="absolute inset-x-0 h-px bg-cloud"
              style={{ bottom: `${(tick / max) * 100}%` }}
            />
          ))}
          <div className="relative flex h-full items-end justify-around">
            {data.map((day, index) => (
              <div
                key={day.dow}
                className="relative flex h-full items-end gap-1.5 px-2"
                onPointerEnter={() => setHover(index)}
                onFocus={() => setHover(index)}
                tabIndex={0}
                aria-label={`${DAYS[index]}: ${formatPrice(day.current)} no período atual, ${formatPrice(day.previous)} no anterior`}
              >
                {[
                  { value: day.previous, color: PREVIOUS },
                  { value: day.current, color: CURRENT },
                ].map((bar, position) => (
                  <motion.span
                    key={position}
                    className="w-[18px] rounded-t-full rounded-b-md"
                    style={{ background: bar.color, opacity: hover === null || hover === index ? 1 : 0.45 }}
                    initial={{ height: 0 }}
                    animate={{ height: height(bar.value) }}
                    transition={{ duration: 0.9, delay: index * 0.05 + position * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  />
                ))}
                {hover === index && (
                  <div
                    className="pointer-events-none absolute left-1/2 z-10 w-44 -translate-x-1/2 rounded-2xl bg-ink px-3.5 py-3 text-[12px] text-white shadow-xl"
                    style={{ bottom: Math.max(height(day.current), height(day.previous)) + 14 }}
                  >
                    <p className="mb-1.5 font-semibold">{DAYS[index]}</p>
                    <p className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-1.5 text-white/70">
                        <span className="size-2 rounded-full" style={{ background: CURRENT }} /> Atual
                      </span>
                      {formatPrice(day.current)}
                    </p>
                    <p className="mt-1 flex items-center justify-between gap-3">
                      <span className="flex items-center gap-1.5 text-white/70">
                        <span className="size-2 rounded-full" style={{ background: PREVIOUS }} /> Anterior
                      </span>
                      {formatPrice(day.previous)}
                    </p>
                    <span className="absolute -bottom-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 bg-ink" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <span />
        <div className="flex justify-around text-[12px] text-mist">
          {DAYS.map((day) => (
            <span key={day} className="w-14 text-center">
              {day}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
