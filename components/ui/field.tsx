import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "dark" | "light";

const CONTROL: Record<Tone, string> = {
  dark: "border-white/12 bg-white/5 text-white placeholder:text-white/40 focus:border-white/40",
  light: "border-ink/12 bg-white text-ink placeholder:text-ink/35 focus:border-royal focus:ring-4 focus:ring-royal/10",
};

export function controlClass(tone: Tone = "light", className?: string) {
  return cn(
    "w-full rounded-2xl border px-4 text-[15px] outline-none transition disabled:opacity-60",
    CONTROL[tone],
    className,
  );
}

type FieldProps = {
  label: string;
  error?: string;
  hint?: ReactNode;
  tone?: Tone;
  className?: string;
  children: ReactNode;
};

export function Field({ label, error, hint, tone = "light", className, children }: FieldProps) {
  return (
    <label className={cn("block", className)}>
      <span className={cn("mb-2 block text-[13px] font-medium", tone === "dark" ? "text-white/80" : "text-ink/70")}>
        {label}
      </span>
      {children}
      {error ? (
        <span className="mt-1.5 block text-xs text-red-600">{error}</span>
      ) : (
        hint && (
          <span className={cn("mt-1.5 block text-xs", tone === "dark" ? "text-white/45" : "text-ink/45")}>{hint}</span>
        )
      )}
    </label>
  );
}

export function Input({ tone, className, ...props }: ComponentProps<"input"> & { tone?: Tone }) {
  return <input className={controlClass(tone, cn("h-12", className))} {...props} />;
}

export function Textarea({ tone, className, ...props }: ComponentProps<"textarea"> & { tone?: Tone }) {
  return <textarea className={controlClass(tone, cn("min-h-28 py-3", className))} {...props} />;
}

export function Select({ tone, className, ...props }: ComponentProps<"select"> & { tone?: Tone }) {
  return <select className={controlClass(tone, cn("h-12 appearance-none", className))} {...props} />;
}

export function FormMessage({ message, tone = "error" }: { message?: string | null; tone?: "error" | "success" }) {
  if (!message) return null;
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-2xl px-4 py-3 text-sm",
        tone === "error" ? "bg-red-100 text-red-600" : "bg-success-100 text-success",
      )}
    >
      {message}
    </p>
  );
}
