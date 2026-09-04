"use client";

export type Rate = {
  courierId: string;
  courierName: string;
  serviceCode: string;
  amount: number;
  deliveryEta: string;
  requestToken: string;
};

/**
 * Delivery options inside the checkout step.
 *
 * Rates come from /api/shipping/rates, which proxies Shipbubble server-side —
 * the API key never reaches the browser.
 */
export default function ShippingRates({
  rates,
  selected,
  onSelect,
  loading,
  error,
  addressReady,
  freeShipping,
}: {
  rates: Rate[];
  selected: Rate | null;
  onSelect: (rate: Rate) => void;
  loading: boolean;
  error: string;
  addressReady: boolean;
  freeShipping: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="font-body text-[12px] font-semibold text-black">DELIVERY</p>

      {!addressReady && (
        <p className="font-body text-[13px] text-[#a79b99]">
          Fill in your address above to see delivery options.
        </p>
      )}

      {addressReady && loading && (
        <div className="flex flex-col gap-2" aria-live="polite">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-[52px] w-full animate-pulse rounded-sm bg-[#f6f3f3]"
            />
          ))}
          <p className="font-body text-[12px] text-[#a79b99]">Checking couriers…</p>
        </div>
      )}

      {addressReady && !loading && error && (
        <p className="font-body text-[13px] text-[#95402f]" role="alert">
          {error}
        </p>
      )}

      {addressReady && !loading && !error && rates.length === 0 && (
        <p className="font-body text-[13px] text-[#a79b99]">
          No couriers available for that address yet.
        </p>
      )}

      {!loading &&
        rates.map((rate) => {
          const isSelected = selected?.courierId === rate.courierId;
          return (
            <button
              key={rate.courierId}
              type="button"
              onClick={() => onSelect(rate)}
              aria-pressed={isSelected}
              className={`flex w-full items-center justify-between border px-4 py-3 text-left transition-colors duration-200 ${
                isSelected
                  ? "border-sw-blush bg-[#fdf6f4]"
                  : "border-[#ddd5d4] hover:border-sw-blush"
              }`}
            >
              <span className="flex flex-col">
                <span className="font-body text-[14px] font-medium text-[#3d3d3d]">
                  {rate.courierName}
                </span>
                {rate.deliveryEta && (
                  <span className="font-body text-[12px] text-[#a79b99]">{rate.deliveryEta}</span>
                )}
              </span>
              <span className="font-body text-[14px] font-medium text-[#3d3d3d]">
                {freeShipping ? (
                  <span className="text-sw-blush">Free</span>
                ) : (
                  `₦${rate.amount.toLocaleString()}`
                )}
              </span>
            </button>
          );
        })}

      {freeShipping && rates.length > 0 && (
        <p className="font-body text-[12px] text-sw-blush">
          Your order qualifies for free shipping — pick a courier and we cover it.
        </p>
      )}
    </div>
  );
}
