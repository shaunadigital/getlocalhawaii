import type { Metadata } from "next";

import { ProsePage } from "@/components/ProsePage";
import { CONTACT_EMAIL, mailto } from "@/lib/site";

export const metadata: Metadata = {
  title: "Affiliate disclosure",
  description: "How Get Local Hawaii may earn money from links, and what that never changes.",
  alternates: { canonical: "/disclosure" },
};

export default function Disclosure() {
  return (
    <ProsePage
      title="Affiliate disclosure"
      sub="How this site may earn money, and what that never changes."
      updated="Oct 9, 2026"
      sections={[
        {
          heading: "How links may earn money",
          paragraphs: [
            "Some links on this site may be affiliate or referral links. If you book a tour or buy a lei through one, this site may earn a commission or a referral fee. It costs you nothing extra.",
            "These include, or may come to include, activity booking sites such as Viator and GetYourGuide, the Polynesian Cultural Center, and referral codes from lei shops that ship. A page that carries such links says so near the top.",
          ],
        },
        {
          heading: "What it never changes",
          paragraphs: [
            "Commissions never decide which shops or lūʻau are listed, what is said about them, or the order they appear in. Comparisons are listed A to Z or by fact, such as price or distance, and say which they use.",
            "Nobody can pay to be listed, and nobody can pay to be ranked higher. If paid placements are ever added, they will be labeled as paid, on the placement itself.",
          ],
        },
        {
          heading: "Questions",
          paragraphs: [
            <>
              <a href={mailto("Disclosure question")} className="font-bold">
                Email {CONTACT_EMAIL}
              </a>
              .
            </>,
          ],
        },
      ]}
    />
  );
}
