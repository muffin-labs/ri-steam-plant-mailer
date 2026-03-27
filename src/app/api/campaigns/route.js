import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();
    const campaignRows = await db.execute(
      "SELECT * FROM campaigns WHERE is_active = 1 ORDER BY CASE type WHEN 'mailto' THEN 0 ELSE 1 END, sort_order, id"
    );

    const campaigns = [];

    for (const campaign of campaignRows.rows) {
      const recipientRows = await db.execute({
        sql: "SELECT * FROM recipients WHERE campaign_id = ? AND is_active = 1 ORDER BY sort_order, id",
        args: [campaign.id],
      });

      campaigns.push({
        ...campaign,
        recipients: recipientRows.rows,
      });
    }

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error("Failed to fetch campaigns:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}
