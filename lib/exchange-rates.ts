import "server-only";
import { BASE_CURRENCY, type CurrencyCode } from "./regions";

/**
 * Exchange rates, naira to everything else.
 *
 * Fetched server-side and cached for six hours. Rates move slowly enough that
 * fresher is not more correct in any way a shopper notices, and this keeps the
 * page render off a third-party's latency.
 *
 * The fallback values matter more than they look: if the rate provider is
 * down, prices must still render. A missing rate would otherwise mean a
 * product showing no price at all, which is worse than a slightly stale one.
 * They are intentionally conservative — an overseas customer seeing a number
 * a little high is recoverable; seeing one too low is not, since the naira
 * amount is what gets charged.
 */

export type Rates = Record<CurrencyCode, number>;

const FALLBACK: Rates = {
  NGN: 1,
  USD: 1 / 1650,
  GBP: 1 / 2100,
  EUR: 1 / 1800,
};

const SIX_HOURS = 60 * 60 * 6;

export async function getExchangeRates(): Promise<Rates> {
  try {
    // open.er-api.com is free and needs no key. Next's fetch cache handles
    // the revalidation, so this costs one request per six hours per region.
    const res = await fetch(`https://open.er-api.com/v6/latest/${BASE_CURRENCY}`, {
      next: { revalidate: SIX_HOURS },
    });

    if (!res.ok) return FALLBACK;

    const data = await res.json();
    const r = data?.rates;
    if (!r || typeof r.USD !== "number") return FALLBACK;

    return {
      NGN: 1,
      USD: r.USD ?? FALLBACK.USD,
      GBP: r.GBP ?? FALLBACK.GBP,
      EUR: r.EUR ?? FALLBACK.EUR,
    };
  } catch {
    return FALLBACK;
  }
}
