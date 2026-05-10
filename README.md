# Roosevelt Island Steam Plant — Resident Mailer

A Next.js web app that helps Roosevelt Island residents send pre-written letters to elected officials and agencies demanding a halt to the Steam Plant demolition. Residents fill in their name and address, pick a campaign, and click send — the app opens their email client with a fully composed message, or copies the text to their clipboard for web form submissions.

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
- A Turso account with a database (or use the existing one — credentials in `.env.local`)

### Setup

```bash
git clone git@github.com:muffin-labs/ri-steam-plant-mailer.git
cd ri-steam-plant-mailer
npm install
```

Create `.env.local` in the project root:

```env
TURSO_DATABASE_URL=libsql://<your-db>.turso.io
TURSO_AUTH_TOKEN=<your-turso-token>
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

Run migrations to create tables (safe to re-run — uses `CREATE TABLE IF NOT EXISTS`):

```bash
npm run db:migrate
```

Optionally seed with the default campaigns and a `changeme` admin password:

```bash
npm run db:seed
```

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

### Database Migrations

Migrations must be run manually against the production database when the schema changes:

```bash
# Uses TURSO_DATABASE_URL and TURSO_AUTH_TOKEN from .env.local
npm run db:migrate
```

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
