
# Phase 3 — Donations, receipts, newsletter, forms

## 1. Payments: Pesapal + PayPal

**Pesapal** (best for Uganda — cards, MTN Mobile Money, Airtel Money, bank):
- Uses a Consumer Key + Consumer Secret. Not a built-in Lovable connector, so I'll build the integration directly against Pesapal API v3.
- Two secrets to add: `PESAPAL_CONSUMER_KEY`, `PESAPAL_CONSUMER_SECRET`. I'll also add `PESAPAL_ENV` (`sandbox` or `live`) so you can test first, then switch.
- Server flow:
  - `createServerFn` `createPesapalOrder` → gets OAuth token → submits order → returns `redirect_url` and stores donation row as `pending` with `provider='pesapal'` + `provider_ref`.
  - Public server route `/api/public/webhooks/pesapal` (IPN) → verifies status via Pesapal's GetTransactionStatus → flips donation to `confirmed` (which fires the existing DB trigger that bumps the project's `raised` total and progress bar).
  - Return route `/donate/thank-you?ref=…` → shows receipt with Download PDF (uses existing `receipt.ts`).

**PayPal** (best for international donors):
- Server-side REST API (Orders v2). Secrets: `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_ENV`.
- `createPaypalOrder` server fn creates the order; `capturePaypalOrder` finalizes it after approval; both update the same `donations` row. Same thank-you + receipt page.

**Donate page UI:**
- Frequency selector: Once / Weekly / Monthly (weekly & monthly = recurring, handled via Pesapal recurring subscriptions or PayPal subscription plans — recurring adds real complexity; if you want I can ship Once first and add recurring in a follow-up).
- Project dropdown populated from `projects` table.
- Amount presets + custom amount, currency (UGX default, USD for PayPal).
- Provider picker: Pesapal (local) vs PayPal (international). Existing card logos row stays as marketing.

**Admin:**
- Donations tab shows every donation with status, provider, project, donor, amount, ref. Admin can manually mark `confirmed` for cash/bank transfers received off-platform.

## 2. Newsletter emails
- Set up Lovable Emails on your domain (I'll show the email domain setup dialog — you'll pick a subdomain like `notify.thesaintschildcare.org` and add the DNS records at your registrar).
- After the domain is verified, set up email infrastructure (queue + suppression + logging) and scaffold app email templates.
- Admin "Newsletter" tab already has subscriber list + template editor. I'll add a **Send now** button that queues one email per subscriber using the current template's HTML with `{{title}}` / `{{excerpt}}` merge tags. Includes unsubscribe link (required for deliverability).
- Optional auto-send: when admin publishes a new `news_posts` row, automatically send to subscribers.

## 3. Contact & Volunteer forms
Already persist to DB. I'll add:
- Explicit "✓ Successfully submitted" success card that replaces the form.
- Zod validation with proper error messages on all fields.
- Rate limit (1 submission per email per 10 min) to reduce spam.

## 4. Payment Accounts PIN
- On first visit to Payment Accounts tab: prompt admin to create a 4–8 digit PIN. Stored as bcrypt hash in `admin_settings` (row already exists).
- Subsequent visits: PIN prompt → 5 wrong attempts locks the tab for 15 min.
- All account CRUD goes through a `requireSupabaseAuth` server fn that also verifies the PIN hash before returning secret fields (bank account numbers, mobile money numbers).

## 5. FAQ page (`/faq`)
Already scaffolded — I'll flesh out Q&As covering: how donations work, tax receipts, sponsoring a child, volunteering process, contact.

## What I need from you before / during build
1. **Domain** — confirm you'd like `notify.thesaintschildcare.org` (or another subdomain) for the newsletter sender. I'll trigger the DNS setup UI when we get to that step.
2. **Pesapal account** — sign up at pesapal.com (Uganda merchant account). Once approved, you'll get Consumer Key + Secret from their dashboard. I'll request them via the secure secrets flow when we reach that step. Sandbox keys work first so we can test without real money.
3. **PayPal account** — a PayPal Business account. Client ID + Secret from developer.paypal.com. Same secure secrets flow, sandbox first.
4. **Recurring donations** — should I ship "Once" only first and add weekly/monthly recurring in a follow-up, or build all three together (bigger scope, more testing)?

## Build order
1. Pesapal integration (secrets → server fn → webhook → donate UI → thank-you receipt).
2. PayPal integration (parallel provider on same donate UI).
3. Payment Accounts PIN gate.
4. Email domain + newsletter sending.
5. Form polish + FAQ content.

Answer question 4 (recurring now or later) and I'll start.
