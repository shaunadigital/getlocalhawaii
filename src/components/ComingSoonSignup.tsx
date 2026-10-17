"use client";

import { useState } from "react";

import { CONTACT_EMAIL } from "@/lib/site";

type State = "idle" | "sending" | "done" | "invalid" | "error";

/**
 * The coming-soon email box. Posts to /api/signup, which adds a row to the
 * signups sheet. No confirmation email is sent; the page thanks the person in
 * place instead.
 */
export function ComingSoonSignup() {
  const [state, setState] = useState<State>("idle");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setState("sending");
    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.get("email"),
          company: data.get("company"),
          source: "coming-soon",
        }),
      });
      if (response.ok) return setState("done");
      setState(response.status === 400 ? "invalid" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p role="status" className="mt-7 mb-0 text-[18px] font-bold md:mt-10 md:text-[20px]">
        Mahalo, you’re on the list. I’ll email you when the site is up.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="mt-7 flex max-w-[560px] flex-col gap-2.5 md:mt-10">
      <label htmlFor="coming-soon-email" className="sr-only">
        Your email
      </label>
      {/* Honeypot: hidden from people and screen readers, filled only by bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="coming-soon-company">Company</label>
        <input id="coming-soon-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>
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
        <button
          type="submit"
          disabled={state === "sending"}
          className="h-[52px] shrink-0 cursor-pointer rounded-[10px] bg-orchid px-6 text-[16px] font-extrabold text-white hover:bg-orchid-dark disabled:opacity-70 md:h-14 md:text-[17px]"
        >
          {state === "sending" ? "Sending…" : "Let me know"}
        </button>
      </div>
      {state === "invalid" ? (
        <span role="alert" className="text-[14px] font-bold text-[#a1262a]">
          That email address doesn’t look right. Check it and try again.
        </span>
      ) : state === "error" ? (
        <span role="alert" className="text-[14px] font-bold text-[#a1262a]">
          That didn’t go through. Try again, or email {CONTACT_EMAIL}.
        </span>
      ) : (
        <span className="text-[13px] text-ink-soft md:text-[14px]">
          Unsubscribe anytime.
        </span>
      )}
    </form>
  );
}
