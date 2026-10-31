import Image from "next/image";
import Link from "next/link";

import { JsonLd } from "@/components/JsonLd";
import { SignArrow } from "@/components/sign/ArrowSign";
import { CheckedLine } from "@/components/sign/CheckedLine";
import { CreamBoard } from "@/components/sign/CreamBoard";
import { SignFooter } from "@/components/sign/SignFooter";
import { SignHeader } from "@/components/sign/SignHeader";
import { ICON_NAMES, type IconName, SignIcon } from "@/components/sign/SignIcon";
import { StatusChip } from "@/components/sign/StatusChip";
import { cn } from "@/lib/cn";
import {
  type MarketListing,
  type VendorListing,
  bodyRange,
  homeSideHref,
  searchHref,
} from "@/lib/directory";
import { vendorBusinessSchema } from "@/lib/schema";
import { CONTACT_EMAIL } from "@/lib/site";
import { hawaiiClock } from "@/lib/time";

import { hoursRows, hoursSummary } from "./hours";
import { OutArrow, type PlaceBoardData, PlaceBoard, type ShopBoardData, ShopBoard } from "./PlaceBoards";
import { SideLocator } from "./SideLocator";

const CATEGORY_ICONS: Record<string, IconName> = {
  lei: "lei",
  fish: "ahi",
  poi: "bread",
  produce: "papaya",
  farms: "bananas",
  flowers: "flowers",
  plants: "plant",
  makers: "earrings",
  "clothing-jewelry": "earrings",
  "bath-body": "soap",
  pets: "basket",
  "food-trucks": "truck",
  "prepared-food": "bread",
  "food-producers": "honey",
};

function iconFor(vendor: VendorListing): IconName {
  const override = vendor.iconOverride;
  if (override && (ICON_NAMES as readonly string[]).includes(override)) return override as IconName;
  return (vendor.category && CATEGORY_ICONS[vendor.category.slug]) || "basket";
}

const TILTS = [0.4, -0.4, 0.3, -0.3];
const TAG_TILTS = [-1.5, 1, -0.8, 1.2, -1.2, 0.8];

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function socialLink(value: string, host: "instagram.com" | "facebook.com"): { href: string; text: string } {
  if (/^https?:\/\//i.test(value)) {
    let text = value;
    try {
      const parts = new URL(value).pathname.split("/").filter(Boolean);
      if (parts[0]) text = host === "instagram.com" ? `@${parts[0]}` : parts[0];
    } catch {
      // keep the stored text
    }
    return { href: value, text };
  }
  const handle = value.replace(/^@/, "").trim();
  return { href: `https://www.${host}/${handle}`, text: host === "instagram.com" ? `@${handle}` : handle };
}

function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

function directionsUrl(vendor: VendorListing): string | null {
  if (vendor.address) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(vendor.address)}`;
  if (vendor.lat !== null && vendor.lng !== null) {
    return `https://www.google.com/maps/search/?api=1&query=${vendor.lat},${vendor.lng}`;
  }
  return null;
}

function channelLinkLabel(kind: string): string {
  if (["ship", "shipping", "order", "online", "delivery"].includes(kind)) return "Order on their site";
  return "Details on their site";
}

