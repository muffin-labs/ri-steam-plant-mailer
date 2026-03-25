require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@libsql/client");
const bcrypt = require("bcryptjs");

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const campaigns = [
  {
    name: "City Agencies — Halt the Demolition",
    description: null,
    type: "mailto",
    subject: "URGENT: Roosevelt Island Steam Plant Demolition",
    body_template: `To Whom It May Concern,

I am a Roosevelt Island resident at {{address}} with grave concerns about the ongoing rushed demolition of the historic steam plant on our island. I urge you to act decisively to intervene in the interest of our community's health and safety before it's too late.

Demolition is underway pursuant to an emergency declaration the Department of Buildings issued in July 2024. No detailed structural report has been shared with the public to substantiate the need for emergency demolition.

The emergency designation has allowed critical environmental review and public health protections to be circumvented. Key facts:

- 39,781 square feet of asbestos-containing materials confirmed by HPD's own survey
- An active oil spill occurred during demolition (DEC Spill Case No. 2508914)
- The site is immediately adjacent to a daycare, sports complex, and residential buildings
- Community Board 8 voted 37-0 to oppose the demolition
- Over 1,000 residents have signed a petition demanding a halt

We respectfully request that relevant city agencies formally request a pause in demolition, full public disclosure of all environmental findings, and an independent environmental assessment with transparent public reporting.

Respectfully,
{{first_name}} {{last_name}}
{{address}}, Roosevelt Island, NY 10044`,
    form_url: null,
    sort_order: 1,
    recipients: [
      { name: "Ahmed Tigani", title: "DOB Commissioner", email: "commissioner@buildings.nyc.gov" },
      { name: "Dina Levy", title: "HPD Commissioner", email: "commissioner@hpd.nyc.gov" },
      { name: "Rebecca Seawright", title: "Assembly Member", email: "SeawrightR@nyassembly.gov" },
      { name: "Mark Levine", title: "Comptroller", email: "nyccbam@comptroller.nyc.gov" },
      { name: "Office of Comptroller", title: null, email: "action@comptroller.nyc.gov" },
      { name: "Dept of Environmental Protection", title: null, email: "dep@dep.nyc.gov" },
      { name: "NYC Health", title: null, email: "health@health.nyc.gov" },
      { name: "NYC Emergency Management", title: null, email: "oem@oem.nyc.gov" },
      { name: "Office of Sustainability", title: null, email: "sustainability@cityhall.nyc.gov" },
      { name: "NYC Law Department", title: null, email: "law@law.nyc.gov" },
      { name: "Dept of Buildings", title: null, email: "dob@buildings.nyc.gov" },
      { name: "Historic Districts Council", title: null, email: "hdc@hdc.org" },
    ],
  },
  {
    name: "City Council — Stop the Demolition",
    description: null,
    type: "mailto",
    subject: "URGENT: Roosevelt Island Steam Plant Demolition",
    body_template: `Dear Speaker Menin,

I am a Roosevelt Island resident at {{address}} with grave concerns about the ongoing rushed demolition of the historic steam plant on our island. I urge you to act decisively to intervene in the interest of our community's health and safety before it's too late.

Demolition is underway pursuant to an emergency declaration from the Department of Buildings issued in July 2024. No detailed structural report has been shared with the public that substantiates the need for the emergency demolition.

I respectfully request that you ask the DOB for a detailed structural report — supported by documented measurements, descriptions, and photographs — from July 2024 as required by their own rules.

In the absence of documented structural failure, the crew currently on site could perform required maintenance and shoring, rather than proceeding with demolition to grade. This would avoid significant health hazards, save $7.3 million in public funds, and ensure no danger to human life from potential industrial toxins or structural instability.

During a pause, the feasibility review required under NYS SEQRA law could be conducted. If suitable for adaptive reuse — for community space or affordable housing — this would benefit all stakeholders.

Sincerely,
{{first_name}} {{last_name}}
{{address}}, Roosevelt Island, NY 10044`,
    form_url: null,
    sort_order: 2,
    recipients: [
      { name: "Julie Menin", title: "Speaker", email: "SpeakerMenin@council.nyc.gov" },
      { name: "Carolyn Ruvkun", title: "Constituent Services", email: "cruvkun@council.nyc.gov" },
      { name: "Harry Gale", title: "District 5 Liaison", email: "hgale@council.nyc.gov" },
      { name: "District 5", title: null, email: "District5@council.nyc.gov" },
      { name: "Maillie Romulus", title: "District 5 Liaison", email: "mromulus@council.nyc.gov" },
    ],
  },
  {
    name: "Mayor's Office — Website Message",
    description: null,
    type: "clipboard",
    subject: null,
    body_template: `Mayor Mamdani: Stop the demolition of the Roosevelt Island Steam Plant now. Since the prior administration, opaque deals and HPD neglect have bypassed the public. City agencies continue to deny requests for structural and environmental assessments or protection plans. Roosevelt Islanders have been silenced regarding this historic landmark's fate. Adaptive reuse offers a vibrant future: affordable housing, schools, and businesses can thrive here. Save our history. Sign our petition at archrica.org. Your leadership matters. Thank you!`,
    form_url: "https://www.nyc.gov/mayors-office/contact-the-mayor",
    sort_order: 3,
    recipients: [],
  },
  {
    name: "RIOC — Report a Problem",
    description: null,
    type: "clipboard",
    subject: null,
    body_template: `I am a Roosevelt Island resident who is very concerned about what's happening with the demolition of the steam plant. I am concerned about HAZMAT risks and trucking toxic waste down Main Street. Furthermore, it seems questionable that the demolition even needs to happen and a large group of my neighbors want it halted/paused immediately. For the safety of residents, families, kids and seniors, please pause the demolition and listen to the demands in the resident petition and resolution passed unanimously by CB8. Thank you.`,
    form_url: "https://www.rioc.ny.gov/report-problem",
    sort_order: 4,
    recipients: [],
  },
  {
    name: "NYC 311 — File a Complaint",
    description: null,
    type: "clipboard",
    subject: null,
    body_template: `I am a Roosevelt Island resident concerned with the demolition of the old steam plant at 5 Main Street. No Demolition Permit is currently posted on the construction fence. Residents have observed the unsafe excavation of contaminated soil and the removal of leaking industrial oil tanks without any notification given to the surrounding homes or the nearby daycare. Runoff from the contaminated soil is flowing into the street, and a 20-foot-deep excavation is being conducted without proper support, leading to fence collapses. With no air monitoring or Community Protection Plan in place, hazardous materials are being trucked through our public streets. I am deeply concerned about HAZMAT risks. For the safety of our families and seniors, I urge you to pause the demolition and listen to the resident petition and the resolution passed unanimously by CB8. Thank you.`,
    form_url: "https://portal.311.nyc.gov/sr-step/?id=cfdc780d-ea14-f111-83da-7c1e52ea79ba&stepid=749ab462-2a52-e811-a836-000d3a33b56b",
    sort_order: 5,
    recipients: [],
  },
];

