import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/* Sandbox endpoints (per user selection: sandbox for both providers). */
const PAYPAL_BASE = "https://api-m.sandbox.paypal.com";
const PESAPAL_BASE = "https://cybqa.pesapal.com/pesapalv3";

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
  frequency: z.string().max(20),
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

/* ---------- PayPal ---------- */

export const createPaypalOrder = createServerFn({ method: "POST" })
  .inputValidator((d) => commonSchema.parse(d))
  .handler(async ({ data }) => {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const secret = process.env.PAYPAL_SECRET;
    if (!clientId || !secret) throw new Error("PayPal credentials missing");

    const usdAmount =
      data.currency === "USD"
        ? data.amount
        : data.currency === "UGX"
          ? Math.max(1, Math.round((data.amount / UGX_PER_USD) * 100) / 100)
          : data.amount; // EUR/GBP approx 1:1 for sandbox display

    // 1) OAuth token
    const tokenRes = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${clientId}:${secret}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });
    if (!tokenRes.ok) throw new Error(`PayPal auth failed: ${await tokenRes.text()}`);
    const { access_token } = (await tokenRes.json()) as { access_token: string };

    const reference = newRef();

    // 2) Persist pending donation
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
      payment_method: "PayPal",
      status: "pending",
      anonymous: data.donor.anonymous,
      dedication: data.donor.dedication || null,
      project_id: data.projectId || null,
      metadata: { provider: "paypal", usd_amount: usdAmount, original: { amount: data.amount, currency: data.currency } },
    });

    // 3) Create order
    const returnUrl = `${data.origin}/donate?provider=paypal&status=success&ref=${reference}`;
    const cancelUrl = `${data.origin}/donate?status=cancelled`;
    const orderRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: reference,
            description: `Donation to Masembe Childcare Foundation (${data.donationType})`,
            amount: { currency_code: "USD", value: usdAmount.toFixed(2) },
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
      metadata: { provider: "paypal", paypal_order_id: order.id, usd_amount: usdAmount },
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
  const res = await fetch(`${PESAPAL_BASE}/api/Auth/RequestToken`, {
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

  const res = await fetch(`${PESAPAL_BASE}/api/URLSetup/RegisterIPN`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ url: ipnUrl, ipn_notification_type: "GET" }),
  });
  if (!res.ok) throw new Error(`Pesapal IPN register failed: ${await res.text()}`);
  const j = (await res.json()) as { ipn_id: string };
  await supabaseAdmin.from("site_content").upsert({ key, value: { ipn_id: j.ipn_id } });
  return j.ipn_id;
}

export const createPesapalOrder = createServerFn({ method: "POST" })
  .inputValidator((d) => commonSchema.parse(d))
  .handler(async ({ data }) => {
    const token = await pesapalToken();
    const ipnId = await ensurePesapalIpn(token, data.origin);
    const reference = newRef();

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
      metadata: { provider: "pesapal" },
    });

    const [first, ...rest] = (data.donor.name || "Donor").split(" ");
    const body = {
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

    const res = await fetch(`${PESAPAL_BASE}/api/Transactions/SubmitOrderRequest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Pesapal order failed: ${await res.text()}`);
    const j = (await res.json()) as { order_tracking_id: string; redirect_url: string; error?: unknown };
    if (!j.redirect_url) throw new Error(`Pesapal order error: ${JSON.stringify(j)}`);

    await supabaseAdmin
      .from("donations")
      .update({ metadata: { provider: "pesapal", order_tracking_id: j.order_tracking_id } })
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

    if (data.provider === "paypal") {
      const clientId = process.env.PAYPAL_CLIENT_ID!;
      const secret = process.env.PAYPAL_SECRET!;
      const tokenRes = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(`${clientId}:${secret}`)}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      });
      const { access_token } = (await tokenRes.json()) as { access_token: string };
      const orderId = (row.metadata as { paypal_order_id?: string } | null)?.paypal_order_id;
      if (!orderId) throw new Error("Missing PayPal order id");
      // Capture the order (auto-confirms if approved by user)
      const capRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`, {
        method: "POST",
        headers: { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" },
      });
      const cap = (await capRes.json()) as { status?: string };
      if (cap.status === "COMPLETED") {
        await supabaseAdmin.from("donations").update({ status: "confirmed" }).eq("reference", data.reference);
        const { data: refreshed } = await supabaseAdmin.from("donations").select("*").eq("reference", data.reference).maybeSingle();
        return { status: "confirmed", donation: refreshed };
      }
      return { status: row.status, donation: row };
    }

    // Pesapal
    const token = await pesapalToken();
    const trackingId = (row.metadata as { order_tracking_id?: string } | null)?.order_tracking_id;
    if (!trackingId) throw new Error("Missing Pesapal tracking id");
    const res = await fetch(`${PESAPAL_BASE}/api/Transactions/GetTransactionStatus?orderTrackingId=${trackingId}`, {
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
