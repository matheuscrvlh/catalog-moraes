"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { formatInteger, formatPrice } from "@/lib/format";
import type { DashboardData } from "@/lib/admin/dashboard";

const RAMP = ["#1b2a78", "#2f43b8", "#6576d4", "#a3aee6"];
const SPOTS = [
  { x: 92, y: 96 },
  { x: 168, y: 64 },
  { x: 160, y: 148 },
  { x: 54, y: 168 },
];
const CODES: Record<string, string> = {
  Brasil: "BR",
  Portugal: "PT",
  Chile: "CL",
  Argentina: "AR",
  Espanha: "ES",
  Itália: "IT",
  Uruguai: "UY",
  "África do Sul": "ZA",
  "Estados Unidos": "US",
  Alemanha: "DE",
};

export function OriginBubbles({ data }: { data: DashboardData["origins"] }) {
  const [hover, setHover] = useState<string | null>(null);
  const top = data.slice(0, 4);
  const max = Math.max(...data.map((origin) => Number(origin.bottles)), 1);
  const total = data.reduce((sum, origin) => sum + Number(origin.bottles), 0) || 1;

  if (!data.length) return <p className="py-10 text-center text-sm text-mist">Sem vendas no período.</p>;

  return (
    <div>
      <svg
        viewBox="0 0 230 220"
        className="mx-auto h-52 w-full"
        role="img"
        aria-label="Garrafas vendidas por país de origem"
      >
        {top.map((origin, index) => {
          const radius = 26 + Math.sqrt(Number(origin.bottles) / max) * 46;
          const spot = SPOTS[index];
          return (
            <motion.g
              key={origin.country}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: hover && hover !== origin.country ? 0.94 : 1, opacity: 1 }}
              transition={{ type: "spring", damping: 16, stiffness: 160, delay: index * 0.12 }}
              style={{ transformOrigin: `${spot.x}px ${spot.y}px` }}
              onPointerEnter={() => setHover(origin.country)}
              onPointerLeave={() => setHover(null)}
              className="cursor-pointer"
            >
              <circle cx={spot.x} cy={spot.y} r={radius} fill={RAMP[index]} stroke="white" strokeWidth={3} />
              <text
                x={spot.x}
                y={spot.y + 5}
                textAnchor="middle"
                className="text-[15px] font-bold"
                fill={index === 3 ? "#17192b" : "white"}
              >
                {formatInteger(Number(origin.bottles))}
              </text>
            </motion.g>
          );
        })}
      </svg>

      <ul className="mt-2 space-y-3">
        {data.map((origin) => {
          const share = Number(origin.bottles) / total;
          return (
            <li
              key={origin.country}
              className="flex items-center gap-3"
              onPointerEnter={() => setHover(origin.country)}
              onPointerLeave={() => setHover(null)}
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-cloud text-[10px] font-bold text-navy">
                {CODES[origin.country] ?? origin.country.slice(0, 2).toUpperCase()}
              </span>
              <span className="w-24 truncate text-[13.5px] font-medium text-ink">{origin.country}</span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-cloud">
                <motion.span
                  className="block h-full rounded-full bg-royal"
                  initial={{ width: 0 }}
                  animate={{ width: `${share * 100}%` }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                />
              </span>
              <span className="w-24 text-right text-[12.5px] text-mist" title={formatPrice(Number(origin.revenue))}>
                <span className="font-bold text-ink">{formatInteger(Number(origin.bottles))}</span> gf.
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
