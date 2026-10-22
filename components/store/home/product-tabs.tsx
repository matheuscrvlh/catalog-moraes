"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/cn";

type Tab = { id: string; label: string; content: ReactNode };

export function ProductTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const current = tabs.find((tab) => tab.id === active) ?? tabs[0];

  return (
    <div>
      <div className="flex justify-center gap-10" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={tab.id === current?.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              "relative pb-3 text-[12px] font-medium tracking-[0.24em] uppercase transition",
              tab.id === current?.id ? "text-red" : "text-ink/55 hover:text-navy",
            )}
          >
            {tab.label}
            {tab.id === current?.id && (
              <motion.span layoutId="home-tab" className="absolute inset-x-0 bottom-0 h-px bg-red" />
            )}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={current?.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12"
        >
          {current?.content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
