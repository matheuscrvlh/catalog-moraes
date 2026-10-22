"use client";

import { motion } from "motion/react";
import { formatInteger } from "@/lib/format";

const BOWL = "M18 8 H102 C102 66 90 104 60 112 C30 104 18 66 18 8 Z";

type Props = { conversion: number; confirmed: number; total: number; canceled: number };

export function ConversionGlass({ conversion, confirmed, total, canceled }: Props) {
  const level = Math.max(0.04, Math.min(conversion, 1));
  const top = 8 + (1 - level) * (112 - 8);

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-[26px] bg-linear-to-b from-navy-950 to-navy-900 p-6 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_70%,rgba(227,38,46,0.35),transparent_60%)]" />
      <div className="relative">
        <h2 className="text-[17px] font-bold">Taxa de conversão</h2>
        <p className="mt-0.5 text-[13px] text-white/55">Pedidos confirmados ou entregues</p>
      </div>

      <div className="relative flex flex-1 items-center justify-center py-4">
        <svg
          viewBox="0 0 120 190"
          className="h-52 w-auto overflow-visible"
          role="img"
          aria-label={`${Math.round(conversion * 100)}% de conversão`}
        >
          <defs>
            <clipPath id="conversion-bowl">
              <path d={BOWL} />
            </clipPath>
            <linearGradient id="conversion-wine" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#ff5a64" />
              <stop offset="100%" stopColor="#6d0f2a" />
            </linearGradient>
          </defs>
          <g clipPath="url(#conversion-bowl)">
            <motion.g
              initial={{ y: 104 }}
              animate={{ y: top - 8 }}
              transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.path
                d="M-60 14 Q-45 6 -30 14 T0 14 T30 14 T60 14 T90 14 T120 14 T150 14 T180 14 V220 H-60 Z"
                fill="url(#conversion-wine)"
                animate={{ x: [0, 60] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
              />
            </motion.g>
          </g>
          <path d={BOWL} fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.7)" strokeWidth={2} />
          <path
            d="M30 18 C30 60 38 88 52 100"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth={3}
            strokeLinecap="round"
          />
          <rect x={58} y={112} width={4} height={58} rx={2} fill="rgba(255,255,255,0.7)" />
          <ellipse cx={60} cy={174} rx={30} ry={6} fill="rgba(255,255,255,0.7)" />
          <circle cx={92} cy={124} r={2.5} fill="#ff5a64" className="animate-drip" />
        </svg>
        <div className="ml-4">
          <p className="text-[44px] leading-none font-bold">{Math.round(conversion * 100)}%</p>
          <p className="mt-2 text-[12px] text-white/60">dos pedidos</p>
        </div>
      </div>

      <dl className="relative grid grid-cols-3 gap-2 border-t border-white/10 pt-4 text-center">
        {[
          { label: "Recebidos", value: total },
          { label: "Fechados", value: confirmed },
          { label: "Cancelados", value: canceled },
        ].map((item) => (
          <div key={item.label}>
            <dt className="text-[11px] text-white/50">{item.label}</dt>
            <dd className="mt-0.5 text-lg font-bold">{formatInteger(item.value)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
