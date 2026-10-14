# Get Local Hawaiʻi

Lei and lūʻau on Oʻahu, for visitors and anyone sending a lei to the mainland: the airport lei stands, every lūʻau compared, and the shops that ship. Every page shows when it was checked, and "open now" is computed live, never hardcoded.

**Live: [getlocalhawaii.com](https://getlocalhawaii.com)**

![Get Local Hawaiʻi home page](.github/screenshot.jpg)

- **Freshness first.** Each listing carries a verification log, and anything not confirmed in 30 days drops out of "open now" and shows as unconfirmed.
- **Farmers markets as a calendar.** Today's markets first, then the rest of the week, with real map pins from the City's own data.
- **Hawaiʻi time, always.** All open and closed math runs in `Pacific/Honolulu`.

Built with Next.js (App Router, TypeScript, Tailwind), deployed on Vercel. Listings ship as a JSON data file, no database.

```bash
npm run dev    # run locally
npm test       # unit tests
```

`docs/STRATEGY.md` is the plan and `docs/STATUS.md` the current state.

---

Built with ♥ by [shauna.digital](https://shauna.digital)
