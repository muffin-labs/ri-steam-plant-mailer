// ENV_FILE selects the database: .env.local (default) or .env.prod via the :prod npm scripts.
const envFile = process.env.ENV_FILE || ".env.local";
require("dotenv").config({ path: envFile, quiet: true });

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

  // ---------------------------------------------------------------------------
  // /ridn — Roosevelt Island Day Nursery families: fund 3-K and Pre-K
  // ---------------------------------------------------------------------------
  {
    mailer: "ridn",
    name: "Increase 3K & Pre-K Funding",
    description: "Send an email to Dept. of Education contacts, elected representatives, RIOC and CB8 asking them to advocate for increased funding for Pre-K and 3K classes.",
    type: "mailto",
    subject: "URGENT: Increase Funding for 3-K and Pre-K",
    body_template: `Dear City and State Leaders,

I am a parent at Roosevelt Island Day Nursery (RIDN), which partners with the New York City Department of Education to provide 3K and pre-K classrooms on Roosevelt Island. I’m writing because our classrooms are thriving, but the DOE’s funding model can’t sustain them, putting RIDN and other community-based organizations (CBOs) at risk.

I respectfully ask you to do everything in your power to advocate for increased funding and timely payments to CBOs for 3K/Pre-K seats.

The CBO funding gap was the subject of a recent New York Magazine article [https://nymag.com/intelligencer/article/2k-free-child-care-nyc-budgets-cbo-preschool.html]. According to the article, CBOs like RIDN run about half of the city’s pre-K programs, making them critical partners in the City’s commitment to universal early childhood programs. But the City’s reimbursement rate to CBOs has remained stagnant since 2014. This has created an untenable financial situation that may force RIDN and other CBOS to scale back their participation in the City’s early childhood programs.

RIDN has served the community for over 50 years and is widely recognized for its experienced teachers, strong curriculum, and supportive, inclusive environment. Families are doing their part to keep operations afloat. Last year, 92% of RIDN families donated to the annual fundraiser.

This is a high-performing early education program with an exceptionally committed parent community. But behind the scenes, finances are precarious, and the numbers tell a worrying story:

• $15,500: Average DOE reimbursement rate per 3K/Pre-K seat
• $17,100: Average bare minimum cost of providing seat, excluding administrative and operating costs and enrichment activities like art and music
• $123,000: Delinquent amount DOE owes RIDN for last year’s 3K/Pre-K programs
• Without donations, RIDN faces an annual deficit of around $100,000

In other words, RIDN's fundraising and tuition-based daycare programs are subsidizing DOE-funded education, using private money to keep "free" public classrooms afloat. This is not sustainable. NYC families cannot reasonably be expected to cover a systemic public funding gap.

Moreover, RIDN routinely experiences operational hurdles to facilitating DOE programs:

• The online DOE budgeting system has been unreliable, rejecting submissions over technicalities and forcing staff to spend weeks on workarounds just to submit a correct budget
• DOE is so short on finance staff that an educational consultant (a curriculum expert) has been pulled into delivering funding messages, instead of supporting instruction

If this pattern continues, RIDN and CBOs will eventually face painful choices, including:

• Shrink, eliminate or consolidate classrooms, serving fewer children
• Drain limited emergency reserves, leaving no cushion for unexpected costs
• Opt out of City-funded 3K and pre-K programs

To avoid forcing RIDN and other CBOs into these tough choices, I respectfully urge you to advocate for these DOE priorities:

1. Fully fund the real cost of 3K and pre-K seats at CBOs: Increase per-child rates to a minimum of $18,000 per seat so they cover actual payroll, benefits, mandated meals, and operating costs

2. Ensure timely payment to CBOs: Clear outstanding balances such as RIDN’s $123,000 and address chronic delays in payments to providers

3. Fix broken budgeting and payment systems: Make DOE budget submission and payment systems reliable, transparent, and responsive, so schools can plan responsibly

4. Stabilize and protect community-based providers: Treat CBOs as essential infrastructure in the city’s early education system, not as perpetually underfunded afterthoughts.

Thank you for your attention to this issue and for your work on behalf of New York City’s children and families. I would be grateful for a response on how you plan to support sustainable funding for community-based 3K and pre-K programs like RIDN.

Sincerely,
{{first_name}} {{last_name}}
Parent of ___ in ___ class at RIDN
{{address}}
[Your Email / Phone]`,
    form_url: null,
    sort_order: 1,
    recipients: [
      { name: "Julie Menin", title: "Speaker", email: "SpeakerMenin@council.nyc.gov" },
      { name: "District 5", title: null, email: "District5@council.nyc.gov" },
      { name: "Carolyn Ruvkun", title: "Speaker Menin’s office — Constituent Services", email: "cruvkun@council.nyc.gov" },
      { name: "Harry Gale", title: "Speaker Menin’s office — District 5 Liaison", email: "hgale@council.nyc.gov" },
      { name: "Rebecca Seawright", title: "Assembly Member", email: "SeawrightR@nyassembly.gov" },
      { name: "Community Board 8", title: "Manhattan Community Board 8", email: "info@cb8m.com" },
      { name: "DOE Early Childhood Finance", title: "Division of Early Childhood Education (DECE)", email: "EarlyChildhoodFinance@schools.nyc.gov" },
      { name: "DOE Early Childhood Education", title: "Division of Early Childhood Education (DECE)", email: "earlychildhood@schools.nyc.gov" },
      { name: "DOE Early Childhood Expansion", title: "Division of Early Childhood Education (DECE)", email: "eceexpansion@schools.nyc.gov" },
      { name: "Kelly McGuire", title: "District 2 Superintendent", email: "KMcGuire@schools.nyc.gov" },
      { name: "Lalita Kovvuri", title: "District 2 Family Leadership Coordinator", email: "lkovvuri@schools.nyc.gov" },
      { name: "Tina Sibulkin-Yacker", title: "District 2 Family Support Coordinator", email: "tsibulkinyacker@schools.nyc.gov" },
      { name: "RIOC Board", title: "Roosevelt Island Operating Corporation Board of Directors", email: "riocboard@rioc.ny.gov" },
      { name: "BJ Jones", title: "RIOC President", email: "BJ.Jones@rioc.ny.gov" },
      { name: "Mary Cunneen", title: "RIOC Chief Operating Officer", email: "Mary.Cunneen@rioc.ny.gov" },
      { name: "Bryant Daniels", title: "RIOC Assistant VP, Communications & Government Affairs", email: "Bryant.Daniels@rioc.ny.gov" },
    ],
  },
];

