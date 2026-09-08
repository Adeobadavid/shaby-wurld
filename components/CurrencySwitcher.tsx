"use client";

import { useCurrency } from "@/lib/currency-context";
import { CURRENCIES, type CurrencyCode } from "@/lib/regions";

/**
 * Currency picker.
 *
 * The initial value comes from the visitor's country, so this exists for the
 * cases detection cannot cover — a Nigerian abroad, someone on a VPN, or a
 * shopper who simply thinks in another currency.
 *
 * It changes DISPLAY only. Every order is charged in naira, which the
 * checkout states outright rather than leaving the customer to discover on
 * their bank statement.
 */
const ORDER: CurrencyCode[] = ["NGN", "USD", "GBP", "EUR"];

export default function CurrencySwitcher({ className = "" }: { className?: string }) {
  const { currency, setCurrency } = useCurrency();

  return (
    <label className={`inline-flex items-center gap-2 ${className}`}>
      <span className="sr-only">Display currency</span>
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
        className="cursor-pointer rounded-none border border-current/30 bg-transparent px-2 py-1 font-body text-[13px] text-current transition-colors duration-200 hover:border-current focus:outline-none"
      >
        {ORDER.map((code) => (
          <option key={code} value={code} className="text-[#262626]">
            {CURRENCIES[code].symbol} {code}
          </option>
        ))}
      </select>
    </label>
  );
}
