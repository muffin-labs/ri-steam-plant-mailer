# Roosevelt Island Steam Plant — Resident Mailer

A simple web app that helps Roosevelt Island residents send pre-written emails to elected officials and agencies demanding a halt to the Steam Plant demolition. Residents fill in their name and address, pick their recipients, and click send — the app opens their email client with a fully composed message ready to go.

## How It Works

1. Resident visits the site
2. Fills in their name and Roosevelt Island address (used to personalize the letter)
3. Selects which officials to contact (checkboxes — select all by default)
4. Clicks "Send" — their default email client opens with a pre-filled email:
   - **To:** selected officials
   - **Subject:** pre-written subject line
   - **Body:** complete letter with the resident's name, address, and key facts already filled in

The email is sent **from the resident's own email address** using a `mailto:` link. No accounts, no OAuth, no backend auth. This is the most frictionless approach possible — it works with Gmail, Outlook, Apple Mail, Yahoo, or any email client.

## Why `mailto:`?

We considered OAuth (Gmail API, Microsoft Graph) but rejected it because:
- Residents would need to grant permissions to an unknown app — that's a trust barrier
- OAuth requires a backend, API keys, security review, and ongoing maintenance
- Many residents use corporate/school email that blocks third-party OAuth
- `mailto:` works on every device, every OS, every email provider, with zero setup

The tradeoff is that `mailto:` has character limits on some platforms (~2000 chars in the URL). We handle this by keeping letters concise and offering a "copy to clipboard" fallback for long messages.

## Letter Campaigns

The app supports multiple letter campaigns (selectable via tabs or dropdown):

| Campaign | Recipients | Purpose |
|----------|-----------|---------|
| **Halt the Demolition** | HPD Commissioner, DOB Commissioner, Mayor, City Council Speaker | Demand an immediate pause pending environmental review |
| **Congressional Inquiry** | Rep. Nadler, Senators | Request HUD Inspector General investigation and EPA NESHAP enforcement |
| **State Legislators** | Sen. Krueger, Sen. Serrano, AM Seawright | Demand answers from RIOC, request state legislative inquiry |
| **Borough President** | BP Hoylman-Sigal | Request formal statement opposing demolition |
| **City Council Oversight** | Speaker Menin, relevant committee chairs | Request oversight hearing on HPD's management |
| **Comptroller Investigation** | Comptroller Levine | Request investigation of HPD's $7.3M demolition contract |

Each campaign has its own pre-written letter template with merge fields for the resident's information.

## Tech Stack

- **Static site** — HTML/CSS/JS, no backend required
- **Hosted on GitHub Pages** (or Vercel/Netlify)
- **No database** — resident info is used only client-side to compose the mailto link, never stored
- **No cookies, no tracking, no analytics** — resident privacy is paramount
- **Mobile-first** — most residents will access this on their phones

## Privacy

- Resident name and address are used **only** to fill in the letter template
- All processing happens **in the browser** — nothing is sent to any server
- No data is stored, logged, or transmitted anywhere except into the resident's own email client
- The site does not use cookies, analytics, or any third-party scripts

## Related

- [ri-save-the-steam-plant](https://github.com/muffin-labs/ri-save-the-steam-plant) — Legal filings and strategy documents
- [archrica.org](https://archrica.org) — Architectural Community Alliance of Roosevelt Island
