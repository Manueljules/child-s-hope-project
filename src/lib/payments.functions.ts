import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/* Endpoints — switch via PAYPAL_ENV / PESAPAL_ENV env vars ("live" | "sandbox"). Default: live. */
const paypalBase = () =>
  (process.env.PAYPAL_ENV ?? "live").toLowerCase() === "sandbox"
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";
const pesapalBase = () =>
  (process.env.PESAPAL_ENV ?? "live").toLowerCase() === "sandbox"
    ? "https://cybqa.pesapal.com/pesapalv3"
    : "https://pay.pesapal.com/v3";

/* UGX is not supported by PayPal — convert to USD for the PayPal order. */
const UGX_PER_USD = 3800;

const donorSchema = z.object({
  name: z.string().max(120).optional().nullable(),
  email: z.string().email(),
  phone: z.string().max(40).optional().nullable(),
  country: z.string().max(80).optional().nullable(),
  anonymous: z.boolean().default(false),
  dedication: z.string().max(300).optional().nullable(),
});

const commonSchema = z.object({
  amount: z.number().positive(),
  currency: z.enum(["UGX", "USD", "EUR", "GBP"]),
  frequency: z.string().max(20), // one | weekly | monthly | annual
  donationType: z.string().max(30),
  projectId: z.string().uuid().nullable().optional(),
  donor: donorSchema,
  origin: z.string().url(),
});

function newRef() {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SCF-${t}-${r}`;
}

function isRecurring(freq: string) {
  return freq === "monthly" || freq === "weekly" || freq === "annual";
}

/* ---------- PayPal ---------- */

async function paypalToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET;
  if (!clientId || !secret) throw new Error("PayPal credentials missing");
  const res = await fetch(`${paypalBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${clientId}:${secret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`PayPal auth failed: ${await res.text()}`);
  const { access_token } = (await res.json()) as { access_token: string };
  return access_token;
}

async function ensurePaypalProduct(token: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const key = "paypal_product";
  const existing = await supabaseAdmin.from("site_content").select("value").eq("key", key).maybeSingle();
  const cached = (existing.data?.value as { id?: string } | null)?.id;
  if (cached) return cached;

  const res = await fetch(`${paypalBase()}/v1/catalogs/products`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Masembe Childcare Foundation Donation",
      description: "Recurring donation to Masembe Childcare Foundation",
      type: "SERVICE",
      category: "NONPROFIT",
    }),
  });
  if (!res.ok) throw new Error(`PayPal product create failed: ${await res.text()}`);
  const j = (await res.json()) as { id: string };
  await supabaseAdmin.from("site_content").upsert({ key, value: { id: j.id } });
  return j.id;
}

function paypalInterval(freq: string): "WEEK" | "MONTH" | "YEAR" {
  if (freq === "weekly") return "WEEK";
  if (freq === "annual") return "YEAR";
  return "MONTH";
}

async function ensurePaypalPlan(token: string, productId: string, currency: string, freq: string, amount: number) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const interval = paypalInterval(freq);
  const key = `paypal_plan:${currency}:${interval}:${amount}`;
  const existing = await supabaseAdmin.from("site_content").select("value").eq("key", key).maybeSingle();
  const cached = (existing.data?.value as { id?: string } | null)?.id;
  if (cached) return cached;

  const res = await fetch(`${paypalBase()}/v1/billing/plans`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify({
      product_id: productId,
      name: `Donation ${currency} ${amount} / ${interval}`,
      status: "ACTIVE",
      billing_cycles: [
        {
          frequency: { interval_unit: interval, interval_count: 1 },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0, // 0 = infinite
          pricing_scheme: { fixed_price: { value: amount.toFixed(2), currency_code: currency } },
        },
      ],
      payment_preferences: { auto_bill_outstanding: true, setup_fee_failure_action: "CONTINUE", payment_failure_threshold: 2 },
    }),
  });
  if (!res.ok) throw new Error(`PayPal plan create failed: ${await res.text()}`);
  const j = (await res.json()) as { id: string };
  await supabaseAdmin.from("site_content").upsert({ key, value: { id: j.id } });
  return j.id;
}

