/**
 * Copy for the area, delivery and guide capture pages. Original writing for
 * this site. Meta titles use ASCII spellings; body copy keeps diacriticals.
 */

import { LEI_TYPES } from "./lei-types";

export interface PageCopy {
  slug: string;
  heading: string;
  title: string;
  description: string;
  intro: string;
  body: string[];
}

export const CHINATOWN: PageCopy = {
  slug: "chinatown",
  heading: "Lei shops in Chinatown, Honolulu",
  title: "Lei shops in Chinatown Honolulu: Maunakea Street",
  description:
    "The Chinatown lei shops on and around Maunakea Street in Honolulu, listed with addresses, phone numbers and hours where shops post them.",
  intro:
    "Most of Honolulu's lei shops sit within a few blocks of each other, on and around Maunakea Street.",
  body: [
    "If you are buying lei in Honolulu and you are not at the airport, this is where you go. The shops cluster along Maunakea Street and spill around the corner onto North Beretania and Pauahi, several of them within a single block, and walking the row is the fastest way to compare what is strung and ready today against what has to be ordered.",
    "They are small storefronts rather than florists in the mainland sense: a cooler, a rail of finished lei, and someone stringing at a table behind the counter. Because they sit so close together, availability shifts between them day to day, and a flower one shop has run out of is often two doors down. That is the practical argument for coming in person rather than ringing one number.",
    "A few things are worth knowing before you go. Several shops open early and close by mid-afternoon, so this is a morning errand. Parking on Maunakea itself is difficult and mostly metered; the surrounding blocks and the municipal lots are the usual answer. And for anything that has to be made rather than picked off the rail, particularly maile or a haku, call ahead: the shops here are used to same-day walk-ins for common flowers and to advance orders for everything else.",
    "The listings above are compiled from each shop's own site where it has one, and from public directories where it does not. Where a shop posts no hours, this page leaves the hours blank rather than guessing them.",
  ],
};

export const DELIVERY: PageCopy = {
  slug: "delivery",
  heading: "Lei delivery on Oʻahu and shipping to the mainland",
  title: "Lei delivery Oahu and fresh leis shipped to the mainland",
  description:
    "Oahu lei shops that deliver locally or ship fresh lei to the mainland, with what each one says about shipping on its own site.",
  intro:
    "Some Oʻahu shops deliver across the island, and a few pack fresh lei for the mainland.",
  body: [
    "There are two different things people mean by lei delivery, and they need different shops. The first is local delivery on Oʻahu: a lei sent to a hotel, a house, an office or a graduation. That is a florist service, and the shops that do it are generally the larger ones with a van and an online order form. The second is shipping fresh lei to an address outside Hawaiʻi, which is a different operation again, involving overnight air, a cooled box, and agricultural rules on what may leave the state.",
    "For mainland shipping, the flower matters more than anywhere else on this site. Orchid travels best by a wide margin: it is waxy, it holds its shape, and it tolerates a day in a box. Carnation ships reasonably well. Plumeria and pīkake do not, and shops that ship will usually steer you away from them for that reason. Maile is a special case, since it is a leaf lei and hardier than the flowers, but it is also the one most likely to need ordering well ahead.",
    "Timing is the other constraint. Fresh lei are shipped to arrive, not to sit, so orders are usually built around a delivery date rather than an order date, and shops want notice. If the lei is for a graduation or a wedding on the mainland, work backwards from the event and give the shop more room than you think you need.",
    "The listings above are the shops whose own sources say they ship to the mainland. Local-only delivery is common and often unadvertised, so it is worth asking any shop on the island directly.",
  ],
};

