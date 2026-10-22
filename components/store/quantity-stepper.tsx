"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
};

export function QuantityStepper({ value, onChange, min = 1, max = 999, size = "md", className }: Props) {
  const button = cn(
    "flex items-center justify-center text-ink/60 transition hover:text-navy disabled:opacity-30",
    size === "sm" ? "size-7" : "size-10",
  );
  return (
    <div
      className={cn(
        "inline-flex items-center border border-line bg-white",
        size === "sm" ? "h-8 rounded-xs" : "h-12 rounded-xs",
        className,
      )}
    >
      <button
        type="button"
        className={button}
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label="Diminuir"
      >
        <Minus className="size-3.5" />
      </button>
      <span className={cn("text-center tabular-nums", size === "sm" ? "w-7 text-xs" : "w-10 text-sm")}>{value}</span>
      <button
        type="button"
        className={button}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Aumentar"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}
