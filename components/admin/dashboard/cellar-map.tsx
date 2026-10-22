"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import type { DashboardData } from "@/lib/admin/dashboard";

const FULL = 48;
const LOW = 6;
const R = 18;
const GAP = 5;

type Cell = DashboardData["cellar"][number];

export function CellarMap({ cellar }: { cellar: Cell[] }) {
  const container = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(900);
  const [hover, setHover] = useState<{ cell: Cell; x: number; y: number } | null>(null);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const step = (R + GAP) * 2;
  const columns = Math.max(6, Math.floor((width - R) / step));
  const position = (index: number) => {
    const row = Math.floor(index / columns);
    const column = index % columns;
    return { cx: R + 2 + column * step + (row % 2 ? step / 2 : 0), cy: R + 2 + row * (R + GAP) };
  };
  const rows = Math.ceil(cellar.length / columns);
  const height = R * 2 + 4 + (rows - 1) * (R + GAP);
  const categories = [...new Map(cellar.map((cell) => [cell.category, cell.accent])).entries()];

  return (
    <div>
      <div ref={container} className="relative">
        <svg
          width={width}
          height={height}
          className="block overflow-visible"
          role="img"
          aria-label="Estoque por produto"
        >
          {cellar.map((cell, index) => {
            const { cx, cy } = position(index);
            const size = R * Math.max(0.3, Math.sqrt(Math.min(cell.stock, FULL) / FULL));
            const empty = cell.stock <= 0;
            const low = !empty && cell.stock <= LOW;
            const diamond = `${cx},${cy - R} ${cx + R},${cy} ${cx},${cy + R} ${cx - R},${cy}`;
            return (
              <Link
                key={cell.id}
                href={`/admin/produtos/${cell.id}`}
                onPointerEnter={() => setHover({ cell, x: cx, y: cy })}
                onPointerLeave={() => setHover(null)}
                onFocus={() => setHover({ cell, x: cx, y: cy })}
                onBlur={() => setHover(null)}
                aria-label={`${cell.name}: ${cell.stock} unidades`}
              >
                <polygon points={diamond} fill={empty ? "#f4f2ee" : `${cell.accent}26`} />
                {!empty && (
                  <motion.polygon
                    points={`${cx},${cy - size} ${cx + size},${cy} ${cx},${cy + size} ${cx - size},${cy}`}
                    fill={cell.accent}
                    style={{ transformOrigin: `${cx}px ${cy}px` }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 + index * 0.006, ease: [0.16, 1, 0.3, 1] }}
                  />
                )}
                <polygon
                  points={diamond}
                  fill="transparent"
                  stroke={hover?.cell.id === cell.id ? "#070a1c" : empty ? "rgba(7,10,28,0.18)" : "transparent"}
                  strokeWidth={hover?.cell.id === cell.id ? 2 : 1}
                />
                {low && <circle cx={cx} cy={cy - R + 1} r={4} fill="#e3262e" stroke="white" strokeWidth={2} />}
              </Link>
            );
          })}
        </svg>

        {hover && (
          <div
            className="pointer-events-none absolute z-10 w-52 rounded-xl bg-ink px-3 py-2.5 text-xs text-white shadow-xl"
            style={{ left: Math.min(Math.max(hover.x - 104, 0), width - 208), top: hover.y + R + 8 }}
          >
            <p className="font-medium">{hover.cell.name}</p>
            <p className="mt-1 flex items-center gap-1.5 text-white/60">
              <span className="size-2 rounded-full" style={{ background: hover.cell.accent }} />
              {hover.cell.category} · {hover.cell.stock} un.
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-ink/60">
        {categories.map(([name, accent]) => (
          <span key={name} className="flex items-center gap-1.5">
            <svg viewBox="0 0 10 10" className="size-2.5">
              <polygon points="5,0 10,5 5,10 0,5" fill={accent} />
            </svg>
            {name}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <svg viewBox="0 0 10 10" className="size-2.5">
            <polygon points="5,0.5 9.5,5 5,9.5 0.5,5" fill="#f4f2ee" stroke="rgba(7,10,28,0.3)" />
          </svg>
          Esgotado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-red" /> Estoque baixo (≤ {LOW})
        </span>
        <span className="ml-auto text-ink/40">Tamanho do losango interno = estoque · cheio a partir de {FULL} un.</span>
      </div>
    </div>
  );
}
