"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { DashboardId, HistoryEntry } from "@/lib/types";

function StatusCell({ value }: { value: boolean | null }) {
  if (value === null) return <span className="text-muted">—</span>;
  return value ? (
    <span className="font-medium text-ok">✓ Yes</span>
  ) : (
    <span className="font-medium text-p0">✗ No</span>
  );
}

export function HistoryTable({ dashboardId }: { dashboardId: DashboardId }) {
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null);

  useEffect(() => {
    const q = query(collection(db, "history"), where("dashboardId", "==", dashboardId));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as HistoryEntry);
        rows.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
        setEntries(rows);
      },
      (err) => console.error(err)
    );
    return unsub;
  }, [dashboardId]);

  return (
    <section className="overflow-hidden rounded-xl border border-line bg-stone-2">
      <div className="px-5 py-4">
        <h2 className="font-serif text-lg font-semibold text-evergreen">AI Search Check History</h2>
        <p className="mt-1 text-sm text-muted">
          Manually logged results from asking ChatGPT and Perplexity the buyer question. Not automated.
        </p>
      </div>

      {entries === null ? (
        <p className="px-5 pb-4 text-sm text-muted">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="border-t border-line px-5 py-4 text-sm text-muted">
          No entries logged yet.
        </p>
      ) : (
        <div className="overflow-x-auto border-t border-line">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-muted">
                <th className="px-5 py-2 font-medium">Date</th>
                <th className="px-5 py-2 font-medium">ChatGPT</th>
                <th className="px-5 py-2 font-medium">Perplexity</th>
                <th className="px-5 py-2 font-medium">Mentions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-line last:border-b-0">
                  <td className="px-5 py-2.5 text-ink">{entry.date}</td>
                  <td className="px-5 py-2.5">
                    <StatusCell value={entry.chat} />
                  </td>
                  <td className="px-5 py-2.5">
                    <StatusCell value={entry.pplx} />
                  </td>
                  <td className="px-5 py-2.5 text-ink">{entry.ment ?? <span className="text-muted">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
