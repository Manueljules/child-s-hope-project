## Goal
Replace the current payment-method grid in the donate wizard with two large branded buttons — **PayPal** and **Pesapal** — each showing the smaller icons of the sub-methods they accept. On submit, redirect the donor to the provider's sandbox hosted checkout and return to a thank-you/receipt state.

## UI changes (`src/routes/donate.tsx`, `src/components/donate/PaymentLogos.tsx`)
- Remove the current 6-tile card/wallet/paypal grid on the "Payment" step.
- Add two large, tall buttons side-by-side (stacked on mobile):
  - **PayPal** — PayPal wordmark, subtitle "Cards & wallets", sub-icons: PayPal, Visa, Mastercard, Amex, Apple Pay, Google Pay.
  - **Pesapal** — Pesapal wordmark, subtitle "Cards & Mobile Money (Uganda)", sub-icons: Visa, Mastercard, Amex, MTN MoMo, Airtel Money, Apple Pay, Google Pay.
- Selected button gets brand-blue ring + subtle bg tint. Keyboard/focus states preserved.
- Extend `PaymentLogos.tsx` with the missing marks: `PaypalBrandLogo`, `PesapalLogo`, `MtnMomoLogo`, `AirtelMoneyLogo` (inline SVG, same style as existing).
- Keep existing donation form state (amount, frequency, project, donor info). Only the payment-selection UI and the final submit action change.

## Backend — sandbox redirect checkout
Two server functions under `src/lib/` (client-safe module paths), each returning `{ redirectUrl }`. Client navigates via `window.location.href`.

1. `src/lib/paypal.functions.ts` — `createPaypalOrder`
   - Uses `PAYPAL_CLIENT_ID` + `PAYPAL_SECRET` against `https://api-m.sandbox.paypal.com`.
   - Creates an Order (`intent: CAPTURE`), currency configurable (UGX not supported by PayPal → convert display amount to USD using a fixed rate stored in `site_content` or hardcoded fallback; note this in UI as "Charged in USD").
   - `application_context.return_url` = `${origin}/donate?provider=paypal&status=success&token={ORDER_ID}`; `cancel_url` = `${origin}/donate?status=cancelled`.
   - Returns the `approve` link.

2. `src/lib/pesapal.functions.ts` — `createPesapalOrder`
   - Uses `PESAPAL_CONSUMER_KEY` + `PESAPAL_CONSUMER_SECRET` against `https://cybqa.pesapal.com/pesapalv3` (sandbox).
   - Auth: `POST /api/Auth/RequestToken` → bearer token.
   - Register IPN once (lazy, cached in `site_content` row `pesapal_ipn_id`) via `POST /api/URLSetup/RegisterIPN` pointing at `${origin}/api/public/pesapal-ipn`.
   - `POST /api/Transactions/SubmitOrderRequest` with amount (UGX), donor info, `callback_url` = `${origin}/donate?provider=pesapal&status=success`. Returns `redirect_url`.

3. Public IPN + return handling
   - `src/routes/api/public/pesapal-ipn.ts` — GET/POST handler that reads `OrderTrackingId`, calls Pesapal `GetTransactionStatus`, and if COMPLETED marks the pending donation row `status='confirmed'` (existing trigger updates project totals).
   - On the donate page, when it loads with `?status=success`, verify with a lightweight server fn (`verifyDonation`) then show the existing receipt/download step.

4. Donation persistence
   - Before redirect, insert a `donations` row with `status='pending'`, provider, provider_ref (order id / tracking id), amount, currency, project_id, donor info. Update to `confirmed` on IPN / verify.

## Secrets to request (sandbox)
Via `add_secret`:
- `PAYPAL_CLIENT_ID`, `PAYPAL_SECRET`
- `PESAPAL_CONSUMER_KEY`, `PESAPAL_CONSUMER_SECRET`

All four are backend-only; no publishable variants needed.

## Out of scope
- Live/production credentials (sandbox only per your answer).
- Embedded/on-site SDK flows (redirect only).
- Currency conversion service — use a fixed UGX→USD rate constant for PayPal display; can be refined later.

## Technical notes
- Server fns use `createServerFn` from `@tanstack/react-start`, read env inside `.handler()`.
- IPN route lives under `src/routes/api/public/` (bypasses auth) and verifies by re-querying Pesapal, not by trusting the payload.
- No changes to admin, project math, or receipt PDF beyond wiring the confirmed donation into the existing receipt step.
