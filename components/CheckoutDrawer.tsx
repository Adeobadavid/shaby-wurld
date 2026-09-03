"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";

/**
 * Checkout drawer — Figma node 265:1299. Step 2 of 3 (Bag -> Checkout -> Payment).
 * "Continue to Payment" is a UI placeholder here — wiring this button to a real
 * Paystack charge is a separate backend task, not something that can live in a
 * static frontend build.
 */
export default function CheckoutDrawer() {
  const { isCheckoutOpen, closeCheckout, openBag, items, subtotal } = useCart();
  const [form, setForm] = useState({
    email: "",
    phone: "",
    fullName: "",
    address: "",
    postalCode: "",
  });

  if (!isCheckoutOpen) return null;

  const canContinue = form.email.trim() !== "" && form.fullName.trim() !== "" && form.address.trim() !== "";

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={closeCheckout}>
      <div
        className="drawer-slide-in flex h-full w-full max-w-[427px] flex-col justify-between overflow-y-auto bg-white shadow-[-4px_0px_48px_0px_rgba(0,0,0,0.14)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full flex-col items-center gap-[46px]">
          <div className="flex w-full items-start justify-between border-b-[0.5px] border-[#edcac3] px-[26px] pb-[18px] pt-[38px]">
            <div className="flex flex-col gap-[18px]">
              <div className="flex items-center gap-[14px]">
                <button aria-label="Back to bag" onClick={openBag} className="text-[#565656]">
                  ←
                </button>
                <p className="font-body text-[20px] font-medium tracking-[0.4px] text-black">Checkout</p>
              </div>
              <div className="flex items-center gap-[10px]">
                <span className="h-[3px] w-6 bg-sw-blush" />
                <span className="h-[3px] w-6 bg-sw-blush" />
                <span className="h-[3px] w-6 bg-[#ede2df]" />
              </div>
            </div>
            <button aria-label="Close" onClick={closeCheckout} className="text-2xl leading-none text-[#565656]">
              &times;
            </button>
          </div>

          <div className="flex w-full flex-col gap-10 px-[26px]">
            <div className="flex flex-col gap-7">
              <p className="font-body text-[12px] font-semibold text-black">CONTACT</p>
              <label className="flex flex-col gap-[14px]">
                <span className="font-body text-[10px] font-medium text-[#a79b99]">EMAIL</span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  {...field("email")}
                  className="border-b border-[#edcac3] pb-1 font-body text-[14px] font-semibold text-[#3d3d3d] placeholder:text-[#b3b3b6] focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-[14px]">
                <span className="font-body text-[10px] font-medium text-[#a79b99]">PHONE</span>
                <input
                  type="tel"
                  placeholder="+234 900 000 0000"
                  {...field("phone")}
                  className="border-b border-[#edcac3] pb-1 font-body text-[14px] font-semibold text-[#3d3d3d] placeholder:text-[#b3b3b6] focus:outline-none"
                />
              </label>
            </div>

            <div className="flex flex-col gap-7">
              <p className="font-body text-[12px] font-semibold text-black">SHIPPING ADDRESS</p>
              <label className="flex flex-col gap-[14px]">
                <span className="font-body text-[10px] font-medium text-[#a79b99]">FULL NAME</span>
                <input
                  type="text"
                  placeholder="Jane Emeka"
                  {...field("fullName")}
                  className="border-b border-[#edcac3] pb-1 font-body text-[14px] font-semibold text-[#3d3d3d] placeholder:text-[#b3b3b6] focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-[14px]">
                <span className="font-body text-[10px] font-medium text-[#a79b99]">ADDRESS</span>
                <input
                  type="text"
                  placeholder="123 Ikoyi Crescent"
                  {...field("address")}
                  className="border-b border-[#edcac3] pb-1 font-body text-[14px] font-semibold text-[#3d3d3d] placeholder:text-[#b3b3b6] focus:outline-none"
                />
              </label>
              <div className="flex gap-[21px]">
                <label className="flex flex-1 flex-col gap-[14px]">
                  <span className="font-body text-[10px] font-medium text-[#a79b99]">EMAIL</span>
                  <input
                    type="email"
                    value={form.email}
                    disabled
                    className="border-b border-[#edcac3] pb-1 font-body text-[14px] font-semibold text-[#b3b3b6] focus:outline-none"
                  />
                </label>
                <label className="flex flex-1 flex-col gap-[14px]">
                  <span className="font-body text-[10px] font-medium text-[#a79b99]">POSTAL CODE</span>
                  <input
                    type="text"
                    placeholder="100001"
                    {...field("postalCode")}
                    className="border-b border-[#edcac3] pb-1 font-body text-[14px] font-semibold text-[#3d3d3d] placeholder:text-[#b3b3b6] focus:outline-none"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="flex w-full items-center justify-between bg-[#f6f3f3] px-[26px] py-4 font-body text-[14px] font-medium text-[#535353]">
            <p>{items.length} items</p>
            <p>₦{subtotal.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex w-full flex-col border-t-[0.5px] border-[#edcac3] px-[26px] pb-[26px] pt-[28px]">
          <button
            disabled={!canContinue}
            onClick={() => alert("Payment goes through Paystack here — not wired up yet in this build.")}
            className={`flex h-[50px] w-full items-center justify-center gap-[15px] font-body text-[16px] font-semibold text-sw-cream transition-colors ${
              canContinue ? "bg-sw-blush hover:bg-[#95402f]" : "bg-[#edcac3]"
            }`}
          >
            <img src="/icons/cart.svg" alt="" className="h-5 w-5" />
            Continue to Payment
          </button>
        </div>
      </div>
    </div>
  );
}
