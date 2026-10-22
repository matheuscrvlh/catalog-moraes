import Link from "next/link";
import type { ComponentProps } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/cn";

const STORE = "rounded-xs text-[12px] font-medium tracking-[0.18em] uppercase";
const PANEL = "rounded-full text-sm font-medium";

const VARIANTS = {
  primary: `${STORE} bg-navy text-white hover:bg-navy-900`,
  accent: `${STORE} bg-red text-white hover:bg-red-600`,
  outline: `${STORE} border border-ink/20 text-ink hover:border-navy hover:text-navy`,
  ghost: `${STORE} text-ink/70 hover:bg-linen hover:text-navy`,
  light: `${STORE} bg-white text-ink hover:bg-ivory`,
  dark: `${PANEL} bg-navy text-white shadow-[0_10px_24px_-12px_rgba(27,42,120,0.8)] hover:bg-navy-900`,
  subtle: `${PANEL} bg-cloud text-ink hover:bg-navy-100`,
  line: `${PANEL} border border-ink/12 bg-white text-ink hover:border-ink/25`,
  danger: `${PANEL} bg-red/10 text-red hover:bg-red/15`,
} as const;

const SIZES = {
  sm: "h-9 gap-1.5 px-4",
  md: "h-11 gap-2 px-6",
  lg: "h-13 gap-2.5 px-8",
  icon: "size-10 justify-center",
  "icon-sm": "size-8 justify-center",
} as const;

export type ButtonVariant = keyof typeof VARIANTS;
type Size = keyof typeof SIZES;

export function buttonClass(variant: ButtonVariant = "primary", size: Size = "md", className?: string) {
  return cn(
    "inline-flex shrink-0 items-center justify-center whitespace-nowrap transition duration-200 select-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

type ButtonProps = ComponentProps<"button"> & { variant?: ButtonVariant; size?: Size; pending?: boolean };

export function Button({ variant, size, pending, className, children, disabled, ...props }: ButtonProps) {
  return (
    <button className={buttonClass(variant, size, className)} disabled={disabled || pending} {...props}>
      {pending && <LoaderCircle className="size-4 animate-spin" />}
      {children}
    </button>
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: Size };

export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}
