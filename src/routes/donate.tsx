import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Heart, Lock, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title: "Donate — The Saints Childcare Foundation Uganda" },
      { name: "description", content: "Help change a child's life today. One-time, monthly, or annual donations via card, mobile money, PayPal, and more." },
    ],
  }),
  component: DonatePage,
});

const FREQS = ["one", "monthly", "annual"] as const;
type Freq = (typeof FREQS)[number];

const TYPES = [
  { id: "one", label: "One-Time" },
  { id: "monthly", label: "Monthly Giving" },
  { id: "annual", label: "Annual Giving" },
  { id: "sponsor", label: "Sponsor a Child" },
  { id: "emergency", label: "Emergency Appeal" },
  { id: "project", label: "Specific Project" },
];

const AMOUNTS_UGX = [20000, 50000, 100000, 250000, 500000, 1000000];

function DonatePage() {
  const [type, setType] = useState("one");
  const [freq, setFreq] = useState<Freq>("one");
  const [currency, setCurrency] = useState("UGX");
  const [amount, setAmount] = useState(100000);
  const [custom, setCustom] = useState("");
  const [anon, setAnon] = useState(false);
  const [dedicate, setDedicate] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const final = custom ? Number(custom) : amount;

  return (
    <SiteLayout>
      <PageHeader eyebrow="Donate" title="Help change a child's life today." description="100% secure. Every shilling tracked and reported. Your gift goes directly into the hands of children who need it most." />

      {submitted ? (
        <section className="py-32 text-center">
          <CheckCircle2 className="size-20 text-brand-green mx-auto mb-6" />
          <h2 className="font-display font-extrabold text-4xl mb-4">Thank you!</h2>
          <p className="text-ink/60 max-w-md mx-auto">A receipt has been sent to your email. You'll begin receiving impact updates within 30 days.</p>
        </section>
      ) : (
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-3 gap-12">
            <form
              onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
              className="lg:col-span-2 space-y-10"
            >
              {/* Type */}
              <div>
                <p className="font-mono text-[11px] uppercase tracking-widest text-brand-blue mb-3">/ Donation type</p>
                <div className="grid sm:grid-cols-3 gap-2">
                  {TYPES.map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setType(t.id)}
                      className={`py-3 px-4 text-sm font-display font-extrabold uppercase tracking-widest border ${type === t.id ? "bg-ink text-white border-ink" : "border-brand-blue/20 text-ink/60 hover:border-brand-blue hover:text-brand-blue"}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Frequency + currency */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-widest text-brand-blue mb-3">/ Frequency</p>
                  <div className="flex gap-2">
                    {FREQS.map((f) => (
                      <button
                        type="button"
                        key={f}
                        onClick={() => setFreq(f)}
                        className={`flex-1 py-3 text-xs font-display font-extrabold uppercase tracking-widest border ${freq === f ? "bg-brand-blue text-white border-brand-blue" : "border-brand-blue/20 text-ink/60"}`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-widest text-brand-blue mb-3">/ Currency</p>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full border border-brand-blue/20 px-4 py-3 font-display font-bold text-sm uppercase focus:border-brand-blue focus:outline-none"
                  >
                    <option value="UGX">Uganda Shillings (UGX)</option>
                    <option value="USD">US Dollars (USD)</option>
                    <option value="EUR">Euros (EUR)</option>
                    <option value="GBP">British Pounds (GBP)</option>
                  </select>
                </div>
              </div>

              {/* Amount */}
              <div>
                <p className="font-mono text-[11px] uppercase tracking-widest text-brand-blue mb-3">/ Amount</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  {AMOUNTS_UGX.map((a) => (
                    <button
                      type="button"
                      key={a}
                      onClick={() => { setAmount(a); setCustom(""); }}
                      className={`py-4 border font-mono text-base ${!custom && amount === a ? "border-brand-blue bg-brand-blue/10 text-brand-blue" : "border-brand-blue/20 text-ink/70 hover:border-brand-blue"}`}
                    >
                      {a.toLocaleString()}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  placeholder="Custom amount"
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  className="w-full border border-brand-blue/20 px-4 py-3 focus:border-brand-blue focus:outline-none text-sm"
                />
              </div>

              {/* Donor info */}
              <div className="grid sm:grid-cols-2 gap-6">
                <Field label="Full Name" name="name" required />
                <Field label="Email" name="email" type="email" required />
                <Field label="Phone" name="phone" type="tel" />
                <Field label="Country" name="country" />
              </div>

              {/* Options */}
              <div className="space-y-3">
                <label className="flex items-start gap-3 text-sm">
                  <input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)} className="mt-1" />
                  <span>Make this donation anonymous</span>
                </label>
                <label className="flex items-start gap-3 text-sm">
                  <input type="checkbox" checked={dedicate} onChange={(e) => setDedicate(e.target.checked)} className="mt-1" />
                  <span>Dedicate this donation in memory or honor of someone</span>
                </label>
                {dedicate && (
                  <input
                    placeholder="In honor of..."
                    className="w-full border border-brand-blue/20 px-4 py-3 focus:border-brand-blue focus:outline-none text-sm"
                  />
                )}
              </div>

              {/* Payment method */}
              <div>
                <p className="font-mono text-[11px] uppercase tracking-widest text-brand-blue mb-3">/ Payment Method</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono uppercase tracking-widest text-ink/60">
                  {["Visa", "Mastercard", "Amex", "PayPal", "Apple Pay", "Google Pay", "MTN Money", "Airtel Money", "Bank Transfer", "Flutterwave", "Pesapal", "Stripe"].map((m) => (
                    <div key={m} className="border border-brand-blue/15 px-3 py-2 text-center">{m}</div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-brand-orange text-white py-5 font-display font-extrabold uppercase tracking-[0.2em] text-base hover:bg-brand-orange/90 inline-flex items-center justify-center gap-3"
              >
                <Heart className="size-5" />
                Donate {currency} {final.toLocaleString()}{freq !== "one" ? `/${freq === "monthly" ? "mo" : "yr"}` : ""}
              </button>

              <p className="text-[11px] font-mono uppercase tracking-widest text-ink/40 text-center inline-flex items-center justify-center gap-2 w-full">
                <Lock className="size-3" /> SSL encrypted · Receipt sent by email
              </p>
            </form>

            {/* Sidebar */}
            <aside className="space-y-6">
              <div className="bg-ink text-white p-8">
                <p className="font-mono text-brand-gold text-xs uppercase tracking-widest mb-4">/ Current Campaign</p>
                <h3 className="font-display font-extrabold text-2xl mb-4">Back-to-school 2026</h3>
                <p className="text-white/60 text-sm mb-6">Raising school fees and supplies for 500 students.</p>
                <div className="mb-2 flex justify-between text-xs font-mono">
                  <span className="text-white/50">Raised</span>
                  <span className="text-brand-gold">UGX 32.4M of 50M</span>
                </div>
                <div className="w-full h-2 bg-white/10">
                  <div className="h-full bg-brand-gold" style={{ width: "65%" }} />
                </div>
              </div>

              <div className="bg-surface p-8">
                <p className="font-mono text-brand-blue text-xs uppercase tracking-widest mb-3">/ Your gift</p>
                <ul className="space-y-3 text-sm text-ink/70">
                  <li>· UGX 20,000 — one week of meals</li>
                  <li>· UGX 50,000 — school supplies</li>
                  <li>· UGX 100,000 — monthly sponsorship</li>
                  <li>· UGX 500,000 — full term of school</li>
                </ul>
              </div>
            </aside>
          </div>
        </section>
      )}
    </SiteLayout>
  );
}

function Field({ label, name, type = "text", required }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label htmlFor={name} className="block font-mono text-[11px] uppercase tracking-widest text-ink/60 mb-2">
        {label}{required && " *"}
      </label>
      <input id={name} name={name} type={type} required={required} className="w-full border border-brand-blue/20 px-4 py-3 focus:border-brand-blue focus:outline-none text-sm" />
    </div>
  );
}
