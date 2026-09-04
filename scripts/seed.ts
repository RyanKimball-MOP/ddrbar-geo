import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, writeBatch } from "firebase/firestore";
import { SEED_TASKS } from "../lib/seed-data";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
  const batch = writeBatch(db);

  for (const task of SEED_TASKS) {
    const docId = `${task.dashboardId}-${task.itemId}`;
    const ref = doc(db, "tasks", docId);
    const existing = await getDoc(ref);

    const contentFields = {
      dashboardId: task.dashboardId,
      sectionId: task.sectionId,
      sectionTitle: task.sectionTitle,
      itemId: task.itemId,
      order: task.order,
      title: task.title,
      subtitle: task.subtitle,
      how: task.how,
      priority: task.priority,
      link: task.link,
      linkLabel: task.linkLabel,
      driveLink: task.driveLink,
    };

    if (existing.exists()) {
      // Preserve live done/approval state — only refresh content fields.
      batch.set(ref, contentFields, { merge: true });
    } else {
      batch.set(ref, { ...contentFields, done: false, approval: null });
    }
  }

  await batch.commit();
  const airwayCount = SEED_TASKS.filter((t) => t.dashboardId === "airway").length;
  const marpeCount = SEED_TASKS.filter((t) => t.dashboardId === "marpe").length;
  console.log(`Seeded ${SEED_TASKS.length} tasks (${airwayCount} airway, ${marpeCount} marpe).`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
