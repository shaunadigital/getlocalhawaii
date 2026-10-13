import Link from "next/link";

/**
 * The site is anonymous: no name, no photo. What carries the trust is the
 * date on every page and the About page saying how they are checked.
 */
export function Byline() {
  return (
    <section className="flex max-w-[760px] flex-col gap-1 py-10 md:py-14">
      <p className="m-0 font-script text-[18px] leading-[1.6] md:text-[22px]">Aloha from Oʻahu.</p>
      <p className="m-0 text-[15px] text-ink-soft md:text-[16px]">
        Written by someone born and raised here. Every page says where its information came from
        and when I last checked it.{" "}
        <Link href="/about" className="font-bold">
          How pages are checked
        </Link>
      </p>
    </section>
  );
}
