"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function Accordion({
  title,
  count,
  defaultOpen = false,
  children,
}: {
  title: string;
  count?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="mt-3 bg-white border border-cocoa/15 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 sm:px-5 py-4 text-left hover:bg-sand/50 transition-colors"
      >
        <span className="font-display text-lg sm:text-xl text-cocoa">
          {title}
          {count !== undefined && <span className="ml-2 text-sm font-normal text-cocoa/50">({count})</span>}
        </span>
        <ChevronDown size={18} className="text-cocoa/50 transition-transform" style={{ transform: open ? "rotate(180deg)" : "none" }} aria-hidden />
      </button>
      {open && <div className="px-4 sm:px-5 pb-5 border-t border-cocoa/10">{children}</div>}
    </section>
  );
}
