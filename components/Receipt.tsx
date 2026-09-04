"use client";

import { useRef, useState } from "react";
import Link from "next/link";

/**
 * Printed receipt.
 *
 * The paper starts translated fully behind the printer housing and is pushed
 * down into view, so it reads as being fed out of the slot. The housing sits
 * above it on the z-axis — nothing is clipped, which keeps the paper fully
 * present in the DOM when exporting.
 *
 * Colour and type come from the site's system, not from generic receipt
 * conventions:
 *   housing   sw-blush + sw-cream, the same pairing as the footer bar and
 *             the Add to Bag buttons
 *   rules     #edcac3, the divider used throughout the cart drawer
 *   labels    #a79b99, the muted warm grey used for every field label
 *   body      #3d3d3d / #262626, the site's text greys
 *   totals    font-display, matching how prices are set on product cards
 *
 * No monospace: the site has none, and the receipt reads as a receipt through
 * its dotted rules, torn edge and barcode. Figures use tabular-nums so columns
 * still align.
 */

export type ReceiptData = {
  orderNumber: string;
  items: { name: string; shade?: string; qty: number; unitPrice: number }[];
  subtotal: number;
  shippingCost: number;
  total: number;
  courier?: string;
  paidAt?: string;
};

const naira = (n: number) => `₦${n.toLocaleString()}.00`;

/** Zigzag torn edge, drawn as an SVG path so it renders and exports reliably. */
function TornEdge() {
  const teeth = 24;
  const width = 240;
  const height = 9;
  const toothWidth = width / teeth;

  let d = `M0 0 H${width} `;
  for (let i = teeth; i > 0; i--) {
    d += `L${((i - 0.5) * toothWidth).toFixed(2)} ${height} L${((i - 1) * toothWidth).toFixed(2)} 0 `;
  }
  d += "Z";

  return (
    <svg
      className="block h-[9px] w-full"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d={d} fill="#ffffff" />
    </svg>
  );
}