export const createPaypalOrder = createServerFn({ method: "POST" })
  .inputValidator((d) => commonSchema.parse(d))
  .handler(async ({ data }) => {
    const token = await paypalToken();

    // PayPal does not support UGX — convert.
    const chargeCurrency = data.currency === "UGX" ? "USD" : data.currency;
    const chargeAmount =
      data.currency === "UGX"
        ? Math.max(1, Math.round((data.amount / UGX_PER_USD) * 100) / 100)
        : data.amount;

    const reference = newRef();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const recurring = isRecurring(data.frequency);

    await supabaseAdmin.from("donations").insert({
      reference,
      donor_name: data.donor.anonymous ? null : data.donor.name,
      donor_email: data.donor.email,
      donor_phone: data.donor.phone || null,
      donor_country: data.donor.country || null,
      amount: data.amount,
      currency: data.currency,
      frequency: data.frequency,
      donation_type: data.donationType,
      payment_method: "PayPal",
      status: "pending",
      anonymous: data.donor.anonymous,
      dedication: data.donor.dedication || null,
      project_id: data.projectId || null,
      metadata: {
        provider: "paypal",
        recurring,
        charge_amount: chargeAmount,
        charge_currency: chargeCurrency,
        original: { amount: data.amount, currency: data.currency },
      },
    });

    const returnUrl = `${data.origin}/donate?provider=paypal&status=success&ref=${reference}`;
    const cancelUrl = `${data.origin}/donate?status=cancelled`;

    if (recurring) {
      const productId = await ensurePaypalProduct(token);
      const planId = await ensurePaypalPlan(token, productId, chargeCurrency, data.frequency, chargeAmount);
      const subRes = await fetch(`${paypalBase()}/v1/billing/subscriptions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Prefer: "return=representation" },
        body: JSON.stringify({
          plan_id: planId,
          custom_id: reference,
          subscriber: {
            name: data.donor.name ? { given_name: data.donor.name.split(" ")[0], surname: data.donor.name.split(" ").slice(1).join(" ") || "Donor" } : undefined,
            email_address: data.donor.email,
          },
          application_context: {
            brand_name: "Masembe Childcare Foundation",
            user_action: "SUBSCRIBE_NOW",
            return_url: returnUrl,
            cancel_url: cancelUrl,
          },
        }),
      });
      if (!subRes.ok) throw new Error(`PayPal subscription failed: ${await subRes.text()}`);
      const sub = (await subRes.json()) as { id: string; links: Array<{ rel: string; href: string }> };
      await supabaseAdmin.from("donations").update({
        metadata: {
          provider: "paypal",
          recurring: true,
          paypal_subscription_id: sub.id,
          paypal_plan_id: planId,
          charge_amount: chargeAmount,
          charge_currency: chargeCurrency,
        },
      }).eq("reference", reference);
      const approve = sub.links.find((l) => l.rel === "approve")?.href;
      if (!approve) throw new Error("PayPal returned no approval link for subscription");
      return { redirectUrl: approve, reference };
    }

    // One-off order
    const orderRes = await fetch(`${paypalBase()}/v2/checkout/orders`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: reference,
            description: `Donation to Masembe Childcare Foundation (${data.donationType})`,
            amount: { currency_code: chargeCurrency, value: chargeAmount.toFixed(2) },
          },
        ],
        application_context: {
          brand_name: "Masembe Childcare Foundation",
          user_action: "PAY_NOW",
          return_url: returnUrl,
          cancel_url: cancelUrl,
        },
      }),
    });
    if (!orderRes.ok) throw new Error(`PayPal order failed: ${await orderRes.text()}`);
    const order = (await orderRes.json()) as { id: string; links: Array<{ rel: string; href: string }> };

    await supabaseAdmin.from("donations").update({
      metadata: { provider: "paypal", recurring: false, paypal_order_id: order.id, charge_amount: chargeAmount, charge_currency: chargeCurrency },
    }).eq("reference", reference);

    const approve = order.links.find((l) => l.rel === "approve")?.href;
    if (!approve) throw new Error("PayPal returned no approval link");
    return { redirectUrl: approve, reference };
  });

/* ---------- Pesapal ---------- */

async function pesapalToken() {
  const key = process.env.PESAPAL_CONSUMER_KEY;
  const secret = process.env.PESAPAL_CONSUMER_SECRET;
  if (!key || !secret) throw new Error("Pesapal credentials missing");
  const res = await fetch(`${pesapalBase()}/api/Auth/RequestToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ consumer_key: key, consumer_secret: secret }),
  });
  if (!res.ok) throw new Error(`Pesapal auth failed: ${await res.text()}`);
  const j = (await res.json()) as { token?: string; error?: unknown };
  if (!j.token) throw new Error(`Pesapal auth: no token (${JSON.stringify(j)})`);
  return j.token;
}

