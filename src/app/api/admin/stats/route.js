import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const db = getDb();

    const totalRow = await db.execute("SELECT COUNT(*) as count FROM sends");
    const total_sends = Number(totalRow.rows[0].count);

    const byDayRows = await db.execute(`
      SELECT date(sent_at) as date, COUNT(*) as count
      FROM sends
      WHERE sent_at >= datetime('now', '-30 days')
      GROUP BY date(sent_at)
      ORDER BY date ASC
    `);

    const byCampaignRows = await db.execute(`
      SELECT
        c.id as campaign_id,
        c.name as campaign_name,
        COUNT(s.id) as total_sends,
        MAX(s.sent_at) as last_sent_at
      FROM campaigns c
      LEFT JOIN sends s ON s.campaign_id = c.id
      GROUP BY c.id, c.name
      ORDER BY total_sends DESC
    `);

    return NextResponse.json({
      total_sends,
      sends_by_day: byDayRows.rows.map((r) => ({
        date: r.date,
        count: Number(r.count),
      })),
      by_campaign: byCampaignRows.rows.map((r) => ({
        campaign_id: r.campaign_id,
        campaign_name: r.campaign_name,
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
