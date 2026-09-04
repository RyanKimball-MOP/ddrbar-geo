"use client";

import { useEffect, useState } from "react";
import type { Task } from "@/lib/types";
import { TaskItem } from "./TaskItem";

export function TaskSection({
  storageKey,
  title,
  tasks,
}: {
  storageKey: string;
  title: string;
  tasks: Task[];
}) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) setCollapsed(stored === "1");
    } catch {
      // ignore (e.g. private browsing)
    }
  }, [storageKey]);

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(storageKey, next ? "1" : "0");
      } catch {
        // ignore
      }
      return next;
    });
  }

  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <section className="overflow-hidden rounded-xl border border-line bg-stone-2">
      <button
        type="button"
        onClick={toggle}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <h2 className="font-serif text-lg font-semibold text-evergreen">{title}</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted">
            {doneCount}/{tasks.length}
          </span>
          <span
            className={`text-muted transition-transform ${collapsed ? "" : "rotate-180"}`}
            aria-hidden
          >
            ▾
          </span>
        </div>
      </button>
      {!collapsed && (
        <ul className="border-t border-line px-5">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </ul>
      )}
    </section>
  );
}