export const AIRPORT: PageCopy = {
  slug: "airport",
  heading: "Lei stands at Honolulu airport",
  title: "Honolulu airport lei stands: where to buy at HNL",
  description:
    "The lei stands on the airport road at Honolulu, listed with addresses and hours where they are posted. Built from public listings.",
  intro:
    "A row of independent lei stands sits on the airport road, outside the terminals.",
  body: [
    "The lei stands at Honolulu airport are not shops inside the terminal. They are a row of separate stands along the airport approach on Rodgers Boulevard, near Lagoon Drive, and you reach them by pulling in on the way to or from the terminal building rather than by walking there from your gate. That matters for planning: once you are through security there is no getting back out to them, so a lei for a departing passenger has to be bought before you drop them off.",
    "Several of these stands are old family businesses that have been on this stretch of road for decades, in some cases since the 1940s, passed down through the family and still trading under the name of the woman who started them. They exist because of the two things that happen at an airport: greeting people who have just landed, and sending people home with something fresh.",
    "The flower that dominates here is orchid, and for good reason. It is the sturdiest of the common lei, it survives being carried around a terminal and sat on a plane, and it is available all year. If the lei is going into a suitcase or onto a mainland flight, that is what to ask for. Pīkake and plumeria are lovely and will not enjoy the journey.",
    "None of these stands publishes its own opening hours. The state airports page describes the lei stands as generally open from early morning until late evening, so check before a very early or very late flight. If you are meeting a specific flight, particularly a large party, it is worth calling ahead where a phone number is listed.",
  ],
};

export const GRADUATION: PageCopy = {
  slug: "graduation-lei",
  heading: "Graduation lei on Oʻahu: what to buy and when to order",
  title: "Graduation lei Oahu: what to buy and when to order",
  description:
    "A practical guide to buying graduation lei on Oahu: which flowers last through a ceremony, how many to expect, money lei, and how far ahead to order.",
  intro:
    "Graduation is the busiest lei week of the year on Oʻahu, and the shops sell out in a predictable order.",
  body: [
    "Two things make graduation different from any other lei occasion. The first is volume: a graduate does not receive one lei, they receive an armful, and by the end of the ceremony they may be wearing so many that the lei reach their ears. The second is endurance. A graduation is long, often outdoors, and the lei is put on early and worn for hours, so a flower that looks perfect at nine in the morning and tired by noon is the wrong flower.",
    "That points at the sturdy ones. Carnation is the traditional graduation lei on Oʻahu for exactly this reason: it is dense, it holds its shape, it stacks with others without crushing, and it survives being taken off and put back on for photographs. Orchid is the other reliable choice, and it has the advantage of travelling home afterwards. Ribbon and ti leaf lei are often braided in with them, and both outlast anything fresh.",
    "Money lei sit slightly apart. They are built on ribbon or on a flower base with folded notes worked in, they are ordered rather than bought off the rail, and the shop needs to know the denomination and the count in advance. If you want one for a specific graduate on a specific day, this is the item to arrange first, not last.",
    "The delicate flowers still have a place, but as the one good lei rather than the workhorse. A single strand of pīkake given at the end of the day, or a puakenikeni for the photographs, does what a stack of carnation cannot. Just do not expect it to survive the whole ceremony in the sun.",
    "On timing: May is when Hawaiʻi's high schools and the university graduate, and the lei shops know it. Common flowers get strung in volume and still run out; anything made to order, including maile, haku, money lei and double or triple strands, needs real notice. A week ahead is not excessive for a specific request in May, and the shops will tell you their own cut-off if you ask. Ordering early also gets you a pickup time, which on a busy Saturday is worth as much as the lei.",
    "The listings below are Oʻahu lei shops compiled from public sources. Where a shop posts hours, this site shows them; where it does not, the hours are left blank rather than guessed, so call before you drive out.",
  ],
};

/** Areas that have written prose. An area without one is not a page. */
export const AREA_PAGES: PageCopy[] = [CHINATOWN, AIRPORT];

/** Every slug served under /[island]/[category]/, for the sitemap. */
export const CAPTURE_SLUGS: string[] = [
  ...LEI_TYPES.map((type) => type.slug),
  DELIVERY.slug,
  ...AREA_PAGES.map((area) => area.slug),
];
