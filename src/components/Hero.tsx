import Image from "next/image";

import { SiteHeader } from "@/components/SiteHeader";

/**
 * Full-bleed photo with the page's headline on a smoked glass panel. On a
 * phone the panel slides up over the bottom of the photo; on desktop it is a
 * card in the lower left. Pages without a photo get the same layout on
 * charcoal, shorter.
 */
export interface HeroProps {
  title: string;
  sub?: string;
  image?: { src: string; alt: string; position?: string };
  /** Small facts under the subline, such as the checked date. */
  meta?: React.ReactNode;
  /** One way to jump, such as a single sign button. */
  children?: React.ReactNode;
  current?: string;
}

export function Hero({ title, sub, image, meta, children, current }: HeroProps) {
  return (
    <header
      className={`relative flex flex-col overflow-hidden bg-ink text-white ${
        image ? "min-h-[560px] md:min-h-[600px]" : "min-h-[360px] md:min-h-[420px]"
      }`}
    >
      {image ? (
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: image.position ?? "center" }}
        />
      ) : null}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(21,24,27,0.65)_0%,rgba(21,24,27,0)_24%)]"
      />

      <SiteHeader current={current} />

      <div className="relative mt-auto w-full md:mx-auto md:max-w-(--container-page) md:px-8 md:pt-10 md:pb-12">
        <div
          className={`flex flex-col gap-3 border-t border-white/18 bg-glass px-4 pt-6 pb-7 backdrop-blur-[16px] md:max-w-[600px] md:gap-4 md:rounded-[18px] md:border md:px-9 md:py-8 md:shadow-[0_16px_48px_rgba(0,0,0,0.3)] ${
            image ? "mt-60 rounded-t-[22px] md:mt-0" : "mt-10 rounded-t-[22px] md:mt-0"
          }`}
        >
          <h1 className="m-0 text-[36px] leading-[1.15] font-extrabold tracking-[-0.01em] md:text-[48px]">
            {title}
          </h1>
          {sub ? <p className="m-0 text-[18px] leading-[1.45] text-mist md:text-[19px]">{sub}</p> : null}
          {meta ? <div className="text-[14px] text-foot">{meta}</div> : null}
          {children}
        </div>
      </div>
    </header>
  );
}
