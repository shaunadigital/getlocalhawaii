/**
 * Copy for the lei type pages.
 *
 * Written for this site, not lifted from any vendor or guide page. Slugs and
 * meta titles use ASCII spellings because that is how people search; the body
 * copy keeps the ʻokina and kahakō.
 *
 * Claims here are deliberately general. Where a detail varies by season, by
 * grower or by shop, the copy says so rather than inventing a number that
 * would read as fact.
 */

export interface LeiType {
  /** ASCII slug, used in the URL and the meta title. */
  slug: string;
  /** Display name with diacriticals, used in body copy and headings. */
  name: string;
  /** ASCII name for the title tag. */
  asciiName: string;
  title: string;
  description: string;
  /** Lead sentence under the H1. */
  intro: string;
  /** 150 to 300 words of original prose, one paragraph per entry. */
  body: string[];
}

export const LEI_TYPES: LeiType[] = [
  {
    slug: "pikake",
    name: "Pīkake",
    asciiName: "Pikake",
    title: "Pikake lei on Oahu: where to buy",
    description:
      "Where to buy pikake lei on Oahu, with shops listed by area and hours shown where the shop posts them. Built from public listings.",
    intro:
      "Pīkake is the small white jasmine bud that scents a whole room from a single strand.",
    body: [
      "Pīkake is Arabian jasmine, and the Hawaiian name means peacock. It is usually traced to Princess Kaʻiulani, who kept peacocks at ʻĀinahau in Waikīkī and was fond of the flower. The lei is made from unopened buds rather than open blooms, strung tightly so the strand looks like a rope of small white beads. A single lei takes a great many buds, which is most of why pīkake costs more than an orchid or plumeria lei of the same length.",
      "The scent is the point. Pīkake is one of the most strongly perfumed lei you can buy in Honolulu, and it carries. Because the buds open and brown quickly once strung, pīkake is a same-day lei: order it for the day you need it, keep it in the refrigerator in a closed bag or container until you leave, and expect it to be at its best for that day rather than the week.",
      "Supply follows the weather. The plant flowers most heavily in the warm months, so pīkake is easiest to find and cheapest from late spring through autumn, and thinner and dearer in winter. Around graduation season and May Day, demand climbs fast and shops sell through what they have strung. If you need pīkake for a particular date, especially a double or triple strand, call ahead rather than turning up and hoping.",
      "Several Chinatown shops list pīkake among their regular lei. Shops that post no product list at all may still make it to order, and the listings above say which is which.",
    ],
  },
  {
    slug: "puakenikeni",
    name: "Puakenikeni",
    asciiName: "Puakenikeni",
    title: "Puakenikeni lei on Oahu: where to buy",
    description:
      "Where to buy puakenikeni lei on Oahu. Listings built from public sources, with hours shown where a shop posts them.",
    intro:
      "Puakenikeni opens white, turns gold over a day, and perfumes everything near it.",
    body: [
      "The name means ten-cent flower, from what a single blossom or a strand of them is said to have cost when the name stuck. The flower is a long, narrow trumpet that opens creamy white in the evening, deepens to yellow through the following day, and finishes a warm orange-gold. A lei often carries blossoms at several stages at once, which is why a fresh puakenikeni strand shades from white through to amber along its length.",
      "It is strung whole rather than as buds, so the lei is bulkier and more sculptural than pīkake and reads from further away. The scent is heavy and sweet, closer to gardenia than to jasmine, and a single lei is generous on a warm day.",
      "Puakenikeni is a lei to order rather than to pick up. The blossoms bruise where they are handled and discolour where they are pressed, so shops that make them tend to string them close to the time you collect them rather than keep a rail of them ready. Trees in Hawaiʻi flower over much of the year with a summer peak, but individual shops get their flowers from particular growers or from a tree in someone's yard, so availability is far more shop-by-shop than it is for commercially grown orchid or carnation.",
      "No listing on this site currently names puakenikeni in its posted product list. That does not mean nobody makes it; it means no source I have read says so. If you know a shop that strings it, tell me and I will add it.",
    ],
  },
  {
    slug: "maile",
    name: "Maile",
    asciiName: "Maile",
    title: "Maile lei on Oahu: where to order",
    description:
      "Where to order maile lei on Oahu, including ti leaf maile. Listings from public sources, with hours where shops post them.",
    intro: "Maile is a leaf lei, worn open rather than closed, and it is almost always ordered ahead.",
    body: [
      "Maile is not a flower lei. It is made from the glossy leaves and slim stems of a native forest vine, twisted or braided into a rope, and it is traditionally worn open: draped over the shoulders with both ends hanging loose rather than joined into a circle. That open form is part of why it turns up at weddings, blessings, graduations and store openings, and why it is the lei most often given to men.",
      "The smell is green rather than sweet, something between fresh-cut vine and vanilla, and it strengthens as the leaves are worked. Maile is frequently combined with other material, most often ti leaf, and a ti leaf maile is a common request at Honolulu shops.",
      "Two practical things matter when buying it. First, maile is gathered rather than grown on any scale, and a large share of what is sold in Honolulu arrives from the Cook Islands or Sāmoa rather than from Oʻahu forest. Supply therefore depends on shipments, not on a local season. Second, and following from that, maile is an order-ahead lei almost everywhere. Two days of notice is a common ask, and more than that around graduation. Turning up on the day and expecting maile on the rail is the one reliable way to be disappointed.",
      "Shops above that name maile in their posted products are the place to start, and it is worth calling to confirm length and lead time.",
    ],
  },
  {
    slug: "plumeria",
    name: "Plumeria",
    asciiName: "Plumeria",
    title: "Plumeria lei on Oahu: where to buy",
    description:
      "Where to buy plumeria lei on Oahu. Shops listed by area, hours shown where posted, built from public listings.",
    intro: "Plumeria is the everyday welcome lei: cheap, abundant, and best worn the day it is strung.",
    body: [
      "Plumeria, called melia in Hawaiian, is not native to Hawaiʻi but has been here long enough to be the flower most visitors picture when they picture a lei. The blooms are five broad petals, white and yellow most commonly, and pink through to deep red on other trees. A lei is strung from whole flowers, so it is full and light and sits well over the shoulders.",
      "It is the least expensive of the common flower lei, which is why it does so much of the work at airport arrivals and casual occasions. The trade-off is life span. Plumeria bruises where it is handled and browns at the edges within a day, faster in a hot car. Buy it for the day you need it, keep it cool and in a bag until the moment you use it, and do not plan on a plumeria lei surviving to be worn again the next morning.",
      "The trees drop their leaves and stop flowering in the cool months, so plumeria is genuinely seasonal on Oʻahu: broadly available from spring into autumn, scarce and more expensive in winter, when shops lean on orchid and carnation instead. Scent varies a lot between trees, from barely there to strong and citrus-sweet, and shops rarely sort by it, so smell the strand before you choose if that matters to you.",
    ],
  },
  {
    slug: "orchid",
    name: "Orchid",
    asciiName: "Orchid",
    title: "Orchid lei on Oahu: where to buy",
    description:
      "Where to buy orchid lei on Oahu, including double orchid. Listings from public sources with hours where shops post them.",
    intro: "The orchid lei is the durable one: available year round, and the one that survives a flight.",
    body: [
      "Most orchid lei sold in Honolulu are strung from dendrobium, a commercially grown orchid that comes in purple, white and combinations of the two. Because it is farmed rather than gathered, it is the one common lei that is not really seasonal: shops can get it in January as readily as in June, and the price moves far less across the year than plumeria or pīkake.",
      "Its other advantage is toughness. Orchid blooms are waxy and hold their shape, so a strand keeps for several days in the refrigerator and travels better than anything else on this list. That is why it dominates the airport stands, why it is the usual choice for a lei being carried to the mainland, and why shops that ship lei ship orchid more than anything else.",
      "You will see single and double strands. A double orchid lei is simply two strands' worth of blooms strung together, roughly twice as full and priced accordingly; it is the common choice when the lei is the main gift rather than a greeting. Triple and braided versions exist for weddings.",
      "What orchid does not have is much scent. Dendrobium is close to odourless, so an orchid lei is chosen for how it looks and how long it lasts rather than for perfume. If the smell is what you are after, pīkake or puakenikeni is the better buy, and several shops will string a mixed lei that gets you both.",
    ],
  },
  {
    slug: "carnation",
    name: "Carnation",
    asciiName: "Carnation",
    title: "Carnation lei on Oahu: where to buy",
    description:
      "Where to buy carnation lei on Oahu. Shops listed by area, hours where posted, compiled from public listings.",
    intro: "Carnation is the lei that survives a long ceremony in the sun.",
    body: [
      "Carnation lei are strung from whole blooms, packed close so the strand is dense and slightly springy. Red and white are the usual colours, with pink and variegated available at larger shops. The scent is mild and a little spicy, closer to clove than to jasmine, and it does not fade the way a plumeria lei's does over an afternoon.",
      "Durability is why carnation turns up so often at graduations. A ceremony can run for hours, much of it outdoors, and a carnation lei will still look worn-on-purpose at the end of it, where a plumeria lei will not. It also stacks well, which matters when a graduate ends up wearing six or seven at once, and it holds up to being taken off, put in a bag and put back on.",
      "Like orchid, carnation is commercially grown rather than gathered, so it is available through the year and its price is steadier than the seasonal flowers. Some of what shops use is grown in Hawaiʻi and some is flown in, and shops do not generally advertise which.",
      "Carnation is often doubled, braided, or combined with ribbon and with ti leaf for graduation lei, and money lei are frequently built on a carnation base. If you want something specific for a ceremony date, order it rather than expecting it on the rail, particularly in May.",
    ],
  },
];

export function findLeiType(slug: string): LeiType | undefined {
  return LEI_TYPES.find((type) => type.slug === slug);
}
