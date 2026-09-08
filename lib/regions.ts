/**
 * Countries, currencies and Nigerian states.
 *
 * IMPORTANT, and the reason this file is careful about the distinction:
 * prices are DISPLAYED in the visitor's currency but always CHARGED in naira.
 * The Paystack account is Nigerian, and Nigerian merchants cannot take GBP or
 * EUR. Converting for display is a courtesy so an overseas customer knows
 * roughly what they are spending; the amount that actually leaves their card
 * is the naira figure, which the checkout states plainly.
 *
 * Shipping has the same asymmetry: Shipbubble quotes Nigerian couriers only,
 * so international orders use a flat rate rather than live quotes.
 */

export type CurrencyCode = "NGN" | "USD" | "GBP" | "EUR";

export type Currency = {
  code: CurrencyCode;
  symbol: string;
  /** Decimal places to show. Naira prices are whole numbers here. */
  decimals: number;
};

export const CURRENCIES: Record<CurrencyCode, Currency> = {
  NGN: { code: "NGN", symbol: "₦", decimals: 0 },
  USD: { code: "USD", symbol: "$", decimals: 2 },
  GBP: { code: "GBP", symbol: "£", decimals: 2 },
  EUR: { code: "EUR", symbol: "€", decimals: 2 },
};

export const BASE_CURRENCY: CurrencyCode = "NGN";

export type Country = {
  code: string;
  name: string;
  currency: CurrencyCode;
  /** Live courier quotes are only available where Shipbubble operates. */
  domestic?: boolean;
};

/**
 * The countries offered in the checkout dropdown. "Other" is deliberately
 * last and keeps the site usable everywhere rather than blocking the sale.
 */
export const COUNTRIES: Country[] = [
  { code: "NG", name: "Nigeria", currency: "NGN", domestic: true },
  { code: "US", name: "United States", currency: "USD" },
  { code: "GB", name: "United Kingdom", currency: "GBP" },
  { code: "CA", name: "Canada", currency: "USD" },
  { code: "IE", name: "Ireland", currency: "EUR" },
  { code: "FR", name: "France", currency: "EUR" },
  { code: "DE", name: "Germany", currency: "EUR" },
  { code: "ES", name: "Spain", currency: "EUR" },
  { code: "IT", name: "Italy", currency: "EUR" },
  { code: "NL", name: "Netherlands", currency: "EUR" },
  { code: "BE", name: "Belgium", currency: "EUR" },
  { code: "PT", name: "Portugal", currency: "EUR" },
  { code: "GH", name: "Ghana", currency: "USD" },
  { code: "ZA", name: "South Africa", currency: "USD" },
  { code: "AE", name: "United Arab Emirates", currency: "USD" },
  { code: "OTHER", name: "Somewhere else", currency: "USD" },
];

/** Every ISO code that should default to euros, beyond those listed above. */
const EURO_ZONE = new Set([
  "AT", "BE", "HR", "CY", "EE", "FI", "FR", "DE", "GR", "IE", "IT", "LV",
  "LT", "LU", "MT", "NL", "PT", "SK", "SI", "ES",
]);

/** Maps a country code (e.g. from Cloudflare's header) to a currency. */
export function currencyForCountry(code?: string | null): CurrencyCode {
  if (!code) return "NGN";
  const upper = code.toUpperCase();

  if (upper === "NG") return "NGN";
  if (upper === "GB") return "GBP";
  if (EURO_ZONE.has(upper)) return "EUR";

  const known = COUNTRIES.find((c) => c.code === upper);
  if (known) return known.currency;

  // Anywhere unrecognised sees dollars, which travel further than naira.
  return "USD";
}

export function isDomestic(countryCode?: string | null): boolean {
  return (countryCode ?? "NG").toUpperCase() === "NG";
}

/** All 36 states plus the FCT, as Shipbubble expects them. */
export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "Federal Capital Territory", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano",
  "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun",
  "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe",
  "Zamfara",
];

/**
 * Formats an amount for display.
 *
 * `amount` is always in the currency named by `code` — conversion happens
 * before this is called, never inside it.
 */
export function formatMoney(amount: number, code: CurrencyCode): string {
  const c = CURRENCIES[code] ?? CURRENCIES.NGN;
  const value = amount.toLocaleString("en-US", {
    minimumFractionDigits: c.decimals,
    maximumFractionDigits: c.decimals,
  });
  return `${c.symbol}${value}`;
}
