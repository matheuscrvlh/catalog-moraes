"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import { niceTicks } from "@/lib/charts";
import { formatCompact, formatDay, formatInteger, formatPrice } from "@/lib/format";
import type { DashboardData } from "@/lib/admin/dashboard";

const METRICS = {
  revenue: { label: "Receita", format: formatPrice, axis: (value: number) => `R$ ${formatCompact(value)}` },
  orders: { label: "Pedidos", format: formatInteger, axis: formatInteger },
  views: { label: "Visitas", format: formatInteger, axis: formatCompact },
} as const;

type Metric = keyof typeof METRICS;

const AXIS = 28;
const LEFT = 60;
const LINE = "#2f43b8";
const DROP = "M0 -9 C 4 -2 7 2 7 6 A 7 7 0 0 1 -7 6 C -7 2 -4 -2 0 -9 Z";

export function TrendChart({ series }: { series: DashboardData["series"] }) {
  const container = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 640, height: 260 });
  const [metric, setMetric] = useState<Metric>("revenue");
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) =>
      setSize({ width: entry.contentRect.width, height: Math.max(entry.contentRect.height, 220) }),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const { width } = size;
  const plotHeight = size.height - AXIS;
  const values = series.map((point) => point[metric]);
  const ticks = niceTicks(Math.max(...values, 1));
  const max = ticks[ticks.length - 1];
  const plotWidth = Math.max(width - LEFT - 8, 100);
  const x = (index: number) => LEFT + (series.length > 1 ? (index / (series.length - 1)) * plotWidth : plotWidth / 2);
  const y = (value: number) => plotHeight - (value / max) * plotHeight;
  const points = values.map((value, index) => `${x(index).toFixed(1)},${y(value).toFixed(1)}`);
  const line = `M${points.join(" L")}`;
  const area = `M${x(0)},${plotHeight} L${points.join(" L")} L${x(values.length - 1)},${plotHeight} Z`;
  const labelEvery = Math.ceil(series.length / Math.max(2, Math.floor(plotWidth / 70)));
  const total = values.reduce((sum, value) => sum + value, 0);
  const peak = values.indexOf(Math.max(...values));
  const active = hover != null ? series[hover] : null;

  const onMove = (event: React.PointerEvent<SVGRectElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    setHover(Math.round(((event.clientX - bounds.left) / bounds.width) * (series.length - 1)));
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-[17px] font-bold text-ink">Safra de vendas</h2>
          <p className="mt-0.5 text-[13px] text-mist">
            {METRICS[metric].label} por dia · total {METRICS[metric].format(total)}
          </p>
        </div>
        <div className="flex rounded-full bg-cloud p-1" role="tablist" aria-label="Métrica do gráfico">
          {(Object.keys(METRICS) as Metric[]).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={metric === key}
              onClick={() => setMetric(key)}
              className={cn(
                "relative rounded-full px-4 py-1.5 text-[12.5px] font-semibold transition",
                metric === key ? "text-white" : "text-mist hover:text-ink",
              )}
            >
              {metric === key && (
                <motion.span
                  layoutId="trend-tab"
                  className="absolute inset-0 rounded-full bg-navy"
                  transition={{ type: "spring", damping: 30, stiffness: 350 }}
                />
              )}
              <span className="relative">{METRICS[key].label}</span>
            </button>
          ))}
        </div>
      </div>

      <div ref={container} className="relative min-h-[260px] flex-1">
        <svg
          width={width}
          height={plotHeight + AXIS}
          className="absolute inset-0 overflow-visible"
          role="img"
          aria-label={`${METRICS[metric].label} por dia`}
        >
          <defs>
            <linearGradient id="trend-area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={LINE} stopOpacity={0.16} />
              <stop offset="100%" stopColor={LINE} stopOpacity={0} />
            </linearGradient>
          </defs>
          {ticks.map((tick) => (
            <g key={tick}>
              <line x1={LEFT} x2={LEFT + plotWidth} y1={y(tick)} y2={y(tick)} stroke="#eef0f6" />
              <text
                x={LEFT - 12}
                y={y(tick)}
                dy="0.35em"
                textAnchor="end"
                className="fill-mist text-[11px] tabular-nums"
              >
                {METRICS[metric].axis(tick)}
              </text>
            </g>
          ))}
          {series.map((point, index) =>
            index % labelEvery === 0 ? (
              <text
                key={point.day}
                x={x(index)}
                y={plotHeight + 20}
                textAnchor="middle"
                className="fill-mist text-[11px]"
              >
                {formatDay(`${point.day}T12:00:00`)}
              </text>
            ) : null,
          )}
          <motion.path
            key={`${metric}-area`}
            d={area}
            fill="url(#trend-area)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          />
          <motion.path
            key={`${metric}-line`}
            d={line}
            fill="none"
            stroke={LINE}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />
          {hover == null && values[peak] > 0 && (
            <g pointerEvents="none">
              <path
                transform={`translate(${x(peak)} ${y(values[peak]) - 14})`}
                d={DROP}
                fill="#e3262e"
                stroke="white"
                strokeWidth={2}
              />
              <text
                x={x(peak)}
                y={y(values[peak]) - 30}
                textAnchor="middle"
                className="fill-ink text-[11px] font-semibold"
              >
                pico
              </text>
            </g>
          )}
          {active && hover != null && (
            <g pointerEvents="none">
              <line
                x1={x(hover)}
                x2={x(hover)}
                y1={y(values[hover])}
                y2={plotHeight}
                stroke={LINE}
                strokeOpacity={0.3}
              />
              <path
                transform={`translate(${x(hover)} ${y(values[hover]) - 14})`}
                d={DROP}
                fill="#e3262e"
                stroke="white"
                strokeWidth={2}
              />
              <circle cx={x(hover)} cy={y(values[hover])} r={4.5} fill={LINE} stroke="white" strokeWidth={2} />
            </g>
          )}
          <rect
            x={LEFT}
            y={0}
            width={plotWidth}
            height={plotHeight}
            fill="transparent"
            onPointerMove={onMove}
            onPointerLeave={() => setHover(null)}
          />
        </svg>

        {active && hover != null && (
          <div
            className="pointer-events-none absolute z-10 rounded-2xl bg-ink px-3.5 py-2.5 text-xs text-white shadow-xl"
            style={{ left: Math.min(Math.max(x(hover) - 70, 0), width - 150), top: Math.max(y(values[hover]) - 84, 0) }}
          >
            <p className="text-white/60">{formatDay(`${active.day}T12:00:00`)}</p>
            <p className="mt-0.5 text-sm font-bold">{METRICS[metric].format(active[metric])}</p>
          </div>
        )}
      </div>
    </div>
  );
}
