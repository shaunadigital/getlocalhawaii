import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Logo } from "@/components/Logo";
import { BUTTONDOWN_USERNAME, CONTACT_EMAIL, mailto, showSignup } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Get Local Hawaii: Lei and Luau on Oahu, Coming Soon" },
  description:
    "Find places to buy lei, compare luau on Oahu, and send a lei to someone special. Get Local Hawaii is coming soon.",
};

/**
 * The coming-soon home. It stands in for the home page while the full site is
 * designed; every inner page stays live at its own URL so its rankings hold.
 * The signup form appears once the Buttondown account exists; until then the
 * page says "Coming soon" and asks for nothing, so it never shows a form that
 * goes nowhere.
 */
export default function Home() {
  const signup = showSignup();
  const action = BUTTONDOWN_USERNAME
    ? `https://buttondown.com/api/emails/embed-subscribe/${BUTTONDOWN_USERNAME}`
    : undefined;

  return (
    <div className="flex min-h-dvh flex-col bg-sand text-ink">
      <header className="mx-auto w-full max-w-[1200px] px-4 md:px-10">
        <Logo ground="light" className="mx-auto [zoom:1.25] md:[zoom:1.35]" />
      </header>

      <main className="mx-auto flex w-full max-w-[1200px] grow flex-col gap-10 px-5 pt-8 pb-12 md:flex-row md:flex-wrap md:items-stretch md:gap-x-[72px] md:gap-y-14 md:px-10 md:pt-14 md:pb-20">
        <div className="flex min-w-0 flex-col justify-center md:flex-[1_1_520px]">
          <h1 className="m-0 text-[50px] leading-none font-extrabold tracking-[-0.035em] md:text-[clamp(52px,5.8vw,80px)] md:leading-[0.98]">
            Find your lūʻau.
            <br />
            Send some <span className="text-orchid">aloha</span>.
          </h1>
          <p className="mt-5 mb-0 max-w-[500px] text-[18px] leading-normal text-[#3a4047] md:mt-7 md:text-[20px]">
            Discover places to buy lei, compare lūʻau, and send a lei to someone special. Get Local
            Hawaiʻi is coming soon, starting on Oʻahu.
          </p>

          <p className="mt-8 mb-0 flex items-center gap-4 text-[30px] leading-none font-extrabold tracking-[-0.02em] text-orchid md:mt-10 md:text-[40px]">
            <span aria-hidden="true" className="h-[3px] w-10 shrink-0 rounded-full bg-orchid md:w-14" />
            Coming soon
          </p>

          {signup ? (
            <form action={action} method="post" className="mt-7 flex max-w-[560px] flex-col gap-2.5 md:mt-10">
              <label htmlFor="coming-soon-email" className="sr-only">
                Your email
              </label>
              <div className="flex flex-col gap-2.5 md:flex-row md:gap-2">
                <input
                  id="coming-soon-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="h-[52px] min-w-0 grow rounded-[10px] border border-[#8c9196] bg-white px-4 text-[16px] text-ink md:h-14 md:text-[17px]"
                />
                <input type="hidden" name="tag" value="coming-soon" />
                <button
                  type="submit"
                  className="h-[52px] shrink-0 cursor-pointer rounded-[10px] bg-orchid px-6 text-[16px] font-extrabold text-white hover:bg-orchid-dark md:h-14 md:text-[17px]"
                >
                  Let me know
                </button>
              </div>
              <span className="text-[13px] text-ink-soft md:text-[14px]">Unsubscribe anytime.</span>
            </form>
          ) : null}
        </div>

        <div className="relative flex min-w-0 pb-7 pl-7 md:flex-[1_1_380px] md:pb-10 md:pl-10">
          <div className="relative h-[380px] grow overflow-hidden rounded-t-full rounded-b-[22px] bg-[#6f5b4e] shadow-[0_18px_36px_rgba(21,24,27,0.14)] md:h-auto md:min-h-[620px] md:rounded-b-[28px]">
            <Image
              src="/images/lei-rows.jpg"
              alt="Rows of fresh flower lei"
              fill
              priority
              sizes="(min-width: 768px) 460px, 100vw"
              className="object-cover object-[30%_center] md:object-[35%_center]"
            />
          </div>
          <div className="absolute bottom-0 left-0 size-[120px] overflow-hidden rounded-full bg-[#5e4a3f] shadow-[0_0_0_6px_#f5f0e8] md:size-[184px] md:shadow-[0_0_0_8px_#f5f0e8]">
            <Image
              src="/images/plumeria-lei-greeting.jpg"
              alt="Hands placing a yellow plumeria lei over someone’s shoulders"
              fill
              sizes="184px"
              className="object-cover object-[center_35%]"
            />
          </div>
          <span
            aria-hidden="true"
            className="absolute top-[120px] -right-7 hidden text-[12px] font-bold tracking-[0.22em] text-[#8c9196] [writing-mode:vertical-rl] md:block"
          >
            HONOLULU · 21°18′N 157°52′W
          </span>
        </div>
      </main>

      <footer className="mx-5 flex flex-col gap-2.5 border-t border-[rgba(21,24,27,0.12)] pt-5 pb-8 text-[14px] text-ink-soft md:mx-auto md:w-full md:max-w-[1120px] md:flex-row md:justify-between md:pt-6">
        <span>
          Questions or a tip?{" "}
          <a href={mailto("Question or a tip")} className="font-bold text-ink">
            {CONTACT_EMAIL}
          </a>
        </span>
        <Link href="/privacy" className="text-ink">
          Privacy
        </Link>
      </footer>
    </div>
  );
}