export default function Receipt({ order }: { order: ReceiptData }) {
  const paperRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState<"png" | "pdf" | null>(null);

  const date = order.paidAt ? new Date(order.paidAt) : new Date();
  const stamp = `${date
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase()} · ${date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;

  /**
   * Render the paper to a PNG data URL.
   *
   * The earlier html2canvas version exported a blank white image: the paper
   * carries an animation transform and its wrapper clips overflow, and
   * html2canvas measures the transformed, clipped box. So the node is pinned
   * to its natural position first (via .sw-capturing), and html-to-image is
   * used instead — it serialises the DOM through an SVG foreignObject, which
   * handles transforms and masks far more predictably.
   */
  async function capture(): Promise<string | null> {
    const node = paperRef.current;
    const wrapper = wrapperRef.current;
    if (!node || !wrapper) return null;

    wrapper.classList.add("sw-capturing");
    // Let the class take effect before measuring.
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    try {
      const { toPng } = await import("html-to-image");
      return await toPng(node, {
        pixelRatio: 2, // legible on retina and when printed
        backgroundColor: "#fbf7f5", // matches the notch fill
        cacheBust: true,
      });
    } finally {
      wrapper.classList.remove("sw-capturing");
    }
  }

  async function saveImage() {
    setSaving("png");
    try {
      const dataUrl = await capture();
      if (!dataUrl) return;

      const link = document.createElement("a");
      link.download = `${order.orderNumber}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("[receipt] png export failed", error);
    } finally {
      setSaving(null);
    }
  }

  async function savePdf() {
    setSaving("pdf");
    try {
      const dataUrl = await capture();
      if (!dataUrl) return;

      // Measure the rendered PNG so the PDF page matches it exactly and
      // there are no margins around the receipt.
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = dataUrl;
      });

      const w = img.width / 2;
      const h = img.height / 2;

      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [w, h] });
      pdf.addImage(dataUrl, "PNG", 0, 0, w, h);
      pdf.save(`${order.orderNumber}.pdf`);
    } catch (error) {
      console.error("[receipt] pdf export failed", error);
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="flex w-full max-w-[420px] flex-col items-center">
      {/* Printer housing — blush on cream, the same pairing as the footer bar.
          Sits above the paper so the paper emerges from beneath its edge. */}
      <div className="sw-printer-body relative z-20 w-full bg-sw-blush p-4 shadow-[0_18px_40px_-22px_rgba(150,64,47,0.55)]">
        <div className="mb-3 flex items-center justify-between">
          <img
            src="/icons/logo-lockup.svg"
            alt="Shaby Wurld"
            className="h-[18px] w-auto"
          />
          <Link
            href="/"
            className="border border-sw-cream/40 px-3 py-1 font-body text-[12px] text-sw-cream transition-colors duration-300 hover:bg-sw-cream hover:text-sw-blush"
          >
            Home
          </Link>
        </div>

        <div className="bg-[#95402f] p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-body text-[15px] font-medium text-sw-cream">Shaby Wurld</p>
              <p className="font-body text-[12px] text-sw-cream/70">
                {order.items.length} item{order.items.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="text-right">
              <p className="font-body text-[11px] text-sw-cream/70">Total</p>
              <p className="font-display text-[18px] tabular-nums text-sw-cream">
                {naira(order.total)}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sw-cream text-[10px] leading-none text-[#95402f]">
              ✓
            </span>
            <p className="font-body text-[13px] text-sw-cream/90">Order complete</p>
          </div>
        </div>

        {/* The slot, flush with the housing's bottom edge so the paper
            genuinely emerges from this opening rather than from below the
            whole box. */}
        <div className="-mx-4 -mb-4 mt-4 h-[7px] bg-[#7d3526] shadow-[inset_0_2px_3px_rgba(0,0,0,0.35)]" />
      </div>

      {/* Paper — tucked directly under the slot */}
      <div ref={wrapperRef} className="relative z-10 -mt-[2px] w-[88%] overflow-hidden">
        <div ref={paperRef} className="sw-receipt-paper relative bg-white">
          <div className="px-6 pb-5 pt-7">
            <div className="mb-5 flex justify-center">
              <img src="/icons/logo-text.webp" alt="Shaby Wurld" className="h-5 w-auto" />
            </div>

            <div className="border-t border-dashed border-[#edcac3]" />

            {/* Items */}
            <div className="py-4">
              {order.items.map((item, i) => (
                <div key={i} className="mb-3 flex items-baseline justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-body text-[13px] leading-[1.35] text-[#262626]">
                      <span className="tabular-nums text-[#a79b99]">{item.qty}×</span>{" "}
                      {item.name}
                    </p>
                    {item.shade && (
                      <p className="font-body text-[12px] text-[#a79b99]">{item.shade}</p>
                    )}
                  </div>
                  <p className="shrink-0 font-body text-[13px] tabular-nums text-[#3d3d3d]">
                    {naira(item.unitPrice * item.qty)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-[#edcac3]" />

            {/* Totals */}
            <div className="py-4 font-body text-[13px] text-[#3d3d3d]">
              <div className="mb-1 flex justify-between">
                <span className="text-[#a79b99]">Subtotal</span>
                <span className="tabular-nums">{naira(order.subtotal)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-[#a79b99]">
                  Delivery{order.courier ? ` · ${order.courier}` : ""}
                </span>
                <span className="shrink-0 tabular-nums">
                  {order.shippingCost === 0 ? "Free" : naira(order.shippingCost)}
                </span>
              </div>
            </div>

            {/* Ticket notches sit on this rule, the way a real receipt is
                perforated above the total. */}
            <div className="relative border-t border-dashed border-[#edcac3]">
              <span className="sw-notch sw-notch-left" aria-hidden="true" />
              <span className="sw-notch sw-notch-right" aria-hidden="true" />
            </div>

            <div className="flex items-baseline justify-between py-4">
              <p className="font-body text-[13px] font-medium uppercase tracking-[0.28px] text-[#a79b99]">
                Total Paid
              </p>
              {/* font-display, the way prices are set on product cards */}
              <p className="font-display text-[24px] tabular-nums text-[#262626]">
                {naira(order.total)}
              </p>
            </div>

            <div className="border-t border-dashed border-[#edcac3]" />

            {/* Meta */}
            <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-[6px] py-4 font-body text-[11px] text-[#a79b99]">
              <span>Order</span>
              <span className="text-right tabular-nums text-[#3d3d3d]">{order.orderNumber}</span>
              <span>Paid with</span>
              <span className="text-right text-[#3d3d3d]">Paystack</span>
              <span>Date</span>
              <span className="text-right tabular-nums text-[#3d3d3d]">{stamp}</span>
            </div>

            {/* Barcode — CSS stripes rather than a library, since it is
                decorative and never scanned. */}
            <div className="flex flex-col items-center pb-1 pt-2">
              <div
                className="h-[42px] w-[70%]"
                aria-hidden="true"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(90deg,#262626 0 2px,transparent 2px 4px,#262626 4px 5px,transparent 5px 9px,#262626 9px 12px,transparent 12px 14px)",
                }}
              />
              <p className="mt-2 font-body text-[10px] tracking-[0.3em] text-[#a79b99]">
                {order.orderNumber.replace(/-/g, " ")}
              </p>
            </div>
          </div>

          {/* Torn bottom edge */}
          <TornEdge />
        </div>
      </div>

      {/* Actions — same shapes as Add to Bag / secondary buttons elsewhere.
          Constrained to the paper's width so they sit inset on mobile rather
          than running edge to edge. */}
      <div className="mt-8 flex w-[88%] flex-col gap-3 sm:w-full sm:flex-row">
        <button
          onClick={saveImage}
          disabled={saving !== null}
          className="flex h-[50px] flex-1 items-center justify-center bg-sw-blush font-body text-[16px] text-sw-cream transition-colors duration-300 hover:bg-[#95402f] active:scale-[0.99] disabled:opacity-50"
        >
          {saving === "png" ? "Saving…" : "Save as image"}
        </button>
        <button
          onClick={savePdf}
          disabled={saving !== null}
          className="flex h-[50px] flex-1 items-center justify-center border border-[#ddd5d4] bg-white font-body text-[16px] text-[#3d3d3d] transition-colors duration-300 hover:border-sw-blush disabled:opacity-50"
        >
          {saving === "pdf" ? "Saving…" : "Save as PDF"}
        </button>
      </div>

      <Link
        href="/"
        className="mt-5 font-body text-[14px] text-[#a79b99] underline transition-colors duration-200 hover:text-sw-blush"
      >
        Continue shopping
      </Link>
    </div>
  );
}
