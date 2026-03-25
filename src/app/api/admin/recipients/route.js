import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaign_id");

    if (!campaignId) {
      return NextResponse.json(
        { error: "campaign_id query parameter is required" },
        { status: 400 }
      );
    }

    const result = await db.execute({
      sql: "SELECT * FROM recipients WHERE campaign_id = ? ORDER BY sort_order, id",
      args: [campaignId],
    });

    return NextResponse.json({ recipients: result.rows });
  } catch (error) {
    console.error("Failed to fetch recipients:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipients" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const db = getDb();
    const { campaign_id, name, title, email, is_active, sort_order } =
      await request.json();

    if (!campaign_id || !name || !email) {
      return NextResponse.json(
        { error: "campaign_id, name, and email are required" },
        { status: 400 }
      );
    }

    const result = await db.execute({
      sql: `INSERT INTO recipients (campaign_id, name, title, email, is_active, sort_order)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        campaign_id,
        name,
        title || null,
        email,
        is_active ?? 1,
        sort_order ?? 0,
      ],
    });

    const recipientId = Number(result.lastInsertRowid);

    const created = await db.execute({
      sql: "SELECT * FROM recipients WHERE id = ?",
      args: [recipientId],
    });

    return NextResponse.json(
      { recipient: created.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create recipient:", error);
    return NextResponse.json(
      { error: "Failed to create recipient" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const db = getDb();
    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Recipient id is required" },
        { status: 400 }
      );
    }

    const allowedFields = [
      "campaign_id",
      "name",
      "title",
      "email",
      "is_active",
      "sort_order",
    ];

    const setClauses = [];
    const args = [];

    for (const field of allowedFields) {
      if (field in fields) {
        setClauses.push(`${field} = ?`);
        args.push(fields[field]);
      }
    }

    if (setClauses.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    args.push(id);

    await db.execute({
      sql: `UPDATE recipients SET ${setClauses.join(", ")} WHERE id = ?`,
      args,
    });

    const updated = await db.execute({
      sql: "SELECT * FROM recipients WHERE id = ?",
      args: [id],
    });

    if (updated.rows.length === 0) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ recipient: updated.rows[0] });
  } catch (error) {
    console.error("Failed to update recipient:", error);
    return NextResponse.json(
      { error: "Failed to update recipient" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const db = getDb();
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Recipient id is required" },
        { status: 400 }
      );
    }

    await db.execute({
      sql: "DELETE FROM recipients WHERE id = ?",
      args: [id],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete recipient:", error);
    return NextResponse.json(
      { error: "Failed to delete recipient" },
      { status: 500 }
    );
  }
}
