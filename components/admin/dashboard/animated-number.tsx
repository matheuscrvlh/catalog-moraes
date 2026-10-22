"use client";

import { useEffect, useState } from "react";
import { animate } from "motion/react";
import { formatCompact, formatInteger, formatPrice } from "@/lib/format";

export type NumberFormat = "currency" | "integer" | "compact";

const FORMATTERS: Record<NumberFormat, (value: number) => string> = {
  currency: formatPrice,
  integer: (value) => formatInteger(Math.round(value)),
  compact: formatCompact,
};

export function AnimatedNumber({ value, format = "integer" }: { value: number; format?: NumberFormat }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, { duration: 1.4, ease: [0.16, 1, 0.3, 1], onUpdate: setDisplay });
    return () => controls.stop();
  }, [value]);

  return <>{FORMATTERS[format](display)}</>;
}
