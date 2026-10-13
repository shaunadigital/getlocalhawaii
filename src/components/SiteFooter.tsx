import Link from "next/link";

import { SignupForm } from "@/components/SignupForm";
import { NAV_LINKS, mailto, showSignup } from "@/lib/site";

/**
 * Reminder signup, the correction address, the menu, and the commission line.
 * A page with its own signup passes signup={false} so it never asks twice.
 */
export function SiteFooter({ signup = true }: { signup?: boolean }) {
  return (
    <footer className="mt-auto bg-ink text-[14px] text-foot">
      <div className="mx-auto flex max-w-(--container-page) flex-col gap-4 px-4 pt-6 pb-8 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-x-8 md:px-8 md:py-8">
        {signup && showSignup() ? (
          <div className="border-b border-[#2e3439] pb-4 md:basis-full md:pb-5">
            <div className="md:max-w-[560px]">
              <SignupForm
                id="footer-email"
                label="Lei Day and graduation reminders"
                hint="A few emails a year, just before you need a lei."
                button="Remind me"
                tag="reminders"
                tone="dark"
              />
            </div>
          </div>
        ) : null}

        <a href={mailto("Something changed")} className="text-[15px] font-bold text-white hover:text-white">
          Something changed? Tell me
        </a>

        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-foot hover:text-white">
              {link.label}
            </Link>
          ))}
          <Link href="/disclosure" className="text-foot hover:text-white">
            Disclosure
          </Link>
          <Link href="/privacy" className="text-foot hover:text-white">
            Privacy
          </Link>
        </nav>

        <p className="m-0 text-foot-mute md:basis-full">
          Some links may earn me a commission. It never changes what I recommend.{" "}
          <Link href="/disclosure" className="text-foot hover:text-white">
            How this works
          </Link>
        </p>
      </div>
    </footer>
  );
}
