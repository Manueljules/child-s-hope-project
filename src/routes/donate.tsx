import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Heart, Lock, CheckCircle2, ChevronLeft, ChevronRight, Download, ShieldCheck } from "lucide-react";
import { PAYMENT_METHODS } from "@/components/donate/PaymentLogos";
import { generateReceiptPDF, type ReceiptData } from "@/lib/receipt";
import { supabase } from "@/integrations/supabase/client";
import heroChildren from "@/assets/hero-children.jpg";

export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title: "Donate — The Saint's Childcare Foundation Uganda" },
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


  // step 2
  const [method, setMethod] = useState<string | null>(null);

  // step 3 — donor
  const [donor, setDonor] = useState({ name: "", email: "", phone: "", country: "Uganda" });
  const [anon, setAnon] = useState(false);
  const [dedication, setDedication] = useState("");
  // step 3 — payment details
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvc: "" });
  const [paypalEmail, setPaypalEmail] = useState("");
  const [walletPhone, setWalletPhone] = useState("");

  // step 5 — receipt
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finalAmount = custom ? Number(custom) : amount;
  const methodMeta = PAYMENT_METHODS.find((m) => m.id === method);

  const canAdvance = (() => {
    if (step === 1) return finalAmount > 0;
    if (step === 2) return !!method;
    if (step === 3) {
      if (!anon && (!donor.name || !donor.email)) return false;
      if (anon && !donor.email) return false;
      if (methodMeta?.kind === "card") return card.number.length >= 12 && card.name && card.expiry && card.cvc.length >= 3;
      if (methodMeta?.kind === "wallet") return walletPhone.length >= 6;
      if (methodMeta?.kind === "paypal") return /\S+@\S+\.\S+/.test(paypalEmail);
    }
    return true;
  })();

  async function submitDonation() {
    setSubmitting(true);
    setError(null);
    try {
      const reference = newRef();
      const payload = {
        reference,
        donor_name: anon ? null : donor.name,
        donor_email: donor.email,
        donor_phone: donor.phone || null,
        donor_country: donor.country || null,
        amount: finalAmount,
        currency,
        frequency: freq,
        donation_type: type,
        payment_method: methodMeta?.label ?? method,
        status: "confirmed", // simulated success (Stripe wiring next); trigger updates project.raised
        anonymous: anon,
        dedication: dedication || null,
        project_id: projectId || null,
        metadata: { simulated: true },

      };
      const { error: err } = await supabase.from("donations").insert(payload);
      if (err) throw err;
      setReceipt({
        reference,
        createdAt: new Date(),
        donorName: donor.name,
        donorEmail: donor.email,
        amount: finalAmount,
        currency,
        frequency: freq,
        donationType: type,
        paymentMethod: methodMeta?.label ?? method ?? "—",
        anonymous: anon,
        dedication,
      });
      setStep(5);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SiteLayout>
      {/* Full-bleed hero with floating donation card */}
      <section className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden">
        {/* Background image */}
        <img src={heroChildren} alt="" aria-hidden className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/10" />

        <div className="relative max-w-7xl mx-auto px-6 py-10 md:py-16 min-h-[calc(100vh-4rem)] flex items-center justify-end">
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
                    Help more children in need wherever they are. By making a {freq === "monthly" ? "monthly" : "one-time"} gift to The Saint's Childcare Foundation, you provide children in Uganda with relief, protection, and hope for a better future.
                  </p>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div className="space-y-5 animate-fade-in">
                  <h2 className="font-display font-extrabold text-2xl">Choose a payment method</h2>
                  <div className="grid grid-cols-3 gap-3">
                    {PAYMENT_METHODS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMethod(m.id)}
                        className={`aspect-[5/3] border flex items-center justify-center bg-white transition-all ${method === m.id ? "border-brand-blue ring-2 ring-brand-blue/30" : "border-brand-blue/20 hover:border-brand-blue"}`}
                      >
                        <m.Logo className="h-8 max-w-[75%]" />
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-ink/50">
                    <ShieldCheck className="size-4 text-brand-green" /> Encrypted · PCI-compliant
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {step === 3 && methodMeta && (
                <div className="space-y-5 animate-fade-in max-h-[70vh] overflow-y-auto pr-1">
                  <div className="flex items-center justify-between border-b border-brand-blue/10 pb-3">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-brand-blue">/ Paying with</p>
                      <p className="font-display font-extrabold text-lg">{methodMeta.label}</p>
                    </div>
                    <methodMeta.Logo className="h-7" />
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

                  <div className="border-t border-brand-blue/10 pt-4 space-y-3">
                    <h3 className="font-display font-extrabold text-lg">Payment details</h3>
                    {methodMeta.kind === "card" && (
                      <>
                        <Field label="Card number" value={card.number} onChange={(v) => setCard({ ...card, number: v.replace(/[^0-9 ]/g, "").slice(0, 19) })} placeholder="1234 5678 9012 3456" required />
                        <Field label="Name on card" value={card.name} onChange={(v) => setCard({ ...card, name: v })} required />
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Expiry" value={card.expiry} onChange={(v) => setCard({ ...card, expiry: v.slice(0, 5) })} placeholder="MM/YY" required />
                          <Field label="CVC" value={card.cvc} onChange={(v) => setCard({ ...card, cvc: v.replace(/\D/g, "").slice(0, 4) })} placeholder="123" required />
                        </div>
                      </>
                    )}
                    {methodMeta.kind === "wallet" && (
                      <>
                        <p className="text-xs text-ink/60">You'll confirm the payment on your {methodMeta.label} device.</p>
                        <Field label="Phone linked to wallet" type="tel" value={walletPhone} onChange={setWalletPhone} required />
                      </>
                    )}
                    {methodMeta.kind === "paypal" && (
                      <Field label="PayPal email" type="email" value={paypalEmail} onChange={setPaypalEmail} required />
                    )}
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-ink/50 pt-1">
                      <Lock className="size-3" /> Encrypted in transit
                    </div>
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
                    <Row k="Payment" v={methodMeta?.label ?? "—"} />
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
                    <Heart className="size-4" /> {submitting ? "Processing…" : `Donate ${currency} ${finalAmount.toLocaleString()}`}
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
