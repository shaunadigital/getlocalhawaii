import { BUTTONDOWN_USERNAME, showSignup } from "@/lib/site";

/**
 * Buttondown's embed form: a plain POST, no JavaScript, so it works on any
 * phone. Buttondown sends the confirmation email. The tag says which signup
 * a subscriber came from.
 */
export interface SignupFormProps {
  id: string;
  label: string;
  button: string;
  tag: "reminders" | "luau-guide";
  /** Dark footer or light card. */
  tone: "dark" | "light";
  /** One line under the label. */
  hint?: string;
}

export function SignupForm({ id, label, button, tag, tone, hint }: SignupFormProps) {
  if (!showSignup()) return null;

  const action = BUTTONDOWN_USERNAME
    ? `https://buttondown.com/api/emails/embed-subscribe/${BUTTONDOWN_USERNAME}`
    : undefined;

  return (
    <form action={action} method="post" className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className={`text-[15px] font-bold ${tone === "dark" ? "text-white" : "text-ink"}`}
      >
        {label}
      </label>
      {hint ? (
        <span className={`-mt-1.5 ${tone === "dark" ? "text-foot-mute" : "text-ink-soft"}`}>{hint}</span>
      ) : null}
      <div className="flex gap-2">
        <input
          id={id}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className={`h-12 min-w-0 grow rounded-lg border bg-white px-3 text-[16px] text-ink ${
            tone === "dark" ? "border-mute" : "border-[#8c9196]"
          }`}
        />
        <input type="hidden" name="tag" value={tag} />
        <button
          type="submit"
          className="h-12 shrink-0 cursor-pointer rounded-lg bg-orchid px-4 text-[15px] font-extrabold text-white hover:bg-orchid-dark md:px-5"
        >
          {button}
        </button>
      </div>
    </form>
  );
}
