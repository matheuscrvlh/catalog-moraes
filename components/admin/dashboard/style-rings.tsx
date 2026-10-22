"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { formatInteger } from "@/lib/format";
import type { DashboardData } from "@/lib/admin/dashboard";
import { AnimatedNumber } from "./animated-number";
import { DeltaChip } from "./kpi-card";

const SERIES = ["#2f43b8", "#e3262e", "#1fa3d6"];
const RADII = [92, 72, 52];
const STROKE = 11;

export function StyleRings({ data }: { data: DashboardData["style_sales"] }) {
  const [hover, setHover] = useState<number | null>(null);
  const total = data.reduce((sum, style) => sum + Number(style.bottles), 0) || 1;
  const totalPrev = data.reduce((sum, style) => sum + Number(style.bottles_prev), 0);
  const top = data.slice(0, 3);
  const rest = data.slice(3);
  const others = rest.reduce((sum, style) => sum + Number(style.bottles), 0);
  const othersPrev = rest.reduce((sum, style) => sum + Number(style.bottles_prev), 0);
  const focused = hover !== null ? top[hover] : null;

  return (
    <div>
      <div className="flex items-center gap-6">
        <svg
          viewBox="0 0 220 220"
          className="size-48 shrink-0 -rotate-90"
          role="img"
          aria-label="Garrafas vendidas por estilo"
        >
          {top.map((style, index) => {
            const radius = RADII[index];
            const circumference = 2 * Math.PI * radius;
            const share = Number(style.bottles) / total;
            return (
              <g
                key={style.name}
                onPointerEnter={() => setHover(index)}
                onPointerLeave={() => setHover(null)}
                className="cursor-pointer"
              >
                <circle cx="110" cy="110" r={radius} fill="none" stroke="#eef0f6" strokeWidth={STROKE} />
                <motion.circle
                  cx="110"
                  cy="110"
                  r={radius}
                  fill="none"
                  stroke={SERIES[index]}
                  strokeWidth={hover === index ? STROKE + 3 : STROKE}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: circumference * (1 - Math.max(share * 0.95, 0.02)) }}
                  transition={{ duration: 1.4, delay: 0.15 * index, ease: [0.16, 1, 0.3, 1] }}
                  style={{ opacity: hover === null || hover === index ? 1 : 0.35 }}
                />
              </g>
            );
          })}
        </svg>
        <div>
          <p className="text-[34px] leading-none font-bold tracking-tight text-ink">
            {focused ? formatInteger(Number(focused.bottles)) : <AnimatedNumber value={total} />}
          </p>
          <p className="mt-1.5 text-[13px] text-mist">
            {focused ? `garrafas de ${focused.name.toLowerCase()}` : "garrafas vendidas"}
          </p>
          <div className="mt-3">
            <DeltaChip
              current={focused ? Number(focused.bottles) : total}
              previous={focused ? Number(focused.bottles_prev) : totalPrev}
            />
          </div>
        </div>
      </div>

      <ul className="mt-6 space-y-3">
        {[
          ...top.map((style, index) => ({ ...style, color: SERIES[index], index })),
          ...(rest.length
            ? [{ name: "Outros estilos", bottles: others, bottles_prev: othersPrev, color: "#c9ccd8", index: -1 }]
            : []),
        ].map((row) => (
          <li
            key={row.name}
            className="flex items-center gap-3 rounded-2xl px-1 py-0.5 transition"
            onPointerEnter={() => row.index >= 0 && setHover(row.index)}
            onPointerLeave={() => setHover(null)}
          >
            <span className="flex size-8 items-center justify-center rounded-xl bg-cloud">
              <span className="size-2.5 rounded-full" style={{ background: row.color }} />
            </span>
            <span className="flex-1 text-[14px] font-medium text-ink">{row.name}</span>
            <span className="text-[14px] font-bold text-ink tabular-nums">{formatInteger(Number(row.bottles))}</span>
            <DeltaChip current={Number(row.bottles)} previous={Number(row.bottles_prev)} />
          </li>
        ))}
      </ul>
    </div>
  );
}
