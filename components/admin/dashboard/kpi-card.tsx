import { ArrowDownRight, ArrowUpRight, Eye, Receipt, ShoppingBasket, Wine, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { delta } from "@/lib/charts";
import { AnimatedNumber, type NumberFormat } from "./animated-number";

const ICONS = { revenue: Receipt, orders: ShoppingBasket, bottles: Wine, views: Eye } satisfies Record<
  string,
  LucideIcon
>;

type Props = {
  label: string;
  value: number;
  previous: number;
  format: NumberFormat;
  icon: keyof typeof ICONS;
  note: string;
  primary?: boolean;
};

export function DeltaChip({ current, previous, inverted }: { current: number; previous: number; inverted?: boolean }) {
  const change = delta(current, previous);
  const up = change >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11.5px] font-bold",
        inverted ? "bg-white/20 text-white" : up ? "bg-success-100 text-success" : "bg-red-100 text-red-600",
      )}
    >
      <Icon className="size-3" strokeWidth={2.5} />
      {up ? "+" : "−"}
      {Math.abs(change * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%
    </span>
  );
}

function Drops() {
  return (
    <svg
      viewBox="0 0 120 140"
      className="pointer-events-none absolute -top-2 right-3 h-36 w-auto opacity-90"
      aria-hidden
    >
      <defs>
        <linearGradient id="kpi-drop" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#ff6b72" />
          <stop offset="100%" stopColor="#e3262e" />
        </linearGradient>
      </defs>
      {[
        { x: 20, delay: "0s", size: 1 },
        { x: 58, delay: "1.2s", size: 0.75 },
        { x: 92, delay: "2.3s", size: 0.9 },
      ].map((drop) => (
        <g key={drop.x} className="animate-drip" style={{ animationDelay: drop.delay, transformBox: "fill-box" }}>
          <path
            transform={`translate(${drop.x} 8) scale(${drop.size})`}
            d="M0 0 C 5 9 9 14 9 19 A 9 9 0 0 1 -9 19 C -9 14 -5 9 0 0 Z"
            fill="url(#kpi-drop)"
          />
        </g>
      ))}
    </svg>
  );
}

export function KpiCard({ label, value, previous, format, icon, note, primary }: Props) {
  const Icon = ICONS[icon];

  return (
    <div
      className={cn(
        "relative flex min-h-[168px] flex-col overflow-hidden rounded-[26px] p-5 transition duration-300 hover:-translate-y-0.5",
        primary
          ? "bg-linear-to-br from-navy via-[#22328f] to-royal text-white shadow-[0_24px_40px_-24px_rgba(47,67,184,0.9)]"
          : "bg-white shadow-[0_1px_2px_rgba(23,25,43,0.04)]",
      )}
    >
      {primary && <Drops />}
      <div className="relative flex items-start justify-between">
        <span
          className={cn(
            "flex size-11 items-center justify-center rounded-2xl",
            primary ? "bg-white/15 text-white backdrop-blur" : "bg-cloud text-navy",
          )}
        >
          <Icon className="size-5" strokeWidth={1.8} />
        </span>
        {!primary && <DeltaChip current={value} previous={previous} />}
      </div>
      <p className={cn("relative mt-auto pt-6 text-[13px] font-medium", primary ? "text-white/75" : "text-mist")}>
        {label}
      </p>
      <div className="relative mt-1 flex items-end justify-between gap-3">
        <p className="text-[28px] leading-none font-bold tracking-tight">
          <AnimatedNumber value={value} format={format} />
        </p>
        {primary && <DeltaChip current={value} previous={previous} inverted />}
      </div>
      <p className={cn("relative mt-2 text-[11.5px]", primary ? "text-white/60" : "text-mist")}>{note}</p>
    </div>
  );
}
