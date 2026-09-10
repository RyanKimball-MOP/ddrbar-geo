"use client";

import { useEffect, useState } from "react";
import type { Task } from "@/lib/types";
import { TaskItem } from "./TaskItem";

function groupByDriveLink(tasks: Task[]): (Task | Task[])[] {
  const countByLink = new Map<string, number>();
  for (const t of tasks) {
    if (t.driveLink) countByLink.set(t.driveLink, (countByLink.get(t.driveLink) ?? 0) + 1);
  }

  const seen = new Set<string>();
  const groups: (Task | Task[])[] = [];

  for (const t of tasks) {
    if (t.driveLink && (countByLink.get(t.driveLink) ?? 0) > 1) {
      if (seen.has(t.driveLink)) continue;
      seen.add(t.driveLink);
      groups.push(tasks.filter((x) => x.driveLink === t.driveLink));
    } else {
      groups.push(t);
    }
  }

  return groups;
}

function SharedDriveGroup({ tasks }: { tasks: Task[] }) {
  const driveLink = tasks[0].driveLink!;
  return (
    <li className="border-b border-line py-4 last:border-b-0">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-highlight bg-highlight-soft px-4 py-3">
        <p className="text-sm text-ink">
          <span className="font-semibold">{tasks.length} edits below</span> are all in this one
          document — review it once, then approve or request changes for each item individually.
        </p>
        <a
          href={driveLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1 rounded-md bg-highlight px-3 py-1.5 text-sm font-medium text-ink transition hover:brightness-95"
        >
          Review in Google Drive ↗
        </a>
      </div>
      <ul className="pl-1">
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} hideDriveButton />
        ))}
      </ul>
    </li>
  );
}

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
  const groups = groupByDriveLink(tasks);

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
          {groups.map((group) =>
            Array.isArray(group) ? (
              <SharedDriveGroup key={group[0].driveLink} tasks={group} />
            ) : (
              <TaskItem key={group.id} task={group} />
            )
          )}
        </ul>
      )}
    </section>
  );
}