async function seed() {
  console.log(`Seeding ${process.env.TURSO_DATABASE_URL} (${envFile})...`);

  try {
    // Seed admin_config with default password hash for "changeme"
    const hash = await bcrypt.hash("changeme", 10);
    await db.execute({
      sql: "INSERT OR IGNORE INTO admin_config (id, password_hash) VALUES (1, ?)",
      args: [hash],
    });
    console.log("Seeded admin_config with default password hash (if not already set).");

    // Only seed mailers that have no campaigns yet, so re-running is safe and
    // adding a new mailer here doesn't duplicate the existing ones.
    const existing = await db.execute(
      "SELECT DISTINCT mailer FROM campaigns"
    );
    const seededMailers = new Set(existing.rows.map((r) => r.mailer));

    for (const campaign of campaigns) {
      const mailer = campaign.mailer || "steamplant";
      if (seededMailers.has(mailer)) {
        console.log(`Skipping "${campaign.name}" (${mailer} already has campaigns)`);
        continue;
      }
      const result = await db.execute({
        sql: `INSERT INTO campaigns (name, description, type, subject, body_template, form_url, sort_order, is_active, mailer)
              VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
        args: [
          campaign.name,
          campaign.description,
          campaign.type,
          campaign.subject,
          campaign.body_template,
          campaign.form_url,
          campaign.sort_order,
          mailer,
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
