import type { Metadata, Viewport } from "next";
import { Figtree, Playwrite_NG_Modern } from "next/font/google";

import { SITE_NAME, SITE_URL } from "@/lib/site";

import "./globals.css";

// Two fonts only: Figtree for everything people read, Playwrite for the logo,
// the byline greeting and small human touches. Figtree replaced LINE Seed JP,
// whose macrons land on the following letter (Pīkake read as "Pik̄ake").
const sans = Figtree({
  variable: "--font-sans-face",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700", "800"],
  display: "swap",
});

const playwrite = Playwrite_NG_Modern({
  variable: "--font-playwrite",
  display: "swap",
});

export const metadata: Metadata = {
  // Every canonical and Open Graph URL on the site resolves against this.
  metadataBase: new URL(SITE_URL),
  title: {
    default: `Honolulu Airport Lei and Sending a Lei | ${SITE_NAME}`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Where to buy a lei at the Honolulu airport and how to send a fresh lei to the mainland, from someone born and raised on Oahu. Every page says when it was checked.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    url: SITE_URL,
  },
};

export const viewport: Viewport = {
  themeColor: "#15181b",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${playwrite.variable}`}>
      <body className="flex min-h-dvh flex-col antialiased">{children}</body>
    </html>
  );
}
