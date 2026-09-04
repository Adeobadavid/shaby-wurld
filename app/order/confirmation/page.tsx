import Link from "next/link";
import { verifyTransaction } from "@/lib/paystack";
import { getOrderForReceipt } from "@/sanity/queries";
import Receipt from "@/components/Receipt";

/**
 * Where Paystack sends the customer back to.
 *
 * Payment is confirmed with Paystack's API server-side. Landing on this URL
 * proves nothing on its own — anyone can type it — so the receipt is only
 * rendered when Paystack itself says the reference was paid. The
 * authoritative record is still written by the webhook.
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
      paid = (await verifyTransaction(reference)).paid;
    } catch {
      paid = false;
    }
  }

  // Only look the order up once payment is confirmed, so an unpaid or
  // guessed reference reveals nothing.
  const order = paid ? await getOrderForReceipt(reference) : null;

  if (paid && order) {
    // #fbf7f5 is the same warm ground the Brand Story section sits on.
    return (
      <main className="flex min-h-dvh flex-col items-center bg-[#fbf7f5] px-5 py-10 sm:py-16">
        <h1 className="mb-8 text-center font-display text-[30px] leading-[1.15] text-[#262626] sm:text-[38px]">
          Thank you.
        </h1>
        <Receipt order={order} />
        <p className="mt-8 max-w-[380px] text-center font-body text-[14px] leading-[1.5] text-[#a79b99]">
          We&apos;ll message you on WhatsApp shortly to confirm delivery details.
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[#fbf7f5] px-6 py-20 text-center">
      <div className="flex w-full max-w-[480px] flex-col items-center gap-6">
        <h1 className="font-display text-[36px] leading-[1.15] text-black sm:text-[44px]">
          Payment not confirmed
        </h1>
        <p className="font-body text-[16px] leading-[1.5] text-[#707070]">
          We couldn&apos;t confirm this payment. If money left your account, don&apos;t pay
          again — contact us and we&apos;ll sort it out.
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
