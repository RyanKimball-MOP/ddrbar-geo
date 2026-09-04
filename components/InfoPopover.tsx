"use client";

import { useEffect, useRef, useState } from "react";

export function InfoPopover({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        aria-label="How to do this"
        onClick={() => setOpen((o) => !o)}
        className="flex h-6 w-6 items-center justify-center rounded-full border border-line bg-stone-2 text-xs font-semibold text-muted transition hover:border-evergreen hover:text-evergreen"
      >
        ?
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-20 w-80 max-w-[85vw] rounded-lg border border-line bg-stone-2 p-4 shadow-lg sm:w-96">
          <p className="whitespace-pre-line text-sm leading-relaxed text-ink">{text}</p>
        </div>
      )}
    </div>
  );
}
