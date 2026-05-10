import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const { campaign_id } = await request.json();

    if (!campaign_id || typeof campaign_id !== "number") {
      return NextResponse.json(
        { error: "campaign_id is required and must be a number" },
        { status: 400 }
      );
    }

    const db = getDb();

    const campaign = await db.execute({
      sql: "SELECT id FROM campaigns WHERE id = ? AND is_active = 1",
      args: [campaign_id],
    });

    if (campaign.rows.length === 0) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    await db.execute({
      sql: "INSERT INTO sends (campaign_id) VALUES (?)",
      args: [campaign_id],
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to record send:", error);
    return NextResponse.json(
      { error: "Failed to record send" },
      { status: 500 }
    );
  }
}
