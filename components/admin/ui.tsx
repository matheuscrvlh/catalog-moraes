import type { ComponentProps, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        {eyebrow && <p className="mb-1.5 text-[13px] font-medium text-mist">{eyebrow}</p>}
        <h1 className="text-[28px] leading-tight font-bold tracking-tight text-ink">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-mist">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function Card({ className, ...props }: ComponentProps<"section">) {
  return (
    <section
      className={cn("rounded-[26px] bg-white p-6 shadow-[0_1px_2px_rgba(23,25,43,0.04)]", className)}
      {...props}
    />
  );
}

export function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card className="grid gap-6 p-6 md:p-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-12">
      <div>
        <span className="flex size-10 items-center justify-center rounded-2xl bg-navy text-white">
          <Icon className="size-[18px]" strokeWidth={1.8} />
        </span>
        <h2 className="mt-4 text-[17px] font-bold text-ink">{title}</h2>
        <p className="mt-1 text-[13px] leading-relaxed text-mist">{description}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </Card>
  );
}

export function CardTitle({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-[17px] font-bold text-ink">{title}</h2>
        {description && <p className="mt-0.5 text-[13px] text-mist">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Badge({
  tone = "#8a8ea3",
  children,
  className,
}: {
  tone?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold whitespace-nowrap",
        className,
      )}
      style={{
        background: `color-mix(in oklab, ${tone} 12%, white)`,
        color: `color-mix(in oklab, ${tone} 80%, #17192b)`,
      }}
    >
      <span className="size-1.5 rounded-full" style={{ background: tone }} />
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-[26px] border border-dashed border-ink/12 bg-white px-6 py-16 text-center">
      <p className="text-xl font-bold text-ink">{title}</p>
      {description && <p className="mt-2 max-w-sm text-sm text-mist">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export const table = {
  wrap: "overflow-x-auto rounded-[26px] bg-white shadow-[0_1px_2px_rgba(23,25,43,0.04)]",
  table: "w-full min-w-[720px] text-left text-sm",
  head: "border-b border-cloud text-[12px] text-mist",
  th: "px-5 py-4 font-semibold",
  row: "border-b border-cloud last:border-0 transition hover:bg-cloud/50",
  td: "px-5 py-3.5 align-middle",
};

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton-light rounded-2xl", className)} />;
}

export function PanelSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-10 w-72" />
      <div className="grid gap-5 md:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-36 rounded-[26px]" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-[26px]" />
    </div>
  );
}
