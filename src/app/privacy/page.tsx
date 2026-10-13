import type { Metadata } from "next";

import { ProsePage } from "@/components/ProsePage";
import { CONTACT_EMAIL, mailto } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What Get Local Hawaii collects, why, and how to have it removed.",
  alternates: { canonical: "/privacy" },
};

export default function Privacy() {
  return (
    <ProsePage
      title="Privacy"
      sub="What this site collects, why, and how to have it removed."
      updated="Oct 9, 2026"
      sections={[
        {
          heading: "Email signups",
          paragraphs: [
            "If you sign up for reminders or for the lūʻau guide, your email address is stored with Buttondown, the service that sends the emails. It is used only to send what you signed up for, a few emails a year. Buttondown asks you to confirm before anything is sent.",
            "Every email has an unsubscribe link, and unsubscribing removes you from the list. Your address is never sold or shared with shops or advertisers.",
          ],
        },
        {
          heading: "Visits",
          paragraphs: [
            "The site is hosted on Vercel, which keeps standard server logs, such as the pages requested and the time, to run and protect the service.",
            "The site does not use advertising or tracking cookies. If visit statistics are added, this page will be updated first to say what is collected and how to opt out.",
          ],
        },
        {
          heading: "Links to other sites",
          paragraphs: [
            "Links to shops, maps and booking sites take you off this site, and those sites have their own privacy policies.",
          ],
        },
        {
          heading: "Contact",
          paragraphs: [
            <>
              To ask what is held about you, or to have it deleted,{" "}
              <a href={mailto("Privacy request")} className="font-bold">
                email {CONTACT_EMAIL}
              </a>
              .
            </>,
          ],
        },
      ]}
    />
  );
}
