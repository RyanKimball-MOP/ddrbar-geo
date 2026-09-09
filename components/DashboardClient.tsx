"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { DashboardId, Task } from "@/lib/types";
import { SECTION_ORDER } from "@/lib/seed-data";
import { ProgressBar } from "./ProgressBar";
import { ClearAllButton } from "./ClearAllButton";
import { TaskSection } from "./TaskSection";
import { HistoryTable } from "./HistoryTable";

export function DashboardClient({
  dashboardId,
  title,
}: {
  dashboardId: DashboardId;
  title: string;
}) {
  const [tasks, setTasks] = useState<Task[] | null>(null);

  useEffect(() => {
    const q = query(collection(db, "tasks"), where("dashboardId", "==", dashboardId));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Task);
        rows.sort((a, b) => a.order - b.order);
        setTasks(rows);
      },
      (err) => console.error(err)
    );
    return unsub;
  }, [dashboardId]);

  const sections = SECTION_ORDER[dashboardId];
  const doneCount = tasks?.filter((t) => t.done).length ?? 0;
  const totalCount = tasks?.length ?? 0;

  return (
    <div className="min-h-screen bg-stone">
      <header className="bg-evergreen">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
          <div>
            <Link href="/" className="text-sm text-sage-soft hover:text-white">
              ← All dashboards
            </Link>
            <h1 className="mt-1 font-serif text-2xl font-semibold text-stone-2 sm:text-3xl">
              {title}
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        {tasks === null ? (
          <p className="text-muted">Loading tasks…</p>
        ) : (
          <>
            <div className="mb-6 flex flex-col gap-4 rounded-xl border border-line bg-stone-2 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <ProgressBar done={doneCount} total={totalCount} />
              </div>
              <ClearAllButton taskIds={tasks.map((t) => t.id)} />
            </div>

            <div className="flex flex-col gap-4">
              {sections.map((section) => {
                const sectionTasks = tasks.filter((t) => t.sectionId === section.id);
                if (sectionTasks.length === 0) return null;
                return (
                  <TaskSection
                    key={section.id}
                    storageKey={`geo-battle-station:${dashboardId}:${section.id}`}
                    title={section.title}
                    tasks={sectionTasks}
                  />
                );
              })}
            </div>

            <div className="mt-4">
              <HistoryTable dashboardId={dashboardId} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
