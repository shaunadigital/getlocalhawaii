import Link from "next/link";

import { Hero } from "@/components/Hero";
import { SiteFooter } from "@/components/SiteFooter";

export default function NotFound() {
  return (
    <>
      <Hero
        title="Nothing here"
        sub="This page is not part of the site any more, or never was. These are:"
      />
      <main className="mx-auto flex w-full max-w-(--container-page) flex-col gap-3 px-4 py-10 md:px-8">
        <Link href="/oahu/lei/airport" className="text-[18px] font-bold">
          Honolulu airport lei
        </Link>
        <Link href="/oahu/lei/delivery" className="text-[18px] font-bold">
          Send a lei to the mainland
        </Link>
        <Link href="/" className="text-[18px] font-bold">
          Home
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
