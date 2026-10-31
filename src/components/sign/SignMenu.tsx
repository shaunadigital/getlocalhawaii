"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { HangingLogo } from "./HangingLogo";
import { SignArrow } from "./ArrowSign";
import { SearchBox } from "./SearchBox";
import { type MenuGroups, type MenuLink, SIGN_NAV } from "./nav";

function Group({ title, links, columns = 2 }: { title: string; links: MenuLink[]; columns?: 1 | 2 }) {
  if (links.length === 0) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <h2 className="m-0 font-display text-[12px] font-normal tracking-[0.02em] text-gl-soft">{title}</h2>
      <ul className={`m-0 grid list-none gap-x-4 p-0 ${columns === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="flex min-h-11 items-center border-b border-[rgba(220,207,225,0.22)] text-[17px] font-bold text-gl-cream no-underline hover:text-gl-soft"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The Menu button and the full-screen menu it opens (board: MenuOpen).
 * Escape or Close shuts it; any link click shuts it too.
 */
export function SignMenu({ groups, className }: { groups: MenuGroups; className?: string }) {
  const [open, setOpen] = useState(false);
  const openButton = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const opener = openButton.current;
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      opener?.focus();
    };
  }, [open]);

  const buttonClass =
    "flex min-h-11 cursor-pointer items-center gap-2 border-0 bg-transparent px-0.5 text-[17px] font-extrabold text-gl-cream focus-visible:outline-3 focus-visible:outline-gl-cream";

  return (
    <>
      <button
        ref={openButton}
        type="button"
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={() => setOpen(true)}
        className={`${buttonClass} ${className ?? ""}`}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h11" />
        </svg>
        Menu
      </button>

      {open ? (
        <div
          id="site-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-50 overflow-y-auto bg-gl-ground text-gl-cream"
          onClick={(event) => {
            if ((event.target as HTMLElement).closest("a")) setOpen(false);
          }}
        >
          <div className="mx-auto max-w-[640px]">
            <div className="flex h-[104px] items-start justify-between px-4">
              <HangingLogo />
              <button
                ref={closeButton}
                type="button"
                aria-expanded="true"
                onClick={() => setOpen(false)}
                className={`${buttonClass} mt-[26px]`}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
                Close
              </button>
            </div>
            <nav aria-label="Main" className="flex flex-col gap-[30px] px-4 pt-1 pb-10">
              <SearchBox />
              <ul className="m-0 flex list-none flex-col p-0">
                {SIGN_NAV.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex min-h-[52px] items-center justify-between border-b-2 border-[rgba(220,207,225,0.3)] font-display text-[22px] text-gl-cream uppercase no-underline"
                    >
                      {link.label}
                      <SignArrow size={20} className="text-gl-soft" />
                    </Link>
                  </li>
                ))}
              </ul>
              <Group title="BY SIDE OF THE ISLAND" links={groups.sides} />
              <Group title="WHAT YOU’RE AFTER" links={groups.categories} />
              <Group title="MARKETS BY TYPE" links={groups.kinds} />
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
