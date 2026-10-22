import { Reveal } from "@/components/ui/reveal";
import type { ProductDetail } from "@/lib/catalog/types";

const AXES: { key: keyof ProductDetail["profile"]; label: string; low: string; high: string }[] = [
  { key: "body", label: "Corpo", low: "Leve", high: "Encorpado" },
  { key: "acidity", label: "Acidez", low: "Macia", high: "Vibrante" },
  { key: "tannin", label: "Tanino", low: "Suave", high: "Marcante" },
  { key: "sweetness", label: "Doçura", low: "Seco", high: "Doce" },
];

export function SensoryProfile({ profile }: { profile: ProductDetail["profile"] }) {
  const axes = AXES.filter((axis) => profile[axis.key] != null);
  if (!axes.length) return null;

  return (
    <div className="space-y-6">
      {axes.map((axis, index) => {
        const value = profile[axis.key] ?? 0;
        return (
          <Reveal key={axis.key} delay={index * 0.08} y={10}>
            <div className="mb-2 flex items-baseline justify-between">
              <span className="caps text-[13px] text-navy">{axis.label}</span>
              <span className="text-[11px] text-pebble">{value} de 5</span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 5 }, (_, step) => (
                <span key={step} className={step < value ? "h-1.5 flex-1 bg-navy" : "h-1.5 flex-1 bg-parchment"} />
              ))}
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] tracking-[0.18em] text-pebble uppercase">
              <span>{axis.low}</span>
              <span>{axis.high}</span>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
