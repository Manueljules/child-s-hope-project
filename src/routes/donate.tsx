import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Heart, Lock, CheckCircle2, ChevronLeft, ChevronRight, Download, ShieldCheck } from "lucide-react";
import { PAYMENT_METHODS } from "@/components/donate/PaymentLogos";
import { generateReceiptPDF, type ReceiptData } from "@/lib/receipt";
import { supabase } from "@/integrations/supabase/client";
import heroChildren from "@/assets/hero-children.jpg";

export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title: "Donate — The Saints Childcare Foundation Uganda" },
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
const FREQS = ["one", "monthly", "annual"] as const;
type Freq = (typeof FREQS)[number];
const AMOUNTS_UGX = [20000, 50000, 100000, 250000, 500000, 1000000];

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
        status: "completed", // simulated success (Stripe wiring next)
        anonymous: anon,
        dedication: dedication || null,
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
      <PageHeader
        eyebrow="Donate"
        title="Help change a child's life today."
        description="100% secure. Follow the steps and receive an instant downloadable receipt."
      />

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-[1fr_240px] gap-8">
          {/* MAIN WIZARD */}
          <div className="min-w-0">
            {/* progress bar */}
            <div className="flex items-center gap-2 mb-8">
              {STEPS.map((s) => (
                <div key={s.id} className="flex-1 h-1 bg-ink/10 relative overflow-hidden">
                  <div className={`absolute inset-y-0 left-0 ${step >= s.id ? "bg-brand-blue" : "bg-transparent"} transition-all`} style={{ width: step >= s.id ? "100%" : "0%" }} />
                </div>
              ))}
            </div>

            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-8 animate-fade-in">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-widest text-brand-blue mb-3">/ Donation type</p>
                  <div className="grid sm:grid-cols-3 gap-2">
                    {TYPES.map((t) => (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => setType(t.id)}
                        className={`py-3 px-4 text-sm font-display font-extrabold uppercase tracking-widest border transition-all ${type === t.id ? "bg-ink text-white border-ink" : "border-brand-blue/20 text-ink/60 hover:border-brand-blue hover:text-brand-blue"}`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-widest text-brand-blue mb-3">/ Frequency</p>
                    <div className="flex gap-2">
                      {FREQS.map((f) => (
                        <button type="button" key={f} onClick={() => setFreq(f)} className={`flex-1 py-3 text-xs font-display font-extrabold uppercase tracking-widest border ${freq === f ? "bg-brand-blue text-white border-brand-blue" : "border-brand-blue/20 text-ink/60"}`}>
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-widest text-brand-blue mb-3">/ Currency</p>
                    <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full border border-brand-blue/20 px-4 py-3 font-display font-bold text-sm uppercase focus:border-brand-blue focus:outline-none">
                      <option value="UGX">Uganda Shillings (UGX)</option>
                      <option value="USD">US Dollars (USD)</option>
                      <option value="EUR">Euros (EUR)</option>
                      <option value="GBP">British Pounds (GBP)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <p className="font-mono text-[11px] uppercase tracking-widest text-brand-blue mb-3">/ Amount</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                    {AMOUNTS_UGX.map((a) => (
                      <button type="button" key={a} onClick={() => { setAmount(a); setCustom(""); }} className={`py-4 border font-mono text-base ${!custom && amount === a ? "border-brand-blue bg-brand-blue/10 text-brand-blue" : "border-brand-blue/20 text-ink/70 hover:border-brand-blue"}`}>
                        {a.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  <input type="number" placeholder="Custom amount" value={custom} onChange={(e) => setCustom(e.target.value)} className="w-full border border-brand-blue/20 px-4 py-3 focus:border-brand-blue focus:outline-none text-sm" />
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="font-display font-extrabold text-2xl mb-2">Choose a payment method</h2>
                  <p className="text-ink/60 text-sm">Select one — we'll ask for the details on the next step.</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {PAYMENT_METHODS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id)}
                      className={`aspect-[5/3] border flex items-center justify-center bg-white transition-all ${method === m.id ? "border-brand-blue ring-2 ring-brand-blue/30" : "border-brand-blue/20 hover:border-brand-blue"}`}
                      aria-pressed={method === m.id}
                    >
                      <m.Logo className="h-8 max-w-[70%]" />
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-ink/50">
                  <ShieldCheck className="size-4 text-brand-green" /> Encrypted end-to-end · PCI-compliant processing
                </div>
              </div>
            )}

            {/* Step 3 — Details + payment drawer */}
            {step === 3 && methodMeta && (
              <div className="grid md:grid-cols-2 gap-8 animate-fade-in">
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display font-extrabold text-2xl mb-2">Your details</h2>
                    <p className="text-ink/60 text-sm">We'll email your receipt here.</p>
                  </div>
                  <label className="flex items-center gap-3 text-sm">
                    <input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)} />
                    <span>Make my donation anonymous</span>
                  </label>
                  {!anon && (
                    <Field label="Full name" value={donor.name} onChange={(v) => setDonor({ ...donor, name: v })} required />
                  )}
                  <Field label="Email" type="email" value={donor.email} onChange={(v) => setDonor({ ...donor, email: v })} required />
                  <Field label="Phone" type="tel" value={donor.phone} onChange={(v) => setDonor({ ...donor, phone: v })} />
                  <Field label="Country" value={donor.country} onChange={(v) => setDonor({ ...donor, country: v })} />
                  <Field label="Dedication (optional)" value={dedication} onChange={setDedication} placeholder="In honor of..." />
                </div>

                {/* Side drawer for payment method-specific fields */}
                <aside className="bg-surface border border-brand-blue/10 p-6 md:p-8 space-y-5 self-start">
                  <div className="flex items-center justify-between border-b border-brand-blue/10 pb-4">
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-widest text-brand-blue">/ Paying with</p>
                      <p className="font-display font-extrabold text-lg mt-1">{methodMeta.label}</p>
                    </div>
                    <methodMeta.Logo className="h-8 max-w-[90px]" />
                  </div>

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
                      <p className="text-xs text-ink/60">You'll confirm the payment on your {methodMeta.label} device after clicking Donate.</p>
                      <Field label="Phone linked to wallet" type="tel" value={walletPhone} onChange={setWalletPhone} placeholder="+256 ..." required />
                    </>
                  )}
                  {methodMeta.kind === "paypal" && (
                    <>
                      <p className="text-xs text-ink/60">You'll be redirected to PayPal to authorise the payment.</p>
                      <Field label="PayPal email" type="email" value={paypalEmail} onChange={setPaypalEmail} required />
                    </>
                  )}
                  <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-ink/50 pt-2">
                    <Lock className="size-3" /> Details are encrypted in transit
                  </div>
                </aside>
              </div>
            )}

            {/* Step 4 — Review */}
            {step === 4 && (
              <div className="space-y-6 animate-fade-in max-w-lg">
                <h2 className="font-display font-extrabold text-2xl">Review your donation</h2>
                <div className="bg-surface p-6 space-y-3">
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

            {/* Step 5 — Receipt */}
            {step === 5 && receipt && (
              <div className="text-center py-8 animate-fade-in max-w-md mx-auto">
                <CheckCircle2 className="size-20 text-brand-green mx-auto mb-6" />
                <h2 className="font-display font-extrabold text-3xl mb-2">Thank you!</h2>
                <p className="text-ink/60 mb-2">Your donation of <strong>{receipt.currency} {receipt.amount.toLocaleString()}</strong> has been received.</p>
                <p className="text-xs font-mono text-ink/50 mb-8">Reference {receipt.reference}</p>
                <button
                  onClick={() => generateReceiptPDF(receipt)}
                  className="w-full bg-brand-orange text-white py-4 font-display font-extrabold uppercase tracking-widest text-sm hover:bg-brand-orange/90 inline-flex items-center justify-center gap-3"
                >
                  <Download className="size-4" /> Download Receipt (PDF)
                </button>
                <a href="/" className="mt-4 inline-block text-brand-blue font-mono text-[11px] uppercase tracking-widest hover:underline">Back to home</a>
              </div>
            )}

            {/* Nav buttons */}
            {step < 5 && (
              <div className="flex items-center justify-between mt-10 pt-6 border-t border-brand-blue/10">
                <button
                  type="button"
                  disabled={step === 1}
                  onClick={() => setStep((s) => Math.max(1, s - 1))}
                  className="inline-flex items-center gap-2 px-5 py-3 font-display font-extrabold uppercase tracking-widest text-xs text-ink/60 disabled:opacity-30 hover:text-brand-blue"
                >
                  <ChevronLeft className="size-4" /> Previous
                </button>
                {step < 4 ? (
                  <button
                    type="button"
                    disabled={!canAdvance}
                    onClick={() => setStep((s) => s + 1)}
                    className="inline-flex items-center gap-2 bg-brand-blue text-white px-7 py-4 font-display font-extrabold uppercase tracking-widest text-sm disabled:opacity-40 hover:bg-brand-blue/90"
                  >
                    Next <ChevronRight className="size-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={submitDonation}
                    className="inline-flex items-center gap-2 bg-brand-orange text-white px-7 py-4 font-display font-extrabold uppercase tracking-widest text-sm disabled:opacity-60 hover:bg-brand-orange/90"
                  >
                    <Heart className="size-4" /> {submitting ? "Processing…" : `Donate ${currency} ${finalAmount.toLocaleString()}`}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* VERTICAL STEP TAB (right) */}
          <aside className="hidden lg:block sticky top-24 self-start rounded-none overflow-hidden">
            <div className="relative">
              <img src={heroChildren} alt="" aria-hidden className="absolute inset-0 size-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-brand-blue/95 via-brand-blue/85 to-ink/90" />
              <div className="relative p-6 text-white">
                <p className="font-mono text-[10px] uppercase tracking-widest text-brand-gold mb-6">/ Steps</p>
                <ol className="space-y-5">
                  {STEPS.map((s) => {
                    const active = s.id === step;
                    const done = s.id < step;
                    return (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => s.id < step && setStep(s.id)}
                          disabled={s.id > step}
                          className="w-full text-left flex gap-3 items-start disabled:cursor-not-allowed"
                        >
                          <span
                            className={`size-7 shrink-0 rounded-full grid place-items-center font-display font-extrabold text-xs border ${
                              done ? "bg-brand-gold text-ink border-brand-gold" : active ? "bg-white text-brand-blue border-white" : "border-white/40 text-white/60"
                            }`}
                          >
                            {done ? "✓" : s.id}
                          </span>
                          <span className="min-w-0">
                            <span className={`block font-display font-extrabold text-sm uppercase tracking-wide ${active ? "text-white" : done ? "text-white/90" : "text-white/60"}`}>
                              {s.title}
                            </span>
                            <span className="block text-[11px] text-white/60 mt-0.5 leading-snug">
                              {s.hint}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
          </aside>
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
