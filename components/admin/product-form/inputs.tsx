"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { controlClass } from "@/components/ui/field";

export function ChipsInput({
  value,
  onChange,
  placeholder,
  suggestions = [],
}: {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
  suggestions?: string[];
}) {
  const [draft, setDraft] = useState("");

  const add = (raw: string) => {
    const item = raw.trim();
    if (item && !value.some((entry) => entry.toLowerCase() === item.toLowerCase())) onChange([...value, item]);
    setDraft("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      add(draft);
    } else if (event.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  const available = suggestions.filter((item) => !value.includes(item)).slice(0, 8);

  return (
    <div>
      <div className={controlClass("light", "flex min-h-12 flex-wrap items-center gap-1.5 px-2 py-2")}>
        {value.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1 rounded-full bg-cloud py-1 pr-1.5 pl-3 text-[13px]"
          >
            {item}
            <button
              type="button"
              onClick={() => onChange(value.filter((entry) => entry !== item))}
              className="rounded-full p-0.5 text-ink/40 hover:bg-ink/10 hover:text-ink"
              aria-label={`Remover ${item}`}
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => draft && add(draft)}
          placeholder={value.length ? "" : placeholder}
          className="min-w-32 flex-1 bg-transparent px-2 text-[15px] outline-none placeholder:text-ink/35"
        />
      </div>
      {available.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {available.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => add(item)}
              className="rounded-full border border-dashed border-ink/15 px-2.5 py-1 text-[12px] text-ink/55 hover:border-ink/40 hover:text-ink"
            >
              + {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ScaleInput({
  name,
  label,
  low,
  high,
  value,
  onChange,
  accent,
}: {
  name: string;
  label: string;
  low: string;
  high: string;
  value: number | null;
  onChange: (value: number | null) => void;
  accent: string;
}) {
  return (
    <div>
      <input type="hidden" name={name} value={value ?? ""} />
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[13px] font-medium text-ink/70">{label}</span>
        <button type="button" onClick={() => onChange(null)} className="text-[11px] text-ink/40 hover:text-ink">
          {value ? `${value}/5 · limpar` : "não informado"}
        </button>
      </div>
      <div className="flex gap-1.5" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((step) => (
          <button
            key={step}
            type="button"
            role="radio"
            aria-checked={value === step}
            aria-label={`${label} ${step}`}
            onClick={() => onChange(step)}
            className={cn(
              "h-3 flex-1 rounded-full transition hover:scale-y-125",
              value && step <= value ? "" : "bg-ink/8",
            )}
            style={value && step <= value ? { background: accent } : undefined}
          />
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[10.5px] tracking-wide text-ink/40 uppercase">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  );
}

export function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[26px] border border-ink/6 bg-white p-6 md:p-7">
      <h2 className="text-[15px] font-semibold">{title}</h2>
      {description && <p className="mt-0.5 text-[13px] text-ink/50">{description}</p>}
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}
