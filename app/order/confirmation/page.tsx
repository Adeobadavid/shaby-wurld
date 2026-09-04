import Link from "next/link";
import { verifyTransaction } from "@/lib/paystack";

/**
 * Where Paystack sends the customer back to.
 *
 * The status shown here is confirmed with Paystack's API server-side. Landing
 * on this URL proves nothing on its own — anyone can type it — so the order is
 * only ever described as paid when Paystack itself says so. The authoritative
 * record is still written by the webhook.
 */
export const dynamic = "force-dynamic";

export default async function OrderConfirmation({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; reference?: string }>;
}) {
  const params = await searchParams;
  const reference = params.ref ?? params.reference ?? "";

  let paid = false;
  if (reference) {
    try {
      const result = await verifyTransaction(reference);
      paid = result.paid;
    } catch {
      paid = false;
    }
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[#fbf7f5] px-6 py-20 text-center">
      <div className="flex w-full max-w-[480px] flex-col items-center gap-6">
        <h1 className="font-display text-[36px] leading-[1.15] text-black sm:text-[44px]">
          {paid ? "Thank you." : "Payment not confirmed"}
        </h1>

        <p className="font-body text-[16px] leading-[1.5] text-[#707070]">
          {paid
            ? "Your order is in. We'll message you on WhatsApp shortly to confirm delivery details."
            : "We couldn't confirm this payment. If money left your account, don't pay again — contact us and we'll sort it out."}
        </p>

        {reference && (
          <p className="font-body text-[13px] text-[#a79b99]">
            Order reference: <span className="font-medium text-[#3d3d3d]">{reference}</span>
          </p>
        )}

        <Link
          href="/"
          className="mt-2 flex h-[50px] w-full max-w-[280px] items-center justify-center bg-sw-blush font-body text-[16px] text-sw-cream transition-colors duration-300 hover:bg-[#95402f]"
        >
          Continue shopping
        </Link>
      </div>
    </main>
  );
}