/** "Claim Cindy’s Lei Shoppe ..." as a mail to the contact address, until a claim route exists. */
function claimHref(name: string, path: string): string {
  const subject = `Claim ${name}`;
  const body = `I run ${name} (https://getlocalhawaii.com${path}) and would like to claim the listing.`;
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function NotPostedBox({ text }: { text: string }) {
  return (
    <div className="flex flex-col gap-1.5 border-2 border-dashed border-[rgba(251,247,240,0.45)] p-4">
      <span className="font-display text-[13px] text-gl-cream">NOT POSTED YET</span>
      <p className="m-0 text-[15px] leading-normal text-gl-soft">{text}</p>
    </div>
  );
}

function SectionHeading({ children, aside, id }: { children: React.ReactNode; aside?: string; id?: string }) {
  return (
    <h2
      id={id}
      className="m-0 flex items-baseline justify-between gap-2.5 font-display text-[26px] leading-none font-normal text-gl-cream md:text-[28px]"
    >
      <span>{children}</span>
      {aside ? <span className="shrink-0 text-[14px] text-gl-soft">{aside}</span> : null}
    </h2>
  );
}

export interface VendorPageProps {
  vendor: VendorListing;
  /** The vendor's markets as full listings, for their status. */
  markets: MarketListing[];
  /** Other listings in the same category on the same side. */
  nearby: VendorListing[];
  now: Date;
}

export function VendorPage({ vendor, markets, nearby, now }: VendorPageProps) {
  const path = vendor.href ?? "/";
  const place = vendor.neighborhood ?? vendor.area;
  const clock = hawaiiClock(now);

  // WHERE TO FIND THEM -------------------------------------------------------
  const hasShop =
    vendor.fixedOrRoaming !== "roaming" &&
    (vendor.address !== null || vendor.hours.length > 0 || (vendor.markets.length === 0 && place !== null));

  const shop: ShopBoardData | null = hasShop
    ? {
        title: place ? `${place} shop` : "The shop",
        address: vendor.address,
        status: vendor.status,
        callAhead: vendor.phone !== null,
        summary: hoursSummary(vendor.hours),
        hoursNote: vendor.hoursNote,
        rows: vendor.hours.length > 0 ? hoursRows(vendor.hours, clock.dayOfWeek) : [],
        directionsUrl: directionsUrl(vendor),
        phoneHref: vendor.phone ? telHref(vendor.phone) : null,
      }
    : null;

  const marketById = new Map(markets.map((m) => [m.id, m]));
  const marketBoards: (PlaceBoardData & { open: boolean })[] = vendor.markets.map((link) => {
    const market = marketById.get(link.id);
    const next = market?.next;
    const time = next && next.timePosted && next.starts ? bodyRange(next.starts, next.ends) : null;
    const body = [
      market?.venueName ?? market?.neighborhood ?? market?.area ?? null,
      link.usualDays,
      link.stall ? `Stall ${link.stall}` : null,
      next && !next.timePosted ? "Times not posted" : time,
    ]
      .filter(Boolean)
      .join(" · ");
    return {
      key: `market-${link.id}`,
      status: market?.status ?? null,
      title: link.name,
      body: body || null,
      link: { href: link.href, label: "See the market", external: false },
      open: market?.status.isOpenNow ?? false,
    };
  });

  const channelBoards: PlaceBoardData[] = vendor.channels.map((channel, i) => ({
    key: `channel-${i}`,
    status: null,
    title: channel.label,
    body: channel.note,
    link: channel.url ? { href: channel.url, label: channelLinkLabel(channel.kind), external: true } : null,
  }));
  const shipsChannel = vendor.channels.some((c) => /ship|mainland/i.test(`${c.kind} ${c.label}`));
  const shipUrl = vendor.orderUrl ?? vendor.website;
  if (vendor.shipsMainland && !shipsChannel) {
    channelBoards.push({
      key: "ships",
      status: null,
      title: "Ships to the mainland",
      body: null,
      link: shipUrl ? { href: shipUrl, label: "Order on their site", external: true } : null,
    });
  }

  // Whatever is open now goes on top; otherwise the shop, then markets, then other ways to buy.
  const placeCount = (shop ? 1 : 0) + marketBoards.length + channelBoards.length;
  const placeLabel =
    placeCount === 0
      ? undefined
      : shop && placeCount === 1
        ? "1 SHOP"
        : `${placeCount} ${placeCount === 1 ? "PLACE" : "PLACES"}`;

  const items: { key: string; open: boolean; board: PlaceBoardData | null }[] = [
    ...(shop ? [{ key: "shop", open: shop.status.isOpenNow, board: null }] : []),
    ...marketBoards.map((b) => ({ key: b.key, open: b.open, board: b as PlaceBoardData })),
    ...channelBoards.map((b) => ({ key: b.key, open: false, board: b })),
  ];
  const ordered = [...items.filter((i) => i.open), ...items.filter((i) => !i.open)];
  let tiltIndex = 0;
  const stack = ordered.map((item) =>
    item.board ? (
      <PlaceBoard key={item.key} place={item.board} tilt={TILTS[tiltIndex++ % TILTS.length]} />
    ) : shop ? (
      <ShopBoard key="shop" shop={shop} />
    ) : null,
  );

  // WHAT THEY SELL -----------------------------------------------------------
  const simpleProducts = vendor.products.every((p) => !p.note && !p.priceNote);
  const icon = iconFor(vendor);

  // Links ----------------------------------------------------------------------
  const links: { key: string; label: string; text: string; href: string; external: boolean }[] = [];
  if (vendor.website) {
    links.push({ key: "web", label: "Website", text: hostOf(vendor.website), href: vendor.website, external: true });
  }
  if (vendor.orderUrl && vendor.orderUrl !== vendor.website) {
    links.push({ key: "order", label: "Order", text: hostOf(vendor.orderUrl), href: vendor.orderUrl, external: true });
  }
  if (vendor.instagram) {
    const s = socialLink(vendor.instagram, "instagram.com");
    links.push({ key: "ig", label: "Instagram", text: s.text, href: s.href, external: true });
  }
  if (vendor.facebook) {
    const s = socialLink(vendor.facebook, "facebook.com");
    links.push({ key: "fb", label: "Facebook", text: s.text, href: s.href, external: true });
  }
  if (vendor.phone) {
    links.push({ key: "tel", label: "Phone", text: vendor.phone, href: telHref(vendor.phone), external: false });
  }

  const payments = [...vendor.paymentMethods];
  if (vendor.acceptsSnap && !payments.some((p) => /snap|ebt/i.test(p))) payments.push("SNAP");
  const hasPayment = payments.length > 0 || vendor.paymentNotes !== null;
  const hasAbout = vendor.story !== null || vendor.goodToKnow !== null;

  const sourceUrl = vendor.sourceUrl;
  const sourceText = vendor.sourceLabel ?? (sourceUrl ? hostOf(sourceUrl) : null);
  const titleSize = vendor.name.length > 14 ? "text-[40px]" : "text-[52px]";

  const nearbyHeading = vendor.sideName
    ? `MORE ${(vendor.category?.name ?? "").toUpperCase()} IN ${vendor.sideName.toUpperCase()}`.replace("  ", " ")
    : null;

  return (
    <div className="flex min-h-dvh grow flex-col overflow-x-hidden bg-gl-ground font-sans text-[16px] leading-normal text-gl-cream">
      <JsonLd data={vendorBusinessSchema(vendor, path)} />
      <SignHeader />

      {/* Title */}
      <section className="mx-auto box-border flex w-full max-w-[1200px] flex-wrap items-end justify-between gap-x-10 gap-y-5 px-4 pt-1.5 md:px-10 md:pt-5">
        <div className="flex min-w-0 flex-[1_1_560px] flex-col gap-3">
          <nav aria-label="Breadcrumb" className="text-[14px] font-bold text-gl-soft">
            <ol className="m-0 flex list-none flex-wrap gap-1.5 p-0">
              {vendor.category ? (
                <li>
                  <Link href={searchHref(vendor.category.name)} className="text-gl-cream">
                    {vendor.category.name}
                  </Link>
                </li>
              ) : null}
              {vendor.side && vendor.sideName ? (
                <li className="flex gap-1.5">
                  <span aria-hidden="true">/</span>
                  <Link href={homeSideHref(vendor.side)} className="text-gl-cream">
                    {vendor.sideName}
                  </Link>
                </li>
              ) : null}
              {place ? (
                <li className="flex gap-1.5">
                  <span aria-hidden="true">/</span>
                  <span>{place}</span>
                </li>
              ) : null}
            </ol>
          </nav>
          <div className="flex items-center justify-between gap-3 md:block">
            <h1
              className={cn(
                "m-0 min-w-0 font-display leading-[0.95] font-normal break-words text-gl-cream uppercase [text-shadow:0_2px_0_#2A1C30] md:text-[clamp(56px,6vw,84px)]",
                titleSize,
              )}
            >
              {vendor.name}
            </h1>
            <span
              aria-hidden="true"
              className="flex size-[84px] shrink-0 rotate-6 items-center justify-center rounded-full border-2 border-gl-ink bg-gl-cream text-gl-ink shadow-gl-board md:hidden"
            >
              <SignIcon name={icon} size={56} />
            </span>
          </div>
          {vendor.description ? (
            <p className="m-0 text-[19px] leading-[1.4] text-gl-soft md:text-[21px] md:leading-normal">
              {vendor.description}
            </p>
          ) : null}
          <CheckedLine checked={vendor.checked} />
        </div>
        <span
          aria-hidden="true"
          className="hidden size-[124px] shrink-0 rotate-6 items-center justify-center rounded-full border-2 border-gl-ink bg-gl-cream text-gl-ink shadow-gl-board md:flex"
        >
          <SignIcon name={icon} size={84} />
        </span>
      </section>

      {vendor.photo ? (
        <section aria-label="Photos" className="mx-auto box-border w-full max-w-[1200px] px-4 pt-[30px] md:px-10">
          <figure className="relative m-0 box-border w-[calc(50%-8px)] -rotate-2 border-2 border-gl-ink bg-gl-cream p-[9px] pb-9 shadow-gl-board md:w-[280px]">
            <span
              aria-hidden="true"
              className="absolute -top-3 left-1/2 z-10 -ml-10 h-6 w-20 -rotate-3 border-x-2 border-dashed border-x-[rgba(21,24,27,0.18)] bg-[rgba(239,231,218,0.85)]"
            />
            <span className="relative block aspect-[4/5] w-full overflow-hidden bg-gl-muted">
              <Image
                src={vendor.photo.url}
                alt={`Photo of ${vendor.name}`}
                fill
                unoptimized
                sizes="280px"
                className="object-cover"
              />
            </span>
            {vendor.photo.credit || vendor.photo.takenAt ? (
              <figcaption className="absolute right-[9px] bottom-2 left-[11px] truncate font-script text-[11px] leading-[1.2] text-gl-ink">
                {[vendor.photo.credit, vendor.photo.takenAt].filter(Boolean).join(" · ")}
              </figcaption>
            ) : null}
          </figure>
        </section>
      ) : null}

      <main className="mx-auto box-border flex w-full max-w-[1200px] flex-wrap items-start gap-x-11 gap-y-9 px-4 pt-[30px] pb-5 md:px-10 md:pt-[34px]">
        {/* Where to find them */}
        <section aria-labelledby="where" className="flex min-w-0 flex-[999_1_600px] flex-col gap-4">
          <SectionHeading id="where" aside={placeLabel}>
            WHERE TO <br className="md:hidden" />
            FIND THEM
          </SectionHeading>
          {stack.length === 0 && !vendor.side ? (
            <NotPostedBox text="No shop address or market days yet." />
          ) : (
            <div className="grid items-start gap-4 md:grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
              {vendor.side ? <SideLocator side={vendor.side} place={place} /> : null}
              {stack}
              {stack.length === 0 ? <NotPostedBox text="No shop address or market days yet." /> : null}
            </div>
          )}
        </section>

        <aside className="flex min-w-0 flex-[1_1_340px] flex-col gap-9 md:gap-6">
          {/* What they sell */}
          <section aria-labelledby="sell" className="flex flex-col gap-3.5">
            <SectionHeading id="sell">WHAT THEY SELL</SectionHeading>
            {vendor.products.length === 0 ? (
              <NotPostedBox text="No list of what they sell yet." />
            ) : simpleProducts ? (
              <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                {vendor.products.map((p, i) => (
                  <li
                    key={`${p.label}-${i}`}
                    className="inline-flex min-h-[34px] items-center border-2 border-gl-ink bg-gl-cream px-2.5 font-display text-[12px] text-gl-ink uppercase"
                    style={{ transform: `rotate(${i % 2 ? -0.8 : 0.8}deg)` }}
                  >
                    {p.label}
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="m-0 flex list-none flex-wrap gap-3 p-0">
                {vendor.products.map((p, i) => (
                  <li
                    key={`${p.label}-${i}`}
                    className="flex drop-shadow-[0_3px_0_#2A1C30]"
                    style={{ transform: `rotate(${TAG_TILTS[i % TAG_TILTS.length]}deg)` }}
                  >
                    <span className="gl-tagshape flex bg-gl-ink p-[3px]">
                      <span className="gl-tagshape relative flex items-center gap-2.5 bg-gl-cream py-2.5 pr-3.5 pl-[30px] text-gl-ink">
                        <span
                          aria-hidden="true"
                          className="absolute top-1/2 left-[11px] -mt-[5px] size-2.5 rounded-full bg-gl-purple shadow-[inset_0_0_0_2px_#221A26]"
                        />
                        <SignIcon name={icon} size={30} />
                        <span className="flex flex-col">
                          <span className="text-[16px] font-extrabold">{p.label}</span>
                          {[p.note, p.priceNote].filter(Boolean).length > 0 ? (
                            <span className="text-[13px] text-gl-muted">
                              {[p.note, p.priceNote].filter(Boolean).join(" · ")}
                            </span>
                          ) : null}
                        </span>
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {hasPayment ? (
            <section aria-labelledby="pay" className="flex flex-col gap-3">
              <SectionHeading id="pay">HOW TO PAY</SectionHeading>
              {payments.length > 0 ? (
                <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                  {payments.map((p) => (
                    <li
                      key={p}
                      className="inline-flex min-h-[34px] items-center border-2 border-gl-ink bg-gl-cream px-2.5 font-display text-[12px] text-gl-ink uppercase"
                    >
                      {p}
                    </li>
                  ))}
                </ul>
              ) : null}
              {vendor.paymentNotes ? <p className="m-0 text-[16px] text-gl-cream">{vendor.paymentNotes}</p> : null}
            </section>
          ) : null}

          {/* About and links */}
          <section aria-labelledby="about" className="flex flex-col gap-3">
            <SectionHeading id="about">{hasAbout ? "ABOUT" : "HOURS AND LINKS"}</SectionHeading>
            {vendor.story ? (
              <p className="m-0 text-[17px] leading-[1.6] text-gl-cream md:text-[16px] md:leading-normal">{vendor.story}</p>
            ) : null}
            {vendor.goodToKnow ? (
              <p className="m-0 text-[16px] leading-normal text-gl-soft">{vendor.goodToKnow}</p>
            ) : null}
            {links.length > 0 ? (
              <ul className="m-0 mt-1 flex list-none flex-col border-2 border-gl-ink bg-gl-cream p-0 text-gl-ink">
                {links.map((link, i) => (
                  <li key={link.key} className={cn(i > 0 && "border-t-2 border-dashed border-gl-rule")}>
                    <a
                      href={link.href}
                      {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="flex min-h-[52px] items-center justify-between gap-3 px-3.5 text-[16px] font-extrabold text-gl-ink no-underline hover:bg-gl-cream2/60 focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-gl-purple"
                    >
                      <span className="min-w-0 break-words">
                        {link.label} <span className="font-medium text-gl-muted">{link.text}</span>
                      </span>
                      {link.external ? <OutArrow className="shrink-0 text-gl-purple" /> : null}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <NotPostedBox text="No website, Instagram or phone number yet." />
            )}
          </section>

          {/* Claim */}
          <CreamBoard nails={false} tilt={-0.6} className="flex flex-col gap-2.5 px-[18px] py-5">
            <h2 className="m-0 font-display text-[24px] leading-none font-normal md:text-[22px]">IS THIS YOUR BUSINESS?</h2>
            <p className="m-0 text-[16px] font-medium">
              Claim {vendor.name} to post your market days and keep your hours current.
            </p>
            <a
              href={claimHref(vendor.name, path)}
              className="flex min-h-12 items-center gap-2.5 self-start border-2 border-gl-ink bg-gl-ink px-4 font-display text-[14px] text-gl-cream no-underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gl-purple"
            >
              CLAIM THIS LISTING
              <SignArrow size={18} className="text-gl-soft" />
            </a>
          </CreamBoard>

          {sourceUrl && sourceText ? (
            <p className="m-0 text-[14px] text-gl-soft">
              Source:{" "}
              <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-gl-cream">
                {sourceText}
              </a>
              {vendor.checked ? `, checked ${vendor.checked.date}.` : "."}
            </p>
          ) : null}
        </aside>
      </main>

      {nearby.length > 0 && nearbyHeading ? (
        <section
          aria-labelledby="nearby"
          className="mx-auto box-border flex w-full max-w-[1200px] flex-col gap-3.5 px-4 pt-[30px] pb-11 md:px-10 md:pb-[60px]"
        >
          <SectionHeading id="nearby">{nearbyHeading}</SectionHeading>
          <ul className="m-0 flex list-none flex-col gap-3 p-0 md:flex-row md:flex-wrap md:gap-4">
            {nearby.map((other, i) => (
              <li key={other.id} className="flex min-w-0 md:flex-[1_1_300px]">
                <Link
                  href={other.href ?? "/"}
                  className="flex grow no-underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gl-cream"
                  style={{ transform: `rotate(${[-0.6, 0.5, -0.3][i % 3]}deg)` }}
                >
                  <span className="gl-arrowboard gl-lift flex grow bg-gl-ink p-[3px] drop-shadow-[0_5px_5px_rgba(42,28,48,0.25)]">
                    <span className="gl-arrowboard flex grow flex-col gap-[3px] bg-gl-cream py-2.5 pr-[34px] pl-3.5 text-gl-ink">
                      <span className="text-[16px] leading-[1.25] font-extrabold">{other.name}</span>
                      {other.description || other.neighborhood || other.area ? (
                        <span className="text-[13px] text-gl-muted">
                          {[other.description, other.neighborhood ?? other.area].filter(Boolean).join(" · ")}
                        </span>
                      ) : null}
                      <StatusChip status={other.status} className="mt-0.5 self-start text-[11px]" />
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <div className="pb-11 md:pb-[60px]" />
      )}

      <SignFooter subject={`Something changed: ${vendor.name}`} />
    </div>
  );
}
