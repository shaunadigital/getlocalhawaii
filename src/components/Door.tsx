import Image from "next/image";
import Link from "next/link";

import { ArrowRight } from "@/components/Icons";

/** A photo door to another page: kicker, plain page name, checked date. */
export interface DoorProps {
  href: string;
  kicker: string;
  title: string;
  checked?: string | null;
  image: { src: string; alt: string; position?: string };
}

export function Door({ href, kicker, title, checked, image }: DoorProps) {
  return (
    <Link
      href={href}
      className="group relative block h-[220px] overflow-hidden rounded-2xl bg-ink text-white no-underline hover:text-white md:h-[360px]"
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes="(min-width: 768px) 560px, 100vw"
        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        style={{ objectPosition: image.position ?? "center" }}
      />
      <span className="absolute right-3 bottom-3 left-3 flex items-center gap-3 rounded-xl border border-white/18 bg-glass px-3.5 py-3 backdrop-blur-[14px] md:right-3.5 md:bottom-3.5 md:left-3.5 md:px-4 md:py-3.5">
        <span className="flex grow flex-col">
          <span className="text-[12px] font-extrabold tracking-[0.08em] text-orchid-light">{kicker}</span>
          <span className="text-[19px] leading-[1.25] font-extrabold md:text-[20px]">{title}</span>
          {checked ? <span className="text-[13px] text-mist md:text-[14px]">{checked}</span> : null}
        </span>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-orchid md:size-11">
          <ArrowRight className="transition-transform group-hover:translate-x-[3px]" />
        </span>
      </span>
    </Link>
  );
}