async function ensurePesapalIpn(token: string, origin: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const ipnUrl = `${origin}/api/public/pesapal-ipn`;
  const key = `pesapal_ipn:${ipnUrl}`;
  const existing = await supabaseAdmin.from("site_content").select("value").eq("key", key).maybeSingle();
  const cached = (existing.data?.value as { ipn_id?: string } | null)?.ipn_id;
  if (cached) return cached;

  const res = await fetch(`${pesapalBase()}/api/URLSetup/RegisterIPN`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ url: ipnUrl, ipn_notification_type: "GET" }),
  });
  if (!res.ok) throw new Error(`Pesapal IPN register failed: ${await res.text()}`);
  const j = (await res.json()) as { ipn_id: string };
  await supabaseAdmin.from("site_content").upsert({ key, value: { ipn_id: j.ipn_id } });
  return j.ipn_id;
}

function pesapalFrequency(freq: string): "WEEKLY" | "MONTHLY" | "YEARLY" {
  if (freq === "weekly") return "WEEKLY";
  if (freq === "annual") return "YEARLY";
  return "MONTHLY";
}

function fmtDate(d: Date) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}-${mm}-${d.getFullYear()}`;
}

export const createPesapalOrder = createServerFn({ method: "POST" })
  .inputValidator((d) => commonSchema.parse(d))
  .handler(async ({ data }) => {
    const token = await pesapalToken();
    const ipnId = await ensurePesapalIpn(token, data.origin);
    const reference = newRef();
    const recurring = isRecurring(data.frequency);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("donations").insert({
      reference,
      donor_name: data.donor.anonymous ? null : data.donor.name,
      donor_email: data.donor.email,
      donor_phone: data.donor.phone || null,
      donor_country: data.donor.country || null,
      amount: data.amount,
      currency: data.currency,
      frequency: data.frequency,
      donation_type: data.donationType,
      payment_method: "Pesapal",
      status: "pending",
      anonymous: data.donor.anonymous,
      dedication: data.donor.dedication || null,
      project_id: data.projectId || null,
      metadata: { provider: "pesapal", recurring },
    });

    const [first, ...rest] = (data.donor.name || "Donor").split(" ");
    const body: Record<string, unknown> = {
      id: reference,
      currency: data.currency,
      amount: data.amount,
      description: `Donation to Masembe Childcare Foundation`,
      callback_url: `${data.origin}/donate?provider=pesapal&status=success&ref=${reference}`,
      notification_id: ipnId,
      billing_address: {
        email_address: data.donor.email,
        phone_number: data.donor.phone || "",
        country_code: (data.donor.country || "UG").slice(0, 2).toUpperCase(),
        first_name: first || "Donor",
        last_name: rest.join(" ") || "",
      },
    };

    if (recurring) {
      const start = new Date();
      const end = new Date();
      end.setFullYear(end.getFullYear() + 5); // subscription window (5 years)
      body.account_number = reference; // unique donor/customer id
      body.subscription_details = {
        start_date: fmtDate(start),
        end_date: fmtDate(end),
        frequency: pesapalFrequency(data.frequency),
      };
    }

    const res = await fetch(`${pesapalBase()}/api/Transactions/SubmitOrderRequest`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Pesapal order failed: ${await res.text()}`);
    const j = (await res.json()) as { order_tracking_id: string; redirect_url: string; error?: unknown };
    if (!j.redirect_url) throw new Error(`Pesapal order error: ${JSON.stringify(j)}`);

    await supabaseAdmin
      .from("donations")
      .update({ metadata: { provider: "pesapal", recurring, order_tracking_id: j.order_tracking_id } })
      .eq("reference", reference);

    return { redirectUrl: j.redirect_url, reference };
  });

/* ---------- Verify a donation on return ---------- */

