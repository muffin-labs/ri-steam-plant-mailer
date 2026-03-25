import "./globals.css";

export const metadata = {
  title: "Save the Roosevelt Island Steam Plant — Take Action",
  description:
    "The City is rushing to demolish an 87-year-old Roosevelt Island landmark without following the law. Join thousands of residents fighting back. Send a letter to your elected officials in under 2 minutes.",
  openGraph: {
    title: "Save the Roosevelt Island Steam Plant — Take Action",
    description:
      "The City is rushing to demolish an 87-year-old landmark without following the law. Residents are fighting back.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
