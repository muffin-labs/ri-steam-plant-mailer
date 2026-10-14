import "./globals.css";

export const metadata = {
  title: "Roosevelt Island — Take Action",
  description:
    "Send a letter to your elected officials in under 2 minutes. Choose a Roosevelt Island campaign and make your voice heard.",
  openGraph: {
    title: "Roosevelt Island — Take Action",
    description:
      "Send a letter to your elected officials in under 2 minutes.",
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
