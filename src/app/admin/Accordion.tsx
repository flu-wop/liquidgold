"use client";

import { useState } from "react";

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
    <div className="border-b border-cocoa/10">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="font-display text-2xl text-cocoa">
          {title}
          {count !== undefined && (
            <span className="ml-2 text-base font-normal text-cocoa/40">({count})</span>
          )}
        </span>
        <span
          className={`text-guava transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          &#9662;
        </span>
      </button>
      {open && <div className="pb-8">{children}</div>}
    </div>
  );
}
