// Each mailer is a separate public page (/<slug>) with its own set of campaigns.
// Campaigns are linked to a mailer via the `campaigns.mailer` column.
export const MAILERS = [
  {
    slug: "steamplant",
    name: "Save the Steam Plant",
    eyebrow: "Roosevelt Island Residents",
    heading: "Stop the Demolition",
    intro:
      "The City is rushing to demolish an 87-year-old landmark without following the law. Send a letter to your elected officials in under 2 minutes.",
    summary:
      "Urge elected officials and agencies to halt the rushed demolition of the historic Roosevelt Island Steam Plant.",
    metadata: {
      title: "Save the Roosevelt Island Steam Plant — Take Action",
      description:
        "The City is rushing to demolish an 87-year-old Roosevelt Island landmark without following the law. Join thousands of residents fighting back. Send a letter to your elected officials in under 2 minutes.",
      ogDescription:
        "The City is rushing to demolish an 87-year-old landmark without following the law. Residents are fighting back.",
    },
  },
  {
    slug: "ridn",
    name: "Fund 3-K & Pre-K",
    eyebrow: "Take Action to Save our Schools",
    heading: "Fix the Preschool Funding Gap",
    intro:
      "Public funding doesn’t cover the cost of 3K and pre-K at community-based schools like Roosevelt Island Day Nursery. Ask your officials to increase funding.",
    summary:
      "Roosevelt Island Day Nursery families asking elected officials to increase funding for 3-K and Pre-K programs.",
    metadata: {
      title: "Fund 3-K & Pre-K — Roosevelt Island Day Nursery Families",
      description:
        "Roosevelt Island Day Nursery families are asking elected officials to increase funding for 3-K and Pre-K. Send a letter in under 2 minutes.",
      ogDescription:
        "RIDN families are asking elected officials to increase funding for 3-K and Pre-K.",
    },
  },
];

export const DEFAULT_MAILER = "steamplant";

export function getMailer(slug) {
  return MAILERS.find((m) => m.slug === slug) || null;
}

export function mailerMetadata(slug) {
  const { metadata } = getMailer(slug);
  return {
    title: metadata.title,
    description: metadata.description,
    openGraph: {
      title: metadata.title,
      description: metadata.ogDescription,
      type: "website",
    },
  };
}
