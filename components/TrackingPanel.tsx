"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { DashboardId, Tracking } from "@/lib/types";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function TrackingPanel({ dashboardId }: { dashboardId: DashboardId }) {
  const [tracking, setTracking] = useState<Tracking | null | undefined>(undefined);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "tracking", dashboardId),
      (snap) => setTracking(snap.exists() ? (snap.data() as Tracking) : null),
      (err) => console.error(err)
    );
    return unsub;
  }, [dashboardId]);

  return (
    <section className="overflow-hidden rounded-xl border border-line bg-stone-2">
      <div className="px-5 py-4">
        <h2 className="font-serif text-lg font-semibold text-evergreen">Live Tracking Panel</h2>
        <p className="mt-1 text-sm text-muted">
          Real Google Search Console and Analytics data for this page. Search Console typically
          lags 2–3 days behind real activity.
        </p>
      </div>

      {tracking === undefined ? (
        <p className="px-5 pb-4 text-sm text-muted">Loading…</p>
      ) : tracking === null ? (
        <p className="border-t border-line px-5 py-4 text-sm text-muted">
          No tracking data synced yet.
        </p>
      ) : (
        <div className="border-t border-line px-5 py-4">
          <p className="mb-4 truncate text-xs text-muted">
            <a href={tracking.pageUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {tracking.pageUrl}
            </a>{" "}
            — last synced {formatDate(tracking.fetchedAt)}
          </p>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted">Indexing</div>
              <div
                className={`mt-1 text-sm font-semibold ${
                  tracking.indexing.verdict === "PASS" ? "text-ok" : "text-p0"
                }`}
              >
                {tracking.indexing.coverageState}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted">Clicks (28d)</div>
              <div className="mt-1 text-sm font-semibold text-ink">
                {tracking.searchConsole.clicks28d}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted">Impressions (28d)</div>
              <div className="mt-1 text-sm font-semibold text-ink">
                {tracking.searchConsole.impressions28d}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted">Avg. Position</div>
              <div className="mt-1 text-sm font-semibold text-ink">
                {tracking.searchConsole.position28d.toFixed(1)}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted">Page Views (28d)</div>
              <div className="mt-1 text-sm font-semibold text-ink">
                {tracking.analytics.pageViews28d}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted">Active Users (28d)</div>
              <div className="mt-1 text-sm font-semibold text-ink">
                {tracking.analytics.activeUsers28d}
              </div>
            </div>
          </div>

          {tracking.searchConsole.topQueries.length > 0 && (
            <div className="mt-5">
              <div className="mb-2 text-xs uppercase tracking-wide text-muted">
                Top queries (last 90 days)
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-line text-muted">
                      <th className="py-1.5 pr-3 font-medium">Query</th>
                      <th className="py-1.5 pr-3 font-medium">Clicks</th>
                      <th className="py-1.5 pr-3 font-medium">Impressions</th>
                      <th className="py-1.5 font-medium">Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tracking.searchConsole.topQueries.map((q) => (
                      <tr key={q.query} className="border-b border-line last:border-b-0">
                        <td className="py-1.5 pr-3 text-ink">{q.query}</td>
                        <td className="py-1.5 pr-3 text-ink">{q.clicks}</td>
                        <td className="py-1.5 pr-3 text-ink">{q.impressions}</td>
                        <td className="py-1.5 text-ink">{q.position.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
