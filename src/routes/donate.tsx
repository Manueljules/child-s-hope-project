import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Heart, Lock, CheckCircle2, ChevronLeft, ChevronRight, Download, ShieldCheck, ExternalLink } from "lucide-react";
import { PROVIDERS, type ProviderId } from "@/components/donate/PaymentLogos";
import { generateReceiptPDF, type ReceiptData } from "@/lib/receipt";
import { supabase } from "@/integrations/supabase/client";
import { createPaypalOrder, createPesapalOrder, verifyDonation, cancelSubscription } from "@/lib/payments.functions";
import heroDonateAsset from "@/assets/hero-donate-bg.jpg.asset.json";
const heroChildren = heroDonateAsset.url;

export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title: "Donate — Masembe Childcare Foundation Uganda" },
      { name: "description", content: "Support vulnerable children in Uganda. Give securely with Visa, Mastercard, Amex, Apple Pay, Google Pay or PayPal — and download an instant receipt." },
    ],
  }),
  component: DonatePage,
});

const TYPES = [
  { id: "one", label: "One-Time" },
  { id: "monthly", label: "Monthly Giving" },
  { id: "annual", label: "Annual Giving" },
  { id: "sponsor", label: "Sponsor a Child" },
  { id: "emergency", label: "Emergency Appeal" },
  { id: "project", label: "Specific Project" },
];
const FREQS = ["one", "weekly", "monthly", "annual"] as const;
type Freq = (typeof FREQS)[number];
const AMOUNTS: Record<string, number[]> = {
  UGX: [20000, 50000, 100000, 250000],
  USD: [10, 25, 50, 100],
  EUR: [10, 25, 50, 100],
  GBP: [10, 25, 50, 100],
};
const CURRENCY_SYMBOL: Record<string, string> = { UGX: "UGX ", USD: "$", EUR: "€", GBP: "£" };

const STEPS = [
  { id: 1, title: "Amount", hint: "How much you'd like to give" },
  { id: 2, title: "Method", hint: "Choose a payment method" },
  { id: 3, title: "Details", hint: "Your details & payment info" },
  { id: 4, title: "Review", hint: "Confirm your donation" },
  { id: 5, title: "Receipt", hint: "Download your receipt" },
] as const;

