import Link from "next/link";
import { MAILERS } from "@/lib/mailers";

export default function HomePage() {
  return (
    <main id="main" className="min-h-screen bg-navy-50/40">
      <header className="border-b border-navy-100 bg-navy-900">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-amber-400">
            Roosevelt Island
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Take Action
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-navy-300">
            Choose a campaign below and send a letter to your elected officials in under 2 minutes.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-navy-500">
          Choose a Campaign
        </h2>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {MAILERS.map((m) => (
            <li key={m.slug}>
              <Link
                href={`/${m.slug}`}
                className="group flex h-full flex-col rounded-xl border-2 border-navy-100 bg-white p-5 text-navy-800 transition hover:border-navy-300 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
              >
                <span className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-600">
                  {m.eyebrow}
                </span>
                <span className="text-lg font-semibold leading-snug text-navy-900">
                  {m.name}
                </span>
                <span className="mt-2 flex-1 text-sm leading-relaxed text-navy-500">
                  {m.summary}
                </span>
                <span className="mt-4 text-sm font-semibold text-navy-700 group-hover:text-navy-900">
                  Take action &rarr;
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
