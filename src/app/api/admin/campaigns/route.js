import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const db = getDb();
    const campaignRows = await db.execute(
      "SELECT * FROM campaigns ORDER BY sort_order, id"
    );

    const campaigns = [];

    for (const campaign of campaignRows.rows) {
      const recipientRows = await db.execute({
        sql: "SELECT * FROM recipients WHERE campaign_id = ? ORDER BY sort_order, id",
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

export async function POST(request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const db = getDb();
    const {
      name,
      description,
      type,
      subject,
      body_template,
      form_url,
      sort_order,
      is_active,
    } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Campaign name is required" },
        { status: 400 }
      );
    }

    const result = await db.execute({
      sql: `INSERT INTO campaigns (name, description, type, subject, body_template, form_url, sort_order, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        name,
        description || null,
        type || "email",
        subject || null,
        body_template || null,
        form_url || null,
        sort_order ?? 0,
        is_active ?? 1,
      ],
    });

    const campaignId = Number(result.lastInsertRowid);

    const created = await db.execute({
      sql: "SELECT * FROM campaigns WHERE id = ?",
      args: [campaignId],
    });

    return NextResponse.json({ campaign: created.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Failed to create campaign:", error);
    return NextResponse.json(
      { error: "Failed to create campaign" },
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
        { error: "Campaign id is required" },
        { status: 400 }
      );
    }

    const allowedFields = [
      "name",
      "description",
      "type",
      "subject",
      "body_template",
      "form_url",
      "sort_order",
      "is_active",
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

    setClauses.push("updated_at = datetime('now')");
    args.push(id);

    await db.execute({
      sql: `UPDATE campaigns SET ${setClauses.join(", ")} WHERE id = ?`,
      args,
    });

    const updated = await db.execute({
      sql: "SELECT * FROM campaigns WHERE id = ?",
      args: [id],
    });

    if (updated.rows.length === 0) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ campaign: updated.rows[0] });
  } catch (error) {
    console.error("Failed to update campaign:", error);
    return NextResponse.json(
      { error: "Failed to update campaign" },
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
        { error: "Campaign id is required" },
        { status: 400 }
      );
    }

    await db.execute({
      sql: "DELETE FROM campaigns WHERE id = ?",
      args: [id],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete campaign:", error);
    return NextResponse.json(
      { error: "Failed to delete campaign" },
      { status: 500 }
    );
  }
}
