import { NextResponse } from "next/server";

/**
 * Coming-soon signups. The browser posts here; this route checks the address
 * and passes it to a Google Apps Script web app that appends a row to the
 * "Get Local Hawaii signups" sheet. The script URL and its shared secret live
 * only in Vercel env vars, so the sheet cannot be written to from the page.
 */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  const url = process.env.SIGNUP_SHEET_URL;
  const secret = process.env.SIGNUP_SHEET_SECRET;
  if (!url || !secret) {
    return NextResponse.json({ ok: false, error: "not-configured" }, { status: 503 });
  }

  let body: { email?: unknown; company?: unknown; source?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad-request" }, { status: 400 });
  }

  // Honeypot: a field people never see. A bot that fills it gets a quiet "ok".
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (email.length > 254 || !EMAIL.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid-email" }, { status: 400 });
  }
  const source = typeof body.source === "string" ? body.source.slice(0, 40) : "coming-soon";

  try {
    // Apps Script answers a POST with a redirect to the result; fetch follows it.
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, email, source }),
      cache: "no-store",
    });
    const result = (await response.json()) as { ok?: boolean };
    if (!result.ok) throw new Error("sheet refused");
  } catch {
    return NextResponse.json({ ok: false, error: "sheet-unavailable" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
