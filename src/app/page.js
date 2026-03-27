export default function HomePage() {
  return (
    <>
      <header className="bg-navy-900 text-white">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-sm font-medium tracking-wide text-navy-200">
            Roosevelt Island Residents
          </p>
        </div>
      </header>

      <main id="main">
        {/* ── Hero ── */}
        <section className="relative bg-navy-900 pb-16 pt-12 text-white sm:pb-24 sm:pt-20 overflow-hidden">
          <img
            src="/hero-steam-plant.jpg"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-navy-900/75" aria-hidden="true" />
          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Save the Roosevelt Island
              <br />
              Steam Plant
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-navy-200 sm:text-xl">
              The City is rushing to demolish an 87-year-old landmark without
              following the law. Residents are fighting back.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="/action"
                className="inline-flex items-center justify-center rounded-md bg-amber-500 px-8 py-4 text-lg font-bold text-navy-950 shadow-lg transition-colors hover:bg-amber-400 focus-visible:outline-offset-4"
              >
                Take Action Now
              </a>
              <a
                href="#story"
                className="inline-flex items-center justify-center rounded-md border-2 border-navy-400 px-8 py-4 text-lg font-semibold text-white transition-colors hover:border-white hover:bg-navy-800"
              >
                Learn More
              </a>
            </div>
          </div>
        </section>

        {/* ── Key Facts ── */}
        <section className="border-b border-navy-100 bg-navy-50 py-12">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              <FactCard number="37-0" label="CB8 vote against demolition" />
              <FactCard number="1,000+" label="Petition signatures" />
              <FactCard number="$7.3M" label="In public funds for demolition" />
              <FactCard
                number="40,000 SF"
                label="Of asbestos in the building"
              />
            </div>
          </div>
        </section>

        {/* ── What's Happening ── */}
        <section id="story" className="py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
              What&rsquo;s Happening
            </h2>

            <div className="mt-8 space-y-6 text-lg leading-relaxed text-gray-800">
              <p>
                The Roosevelt Island Steam Plant was built in 1939 by Starrett
                &amp; van Vleck &mdash; the architects behind
                Bloomingdale&rsquo;s flagship and Saks Fifth Avenue. It served
                the island&rsquo;s residents for 75 years before being
                decommissioned in 2014.
              </p>
              <p>
                In January 2023, the Department of Buildings inspected the plant
                and ordered repairs. HPD &mdash; the agency responsible &mdash;
                never performed those repairs. They didn&rsquo;t even apply for
                permits. For 18 months, they let the building deteriorate.
              </p>
              <p>
                Then in July 2024, DOB suddenly ordered full demolition instead
                of repairs. No structural report has ever been shown to anyone
                explaining why.
              </p>
              <p className="border-l-4 border-amber-500 bg-amber-50 py-4 pl-6 pr-4 font-medium text-navy-900">
                The most telling fact: in November 2025, Governor Hochul and
                Mayor Adams publicly announced plans for &ldquo;possible
                redevelopment of the defunct Roosevelt Island Steam Plant
                site.&rdquo; If this were really about emergency safety, they
                wouldn&rsquo;t be marketing it as a development opportunity.
              </p>
            </div>
          </div>
        </section>

        {/* ── The Danger ── */}
        <section className="border-t border-navy-100 bg-navy-50 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
              The Danger
            </h2>

            <ul className="mt-8 space-y-5" role="list">
              <DangerItem>
                <strong>39,781 square feet of asbestos-containing materials</strong>{" "}
                (confirmed by HPD&rsquo;s own survey)
              </DangerItem>
              <DangerItem>
                <strong>Active oil spill discovered during demolition</strong>{" "}
                (DEC Spill Case #2508914) &mdash; reported by residents, not the
                contractor
              </DangerItem>
              <DangerItem>
                Demolition site{" "}
                <strong>
                  immediately adjacent to a daycare, sports complex, and
                  thousands of homes
                </strong>
              </DangerItem>
              <DangerItem>
                <strong>
                  No air monitoring, no Community Protection Plan, no
                  notification to residents
                </strong>
              </DangerItem>
              <DangerItem>
                <strong>Contaminated soil runoff</strong> observed flowing into
                the street
              </DangerItem>
            </ul>
          </div>
        </section>

        {/* ── Timeline ── */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
              Timeline
            </h2>

            <div
              className="relative mt-10 ml-4 border-l-2 border-navy-200 pl-8 sm:ml-0"
              role="list"
              aria-label="Timeline of events"
            >
              <TimelineEvent date="Jan 2023">
                DOB orders repairs &mdash; not demolition
              </TimelineEvent>
              <TimelineEvent date="Mar 2023">
                HPD cited for failing to comply &mdash; does nothing for 18
                months
              </TimelineEvent>
              <TimelineEvent date="Jul 2024">
                DOB suddenly orders demolition &mdash; no structural report
                disclosed
              </TimelineEvent>
              <TimelineEvent date="Nov 2025">
                Governor &amp; Mayor announce &ldquo;redevelopment&rdquo; plans
                &mdash; reveals true motive
              </TimelineEvent>
              <TimelineEvent date="Feb 2026" highlight>
                Oil spill discovered; CB8 votes 37-0 against demolition
              </TimelineEvent>
              <TimelineEvent date="Mar 2026" highlight>
                Lawsuit filed in federal court
              </TimelineEvent>
            </div>
          </div>
        </section>

        {/* ── What We're Asking For ── */}
        <section className="border-t border-navy-100 bg-navy-50 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
              What We&rsquo;re Asking For
            </h2>

            <ol className="mt-8 space-y-4 text-lg leading-relaxed text-gray-800">
              <AskItem number={1}>
                Pause demolition until the law is followed
              </AskItem>
              <AskItem number={2}>
                Complete the environmental review required by federal and state
                law
              </AskItem>
              <AskItem number={3}>
                Remove asbestos properly with air monitoring to protect residents
              </AskItem>
              <AskItem number={4}>
                Release the structural report &mdash; if one even exists
              </AskItem>
              <AskItem number={5}>
                Analyze alternatives: stabilization, repair, and adaptive reuse
                for affordable housing or community space
              </AskItem>
              <AskItem number={6}>
                Include the community in decisions about the site&rsquo;s future
              </AskItem>
            </ol>
          </div>
        </section>

        {/* ── It's Been Done Before ── */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
              It&rsquo;s Been Done Before
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-gray-600">
              Historic industrial buildings across the country have been
              preserved and transformed into vital community assets.
            </p>

            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <PrecedentCard
                name="Powerhouse Arts, Brooklyn"
                detail="1904 power station"
                result="170,000 SF arts facility"
                url="https://www.powerhousearts.org/"
              />
              <PrecedentCard
                name="Domino Sugar Refinery, Brooklyn"
                detail="Factory"
                result="460,000 SF net-zero office"
                url="https://www.therefineryatdomino.com/"
              />
              <PrecedentCard
                name="South Street Power Station, Providence"
                detail="1912, vacant 20 years"
                result="$220M academic center"
                url="https://www.wsp.com/en-us/projects/south-street-landing"
              />
              <PrecedentCard
                name="Pratt Street Power Plant, Baltimore"
                detail="Power plant"
                result="Mixed-use retail & entertainment"
                url="https://powerplantlive.com/"
              />
            </div>
          </div>
        </section>

        {/* ── Call to Action Banner ── */}
        <section className="bg-navy-900 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Your voice matters.
            </h2>
            <p className="mt-4 text-xl text-navy-200">
              Send a letter to your elected officials in under 2 minutes.
            </p>
            <div className="mt-10">
              <a
                href="/action"
                className="inline-flex items-center justify-center rounded-md bg-amber-500 px-10 py-5 text-xl font-bold text-navy-950 shadow-lg transition-colors hover:bg-amber-400 focus-visible:outline-offset-4"
              >
                Take Action Now
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-navy-100 bg-white py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-navy-900">Resources</p>
              <nav aria-label="Footer links" className="flex flex-col gap-2">
                <a
                  href="https://archrica.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-navy-600 underline underline-offset-2 hover:text-navy-900"
                >
                  archrica.org
                </a>
                <a
                  href="https://www.change.org/p/save-the-roosevelt-island-steam-plant"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-navy-600 underline underline-offset-2 hover:text-navy-900"
                >
                  Sign the Petition
                </a>
              </nav>
            </div>

            <div className="space-y-3 text-sm text-gray-500 sm:text-right">
              <p>
                Powered by{" "}
                <a
                  href="https://ricivica.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-navy-700 underline underline-offset-2 hover:text-navy-900"
                >
                  RI Civica
                </a>
              </p>
              <p>No data is collected. Your privacy is protected.</p>
              <p>
                Built with purpose by{" "}
                <a
                  href="https://muffinlabs.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-navy-700 underline underline-offset-2 hover:text-navy-900"
                >
                  Muffin Labs
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

/* ─── Sub-components (co-located, server-rendered) ─── */

function FactCard({ number, label }) {
  return (
    <div className="rounded-lg border border-navy-200 bg-white p-5 text-center shadow-sm">
      <p className="text-3xl font-extrabold text-navy-900 sm:text-4xl">
        {number}
      </p>
      <p className="mt-1 text-sm font-medium text-gray-600">{label}</p>
    </div>
  );
}

function DangerItem({ children }) {
  return (
    <li className="flex items-start gap-3 text-lg leading-relaxed text-gray-800">
      <span
        className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500"
        aria-hidden="true"
      >
        <span className="block h-2 w-2 rounded-full bg-white" />
      </span>
      <span>{children}</span>
    </li>
  );
}

function TimelineEvent({ date, children, highlight = false }) {
  return (
    <div className="relative pb-10 last:pb-0" role="listitem">
      <div
        className={`absolute -left-[2.35rem] top-1 h-4 w-4 rounded-full border-2 ${
          highlight
            ? "border-amber-500 bg-amber-500"
            : "border-navy-400 bg-white"
        }`}
        aria-hidden="true"
      />
      <p
        className={`text-sm font-bold uppercase tracking-wide ${
          highlight ? "text-amber-600" : "text-navy-500"
        }`}
      >
        {date}
      </p>
      <p className="mt-1 text-lg text-gray-800">{children}</p>
    </div>
  );
}

function AskItem({ number, children }) {
  return (
    <li className="flex items-start gap-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-900 text-sm font-bold text-white">
        {number}
      </span>
      <span className="pt-0.5">{children}</span>
    </li>
  );
}

function PrecedentCard({ name, detail, result, url }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg border border-navy-200 bg-white p-6 shadow-sm transition hover:border-amber-300 hover:shadow-md"
    >
      <h3 className="text-lg font-bold text-navy-900">{name}</h3>
      <p className="mt-1 text-sm text-gray-500">{detail}</p>
      <p className="mt-3 flex items-center gap-2 text-base font-semibold text-navy-700">
        <span aria-hidden="true" className="text-amber-500">
          &rarr;
        </span>
        {result}
      </p>
    </a>
  );
}
