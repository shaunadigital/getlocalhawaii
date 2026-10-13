import { ArrowDown } from "@/components/Icons";

/**
 * Section headings drawn as wayfinding signs: orchid arrow box, charcoal
 * bar, and a white tag that carries one real fact. No fact, no tag.
 */
export function Sign({ title, tag, id }: { title: string; tag?: string; id?: string }) {
  return (
    <h2
      id={id}
      className="group m-0 flex scroll-mt-6 self-start overflow-hidden rounded-md border border-ink text-[20px] leading-[1.25] font-extrabold md:text-[24px]"
    >
      <span className="flex w-10 shrink-0 items-center justify-center bg-orchid text-white md:w-12">
        <ArrowDown className="transition-transform group-hover:translate-y-[3px]" />
      </span>
      <span className="bg-ink px-3.5 py-[9px] text-white md:px-[18px] md:py-2.5">{title}</span>
      {tag ? (
        <span className="flex items-center border-l border-ink bg-white px-3 text-[14px] font-bold md:px-4 md:text-[16px]">
          {tag}
        </span>
      ) : null}
    </h2>
  );
}
