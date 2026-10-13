/** Canonical origin. Every absolute URL on the site is built from this. */
export const SITE_URL = "https://getlocalhawaii.com";

/**
 * Plain spelling for title tags, schema and anything a search engine reads as
 * the site's name. The logo on the page reads "Get Local Hawaiʻi".
 */
export const SITE_NAME = "Get Local Hawaii";

/** The name as it appears on the page. */
export const SITE_LOGO = "Get Local Hawaiʻi";

/** Where corrections and questions go. */
export const CONTACT_EMAIL = "aloha@getlocalhawaii.com";

export function mailto(subject: string): string {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

/** Absolute URL for a canonical tag or a sitemap entry. */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

/** The pages in the menu, in order. A page joins this list once it is live. */
export const NAV_LINKS: { href: string; label: string }[] = [
  { href: "/oahu/lei/airport", label: "Airport lei" },
  { href: "/oahu/lei/delivery", label: "Send a lei" },
  { href: "/#lei-by-flower", label: "Lei guide" },
  { href: "/about", label: "About" },
];

/**
 * Buttondown newsletter username. Until the account exists the signup forms
 * still render on previews and locally, so the design can be reviewed, but
 * are left off the production site rather than shown broken.
 */
export const BUTTONDOWN_USERNAME = process.env.NEXT_PUBLIC_BUTTONDOWN_USERNAME ?? "";

export function showSignup(): boolean {
  return BUTTONDOWN_USERNAME !== "" || process.env.VERCEL_ENV !== "production";
}
