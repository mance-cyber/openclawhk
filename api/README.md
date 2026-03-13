# Stripe Webhook — Setup Guide

This serverless function handles automated product delivery after a Stripe purchase.

**File:** `api/stripe-webhook.js`
**Route:** `POST /api/stripe-webhook` (auto-served by Vercel)

---

## How It Works

1. Customer completes checkout on Stripe
2. Stripe sends `checkout.session.completed` event to your webhook URL
3. Function identifies which product was purchased (by Price ID or name)
4. Sends a thank-you email with download link via Resend

---

## Step 1 — Create Resend Account

1. Sign up at [resend.com](https://resend.com) (free tier: 100 emails/day)
2. Go to **API Keys** → Create API Key
3. Add your domain (`openclawhk.io`) under **Domains** and verify DNS records
4. Set sender: `orders@openclawhk.io`

---

## Step 2 — Get Stripe Keys

1. Stripe Dashboard → **Developers** → **API Keys**
2. Copy **Secret key** (starts with `sk_live_...`)
3. Go to **Webhooks** → **Add endpoint**
   - URL: `https://openclawhk.io/api/stripe-webhook`
   - Events: select `checkout.session.completed`
4. After creating, copy the **Signing secret** (starts with `whsec_...`)

---

## Step 3 — Update Product Price IDs

In `api/stripe-webhook.js`, update the `PRODUCTS` object with your real Stripe Price IDs:

```js
const PRODUCTS = {
  'price_XXXXXXXXXXXXXX': {         // ← replace with real Price ID from Stripe
    name: 'Eve AI Setup Guide',
    nameZh: 'Eve AI 設定指南',
    downloadUrl: 'https://openclawhk.io/downloads/eve-ai-setup-guide-tc.pdf',
  },
  // ... etc
};
```

To find Price IDs: Stripe Dashboard → **Products** → click product → copy Price ID (e.g. `price_1OqX2Y...`)

---

## Step 4 — Set Environment Variables in Vercel

In Vercel Dashboard → your project → **Settings** → **Environment Variables**:

| Variable | Value |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |
| `RESEND_API_KEY` | `re_...` |

For local testing, create `.env.local`:
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
```

---

## Step 5 — Install Dependencies

Add to `package.json` (create one in the root if it doesn't exist):

```json
{
  "dependencies": {
    "stripe": "^14.0.0",
    "resend": "^3.0.0"
  }
}
```

Then run:
```bash
npm install
```

---

## Step 6 — Set Up Download Files

Upload your product files to a secure location. Options:

**Option A — Cloudflare R2 (recommended, free 10GB)**
1. Create R2 bucket in Cloudflare dashboard
2. Upload PDF/ZIP files
3. Generate public URLs or signed URLs per download

**Option B — Simple: Vercel /public folder**
- Put files in `/public/downloads/` (not indexed by default)
- URL: `https://openclawhk.io/downloads/filename.pdf`

---

## Step 7 — Test Locally

Install Stripe CLI:
```bash
# Mac
brew install stripe/stripe-cli/stripe

# Windows
scoop install stripe
```

Forward webhooks to local:
```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

Trigger a test event:
```bash
stripe trigger checkout.session.completed
```

---

## Step 8 — Deploy to Vercel

```bash
# Push to GitHub — Vercel auto-deploys on push to master
git add api/
git commit -m "feat: add Stripe webhook for automated email delivery"
git push
```

---

## Monitoring

- **Vercel logs**: Dashboard → your project → **Functions** tab
- **Stripe events**: Stripe Dashboard → **Developers** → **Events**
- **Resend logs**: Resend Dashboard → **Emails**

---

## Security Notes

- Webhook signature is verified on every request (prevents fake events)
- `bodyParser: false` is required for signature verification
- Never log full session objects (may contain PII)
- Consider signed/expiring download URLs for higher security
