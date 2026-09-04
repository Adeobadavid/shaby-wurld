"use client";

import { useRef, useState } from "react";
import Link from "next/link";

/**
 * Printed receipt.
 *
 * The paper starts translated fully behind the printer housing and is pushed
 * down into view, so it reads as being fed out of the slot. The housing sits
 * above it on the z-axis — nothing is clipped, which keeps the paper fully
 * present in the DOM for html2canvas when saving.
 *
 * Everything shown here comes from the server-verified order. The component
 * never decides that anything was paid.
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

const naira = (n: number) => `NGN ${n.toLocaleString()}.00`;

export default function Receipt({ order }: { order: ReceiptData }) {
  const paperRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState<"png" | "pdf" | null>(null);

  const date = order.paidAt ? new Date(order.paidAt) : new Date();
  const stamp = `${date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).toUpperCase()} · ${date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;

  /**
   * Both exports render the DOM node to a canvas. The libraries are imported
   * lazily so ~200 KB never loads for anyone who doesn't tap save.
   */
  async function capture() {
    const node = paperRef.current;
    if (!node) return null;

    const { default: html2canvas } = await import("html2canvas");
    return html2canvas(node, {
      backgroundColor: "#ffffff",
      scale: 2, // legible on a retina screen and when printed
      useCORS: true,
    });
  }

  async function saveImage() {
    setSaving("png");
    try {
      const canvas = await capture();
      if (!canvas) return;

      const link = document.createElement("a");
      link.download = `${order.orderNumber}.png`;
      link.href = canvas.toDataURL("image/png");
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
      const canvas = await capture();
      if (!canvas) return;

      const { jsPDF } = await import("jspdf");
      // Page matches the receipt's aspect ratio, so there are no margins.
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width / 2, canvas.height / 2],
      });
      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        0,
        0,
        canvas.width / 2,
        canvas.height / 2
      );
      pdf.save(`${order.orderNumber}.pdf`);
    } catch (error) {
      console.error("[receipt] pdf export failed", error);
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="flex w-full max-w-[420px] flex-col items-center">
      {/* Printer housing — sits above the paper so the paper emerges from
          beneath its lower edge. */}
      <div className="sw-printer-body relative z-20 w-full rounded-[18px] bg-[#1c1a1a] p-4 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.6)]">
        <div className="mb-3 flex items-center justify-between">
          <img src="/icons/logo-text.webp" alt="Shaby Wurld" className="h-4 w-auto invert" />
          <Link
            href="/"
            className="rounded-full bg-white/10 px-3 py-1 font-body text-[12px] text-white/80 transition-colors hover:bg-white/20"
          >
            Home
          </Link>
        </div>

        <div className="rounded-[12px] bg-[#2a2726] p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-body text-[15px] font-medium text-white">Shaby Wurld</p>
              <p className="font-body text-[12px] text-white/50">
                {order.items.length} item{order.items.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="text-right">
              <p className="font-body text-[11px] text-white/50">Total</p>
              <p className="font-body text-[16px] font-medium text-white">
                ₦{order.total.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#4ade80] text-[10px] text-[#1c1a1a]">
              ✓
            </span>
            <p className="font-body text-[13px] text-white/85">Order complete</p>
          </div>
        </div>

        {/* The slot */}
        <div className="mx-auto mt-4 h-[5px] w-[92%] rounded-full bg-black/70" />
      </div>

      {/* Paper */}
      <div className="relative z-10 -mt-[3px] w-[88%] overflow-hidden">
        <div ref={paperRef} className="sw-receipt-paper bg-white">
          <div className="px-6 pb-5 pt-7">
            <div className="mb-5 flex justify-center">
              <img src="/icons/logo-text.webp" alt="Shaby Wurld" className="h-5 w-auto" />
            </div>

            <div className="border-t border-dashed border-[#c9c4c2]" />

            {/* Items */}
            <div className="py-4">
              {order.items.map((item, i) => (
                <div key={i} className="mb-3 flex items-baseline justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-[11px] uppercase tracking-tight text-[#2b2b2b]">
                      {item.qty} × {item.name}
                    </p>
                    {item.shade && (
                      <p className="font-mono text-[10px] text-[#8a8a8a]">{item.shade}</p>
                    )}
                  </div>
                  <p className="shrink-0 font-mono text-[11px] text-[#2b2b2b]">
                    {naira(item.unitPrice * item.qty)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-[#c9c4c2]" />

            {/* Totals */}
            <div className="py-4 font-mono text-[11px] text-[#2b2b2b]">
              <div className="mb-1 flex justify-between">
                <span>Subtotal</span>
                <span>{naira(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery{order.courier ? ` (${order.courier})` : ""}</span>
                <span>{order.shippingCost === 0 ? "FREE" : naira(order.shippingCost)}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-[#c9c4c2]" />

            <div className="flex items-baseline justify-between py-4">
              <p className="font-mono text-[13px] font-semibold uppercase text-[#1c1a1a]">
                Total Paid
              </p>
              <p className="font-mono text-[17px] font-semibold text-[#1c1a1a]">
                {naira(order.total)}
              </p>
            </div>

            <div className="border-t border-dashed border-[#c9c4c2]" />

            {/* Meta */}
            <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 py-4 font-mono text-[10px] text-[#8a8a8a]">
              <span>Order</span>
              <span className="text-right text-[#2b2b2b]">{order.orderNumber}</span>
              <span>Paid with</span>
              <span className="text-right text-[#2b2b2b]">Paystack</span>
              <span>Date</span>
              <span className="text-right text-[#2b2b2b]">{stamp}</span>
            </div>

            {/* Barcode — CSS stripes rather than a library, since it is
                decorative and never scanned. */}
            <div className="flex flex-col items-center pb-1 pt-2">
              <div
                className="h-[42px] w-[70%]"
                aria-hidden="true"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(90deg,#1c1a1a 0 2px,transparent 2px 4px,#1c1a1a 4px 5px,transparent 5px 9px,#1c1a1a 9px 12px,transparent 12px 14px)",
                }}
              />
              <p className="mt-2 font-mono text-[9px] tracking-[0.3em] text-[#8a8a8a]">
                {order.orderNumber.replace(/-/g, " ")}
              </p>
            </div>
          </div>

          {/* Torn bottom edge */}
          <div className="sw-receipt-tear bg-white" />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
        <button
          onClick={saveImage}
          disabled={saving !== null}
          className="flex h-[46px] flex-1 items-center justify-center gap-2 bg-sw-blush font-body text-[15px] text-sw-cream transition-colors duration-300 hover:bg-[#95402f] disabled:opacity-50"
        >
          {saving === "png" ? "Saving…" : "Save as image"}
        </button>
        <button
          onClick={savePdf}
          disabled={saving !== null}
          className="flex h-[46px] flex-1 items-center justify-center gap-2 border border-[#ddd5d4] bg-white font-body text-[15px] text-[#3d3d3d] transition-colors duration-300 hover:border-sw-blush disabled:opacity-50"
        >
          {saving === "pdf" ? "Saving…" : "Save as PDF"}
        </button>
      </div>

      <Link
        href="/"
        className="mt-5 font-body text-[14px] text-[#a79b99] underline transition-colors hover:text-sw-blush"
      >
        Continue shopping
      </Link>
    </div>
  );
}