function newRef() {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SCF-${t}-${r}`;
}


function DonatePage() {
  const [step, setStep] = useState(1);

  // step 1
  const [type, setType] = useState("one");
  const [freq, setFreq] = useState<Freq>("one");
  const [currency, setCurrency] = useState("UGX");
  const [amount, setAmount] = useState(100000);
  const [custom, setCustom] = useState("");
  const [projectId, setProjectId] = useState<string | "">("");
  const [projects, setProjects] = useState<Array<{ id: string; title: string }>>([]);
  useEffect(() => {
    supabase.from("projects").select("id,title").eq("is_published", true).order("sort_order").then(({ data }) => {
      setProjects((data ?? []) as Array<{ id: string; title: string }>);
    });
  }, []);

  // Reset to a sensible default amount when currency changes
  useEffect(() => {
    setAmount((AMOUNTS[currency] ?? AMOUNTS.USD)[2]);
    setCustom("");
  }, [currency]);


  // step 2 — provider (paypal | pesapal)
  const [provider, setProvider] = useState<ProviderId | null>(null);
  const providerMeta = PROVIDERS.find((p) => p.id === provider);

  // step 3 — donor
  const [donor, setDonor] = useState({ name: "", email: "", phone: "", country: "Uganda" });
  const [anon, setAnon] = useState(false);
  const [dedication, setDedication] = useState("");

  // step 5 — receipt
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finalAmount = custom ? Number(custom) : amount;

  const canAdvance = (() => {
    if (step === 1) return finalAmount > 0;
    if (step === 2) return !!provider;
    if (step === 3) {
      if (!anon && (!donor.name || !donor.email)) return false;
      if (anon && !donor.email) return false;
    }
    return true;
  })();

  const paypalFn = useServerFn(createPaypalOrder);
  const pesapalFn = useServerFn(createPesapalOrder);
  const verifyFn = useServerFn(verifyDonation);

  // Handle return from provider (?provider=paypal|pesapal&status=success&ref=...)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search);
    const prov = p.get("provider") as ProviderId | null;
    const status = p.get("status");
    const ref = p.get("ref");
    if (!prov || status !== "success" || !ref) return;
    (async () => {
      try {
        const { donation } = await verifyFn({ data: { reference: ref, provider: prov } });
        if (!donation) return;
        setReceipt({
          reference: donation.reference,
          createdAt: new Date(donation.created_at),
          donorName: donation.donor_name ?? "",
          donorEmail: donation.donor_email ?? "",
          amount: Number(donation.amount),
          currency: donation.currency,
          frequency: donation.frequency,
          donationType: donation.donation_type,
          paymentMethod: donation.payment_method ?? prov,
          anonymous: !!donation.anonymous,
          dedication: donation.dedication ?? "",
        });
        setStep(5);
        // Clean the URL so a refresh doesn't re-verify
        window.history.replaceState({}, "", "/donate");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not verify your donation.");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submitDonation() {
    if (!provider) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        amount: finalAmount,
        currency,
        frequency: freq,
        donationType: type,
        projectId: projectId || null,
        donor: {
          name: donor.name || null,
          email: donor.email,
          phone: donor.phone || null,
          country: donor.country || null,
          anonymous: anon,
          dedication: dedication || null,
        },
        origin: window.location.origin,
      };
      const { redirectUrl } = provider === "paypal"
        ? await paypalFn({ data: payload })
        : await pesapalFn({ data: payload });
      window.location.href = redirectUrl;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }


  return (
    <SiteLayout>
      {/* Full-bleed hero with floating donation card */}
      <section className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden">
        {/* Background image */}
        <img src={heroChildren} alt="" aria-hidden className="absolute inset-0 size-full object-contain sm:object-cover bg-brand-blue" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/10" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-16 min-h-[calc(100vh-4rem)] flex items-center justify-center md:justify-end">
          {/* Floating card */}
          <div className="w-full max-w-xl bg-white shadow-2xl">
            <div className="p-6 md:p-10 relative">
              {/* Vertical step tab attached to left */}
              <div className="hidden md:flex flex-col absolute -left-14 top-8 gap-2">
                {STEPS.map((s) => {
                  const active = s.id === step;
                  const done = s.id < step;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => s.id < step && setStep(s.id)}
                      disabled={s.id > step}
                      title={s.title}
                      className={`size-11 grid place-items-center font-display font-extrabold text-sm shadow-md transition-all ${
                        done ? "bg-brand-gold text-ink" : active ? "bg-brand-blue text-white scale-110" : "bg-white/80 text-ink/50"
                      }`}
                    >
                      {done ? "✓" : s.id}
                    </button>
                  );
                })}
              </div>

              {/* Header inside card */}
              {step === 1 && (
                <div className="mb-6">
                  <h1 className="font-display font-extrabold text-3xl md:text-4xl text-ink leading-tight">
                    Make a child just better.
                  </h1>
                  <p className="mt-3 text-ink/70 text-sm md:text-base">
                    Your compassion turns into food, school, healthcare and shelter for Uganda's most vulnerable children. Give securely below.
                  </p>
                </div>
              )}

              {/* Step 1 */}
              {step === 1 && (
                <div className="space-y-6 animate-fade-in">
                  {/* Frequency toggle — Once / Weekly / Monthly */}
                  <div className="grid grid-cols-3 border border-brand-blue/20">
                    {([
                      { id: "one", label: "Give Once" },
                      { id: "weekly", label: "Weekly" },
                      { id: "monthly", label: "Monthly" },
                    ] as Array<{ id: Freq; label: string }>).map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFreq(f.id)}
                        className={`py-4 font-display font-extrabold text-sm md:text-base flex items-center justify-center gap-2 transition ${freq === f.id ? "bg-brand-blue text-white" : "bg-white text-ink/60"}`}
                      >
                        {f.label} {freq === f.id && f.id !== "one" && <Heart className="size-4 fill-red-500 text-red-500" />}
                      </button>
                    ))}
                  </div>

                  <p className="text-brand-blue text-sm font-medium">
                    {freq === "monthly" ? "Your priceless monthly gift can provide long-lasting change" : freq === "weekly" ? "A small weekly gift adds up to real change" : "One gift, immediate impact for a child in need"}
                  </p>

                  {/* Project allocation */}
                  <div>
                    <label className="block font-mono text-[11px] uppercase tracking-widest text-ink/60 mb-2">Choose a project (optional)</label>
                    <select
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      className="w-full border border-brand-blue/20 px-3 py-3 text-sm bg-white focus:outline-none focus:border-brand-blue"
                    >
                      <option value="">Where it's needed most</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                    {projectId && <p className="mt-2 text-xs text-brand-green">Your gift will fund this project — its progress bar updates once payment is confirmed.</p>}
                  </div>


                  {/* Currency + Amount grid */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono uppercase tracking-widest text-ink/50">Currency:</span>
                    <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="border border-brand-blue/20 px-2 py-1 font-mono text-xs">
                      <option>UGX</option><option>USD</option><option>EUR</option><option>GBP</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {(AMOUNTS[currency] ?? AMOUNTS.USD).map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => { setAmount(a); setCustom(""); }}
                        className={`relative py-4 px-2 border text-center transition ${!custom && amount === a ? "bg-brand-blue text-white border-brand-blue" : "border-brand-blue/20 text-ink hover:border-brand-blue"}`}
                      >
                        <div className="font-display font-extrabold text-sm md:text-base leading-none whitespace-nowrap">{CURRENCY_SYMBOL[currency]}{a.toLocaleString()}</div>
                        <div className="text-[10px] mt-1 opacity-80">Per {freq === "monthly" ? "month" : freq === "weekly" ? "week" : "gift"}</div>
                        {!custom && amount === a && (
                          <span className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-3 h-3 rotate-45 bg-brand-blue" />
                        )}
                      </button>
                    ))}
                    <div className="border border-brand-blue/20 flex items-center justify-center">
                      <input
                        type="number"
                        placeholder="Other"
                        value={custom}
                        onChange={(e) => setCustom(e.target.value)}
                        className="w-full h-full text-center font-display font-extrabold text-sm bg-transparent focus:outline-none placeholder:text-ink/50"
                      />
                    </div>
                  </div>

                  <p className="text-sm text-ink/70 leading-relaxed">
                    Help more children in need wherever they are. By making a {freq === "monthly" ? "monthly" : "one-time"} gift to Masembe Childcare Foundation, you provide children in Uganda with relief, protection, and hope for a better future.
                  </p>
                </div>
              )}

              {/* Step 2 — choose provider */}
              {step === 2 && (
                <div className="space-y-5 animate-fade-in">
                  <h2 className="font-display font-extrabold text-2xl">Choose a payment method</h2>
                  <p className="text-sm text-ink/60">
                    Pay securely through one of our checkout partners. You'll be redirected to complete payment.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {PROVIDERS.map((p) => {
                      const selected = provider === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setProvider(p.id)}
                          className={`text-left border-2 p-5 bg-white transition-all flex flex-col gap-4 min-h-[190px] ${
                            selected ? `${p.ring} ring-4 shadow-lg` : "border-brand-blue/15 hover:border-brand-blue/60"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <p.Brand className="h-10 max-w-[70%]" />
                            {selected && <CheckCircle2 className="size-6 text-brand-green shrink-0" />}
                          </div>
                          <p className="text-xs text-ink/60 leading-snug">{p.tagline}</p>
                          <div className="mt-auto">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-ink/40 mb-2">Accepts</p>
                            <div className="flex flex-wrap items-center gap-2">
                              {p.methods.map((m) => (
                                <span
                                  key={m.label}
                                  title={m.label}
                                  className="inline-flex items-center justify-center h-7 min-w-[42px] px-1.5 bg-surface border border-ink/5"
                                >
                                  <m.Logo className="h-4 max-w-[46px]" />
                                </span>
                              ))}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-ink/50">
                    <ShieldCheck className="size-4 text-brand-green" /> Encrypted · PCI-compliant
                  </div>
                </div>
              )}

              {/* Step 3 — donor details only (card / wallet data collected on provider's page) */}
              {step === 3 && providerMeta && (
                <div className="space-y-5 animate-fade-in max-h-[70vh] overflow-y-auto pr-1">
                  <div className="flex items-center justify-between border-b border-brand-blue/10 pb-3">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-brand-blue">/ Checkout via</p>
                      <p className="font-display font-extrabold text-lg">{providerMeta.name}</p>
                    </div>
                    <providerMeta.Brand className="h-7" />
                  </div>
                  <h3 className="font-display font-extrabold text-lg">Your details</h3>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)} /> Make my donation anonymous
                  </label>
                  {!anon && <Field label="Full name" value={donor.name} onChange={(v) => setDonor({ ...donor, name: v })} required />}
                  <Field label="Email" type="email" value={donor.email} onChange={(v) => setDonor({ ...donor, email: v })} required />
                  <Field label="Phone" type="tel" value={donor.phone} onChange={(v) => setDonor({ ...donor, phone: v })} />
                  <Field label="Country" value={donor.country} onChange={(v) => setDonor({ ...donor, country: v })} />
                  <Field label="Dedication (optional)" value={dedication} onChange={setDedication} placeholder="In honor of..." />
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-ink/50 pt-1">
                    <Lock className="size-3" /> Card, wallet & mobile-money details are entered on {providerMeta.name}'s secure page.
                  </div>
                </div>
              )}

              {/* Step 4 */}
              {step === 4 && (
                <div className="space-y-5 animate-fade-in">
                  <h2 className="font-display font-extrabold text-2xl">Review your donation</h2>
                  <div className="bg-surface p-5 space-y-3">
                    <Row k="Amount" v={`${currency} ${finalAmount.toLocaleString()}`} big />
                    <Row k="Type" v={TYPES.find((t) => t.id === type)?.label ?? type} />
                    <Row k="Frequency" v={freq === "one" ? "One-time" : freq} />
                    <Row k="Payment" v={providerMeta?.name ?? "—"} />
                    <Row k="Donor" v={anon ? "Anonymous" : donor.name} />
                    <Row k="Email" v={donor.email} />
                    {dedication && <Row k="Dedication" v={dedication} />}
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                </div>
              )}


              {/* Step 5 */}
              {step === 5 && receipt && (
                <div className="text-center py-6 animate-fade-in">
                  <CheckCircle2 className="size-16 text-brand-green mx-auto mb-4" />
                  <h2 className="font-display font-extrabold text-3xl mb-2">Thank you!</h2>
                  <p className="text-ink/70 mb-1">Your donation of <strong>{receipt.currency} {receipt.amount.toLocaleString()}</strong> has been received.</p>
                  <p className="text-xs font-mono text-ink/50 mb-6">Ref {receipt.reference}</p>
                  <button
                    onClick={() => generateReceiptPDF(receipt)}
                    className="w-full bg-brand-orange text-white py-4 font-display font-extrabold uppercase tracking-widest text-sm hover:bg-brand-orange/90 inline-flex items-center justify-center gap-3"
                  >
                    <Download className="size-4" /> Download Receipt (PDF)
                  </button>
                  <a href="/" className="mt-4 inline-block text-brand-blue font-mono text-[11px] uppercase tracking-widest hover:underline">Back to home</a>
                </div>
              )}

              {/* Primary CTA / Nav */}
              {step < 4 && (
                <div className="mt-6 space-y-3">
                  <button
                    type="button"
                    disabled={!canAdvance}
                    onClick={() => setStep((s) => s + 1)}
                    className="w-full bg-brand-orange text-white py-4 font-display font-extrabold uppercase tracking-widest text-sm rounded-full hover:bg-brand-orange/90 disabled:opacity-40 inline-flex items-center justify-center gap-2"
                  >
                    {step === 1
                      ? `Give ${CURRENCY_SYMBOL[currency]}${finalAmount.toLocaleString()} ${freq === "monthly" ? "Monthly" : freq === "weekly" ? "Weekly" : freq === "annual" ? "Annually" : ""}`
                      : <>Continue <ChevronRight className="size-4" /></>}
                  </button>
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={() => setStep((s) => Math.max(1, s - 1))}
                      className="w-full inline-flex items-center justify-center gap-2 py-2 font-mono text-[11px] uppercase tracking-widest text-ink/60 hover:text-brand-blue"
                    >
                      <ChevronLeft className="size-3" /> Back
                    </button>
                  )}
                </div>
              )}
              {step === 4 && (
                <div className="mt-6 space-y-3">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={submitDonation}
                    className="w-full bg-brand-orange text-white py-4 font-display font-extrabold uppercase tracking-widest text-sm rounded-full hover:bg-brand-orange/90 disabled:opacity-60 inline-flex items-center justify-center gap-2"
                  >
                    <Heart className="size-4" /> {submitting ? "Redirecting…" : `Continue to ${providerMeta?.name ?? "Checkout"}`} <ExternalLink className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2 font-mono text-[11px] uppercase tracking-widest text-ink/60 hover:text-brand-blue"
                  >
                    <ChevronLeft className="size-3" /> Back
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}


function Field({
  label, value, onChange, type = "text", placeholder, required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block font-mono text-[11px] uppercase tracking-widest text-ink/60 mb-2">
        {label}{required && " *"}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full border border-brand-blue/20 px-4 py-3 focus:border-brand-blue focus:outline-none text-sm bg-white"
      />
    </div>
  );
}

function Row({ k, v, big }: { k: string; v: string; big?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-ink/5 last:border-0 pb-2 last:pb-0">
      <span className="font-mono text-[11px] uppercase tracking-widest text-ink/50">{k}</span>
      <span className={big ? "font-display font-extrabold text-2xl text-brand-blue" : "font-medium text-sm text-ink"}>{v}</span>
    </div>
  );
}
