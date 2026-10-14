// ENV_FILE selects the database: .env.local (default) or .env.prod via the :prod npm scripts.
const envFile = process.env.ENV_FILE || ".env.local";
require("dotenv").config({ path: envFile, quiet: true });

const { createClient } = require("@libsql/client");

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function migrate() {
  console.log(`Running migrations against ${process.env.TURSO_DATABASE_URL} (${envFile})...`);

  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL DEFAULT 'mailto',
        subject TEXT,
        body_template TEXT NOT NULL,
        form_url TEXT,
        sort_order INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `);
    console.log("Created table: campaigns");

    await db.execute(`
      CREATE TABLE IF NOT EXISTS recipients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        title TEXT,
        email TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 0
      )
    `);
    console.log("Created table: recipients");

    await db.execute(`
      CREATE TABLE IF NOT EXISTS admin_config (
        id INTEGER PRIMARY KEY,
        password_hash TEXT NOT NULL
      )
    `);
    console.log("Created table: admin_config");

    await db.execute(`
      CREATE TABLE IF NOT EXISTS sends (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
        sent_at     TEXT DEFAULT (datetime('now'))
      )
    `);
    console.log("Created table: sends");

    // Each campaign belongs to one mailer page (/steamplant, /ridn, ...).
    // Existing campaigns predate multiple mailers, so they default to steamplant.
    const campaignCols = await db.execute("PRAGMA table_info(campaigns)");
    if (!campaignCols.rows.some((c) => c.name === "mailer")) {
      await db.execute(
        "ALTER TABLE campaigns ADD COLUMN mailer TEXT NOT NULL DEFAULT 'steamplant'"
      );
      console.log("Added column: campaigns.mailer");
    }

    console.log("All migrations completed successfully.");
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  }
}

migrate();