async function seed() {
  console.log("Seeding database...");

  try {
    // Seed admin_config with default password hash for "changeme"
    const hash = await bcrypt.hash("changeme", 10);
    await db.execute({
      sql: "INSERT OR REPLACE INTO admin_config (id, password_hash) VALUES (1, ?)",
      args: [hash],
    });
    console.log("Seeded admin_config with default password hash.");

    for (const campaign of campaigns) {
      const result = await db.execute({
        sql: `INSERT INTO campaigns (name, description, type, subject, body_template, form_url, sort_order, is_active)
              VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        args: [
          campaign.name,
          campaign.description,
          campaign.type,
          campaign.subject,
          campaign.body_template,
          campaign.form_url,
          campaign.sort_order,
        ],
      });

      const campaignId = Number(result.lastInsertRowid);
      console.log(`Inserted campaign: "${campaign.name}" (id: ${campaignId})`);

      for (let i = 0; i < campaign.recipients.length; i++) {
        const r = campaign.recipients[i];
        await db.execute({
          sql: `INSERT INTO recipients (campaign_id, name, title, email, is_active, sort_order)
                VALUES (?, ?, ?, ?, 1, ?)`,
          args: [campaignId, r.name, r.title, r.email, i],
        });
      }

      if (campaign.recipients.length > 0) {
        console.log(`  -> Inserted ${campaign.recipients.length} recipients.`);
      }
    }

    console.log("Seeding completed successfully.");
  } catch (err) {
    console.error("Seeding failed:", err.message);
    process.exit(1);
  }
}

seed();
