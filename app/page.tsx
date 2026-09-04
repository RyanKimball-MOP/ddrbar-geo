import Link from "next/link";
import { DASHBOARDS } from "@/lib/types";

export default function Home() {
  return (
    <div className="min-h-screen bg-stone">
      <header className="bg-evergreen">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <h1 className="font-serif text-3xl font-semibold text-stone-2">GEO Battle Station</h1>
          <p className="mt-1 text-sm text-sage-soft">Dr. Bar Orthodontics — SEO/GEO task tracking</p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="grid gap-5 sm:grid-cols-2">
          {DASHBOARDS.map((dashboard) => (
            <Link
              key={dashboard.id}
              href={`/${dashboard.id}`}
              className="group flex flex-col justify-between rounded-xl border border-line bg-stone-2 p-6 transition hover:border-evergreen hover:shadow-md"
            >
              <div>
                <h2 className="font-serif text-xl font-semibold text-evergreen">
                  {dashboard.title}
                </h2>
                <p className="mt-2 text-sm text-muted">{dashboard.description}</p>
              </div>
              <span className="mt-4 text-sm font-medium text-evergreen group-hover:underline">
                Open dashboard →
              </span>
            </Link>
          ))}

          <div className="flex flex-col justify-center rounded-xl border border-dashed border-line p-6 text-center text-sm text-muted sm:col-span-2">
            More sections (Facebook Ads, Social Performance) coming soon.
          </div>
        </div>
      </main>
    </div>
  );
}
