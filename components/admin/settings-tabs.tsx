"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";

export function SettingsTabs({ tabs }: { tabs: { href: string; label: string }[] }) {
  const pathname = usePathname();
  const current = [...tabs].sort((a, b) => b.href.length - a.href.length).find((tab) => pathname.startsWith(tab.href));

  return (
    <nav
      className="mb-6 flex w-fit gap-1 rounded-full bg-white p-1 shadow-[0_1px_2px_rgba(23,25,43,0.05)]"
      aria-label="Seções"
    >
      {tabs.map((tab) => {
        const active = tab.href === current?.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "relative rounded-full px-5 py-2 text-[13.5px] font-medium transition",
              active ? "text-white" : "text-ink/60 hover:text-ink",
            )}
          >
            {active && (
              <motion.span
                layoutId="settings-tab"
                className="absolute inset-0 rounded-full bg-navy"
                transition={{ type: "spring", damping: 30, stiffness: 340 }}
              />
            )}
            <span className="relative">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
