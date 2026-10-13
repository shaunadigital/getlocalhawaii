import { ArrowUpRight, PinIcon } from "@/components/Icons";
import { checkedLine } from "@/lib/checked";
import { type VendorSummary, dialable, directionsUrl } from "@/lib/types";

/**
 * One shop. Only facts the source gave: a missing phone or hours line is
 * simply not shown. "Open now" appears only when posted hours say so; there
 * is no "unconfirmed" label any more, the checked date does that job.
 */
export function ShopCard({ vendor }: { vendor: VendorSummary }) {
  const { status } = vendor;
  const line = vendor.reportNote ?? vendor.description;
  const checked = checkedLine(vendor.freshness);

  let hours: React.ReactNode = null;
  if (status.isOpenNow) {
    hours = (
      <span className="inline-flex items-center gap-2 font-bold">
        <span className="size-2.5 shrink-0 rounded-full bg-[#1f9d55]" aria-hidden="true" />
        Open now{status.closesAt ? `, closes ${status.closesAt.toLowerCase()}` : ""}
      </span>
    );
  } else if (status.kind === "opens_later" && status.opensAt) {
    hours = (
      <span className="font-bold">
        Opens {status.opensDay ? `${status.opensDay} ` : ""}
        {status.opensAt.toLowerCase()}
      </span>
    );
  }

  const isText = vendor.contactMethod === "text";

  return (
    <article
      id={vendor.slug}
      className="flex scroll-mt-6 flex-col overflow-hidden rounded-[14px] border border-line bg-white"
    >
      <div className="flex grow flex-col gap-1 p-4">
        {vendor.shipsMainland ? (
          <span className="self-start rounded bg-orchid px-1.5 py-0.5 text-[11px] font-extrabold tracking-[0.08em] text-white">
            SHIPS TO THE MAINLAND
          </span>
        ) : null}
        <h3 className="m-0 text-[18px] leading-[1.25] font-extrabold md:text-[20px]">{vendor.name}</h3>
        <span className="flex items-center gap-1.5 text-[14px] text-ink-soft">
          <PinIcon />
          {vendor.area}
        </span>
        {line ? <p className="m-0 text-[15px] leading-[1.5] text-ink-soft">{line}</p> : null}
        {hours ? <p className="m-0 mt-1 text-[15px]">{hours}</p> : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line-soft bg-[#fafaf8] px-4 py-2.5">
        <span className="text-[13px] text-mute">{checked}</span>
        <span className="flex gap-2">
          {vendor.phone ? (
            <a
              href={`${isText ? "sms" : "tel"}:${dialable(vendor.phone)}`}
              className="flex min-h-10 items-center rounded-lg border border-ink bg-white px-3.5 text-[14px] font-bold no-underline"
            >
              {isText ? "Text" : "Call"} {vendor.phone}
            </a>
          ) : null}
          <a
            href={directionsUrl(vendor.name, vendor.area)}
            target="_blank"
            rel="noopener"
            className="flex min-h-10 items-center gap-1.5 rounded-lg bg-ink px-3.5 text-[14px] font-bold text-white no-underline hover:text-white"
          >
            Map
            <ArrowUpRight />
          </a>
        </span>
      </div>
    </article>
  );
}
