import type { ComponentProps, ReactNode } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = ComponentProps<"input"> & {
  label: string;
  icon?: ReactNode;
  error?: string;
  hint?: string;
  glass?: boolean;
};

export function AuthInput({ label, icon, error, hint, glass, className, ...props }: Props) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-medium text-ink">{label}</span>
      <span className="relative block">
        <input
          className={cn(
            "h-12 w-full rounded-xl border pr-11 pl-4 text-[15px] text-ink transition outline-none placeholder:text-pebble focus:border-red/60 focus:ring-4 focus:ring-red/10",
            glass ? "bg-white/65 backdrop-blur-md focus:bg-white/90" : "bg-white",
            error ? "border-red/60" : glass ? "border-white/80" : "border-line",
            className,
          )}
          {...props}
        />
        {icon && (
          <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-pebble">{icon}</span>
        )}
      </span>
      {error ? (
        <span className="mt-1.5 block text-xs text-red-600">{error}</span>
      ) : (
        hint && <span className="mt-1.5 block text-xs text-pebble">{hint}</span>
      )}
    </label>
  );
}

export function AuthSubmit({ pending, children }: { pending: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="group flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-red to-[#b4153a] text-[15px] font-medium text-white shadow-[0_16px_30px_-16px_rgba(227,38,46,0.9)] transition hover:brightness-110 disabled:opacity-70"
    >
      {pending && <LoaderCircle className="size-4 animate-spin" />}
      {children}
      {!pending && <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />}
    </button>
  );
}

export function AuthDivider({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-4 text-xs text-stone">
      <span className="h-px flex-1 bg-ink/10" />
      {children}
      <span className="h-px flex-1 bg-ink/10" />
    </div>
  );
}
