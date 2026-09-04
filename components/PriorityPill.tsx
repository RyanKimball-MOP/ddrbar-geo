import type { Priority } from "@/lib/types";

const PRIORITY_CONFIG: Record<Priority, { label: string; className: string }> = {
  P0: { label: "Now", className: "bg-p0 text-white" },
  P1: { label: "Next", className: "bg-highlight text-ink" },
  P2: { label: "Later", className: "bg-sage text-white" },
};

export function PriorityPill({ priority }: { priority: Priority }) {
  const { label, className } = PRIORITY_CONFIG[priority];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide ${className}`}
    >
      {label}
    </span>
  );
}
