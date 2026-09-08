"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  CURRENCIES,
  currencyForCountry,
  formatMoney,
  type CurrencyCode,
} from "./regions";

/**
 * Display currency.
 *
 * Every price in the app is stored and charged in naira. This converts for
 * DISPLAY only — `format()` takes a naira amount and returns a string in
 * whatever the visitor is viewing in. Nothing here touches what is charged;
 * the checkout always sends naira, and says so.
 *
 * The initial currency comes from the country Cloudflare reports on the
 * request, so a first-time visitor in London sees pounds without choosing.
 * A manual choice is remembered in localStorage and wins from then on.
 */

type CurrencyContextType = {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  /** Naira in, formatted string out. */
  format: (naira: number) => string;
  /** Naira in, converted number out — for when you need the value. */
  convert: (naira: number) => number;
  /** True when showing anything other than the charged currency. */
  isConverted: boolean;
  rates: Record<CurrencyCode, number>;
};

const CurrencyContext = createContext<CurrencyContextType | null>(null);

const STORAGE_KEY = "sw-currency";

export function CurrencyProvider({
  children,
  initialCurrency,
  rates,
}: {
  children: React.ReactNode;
  initialCurrency: CurrencyCode;
  rates: Record<CurrencyCode, number>;
}) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(initialCurrency);

  // Read the saved choice after mount rather than during render: the server
  // has no localStorage, and reading it during render would produce different
  // markup on the client and trip a hydration mismatch.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && saved in CURRENCIES) setCurrencyState(saved as CurrencyCode);
    } catch {
      // Private browsing and blocked storage both throw here. The detected
      // currency is a perfectly good answer, so there is nothing to do.
    }
  }, []);

  const setCurrency = useCallback((c: CurrencyCode) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(STORAGE_KEY, c);
    } catch {}
  }, []);

  const convert = useCallback(
    (naira: number) => {
      const rate = rates[currency] ?? 1;
      const value = naira * rate;

      // Round to the currency's own precision so totals do not drift by a
      // cent between the bag and the checkout summary.
      const decimals = CURRENCIES[currency].decimals;
      const factor = 10 ** decimals;
      return Math.round(value * factor) / factor;
    },
    [currency, rates]
  );

  const format = useCallback(
    (naira: number) => formatMoney(convert(naira), currency),
    [convert, currency]
  );

  const value = useMemo(
    () => ({
      currency,
      setCurrency,
      format,
      convert,
      isConverted: currency !== "NGN",
      rates,
    }),
    [currency, setCurrency, format, convert, rates]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}

export { currencyForCountry };
