import { createFileRoute } from "@tanstack/react-router";

const PESAPAL_BASE = "https://cybqa.pesapal.com/pesapalv3";

async function pesapalToken() {
  const res = await fetch(`${PESAPAL_BASE}/api/Auth/RequestToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      consumer_key: process.env.PESAPAL_CONSUMER_KEY,
      consumer_secret: process.env.PESAPAL_CONSUMER_SECRET,
    }),
  });
  const j = (await res.json()) as { token: string };
  return j.token;
}

async function handle(request: Request) {
  const url = new URL(request.url);
  let trackingId = url.searchParams.get("OrderTrackingId") || url.searchParams.get("orderTrackingId");
  let merchantRef = url.searchParams.get("OrderMerchantReference") || url.searchParams.get("orderMerchantReference");

  if (!trackingId && request.method === "POST") {
    try {
      const body = (await request.json()) as Record<string, string>;
      trackingId = trackingId || body.OrderTrackingId || body.orderTrackingId;
      merchantRef = merchantRef || body.OrderMerchantReference || body.orderMerchantReference;
    } catch {
      /* ignore */
    }
  }

  if (!trackingId) return new Response("Missing tracking id", { status: 400 });

  const token = await pesapalToken();
  const res = await fetch(
    `${PESAPAL_BASE}/api/Transactions/GetTransactionStatus?orderTrackingId=${trackingId}`,
    { headers: { Accept: "application/json", Authorization: `Bearer ${token}` } },
  );
  const j = (await res.json()) as { payment_status_description?: string; status_code?: number };

  if (
    (j.payment_status_description?.toLowerCase() === "completed" || j.status_code === 1) &&
    merchantRef
  ) {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("donations").update({ status: "confirmed" }).eq("reference", merchantRef);
  }

  return Response.json({ orderNotificationType: "IPNCHANGE", orderTrackingId: trackingId, orderMerchantReference: merchantRef, status: 200 });
}

export const Route = createFileRoute("/api/public/pesapal-ipn")({
  server: {
    handlers: {
      GET: ({ request }) => handle(request),
      POST: ({ request }) => handle(request),
    },
  },
});
