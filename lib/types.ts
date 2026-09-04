export type DashboardId = "airway" | "marpe";

export type Priority = "P0" | "P1" | "P2";

export type Approval = "approved" | "rejected" | null;

export interface Task {
  id: string;
  dashboardId: DashboardId;
  sectionId: string;
  sectionTitle: string;
  itemId: string;
  order: number;
  title: string;
  subtitle: string;
  how: string;
  priority: Priority;
  link: string | null;
  linkLabel: string | null;
  driveLink: string | null;
  done: boolean;
  approval: Approval;
}

export interface HistoryEntry {
  id: string;
  dashboardId: DashboardId;
  date: string;
  chat: boolean | null;
  pplx: boolean | null;
  ment: number | null;
}

export interface DashboardMeta {
  id: DashboardId;
  title: string;
  description: string;
}

export const DASHBOARDS: DashboardMeta[] = [
  {
    id: "airway",
    title: "Airway",
    description: "Airway-focused orthodontist identity, authority, and quotability tasks.",
  },
  {
    id: "marpe",
    title: "MARPE",
    description: "Adult palate expander (MARPE) page, listings, and bio consistency tasks.",
  },
];
