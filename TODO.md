# TODO — Resident Mailer

## Phase 1: MVP (Get It Live)

### Setup & Infrastructure
- [ ] Create GitHub repo under muffin-labs org
- [ ] Set up Vercel project (free tier) with serverless API routes
- [ ] Provision Turso database (free tier) for campaign/template storage
- [ ] Configure custom domain on Cloudflare (ricivica.org subdomain — e.g. action.ricivica.org)
  - [ ] Add CNAME record in Cloudflare pointing to Vercel
  - [ ] Configure domain in Vercel project settings
  - [ ] SSL handled automatically by Cloudflare/Vercel

### Landing Page (Home — `/`)
Public-facing informational page that tells the story and funnels visitors to take action.

- [ ] Hero section:
  - Headline: "Save the Roosevelt Island Steam Plant"
  - Subhead: brief 1-2 sentence summary of the crisis
  - CTA button: "Take Action Now" → scrolls/links to the mailer
  - Hero image of the steam plant (pull from GDrive/Fliers/)
- [ ] "What's Happening" section:
  - Plain-language summary of the demolition crisis
  - Source: EXPLAINER_FOR_RESIDENTS.md
  - Key bullet points: 40K SF asbestos, no structural report, fake emergency, oil spill, daycare proximity
- [ ] Key Facts callout boxes:
  - 37-0 CB8 vote against demolition
  - 1,000+ petition signatures
  - $7.3M in public funds for demolition
  - 39,781 SF of asbestos-containing material
  - Oil spill discovered (DEC Case #2508914)
  - Built 1939 by Starrett & van Vleck
- [ ] Timeline section:
  - Jan 2023: DOB orders repairs (not demolition)
  - Mar 2023: HPD cited for non-compliance, does nothing for 18 months
  - Jul 2024: DOB suddenly orders demolition — no structural report shared
  - Nov 14, 2025: Governor & Mayor announce "possible redevelopment" — reveals true motive
  - Feb 6, 2026: Oil spill discovered during demolition
  - Feb 2026: CB8 votes 37-0 against demolition
  - Mar 2026: Lawsuit filed; demolition continues
- [ ] "What We're Asking For" section:
  - Pause demolition until law is followed
  - Complete environmental review
  - Proper asbestos removal with air monitoring
  - Release the structural report
  - Analyze alternatives (stabilization, adaptive reuse)
  - Community participation in planning
- [ ] "It's Been Done Before" section — comparable adaptive reuse successes:
  - Powerhouse Arts, Brooklyn (1904 → arts facility)
  - Domino Sugar Refinery, Brooklyn (→ net-zero office)
  - South Street Power Station, Providence (1912 → $220M academic center)
  - Pratt Street Power Plant, Baltimore (→ mixed-use retail)
- [ ] Footer:
  - Links to archrica.org, petition, legal filings
  - "No data is collected — your privacy is protected"
  - RI Civica attribution

### Mailer App (Action Page — `/action` or section on landing page)
- [ ] Resident input form:
  - Name (first, last)
  - Address (street address on Roosevelt Island)
  - Email address (optional — used for "email me a copy" feature, not stored)
- [ ] Campaign selector (tabs or cards) — pulls active campaigns from Turso
- [ ] Recipient checkboxes for each campaign (all selected by default)
- [ ] "Send Email" button that generates a `mailto:` link and triggers it
- [ ] "Copy to Clipboard" fallback button for long messages or when mailto fails
- [ ] For clipboard-type campaigns: "Copy & Open Form" button that copies text and opens the target URL
- [ ] Letter preview panel showing the composed message before sending

### Admin CMS (Password-Protected — `/admin`)
- [ ] Login page with shared admin password (bcrypt-hashed in Turso)
- [ ] Session management (JWT stored in httpOnly cookie, short-lived tokens)
- [ ] Campaign management:
  - [ ] Create new campaign (name, description, active/inactive toggle)
  - [ ] Edit existing campaigns
  - [ ] Reorder campaigns (drag or up/down)
  - [ ] Archive/delete campaigns
- [ ] Letter template editor per campaign:
  - [ ] Textarea editor for letter body
  - [ ] Subject line field
  - [ ] Merge field insertion buttons: `{{first_name}}`, `{{last_name}}`, `{{address}}`
  - [ ] Character count with mailto limit warning (1500 char target)
  - [ ] Live preview of rendered letter
- [ ] Recipient management per campaign:
  - [ ] Add/edit/remove recipients (name, title, email)
  - [ ] Enable/disable individual recipients without deleting
  - [ ] Bulk import recipients (paste CSV or comma-separated emails)
- [ ] Campaign type selector:
  - [ ] `mailto` — opens email client (default)
  - [ ] `clipboard` — copy-to-clipboard for web form campaigns (Mayor's site, RIOC, 311)
  - [ ] For clipboard campaigns: URL field linking to the target web form
- [ ] Landing page content management (Phase 2 — hardcode content for MVP)

### Initial Campaigns (Seed Data)
- [ ] **City Agencies — Halt the Demolition**
  - Template: adapted from Elected Officials outreach letter
  - Recipients: DOB Commissioner, HPD Commissioner, Comptroller, AM Seawright, DEP, Health, OEM, Sustainability, Law Dept, DOB general, HDC
  - Type: `mailto`
- [ ] **City Council — Stop the Demolition**
  - Template: adapted from Speaker Menin Letter 1
  - Recipients: Speaker Menin, District 5 liaisons, Constituent Services
  - Type: `mailto`
- [ ] **Website Messages — Mayor's Office**
  - Template: Mayor's office suggested text
  - Link: https://www.nyc.gov/mayors-office/contact-the-mayor
  - Type: `clipboard`
- [ ] **Website Messages — RIOC**
  - Template: RIOC suggested text
  - Link: https://www.rioc.ny.gov/report-problem
  - Type: `clipboard`
- [ ] **Website Messages — NYC 311**
  - Template: 311 complaint text
  - Link: https://portal.311.nyc.gov/sr-step/?id=cfdc780d-ea14-f111-83da-7c1e52ea79ba&stepid=749ab462-2a52-e811-a836-000d3a33b56b
  - Type: `clipboard`
- [ ] Each mailto template includes merge fields: `{{first_name}}`, `{{last_name}}`, `{{address}}`
- [ ] Keep mailto letters under 1500 characters (URL limit safety)

### Design
- [ ] Mobile-first responsive layout
- [ ] Clear, simple UI — the goal is zero confusion
- [ ] Large tap targets for mobile
- [ ] Landing page should be compelling but fast-loading (no heavy frameworks)
- [ ] Progress indicator on mailer: "Fill in your info → Pick a campaign → Send"
- [ ] Success state after mailto fires ("Check your email app — your message should be ready to send!")
- [ ] Admin UI: clean and functional, doesn't need to be fancy

## Phase 2: Polish

### UX Improvements
- [ ] Auto-detect if mailto worked (heuristic: page blur event after click)
- [ ] If mailto didn't fire, show clipboard fallback with instructions
- [ ] "Send All" button that opens one mailto per campaign (batch mode)
- [ ] Remember resident name/address in localStorage (opt-in) so returning visitors don't re-enter
- [ ] Add webmail fallback links (open Gmail compose, Outlook compose) for users whose mailto handler isn't configured
  - Gmail: `https://mail.google.com/mail/?view=cm&to=...&su=...&body=...`
  - Outlook: `https://outlook.live.com/mail/0/deeplink/compose?to=...&subject=...&body=...`

### Landing Page Enhancements
- [ ] Make landing page content editable from admin CMS
- [ ] Add photo gallery / before-during demolition images
- [ ] Embedded petition link or signature count
- [ ] Social share buttons (Twitter/X, Facebook) after sending a letter

### Admin Enhancements
- [ ] Audit log (who changed what, when)
- [ ] Duplicate campaign button (clone an existing campaign as starting point)
- [ ] Campaign scheduling (set a go-live date for new campaigns)

### Accessibility
- [ ] ARIA labels on all form elements
- [ ] Keyboard navigation
- [ ] Screen reader testing
- [ ] High contrast mode support
- [ ] Test with VoiceOver (iOS) and TalkBack (Android)

## Phase 3: Extras

### Additional Features
- [ ] "Custom letter" mode where resident can edit the template before sending
- [ ] Counter showing how many letters have been sent (track "Send" clicks server-side)

### Analytics (Privacy-Respecting)
- [ ] Consider privacy-respecting analytics (Plausible, Fathom) to track page visits only
- [ ] No PII, no cookies, no tracking scripts

### Integration
- [ ] Embed widget version for archrica.org
- [ ] QR code for printed flyers linking directly to the mailer
- [ ] Open Graph / social preview cards for link sharing

## Technical Notes

### Architecture
```
┌─────────────────────────────────────────────────┐
│  Cloudflare (DNS + SSL)                         │
│  action.ricivica.org → CNAME → Vercel           │
└─────────────┬───────────────────────────────────┘
              │
┌─────────────▼───────────────────────────────────┐
│  Vercel (Free Tier)                             │
│                                                 │
│  Static Assets:                                 │
│    /          → Landing page                    │
│    /action    → Mailer app                      │
│    /admin     → CMS (password-protected)        │
│                                                 │
│  Serverless API Routes (/api/*):                │
│    GET  /api/campaigns     → public campaign list│
│    POST /api/admin/login   → admin auth          │
│    CRUD /api/admin/campaigns → manage campaigns  │
│    CRUD /api/admin/recipients → manage recipients│
└─────────────┬───────────────────────────────────┘
              │
┌─────────────▼───────────────────────────────────┐
│  Turso (Free Tier — SQLite at the edge)         │
│                                                 │
│  Tables:                                        │
│    campaigns, recipients, admin_config           │
└─────────────────────────────────────────────────┘
```

### Tech Stack
- **Frontend:** HTML/CSS/JS (vanilla or lightweight framework — keep bundle small)
- **API:** Vercel serverless functions (Node.js)
- **Database:** Turso (libSQL — SQLite-compatible, free tier: 9GB storage, 500M rows read/mo)
- **DNS/SSL:** Cloudflare (ricivica.org)
- **Cost:** $0/month on free tiers

### Database Schema
```sql
CREATE TABLE campaigns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'mailto', -- 'mailto' or 'clipboard'
  subject TEXT,
  body_template TEXT NOT NULL,
  form_url TEXT, -- for clipboard campaigns
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE recipients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT,
  email TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE admin_config (
  id INTEGER PRIMARY KEY,
  password_hash TEXT NOT NULL
);
```

### mailto URL Format
```
mailto:a@example.com,b@example.com?subject=Subject%20Here&body=Body%20here%0Awith%20line%20breaks
```

### Character Limits
- **iOS Safari:** ~2000 chars total URL
- **Android Chrome:** ~2000 chars
- **Desktop browsers:** generally ~8000 chars but varies
- **Safe target:** keep subject + body under 1800 chars encoded

### Webmail Compose Fallbacks
```
Gmail:   https://mail.google.com/mail/?view=cm&to=...&su=...&body=...
Outlook: https://outlook.live.com/mail/0/deeplink/compose?to=...&subject=...&body=...
```

### Content Sources
Landing page content is sourced from:
- `ri-save-the-steam-plant/EXPLAINER_FOR_RESIDENTS.md` — plain-language story
- `ri-save-the-steam-plant/EXPLAINER_FOR_ELECTED_OFFICIALS.md` — policy briefing with key facts
- `ri-save-the-steam-plant/README.md` — FAQ and key facts
- `ri-save-the-steam-plant/GDrive/Fliers/` — images and graphics
- `archrica.org` — additional context and petition link
