import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function SectionTitle({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div className={cn(align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-xl", className)}>
      <p className="eyebrow text-[10.5px]! text-bronze">{eyebrow}</p>
      <h2 className="mt-3 font-display text-[clamp(2.1rem,4vw,3.1rem)] leading-[1.05] font-medium tracking-[0.06em] text-navy uppercase">
        {title}
      </h2>
      <span className={cn("mt-5 block h-px w-14 bg-red", align === "center" && "mx-auto")} />
      {description && <p className="mt-5 text-[15px] leading-relaxed text-stone">{description}</p>}
    </div>
  );
}
