"use client";

import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Task } from "@/lib/types";
import { PriorityPill } from "./PriorityPill";
import { InfoPopover } from "./InfoPopover";

const APPROVAL_LABEL: Record<string, string> = {
  approved: "Approved",
  rejected: "Changes requested",
};

export function TaskItem({ task }: { task: Task }) {
  const ref = doc(db, "tasks", task.id);

  function toggleDone() {
    updateDoc(ref, { done: !task.done }).catch(console.error);
  }

  function setApproval(value: "approved" | "rejected") {
    updateDoc(ref, { approval: task.approval === value ? null : value }).catch(console.error);
  }

  const statusLabel = task.approval ? APPROVAL_LABEL[task.approval] : "Awaiting review";
  const statusClass =
    task.approval === "approved"
      ? "text-ok"
      : task.approval === "rejected"
        ? "text-p0"
        : "text-muted";

  return (
    <li className="flex flex-col gap-3 border-b border-line py-4 last:border-b-0 sm:flex-row sm:items-start">
      <input
        type="checkbox"
        checked={task.done}
        onChange={toggleDone}
        className="mt-1 h-5 w-5 shrink-0 cursor-pointer rounded border-line accent-[var(--evergreen)]"
        aria-label={`Mark "${task.title}" as done`}
      />

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`font-medium ${task.done ? "text-muted line-through" : "text-ink"}`}>
            {task.title}
          </span>
          <PriorityPill priority={task.priority} />
          <InfoPopover text={task.how} />
        </div>
        {task.subtitle && <p className="mt-1 text-sm text-muted">{task.subtitle}</p>}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {task.driveLink && (
            <>
              <a
                href={task.driveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md bg-highlight px-3 py-1.5 text-sm font-medium text-ink transition hover:brightness-95"
              >
                Review in Google Drive ↗
              </a>
              <button
                type="button"
                onClick={() => setApproval("approved")}
                className={`inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm font-medium transition ${
                  task.approval === "approved"
                    ? "border-ok bg-ok text-white"
                    : "border-line bg-stone-2 text-ink hover:border-ok hover:text-ok"
                }`}
              >
                ✓ Approved
              </button>
              <button
                type="button"
                onClick={() => setApproval("rejected")}
                className={`inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm font-medium transition ${
                  task.approval === "rejected"
                    ? "border-p0 bg-p0 text-white"
                    : "border-line bg-stone-2 text-ink hover:border-p0 hover:text-p0"
                }`}
              >
                ✗ Changes Needed
              </button>
              <span className={`text-sm font-medium ${statusClass}`}>{statusLabel}</span>
            </>
          )}

          {!task.driveLink && task.link && (
            <a
              href={task.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md border border-line bg-stone-2 px-3 py-1.5 text-sm font-medium text-ink transition hover:border-evergreen hover:text-evergreen"
            >
              {task.linkLabel ?? "Open link"} ↗
            </a>
          )}
        </div>
      </div>
    </li>
  );
}
