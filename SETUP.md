# Backend setup

Everything is built. These are the steps only you can do, because they involve
accounts and keys.

## 1. Environment file

```bash
cp .env.example .env.local
```

Then fill it in. `.env.local` is gitignored — **never commit it**, and never
paste a secret key into a chat or screenshot.

## 2. Sanity

The schemas are already in this repo, so **do not run `npm create sanity`** —
it would scaffold a second, competing project. The Studio is embedded here
instead.

1. Start the app: `npm run dev`
2. Open <http://localhost:3000/studio> and log in.
3. Sanity will ask to add `http://localhost:3000` as a CORS origin — allow it.
   Add your production domain the same way at
   <https://sanity.io/manage> → project `l1gq8pzc` → API → CORS origins.
4. Create a **write token**: same page → Tokens → Add token → **Editor**.
   Paste it into `SANITY_API_WRITE_TOKEN`.

Then fill in **Site Settings** (it's a singleton, opens directly), add
**Products**, and add **Reviews**.

Until you do, every component falls back to the current hardcoded copy — the
site will not break while the CMS is empty.

## 3. Paystack

1. Dashboard → Settings → API Keys & Webhooks.
2. Copy the **secret key** into `PAYSTACK_SECRET_KEY`. Start with the **test**
   key and run a full order through before switching to live.
3. Set the webhook URL to:
   `https://yourdomain.com/api/paystack/webhook`

You do **not** need the public key. The checkout uses Paystack's redirect flow,
so no Paystack credential is ever loaded in the browser.

The webhook is what marks an order paid — not the customer returning to the
site. Without it configured, orders stay `pending` forever.

## 4. Shipbubble

1. Put your API key in `SHIPBUBBLE_API_KEY`.
2. Create your **pickup address** once (their dashboard, or the
   `/shipping/address/validate` endpoint) and put the returned address code in
   `SHIPBUBBLE_FROM_ADDRESS_CODE`.

Without step 2 the rates endpoint returns an error, because it has nowhere to
ship *from*.

## 5. WhatsApp notifications

Nothing to do — it works out of the box using the **wa.me** path. When an order
is paid, the webhook logs a pre-filled WhatsApp link and the order lands in
Sanity under **Orders**.

To upgrade to fully automatic messages later, fill in the three `WHATSAPP_*`
variables. The app detects them and switches over — **no code change needed**.
That path needs a Meta business account and verification, which takes days,
which is why it isn't the default.

## 6. Deploying

The site can no longer be a static export — it needs a Node host (Vercel,
Netlify, Render, a VPS). Set every variable from `.env.local` in the host's
environment settings, and set `NEXT_PUBLIC_SITE_URL` to the real domain so
Paystack redirects land in the right place.

---

## Security notes

- **Prices are never taken from the browser.** The client sends product ids and
  quantities; the server looks up every price in Sanity and computes the total
  itself. This is what stops someone buying a ₦50,000 order for ₦1.
- **Webhook signatures are verified** against the raw request body with a
  timing-safe comparison, and the charged amount is checked against the stored
  order total before anything is marked paid.
- **The webhook is idempotent** — Paystack retries, and a retry won't
  double-process or double-notify.
- **Secrets are server-only.** `lib/env.ts` throws if imported in the browser,
  and the write client throws if constructed there. Verified: no secret name
  appears in any client bundle.
- **Rate limiting** on both public API routes. It's in-memory, so it's
  per-instance — if you scale to multiple instances, swap the Map in
  `lib/rate-limit.ts` for Upstash Redis. Only that file changes.
- **Orders are read-only in the Studio**, so an accidental edit can't
  contradict what Paystack actually charged.