export const verifyDonation = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ reference: z.string().min(4), provider: z.enum(["paypal", "pesapal"]) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin.from("donations").select("*").eq("reference", data.reference).maybeSingle();
    if (!row) throw new Error("Donation not found");

    if (row.status === "confirmed") return { status: "confirmed", donation: row };

    const meta = (row.metadata ?? {}) as Record<string, unknown>;
    const recurring = !!meta.recurring;

    if (data.provider === "paypal") {
      const token = await paypalToken();

      if (recurring) {
        const subId = meta.paypal_subscription_id as string | undefined;
        if (!subId) throw new Error("Missing PayPal subscription id");
        const res = await fetch(`${paypalBase()}/v1/billing/subscriptions/${subId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const sub = (await res.json()) as { status?: string };
        if (sub.status === "ACTIVE" || sub.status === "APPROVED") {
          await supabaseAdmin.from("donations").update({ status: "confirmed" }).eq("reference", data.reference);
          const { data: refreshed } = await supabaseAdmin.from("donations").select("*").eq("reference", data.reference).maybeSingle();
          return { status: "confirmed", donation: refreshed };
        }
        return { status: row.status, donation: row };
      }

      const orderId = meta.paypal_order_id as string | undefined;
      if (!orderId) throw new Error("Missing PayPal order id");
      const capRes = await fetch(`${paypalBase()}/v2/checkout/orders/${orderId}/capture`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const cap = (await capRes.json()) as { status?: string };
      if (cap.status === "COMPLETED") {
        await supabaseAdmin.from("donations").update({ status: "confirmed" }).eq("reference", data.reference);
        const { data: refreshed } = await supabaseAdmin.from("donations").select("*").eq("reference", data.reference).maybeSingle();
        return { status: "confirmed", donation: refreshed };
      }
      return { status: row.status, donation: row };
    }

    // Pesapal (works for one-off and subscription registration)
    const token = await pesapalToken();
    const trackingId = meta.order_tracking_id as string | undefined;
    if (!trackingId) throw new Error("Missing Pesapal tracking id");
    const res = await fetch(`${pesapalBase()}/api/Transactions/GetTransactionStatus?orderTrackingId=${trackingId}`, {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    });
    const j = (await res.json()) as { payment_status_description?: string; status_code?: number };
    if (j.payment_status_description?.toLowerCase() === "completed" || j.status_code === 1) {
      await supabaseAdmin.from("donations").update({ status: "confirmed" }).eq("reference", data.reference);
      const { data: refreshed } = await supabaseAdmin.from("donations").select("*").eq("reference", data.reference).maybeSingle();
      return { status: "confirmed", donation: refreshed };
    }
    return { status: row.status, donation: row };
  });

/* ---------- Cancel a subscription ---------- */

export const cancelSubscription = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      reference: z.string().min(4),
      email: z.string().email(), // donor confirms identity to cancel
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin.from("donations").select("*").eq("reference", data.reference).maybeSingle();
    if (!row) throw new Error("Subscription not found");
    if ((row.donor_email ?? "").toLowerCase() !== data.email.toLowerCase()) {
      throw new Error("Email does not match this donation");
    }
    const meta = (row.metadata ?? {}) as Record<string, unknown>;
    if (!meta.recurring) throw new Error("This donation is not a subscription");

    if (row.payment_method === "PayPal") {
      const token = await paypalToken();
      const subId = meta.paypal_subscription_id as string | undefined;
      if (!subId) throw new Error("Missing PayPal subscription id");
      const res = await fetch(`${paypalBase()}/v1/billing/subscriptions/${subId}/cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Donor requested cancellation" }),
      });
      // 204 = success, 422 with ALREADY_CANCELLED is fine
      if (!res.ok && res.status !== 204) {
        const text = await res.text();
        if (!/ALREADY_CANCELLED|SUBSCRIPTION_STATUS_INVALID/i.test(text)) {
          throw new Error(`PayPal cancel failed: ${text}`);
        }
      }
    } else if (row.payment_method === "Pesapal") {
      const token = await pesapalToken();
      const res = await fetch(`${pesapalBase()}/api/Transactions/CancelOrder`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ order_tracking_id: meta.order_tracking_id }),
      });
      if (!res.ok) {
        const text = await res.text();
        if (!/already/i.test(text)) throw new Error(`Pesapal cancel failed: ${text}`);
      }
    }

    await supabaseAdmin
      .from("donations")
      .update({ status: "cancelled", metadata: { ...meta, cancelled_at: new Date().toISOString() } })
      .eq("reference", data.reference);
    return { ok: true };
  });

/* ---------- Look up a subscription (for management page) ---------- */

export const lookupSubscription = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ reference: z.string().min(4), email: z.string().email() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("donations")
      .select("reference,amount,currency,frequency,status,payment_method,donor_email,donor_name,created_at,metadata")
      .eq("reference", data.reference)
      .maybeSingle();
    if (!row) throw new Error("No donation with that reference");
    if ((row.donor_email ?? "").toLowerCase() !== data.email.toLowerCase()) {
      throw new Error("Email does not match this donation");
    }
    return { donation: row };
  });
