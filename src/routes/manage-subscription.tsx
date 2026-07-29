import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { cancelSubscription, lookupSubscription } from "@/lib/payments.functions";
import { ShieldCheck, XCircle, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/manage-subscription")({
  head: () => ({
    meta: [
      { title: "Manage your donation — Masembe Childcare Foundation" },
      { name: "description", content: "Look up your recurring donation and cancel it anytime with your reference number and email." },
    ],
  }),
  component: ManagePage,
});

type Sub = {
  reference: string;
  amount: number;
  currency: string;
  frequency: string;
  status: string;
  payment_method: string | null;
  donor_email: string | null;
  donor_name: string | null;
  created_at: string;
  metadata: unknown;
};

function ManagePage() {
  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");
  const [sub, setSub] = useState<Sub | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const lookupFn = useServerFn(lookupSubscription);
  const cancelFn = useServerFn(cancelSubscription);

  async function onLookup(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null); setMsg(null); setSub(null);
    try {
      const { donation } = await lookupFn({ data: { reference: reference.trim(), email: email.trim() } });
      setSub(donation as Sub);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Lookup failed");
    } finally {
      setBusy(false);
    }
  }

  async function onCancel() {
    if (!sub) return;
    if (!confirm("Cancel this recurring donation? No further payments will be taken.")) return;
    setBusy(true); setErr(null); setMsg(null);
    try {
      await cancelFn({ data: { reference: sub.reference, email: email.trim() } });
      setSub({ ...sub, status: "cancelled" });
      setMsg("Your recurring donation has been cancelled. Thank you for the support you've already given.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Cancellation failed");
    } finally {
      setBusy(false);
    }
  }

  const meta = (sub?.metadata ?? {}) as { recurring?: boolean };
  const isRecurring = !!meta.recurring;

  return (
    <SiteLayout>
      <PageHeader title="Manage your donation" subtitle="Look up your recurring donation and cancel anytime." />
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <form onSubmit={onLookup} className="bg-white border border-brand-blue/15 p-6 space-y-4">
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-widest text-ink/60 mb-2">Reference</label>
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              required
              placeholder="SCF-XXXX-XXXX"
              className="w-full border border-brand-blue/20 px-4 py-3 text-sm focus:border-brand-blue focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-widest text-ink/60 mb-2">Email used when donating</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-brand-blue/20 px-4 py-3 text-sm focus:border-brand-blue focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-brand-blue text-white py-3 font-display font-extrabold uppercase tracking-widest text-sm disabled:opacity-50"
          >
            {busy ? "Looking up…" : "Look up donation"}
          </button>
          <p className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-ink/50">
            <ShieldCheck className="size-3 text-brand-green" /> We verify with your email to protect your record.
          </p>
        </form>

        {err && <p className="mt-4 text-sm text-red-600">{err}</p>}
        {msg && <p className="mt-4 text-sm text-brand-green flex items-center gap-2"><CheckCircle2 className="size-4" />{msg}</p>}

        {sub && (
          <div className="mt-6 bg-surface p-6 space-y-3">
            <h2 className="font-display font-extrabold text-xl">Donation {sub.reference}</h2>
            <p className="text-sm">Amount: <strong>{sub.currency} {Number(sub.amount).toLocaleString()}</strong></p>
            <p className="text-sm">Frequency: <strong>{sub.frequency}</strong></p>
            <p className="text-sm">Method: <strong>{sub.payment_method}</strong></p>
            <p className="text-sm">Status: <strong className={sub.status === "cancelled" ? "text-red-600" : "text-brand-green"}>{sub.status}</strong></p>
            {isRecurring && sub.status !== "cancelled" ? (
              <button
                onClick={onCancel}
                disabled={busy}
                className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-red-600 text-white py-3 font-display font-extrabold uppercase tracking-widest text-sm disabled:opacity-50"
              >
                <XCircle className="size-4" /> {busy ? "Cancelling…" : "Cancel recurring donation"}
              </button>
            ) : !isRecurring ? (
              <p className="text-xs text-ink/60">This is a one-time donation — nothing to cancel.</p>
            ) : null}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
