# RFC-001: Admin Statistics Tab

**Status:** Draft  
**Date:** 2026-05-09  
**Author:** Eric Garcia

---

## Summary

Add a **Statistics** tab to the admin dashboard that displays email send activity — total sends, sends per day, and sends per campaign.

---

## Motivation

Currently there is no way to know how many residents have used the mailer or which campaigns are most effective. This data is valuable for advocacy reporting (e.g., "over 500 letters sent this week") but must be collected in a privacy-respecting way consistent with the app's no-tracking ethos stated in the README.

---

## Design

### Tab Navigation

The admin dashboard header gains two tabs: **Campaigns** (existing content) and **Statistics** (new). The current "New Campaign" toolbar button stays scoped to the Campaigns tab.

```
[ Admin Dashboard ]                          [ Logout ]

  [ Campaigns ]  [ Statistics ]

  ...tab content...
```

### What We Track (New `sends` Table)

Each time a resident clicks Send (for mailto) or Copy (for clipboard campaigns), the frontend fires a lightweight POST to a new `/api/sends` endpoint. The payload:

```json
{
  "campaign_id": 2
}
```

No user information is transmitted or stored.

#### Database schema

```sql
CREATE TABLE IF NOT EXISTS sends (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  sent_at     TEXT DEFAULT (datetime('now'))
);
```

No IP addresses. No names. No addresses. No cookies.

### Statistics Tab UI

Three sections:

#### 1. Overview Cards
| Metric | Description |
|---|---|
| Total Sends | Count of all rows in `sends` |
| Active Campaigns | Count of campaigns with `is_active = 1` |
| Sends This Week | Sends in the last 7 days |

#### 2. Sends Over Time (Bar Chart)
- X-axis: date (last 30 days)
- Y-axis: send count
- One bar per day
- Rendered as an inline SVG bar chart (no additional dependencies)

#### 3. Campaign Breakdown Table
| Campaign | Total Sends | Last Send |
|---|---|---|
| City Agencies — Halt the Demolition | 312 | 2026-05-08 |
| City Council — Stop the Demolition | 287 | 2026-05-09 |
| … | … | … |

---

## API

### `POST /api/sends` (public — no auth)

Records a send event. Rate-limiting is handled by Vercel's edge network.

**Request body:**
```json
{
  "campaign_id": 2
}
```

**Validation:**
- `campaign_id` must reference an existing active campaign

**Response:** `{ "ok": true }`

### `GET /api/admin/stats` (auth required)

Returns aggregated statistics.

**Response:**
```json
{
  "total_sends": 599,
  "sends_by_day": [
    { "date": "2026-05-01", "count": 42 },
    ...
  ],
  "by_campaign": [
    {
      "campaign_id": 1,
      "campaign_name": "City Agencies — Halt the Demolition",
      "total_sends": 312,
      "last_sent_at": "2026-05-08T19:34:00Z"
    },
    ...
  ]
}
```

---

## Privacy Considerations

- **No PII stored.** No names, addresses, or identifiers of any kind are transmitted or stored.
- **No IP logging.** The `/api/sends` endpoint does not log or store the request IP.
- **README update required.** The README states "No data is stored, logged, or transmitted anywhere except into the resident's own email client." This RFC updates that statement to note that an anonymous send count is recorded for advocacy reporting purposes.

---

## Open Questions

1. **Should sends be recorded for clipboard-type campaigns?** The resident copies the text but may or may not paste it. We could only record on actual `mailto:` opens, or record both.

2. **Rate limiting on `/api/sends`.** Without auth, a bot could inflate counts. Mitigations: Vercel rate limits or a honeypot field on the form.

3. **Sends-by-day window.** 30 days shown in the chart — is a fixed window sufficient?

---

## Implementation Plan

1. **Migration** — add `sends` table (`scripts/migrate.js`)
2. **`POST /api/sends`** — public endpoint, validates input, inserts row
3. **`GET /api/admin/stats`** — auth-gated, returns aggregated data
4. **Fire send event** in `page.js` after the user clicks Send/Copy
5. **Tab nav** in `src/app/admin/page.js`
6. **StatsTab component** — fetches `/api/admin/stats`, renders cards + chart + table

---

## Out of Scope

- Per-recipient send tracking
- Export to CSV
- Email notifications when milestones are hit
- Historical data before this feature ships (starts from zero)
