import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { execFileSync } from "node:child_process";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import type { DashboardId, Tracking } from "../lib/types";

const SITE_URL = "https://www.drbarortho.com/";
const GA_PROPERTY = "properties/516920793";
const PAGE_URL = "https://www.drbarortho.com/airway-focused-orthodontics/";
const PAGE_PATH_FILTER = "airway-focused-orthodontics";

const DASHBOARDS: { id: DashboardId; keyword: string }[] = [
  { id: "airway", keyword: "airway" },
  { id: "marpe", keyword: "marpe" },
];

function composioExecute(slug: string, data: unknown): any {
  const out = execFileSync("composio", ["execute", slug, "-d", JSON.stringify(data)], {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });
  const parsed = JSON.parse(out);
  if (!parsed.successful) {
    throw new Error(`${slug} failed: ${JSON.stringify(parsed.error)}`);
  }
  return parsed.data;
}

function dateNDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

async function fetchForDashboard(dashboardId: DashboardId, keyword: string): Promise<Tracking> {
  const startDate = dateNDaysAgo(28);
  const endDate = dateNDaysAgo(0);
  const queryStartDate = dateNDaysAgo(90);

  const inspection = composioExecute("GOOGLE_SEARCH_CONSOLE_INSPECT_URL", {
    site_url: SITE_URL,
    inspection_url: PAGE_URL,
  });
  const indexStatus = inspection.inspectionResult.indexStatusResult;

  const pageTotals = composioExecute("GOOGLE_SEARCH_CONSOLE_SEARCH_ANALYTICS_QUERY", {
    site_url: SITE_URL,
    start_date: startDate,
    end_date: endDate,
    dimensions: [],
    dimension_filter_groups: [
      { filters: [{ dimension: "page", operator: "equals", expression: PAGE_URL }] },
    ],
  });
  const totalsRow = pageTotals.rows?.[0] ?? { clicks: 0, impressions: 0, position: 0 };

  const topQueriesResult = composioExecute("GOOGLE_SEARCH_CONSOLE_SEARCH_ANALYTICS_QUERY", {
    site_url: SITE_URL,
    start_date: queryStartDate,
    end_date: endDate,
    dimensions: ["query"],
    row_limit: 5,
    dimension_filter_groups: [
      {
        filters: [
          { dimension: "page", operator: "equals", expression: PAGE_URL },
          { dimension: "query", operator: "contains", expression: keyword },
        ],
      },
    ],
  });
  const topQueries = (topQueriesResult.rows ?? []).map((r: any) => ({
    query: r.keys[0],
    clicks: r.clicks,
    impressions: r.impressions,
    position: r.position,
  }));

  const analyticsResult = composioExecute("GOOGLE_ANALYTICS_RUN_REPORT", {
    property: GA_PROPERTY,
    dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
    dimensionFilter: {
      filter: { fieldName: "pagePath", stringFilter: { matchType: "CONTAINS", value: PAGE_PATH_FILTER } },
    },
  });
  const analyticsRow = analyticsResult.rows?.[0];
  const pageViews28d = analyticsRow ? Number(analyticsRow.metricValues[0].value) : 0;
  const activeUsers28d = analyticsRow ? Number(analyticsRow.metricValues[1].value) : 0;

  return {
    dashboardId,
    pageUrl: PAGE_URL,
    fetchedAt: new Date().toISOString(),
    indexing: {
      coverageState: indexStatus.coverageState,
      verdict: indexStatus.verdict,
      lastCrawlTime: indexStatus.lastCrawlTime ?? null,
    },
    searchConsole: {
      clicks28d: totalsRow.clicks,
      impressions28d: totalsRow.impressions,
      position28d: totalsRow.position ?? 0,
      topQueries,
    },
    analytics: {
      activeUsers28d,
      pageViews28d,
    },
  };
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

async function main() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  for (const { id, keyword } of DASHBOARDS) {
    console.log(`Fetching tracking data for ${id}...`);
    const tracking = await fetchForDashboard(id, keyword);
    await setDoc(doc(db, "tracking", id), tracking);
    console.log(`Wrote tracking/${id}:`, JSON.stringify(tracking, null, 2));
  }

  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
