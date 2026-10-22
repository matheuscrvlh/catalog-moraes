import { cn } from "@/lib/cn";

type Tone = "dark" | "light";

const TONES: Record<Tone, { navy: string; letter: string; earth: string }> = {
  light: { navy: "#1b2a78", letter: "#151515", earth: "#4a3a33" },
  dark: { navy: "#f4eee6", letter: "#f4eee6", earth: "#9c7a68" },
};

export function BrandMark({ tone = "dark", className }: { tone?: Tone; className?: string }) {
  const colors = TONES[tone];
  return (
    <svg viewBox="0 0 120 92" fill="none" strokeLinejoin="round" strokeWidth={8.5} className={className} aria-hidden>
      <path d="M50 2.5 L11.5 31 Q4 37 11.5 42.5 L60 75.5" stroke={colors.navy} />
      <path d="M28.5 46 C27.5 33 34 23 46 14 L57.5 5.5 Q62 2.5 66.5 5.5 L110 39" stroke="#e3262e" />
      <path d="M52 19.5 L108.5 48 Q117.5 53.5 109.5 60 L77.5 88" stroke="#23b4ee" />
      <path d="M10 58 L55.5 85.5 Q62 89.5 68.5 85 L91 67.5 Q97.5 62 97 53.5" stroke={colors.earth} />
      <path
        d="M44 65 L46.5 47 Q48.5 36 57 36.5 Q65 37 64.3 46.5 L63.3 62 M64.3 46.5 Q66.3 36.5 74 36.5 Q82.5 37 82.3 46.5 L84.5 65"
        stroke={colors.letter}
      />
    </svg>
  );
}

export function Logo({ tone = "dark", className }: { tone?: Tone; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <BrandMark tone={tone} className="h-8 w-auto shrink-0" />
      <span className="flex flex-col leading-none">
        <span
          className={cn("text-[17px] font-semibold tracking-[0.16em]", tone === "light" ? "text-navy" : "text-white")}
        >
          MORAES
        </span>
        <span
          className={cn(
            "mt-1 text-[8.5px] font-medium tracking-[0.5em] uppercase",
            tone === "light" ? "text-earth" : "text-white/60",
          )}
        >
          Comercial
        </span>
      </span>
    </span>
  );
}

export function DiamondRing({ className, strokeWidth = 1 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" className={className} aria-hidden>
      <rect
        x="38"
        y="38"
        width="124"
        height="124"
        rx="22"
        transform="rotate(45 100 100)"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
