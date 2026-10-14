# Roosevelt Island Steam Plant — Resident Mailer

A Next.js web app that helps Roosevelt Island residents send pre-written letters to elected officials and agencies demanding a halt to the Steam Plant demolition. Residents fill in their name and address, pick a campaign, and click send — the app opens their email client with a fully composed message, or copies the text to their clipboard for web form submissions.

## Mailers

The site hosts several independent mailers, each at its own path. The home page (`/`) lists them all.

| Path | Mailer |
|---|---|
| `/steamplant` | Save the Steam Plant — halt the Steam Plant demolition |
| `/ridn` | Fund 3-K & Pre-K — Roosevelt Island Day Nursery families |

Mailers are defined in `src/lib/mailers.js` (page heading, intro text, metadata). Each campaign belongs to one mailer via the `campaigns.mailer` column; in the admin panel, use the switcher at the top of the Campaigns tab to manage each mailer's campaigns.

To add a mailer: add an entry to `src/lib/mailers.js`, create `src/app/<slug>/page.js` (copy `src/app/ridn/page.js`), and add its campaigns in the admin panel.

## How It Works

1. Resident visits the site
2. Fills in their name and Roosevelt Island address (used to personalize the letter)
3. Selects a campaign (email or web form)
4. Clicks **Send** — their email client opens with a pre-filled message, or the letter is copied to clipboard for paste into a web form

The email is sent **from the resident's own email address** using a `mailto:` link — no accounts, no OAuth, no backend auth.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** [Turso](https://turso.tech) (libSQL) — stores campaigns, recipients, and anonymous send counts
- **Hosting:** Vercel — auto-deploys on push to `main`
- **Styling:** Tailwind CSS v4
- **Auth:** JWT stored in an httpOnly cookie (admin panel only)
- **Google Places API:** address autocomplete on the resident form

## Privacy

- Resident name and address are used **only** to fill in the letter template client-side
- No resident data is stored or transmitted to any server
- The only data recorded server-side is an **anonymous send count** per campaign (no names, no addresses, no IPs)
- No cookies are set for residents — only admins get a session cookie

---

## Local Development

### Prerequisites

- Node.js 20+
- Nothing else for local development — it uses a local SQLite file (`local.db`). Turso credentials are only needed to update the production database (see [Updating the Production Database](#updating-the-production-database)).

### Setup

```bash
git clone git@github.com:muffin-labs/ri-steam-plant-mailer.git
cd ri-steam-plant-mailer
npm install
```

Create `.env.local` in the project root:

```env
TURSO_DATABASE_URL=file:local.db
TURSO_AUTH_TOKEN=
JWT_SECRET=<random-string-min-32-chars>
ADMIN_PASSWORD_HASH=<bcrypt-hash>
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=<your-key>
```

To generate a bcrypt hash for the admin password:

```bash
node -e "const b = require('bcryptjs'); b.hash('yourpassword', 10).then(console.log)"
```

> **Important:** Next.js uses dotenv-expand, which treats `$` as a variable reference. Escape every `$` in the hash with a backslash in `.env.local`:
> ```
> ADMIN_PASSWORD_HASH=\$2a\$10\$abc123...
> ```
> On Vercel, paste the raw hash (no escaping needed — Vercel doesn't expand variables).

### Database

`.env.local` points at a local SQLite file (`file:local.db`, gitignored), so local development never touches production data.

Create or update the local tables (safe to re-run):

```bash
npm run db:migrate
```

Then load the default campaigns:

```bash
npm run db:seed
```

The seed only adds campaigns for mailers that don't have any yet, so re-running it won't create duplicates.

### Run

```bash
npm run dev        # http://localhost:3000
```

Admin panel: `http://localhost:3000/admin` (login at `/admin/login`)

### Tests

```bash
npm test           # run once
npm run test:watch # watch mode
```

---

## Deployment

The app is deployed on **Vercel** and connected to the `muffin-labs` GitHub org. Every push to `main` triggers an automatic production deployment.

### Vercel Project

- **Project:** `ri-steam-plant-mailer`
- **Org:** `muffin-labs`
- **Production URL:** set in Vercel dashboard

To deploy manually via CLI:

```bash
npx vercel --prod
```

### Environment Variables

Set these in **Vercel → Project → Settings → Environment Variables**. Never commit them to the repo.

| Variable | Description |
|---|---|
| `TURSO_DATABASE_URL` | Turso database URL (`libsql://...`) |
| `TURSO_AUTH_TOKEN` | Turso auth token — rotate periodically from the Turso dashboard |
| `JWT_SECRET` | Random secret for signing admin session tokens — use a strong random value in production, not the dev default |
| `ADMIN_PASSWORD_HASH` | bcrypt hash of the admin password — generate with the command above |
| `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` | Google Places API key for address autocomplete |

### Updating the Admin Password in Production

1. Generate a new bcrypt hash locally:
   ```bash
   node -e "const b = require('bcryptjs'); b.hash('newpassword', 10).then(console.log)"
   ```
2. Update `ADMIN_PASSWORD_HASH` in Vercel environment variables
3. Redeploy (or trigger a redeploy from the Vercel dashboard)

### Updating the Production Database

The production database is on Turso. Vercel does **not** update it on deploy — schema changes must be applied by hand, **before** pushing the code that depends on them.

**1. Set up credentials (one time).** Create `.env.prod` in the project root (gitignored — never commit it):

```env
TURSO_DATABASE_URL=libsql://<prod-db>.turso.io
TURSO_AUTH_TOKEN=<prod-turso-token>
```

Get both values from the Turso dashboard (or from Vercel → Settings → Environment Variables). Don't use `.env.production.local` for this: Next.js loads that file automatically for `next build` / `next start`, which would point a local production build at live data.

**2. Apply schema changes.** Run the migration against production:

```bash
npm run db:migrate:prod
```

The script prints the database URL it's connecting to — check it before relying on the result. Migrations are additive and safe to re-run: tables are created with `IF NOT EXISTS` and columns are only added if missing. Run this **before** merging to `main`, so the new code never runs against an old schema. The old code keeps working against the updated schema.

**3. Add campaigns for a new mailer (optional).** Either create them in the admin panel, or seed the defaults from `scripts/seed.js`:

```bash
npm run db:seed:prod
```

The seed skips any mailer that already has campaigns, so it won't touch or duplicate existing campaigns. (It also writes a `changeme` hash to the `admin_config` table; admin login uses `ADMIN_PASSWORD_HASH` from Vercel, so that has no effect on access.)

**4. Deploy.** Merge to `main`; Vercel builds and deploys automatically.

| Command | Database |
|---|---|
| `npm run db:migrate` / `npm run db:seed` | Local — `.env.local` |
| `npm run db:migrate:prod` / `npm run db:seed:prod` | **Production** — `.env.prod` |

---

## Admin Panel

Available at `/admin`. Requires the admin password.

- **Campaigns tab** — create, edit, reorder, and activate/deactivate campaigns
  - Email campaigns support `{{first_name}}`, `{{last_name}}`, and `{{address}}` merge fields
  - Clipboard campaigns paste a message for submission via a web form URL
- **Statistics tab** — anonymous send counts by day and by campaign

---

## Related

- [ri-save-the-steam-plant](https://github.com/muffin-labs/ri-save-the-steam-plant) — Legal filings and strategy documents
- [archrica.org](https://archrica.org) — Architectural Community Alliance of Roosevelt Island
