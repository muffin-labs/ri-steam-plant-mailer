import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { getMailer } from "@/lib/mailers";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  // Optional ?mailer=<slug> limits every stat to that mailer's campaigns.
  const mailer = new URL(request.url).searchParams.get("mailer");
  if (mailer && !getMailer(mailer)) {
    return NextResponse.json({ error: "Unknown mailer" }, { status: 400 });
  }
  const mailerFilter = mailer ? "c.mailer = ?" : "1 = 1";
  const mailerArgs = mailer ? [mailer] : [];

  try {
    const db = getDb();

    const totalRow = await db.execute({
      sql: `
        SELECT COUNT(*) as count
        FROM sends s
        JOIN campaigns c ON c.id = s.campaign_id
        WHERE ${mailerFilter}
      `,
      args: mailerArgs,
    });
    const total_sends = Number(totalRow.rows[0].count);

    const byDayRows = await db.execute({
      sql: `
        SELECT date(s.sent_at) as date, COUNT(*) as count
        FROM sends s
        JOIN campaigns c ON c.id = s.campaign_id
        WHERE s.sent_at >= datetime('now', '-30 days') AND ${mailerFilter}
        GROUP BY date(s.sent_at)
        ORDER BY date ASC
      `,
      args: mailerArgs,
    });

    const byCampaignRows = await db.execute({
      sql: `
        SELECT
          c.id as campaign_id,
          c.name as campaign_name,
          c.mailer as mailer,
          c.is_active as is_active,
          COUNT(s.id) as total_sends,
          MAX(s.sent_at) as last_sent_at
        FROM campaigns c
        LEFT JOIN sends s ON s.campaign_id = c.id
        WHERE ${mailerFilter}
        GROUP BY c.id, c.name, c.mailer, c.is_active
        ORDER BY total_sends DESC
      `,
      args: mailerArgs,
    });

    return NextResponse.json({
      total_sends,
      sends_by_day: byDayRows.rows.map((r) => ({
        date: r.date,
        count: Number(r.count),
      })),
      by_campaign: byCampaignRows.rows.map((r) => ({
        campaign_id: r.campaign_id,
        campaign_name: r.campaign_name,
        mailer: r.mailer,
        is_active: Number(r.is_active) === 1,
        total_sends: Number(r.total_sends),
        last_sent_at: r.last_sent_at ?? null,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
