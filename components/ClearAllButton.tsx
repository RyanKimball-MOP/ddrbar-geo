"use client";

import { useState } from "react";
import { doc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function ClearAllButton({ taskIds }: { taskIds: string[] }) {
  const [open, setOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  async function handleConfirm() {
    setClearing(true);
    try {
      const batch = writeBatch(db);
      for (const id of taskIds) {
        batch.update(doc(db, "tasks", id), { done: false, approval: null });
      }
      await batch.commit();
    } catch (err) {
      console.error(err);
    } finally {
      setClearing(false);
      setOpen(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-line bg-stone-2 px-3 py-1.5 text-sm font-medium text-muted transition hover:border-p0 hover:text-p0"
      >
        Clear all ticks
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl border border-line bg-stone-2 p-6 shadow-xl">
            <h3 className="font-serif text-lg font-semibold text-ink">Clear all ticks and approvals?</h3>
            <p className="mt-2 text-sm text-muted">
              Clear all ticks and approvals for everyone? This can&apos;t be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border border-line px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-stone"
                disabled={clearing}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="rounded-md bg-p0 px-3 py-1.5 text-sm font-medium text-white transition hover:brightness-95 disabled:opacity-60"
                disabled={clearing}
              >
                {clearing ? "Clearing…" : "Clear everything"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
