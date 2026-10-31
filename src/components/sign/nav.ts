/**
 * Links in the sign header, menu and footer. Only routes that exist or are
 * being built; a page joins here once it is live.
 */
export const SIGN_NAV: { href: string; label: string }[] = [
  { href: "/#this-weekend", label: "This weekend" },
  { href: "/holiday-fairs", label: "Holiday fairs" },
  { href: "/oahu/lei/airport", label: "Airport lei" },
  { href: "/oahu/lei/delivery", label: "Send a lei" },
  { href: "/about", label: "About" },
];

export const FOOTER_LINKS: { href: string; label: string }[] = [
  ...SIGN_NAV,
  { href: "/privacy", label: "Privacy" },
  { href: "/disclosure", label: "Disclosure" },
];

export interface MenuLink {
  href: string;
  label: string;
}

/** Groups for the open menu, built by SignHeader from the directory. */
export interface MenuGroups {
  sides: MenuLink[];
  categories: MenuLink[];
  kinds: MenuLink[];
}
