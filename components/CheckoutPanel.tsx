"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/lib/cart-context";
import ShippingRates, { type Rate } from "./ShippingRates";

/**
 * Step 2 of the cart drawer — Figma node 265:1299.
 *
 * Content only; the panel and step transition live in <CartDrawer>.
 *
 * Delivery cost comes from Shipbubble through our own API route, and payment
 * goes through Paystack's hosted page. Note what this component never does:
 * it never sends prices to the server, and it never decides that an order is
 * paid. Both are settled server-side.
 */
export default function CheckoutPanel({
  freeShippingThreshold = 50000,
}: {
  freeShippingThreshold?: number;
}) {
  const { closeDrawer, backToBag, items, subtotal } = useCart();

  const [form, setForm] = useState({
    email: "",
    phone: "",
    fullName: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
  });

  const [rates, setRates] = useState<Rate[]>([]);
  const [selectedRate, setSelectedRate] = useState<Rate | null>(null);
  const [loadingRates, setLoadingRates] = useState(false);
  const [ratesError, setRatesError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const addressReady =
    form.fullName.trim().length > 1 &&
    form.email.includes("@") &&
    form.phone.trim().length > 6 &&
    form.address.trim().length > 4 &&
    form.city.trim().length > 1 &&
    form.state.trim().length > 1;

  const freeShipping = freeShippingThreshold > 0 && subtotal >= freeShippingThreshold;
  const shippingCost = freeShipping ? 0 : selectedRate?.amount ?? 0;
  const total = subtotal + shippingCost;

  const canContinue = addressReady && items.length > 0 && !submitting;

  /* ----------------------------------------------------------------- *
   * Fetch delivery rates.
   *
   * Debounced, and every response is checked against a request id before it
   * is applied — otherwise a slow earlier request can land after a newer one
   * and show rates for an address the customer has already changed.
   * ----------------------------------------------------------------- */
  const requestId = useRef(0);

  const fetchRates = useCallback(async () => {
    if (!addressReady || items.length === 0) return;

    const id = ++requestId.current;
    setLoadingRates(true);
    setRatesError("");

    try {
      const res = await fetch("/api/shipping/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: form,
          items: items.map((i) => ({ productId: i.id, qty: i.qty, shade: i.variant })),
        }),
      });

      const data = await res.json();
      if (id !== requestId.current) return; // superseded

      if (!res.ok) {
        setRates([]);
        setSelectedRate(null);
        setRatesError(data.error ?? "Could not fetch delivery rates.");
        return;
      }

      setRates(data.rates ?? []);
      setSelectedRate(data.rates?.[0] ?? null); // cheapest, since the API sorts
    } catch {
      if (id !== requestId.current) return;
      setRates([]);
      setRatesError("Could not reach the delivery service. Please try again.");
    } finally {
      if (id === requestId.current) setLoadingRates(false);
    }
  }, [addressReady, form, items]);

  useEffect(() => {
    if (!addressReady) {
      setRates([]);
      setSelectedRate(null);
      return;
    }
    // Wait for typing to settle — each call costs a Shipbubble request.
    const timer = setTimeout(fetchRates, 800);
    return () => clearTimeout(timer);
  }, [addressReady, fetchRates]);

  /* ----------------------------------------------------------------- *
   * Submit
   * ----------------------------------------------------------------- */
  const handleSubmit = async () => {
    if (!canContinue) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: form,
          items: items.map((i) => ({ productId: i.id, qty: i.qty, shade: i.variant })),
          shipping: selectedRate
            ? {
                courierId: selectedRate.courierId,
                courierName: selectedRate.courierName,
                serviceCode: selectedRate.serviceCode,
                requestToken: selectedRate.requestToken,
                amount: selectedRate.amount,
              }
            : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error ?? "Could not start checkout.");
        setSubmitting(false);
        return;
      }

      // Paystack's hosted page. Using the redirect flow rather than the inline
      // popup means no Paystack key is needed in the browser at all.
      window.location.href = data.authorizationUrl;
    } catch {
      setSubmitError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  const inputClass =
    "border-b border-[#edcac3] pb-1 font-body text-[14px] font-semibold text-[#3d3d3d] placeholder:text-[#b3b3b6] transition-colors duration-300 focus:border-sw-blush focus:outline-none";

  const itemCount = useMemo(() => items.reduce((n, i) => n + i.qty, 0), [items]);

  return (
    <div className="flex h-full w-full flex-col">
      {/* Header — fixed */}
      <div className="flex w-full shrink-0 items-start justify-between border-b-[0.5px] border-[#edcac3] px-[26px] pb-[18px] pt-[38px]">
        <div className="flex flex-col gap-[18px]">
          <div className="flex items-center gap-[14px]">
            <button aria-label="Back to bag" onClick={backToBag} className="group text-[#565656]">
              <span className="inline-block transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-x-1">
                ←
              </span>
            </button>
            <p className="font-body text-[20px] font-medium tracking-[0.4px] text-black">Checkout</p>
          </div>
          <div className="flex items-center gap-[10px]">
            <span className="h-[3px] w-6 bg-sw-blush transition-colors duration-500" />
            <span className="h-[3px] w-6 bg-sw-blush transition-colors duration-500" />
            <span className="h-[3px] w-6 bg-[#ede2df] transition-colors duration-500" />
          </div>
        </div>
        <button
          aria-label="Close"
          onClick={closeDrawer}
          className="text-2xl leading-none text-[#565656] transition-transform duration-200 hover:rotate-90"
        >
          &times;
        </button>
      </div>

      {/* Form — the only part that scrolls */}
      <div className="flex w-full flex-1 flex-col gap-10 overflow-y-auto px-[26px] py-[36px]">
        <div className="flex flex-col gap-7">
          <p className="font-body text-[12px] font-semibold text-black">CONTACT</p>
          <label className="flex flex-col gap-[14px]">
            <span className="font-body text-[10px] font-medium text-[#a79b99]">EMAIL</span>
            <input
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...field("email")}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-[14px]">
            <span className="font-body text-[10px] font-medium text-[#a79b99]">PHONE</span>
            <input
              type="tel"
              autoComplete="tel"
              placeholder="+234 900 000 0000"
              {...field("phone")}
              className={inputClass}
            />
          </label>
        </div>

        <div className="flex flex-col gap-7">
          <p className="font-body text-[12px] font-semibold text-black">SHIPPING ADDRESS</p>
          <label className="flex flex-col gap-[14px]">
            <span className="font-body text-[10px] font-medium text-[#a79b99]">FULL NAME</span>
            <input
              type="text"
              autoComplete="name"
              placeholder="Jane Emeka"
              {...field("fullName")}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-[14px]">
            <span className="font-body text-[10px] font-medium text-[#a79b99]">ADDRESS</span>
            <input
              type="text"
              autoComplete="street-address"
              placeholder="123 Ikoyi Crescent"
              {...field("address")}
              className={inputClass}
            />
          </label>
          <div className="flex gap-[21px]">
            <label className="flex flex-1 flex-col gap-[14px]">
              <span className="font-body text-[10px] font-medium text-[#a79b99]">CITY</span>
              <input
                type="text"
                autoComplete="address-level2"
                placeholder="Victoria Island"
                {...field("city")}
                className={inputClass}
              />
            </label>
            {/* State is required, not optional — Shipbubble cannot validate an
                address without it, and rates fail outright. */}
            <label className="flex flex-1 flex-col gap-[14px]">
              <span className="font-body text-[10px] font-medium text-[#a79b99]">STATE</span>
              <input
                type="text"
                autoComplete="address-level1"
                placeholder="Lagos"
                {...field("state")}
                className={inputClass}
              />
            </label>
          </div>
          <label className="flex flex-col gap-[14px]">
            <span className="font-body text-[10px] font-medium text-[#a79b99]">
              POSTAL CODE (OPTIONAL)
            </span>
            <input
              type="text"
              autoComplete="postal-code"
              placeholder="106104"
              {...field("postalCode")}
              className={inputClass}
            />
          </label>
        </div>

        <ShippingRates
          rates={rates}
          selected={selectedRate}
          onSelect={setSelectedRate}
          loading={loadingRates}
          error={ratesError}
          addressReady={addressReady}
          freeShipping={freeShipping}
        />

        {/* Totals */}
        <div className="-mx-[26px] flex w-[calc(100%+52px)] flex-col gap-2 bg-[#f6f3f3] px-[26px] py-4 font-body text-[14px] text-[#535353]">
          <div className="flex items-center justify-between">
            <p>
              {itemCount} item{itemCount === 1 ? "" : "s"}
            </p>
            <p>₦{subtotal.toLocaleString()}</p>
          </div>
          <div className="flex items-center justify-between">
            <p>Delivery{selectedRate ? ` · ${selectedRate.courierName}` : ""}</p>
            <p>{shippingCost === 0 ? (freeShipping ? "Free" : "—") : `₦${shippingCost.toLocaleString()}`}</p>
          </div>
          <div className="flex items-center justify-between border-t border-[#e3dbd9] pt-2 font-medium text-black">
            <p>Total</p>
            <p>₦{total.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Continue — fixed */}
      <div className="flex w-full shrink-0 flex-col gap-3 border-t-[0.5px] border-[#edcac3] px-[26px] pb-[26px] pt-[28px]">
        {submitError && (
          <p className="font-body text-[13px] text-[#95402f]" role="alert">
            {submitError}
          </p>
        )}
        <button
          disabled={!canContinue}
          onClick={handleSubmit}
          className={`flex h-[50px] w-full items-center justify-center gap-[15px] font-body text-[16px] font-semibold text-sw-cream transition-colors duration-300 ${
            canContinue ? "bg-sw-blush hover:bg-[#95402f] active:scale-[0.99]" : "bg-[#edcac3]"
          }`}
        >
          <img src="/icons/cart.svg" alt="" className="h-5 w-5" />
          {submitting ? "Starting payment…" : "Continue to Payment"}
        </button>
        <p className="text-center font-body text-[11px] text-[#a79b99]">
          Payments are processed securely by Paystack.
        </p>
      </div>
    </div>
  );
}
