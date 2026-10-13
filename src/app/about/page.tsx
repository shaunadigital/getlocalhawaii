import type { Metadata } from "next";

import { ProsePage } from "@/components/ProsePage";
import { CONTACT_EMAIL, mailto } from "@/lib/site";

export const metadata: Metadata = {
  title: "How pages are checked",
  description:
    "Who writes Get Local Hawaii, where each listing comes from, what the checked dates mean, and how to send a correction.",
  alternates: { canonical: "/about" },
};

export default function About() {
  return (
    <ProsePage
      title="How pages are checked"
      sub="Who writes this site, where the information comes from, and what the dates on every page mean."
      updated="Oct 9, 2026"
      current="/about"
      sections={[
        {
          heading: "Who writes this",
          paragraphs: [
            "Someone born and raised on Oʻahu. I am not a lei shop, a tour company or a booking site, and the site does not carry my name: what it asks you to trust is the date on each page and the source behind it, not a person.",
            "It started as a list of lei stands for locals. It is now for visitors and for anyone sending a lei to the mainland: where to buy one at the Honolulu airport, which shops ship, and, next, every lūʻau on the island compared.",
          ],
        },
        {
          heading: "Where the information comes from",
          paragraphs: [
            "Each listing comes from a public source: the shop’s own website, an official page such as the state airports’ page on lei greetings, or a public directory where a shop has no site of its own.",
            "A detail the source did not give is left blank. If a shop does not post its hours, this site shows no hours rather than guessing them, and no shop is described as open unless its posted hours say so.",
          ],
        },
        {
          heading: "What the dates mean",
          paragraphs: [
            "“Checked” and a date means I read the shop’s own published information, or the official source, on that day. “Verified” means more: that I called the shop or went there in person. A listing only says “verified” when that actually happened.",
            "Shops are listed because their information can be checked, not because they replied to me or paid anything. A shop that has closed comes off the site.",
          ],
        },
        {
          heading: "Money",
          paragraphs: [
            "Nobody pays to be listed or to be ranked higher. Some links may earn a commission in future, and the disclosure page says exactly how that works.",
          ],
        },
        {
          heading: "Something wrong?",
          paragraphs: [
            <>
              If a shop has moved, closed or changed its hours, or a detail here is out of date,{" "}
              <a href={mailto("Correction")} className="font-bold">
                email {CONTACT_EMAIL}
              </a>
              . Corrections are checked against the source and the page is re-dated.
            </>,
          ],
        },
      ]}
    />
  );
}
