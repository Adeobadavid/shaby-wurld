# Deploying to Cloudflare Workers

The site runs on Cloudflare Workers via the OpenNext adapter. Everything —
pages, API routes, Studio — is one Worker.

Run these from the project directory.

## 1. Log in

```bash
npx wrangler login
```

## 2. Create the two KV namespaces

The Worker needs shared storage. **Rate limiting genuinely does not work
without this** — Workers isolates don't share memory, so an in-memory counter
starts from zero on almost every request.

```bash
npx wrangler kv namespace create RATE_LIMIT_KV
npx wrangler kv namespace create NEXT_INC_CACHE_KV
```

Each prints an `id`. Paste them into `wrangler.jsonc`, replacing the two
`PLACEHOLDER_REPLACE_WITH_REAL_ID` values.

## 3. Set the secrets

These are **not** in `wrangler.jsonc` — that file is committed to git. Secrets
live in Cloudflare's encrypted store:

```bash
npx wrangler secret put SANITY_API_WRITE_TOKEN
npx wrangler secret put SANITY_API_READ_TOKEN
npx wrangler secret put PAYSTACK_SECRET_KEY
npx wrangler secret put SHIPBUBBLE_API_KEY
```

Both Sanity tokens are needed and do different jobs: the **write** token
records orders, the **read** token renders the site now that the dataset is
private. Neither replaces the other.

Each prompts for the value — nothing is echoed or written to disk.

The public (`NEXT_PUBLIC_*`) values are baked in at build time from
`.env.local`, so make sure `NEXT_PUBLIC_SITE_URL` is your real domain before
building for production, not `http://localhost:3000`. Paystack redirects back
to whatever that was set to at build time.

## 4. Preview locally in the real runtime

```bash
npm run cf:preview
```

This runs the actual Workers runtime rather than Node, so it catches anything
that only breaks on Cloudflare. Worth doing before the first deploy.

## 5. Deploy

```bash
npm run cf:deploy
```

## 6. Connect the domain

Cloudflare dashboard → **Workers & Pages** → `shaby-wurld` → **Settings** →
**Domains & Routes** → **Add custom domain**.

Since the domain is already on Cloudflare, DNS is created automatically.

## 7. Point Paystack at the deployed webhook

Paystack dashboard → Settings → API Keys & Webhooks → webhook URL:

```
https://yourdomain.com/api/paystack/webhook
```

**Nothing marks an order paid until this is set.** The customer returning to
the site is not proof of payment, and the code deliberately does not treat it
as such.

Then rebuild and redeploy so `NEXT_PUBLIC_SITE_URL` matches the live domain.

---

## Things specific to Workers, worth knowing

**`nodejs_compat` is required, not optional.** The Paystack webhook verifies
its signature with `node:crypto`. Without that flag the Worker fails to start.
It's already set in `wrangler.jsonc`.

**KV is eventually consistent.** The rate limiter can be briefly exceeded by an
attacker hitting several edge locations at once. That's acceptable for abuse
throttling. It is not an authorisation control and isn't used as one.

**ISR needs `NEXT_INC_CACHE_KV`.** Without it the homepage's `revalidate = 60`
has nowhere to store output, so every visit re-renders and re-queries Sanity —
slower, and it burns your Sanity request quota.

**The Studio is deliberately not in this app.** Embedding it made the Worker
4.13 MB compressed, over the free plan's 3 MB limit. It now lives at
<https://shabywurld.sanity.studio>, hosted free by Sanity, and is redeployed
with `npx sanity deploy` whenever a schema changes.

## Before taking real money

- [ ] Sanity dataset set to **Private** (customer PII is currently world-readable)
- [ ] `SANITY_API_READ_TOKEN` created and set
- [ ] Confirm images still load after that switch
- [ ] Swap Paystack test keys for live keys
- [ ] Webhook URL set in Paystack
- [ ] One real end-to-end order, checked against the Orders list in Studio
