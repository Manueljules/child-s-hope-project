import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Building2, Church, School, Briefcase, Landmark, Globe2, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/partner")({
  head: () => ({
    meta: [
      { title: "Partner With Us — The Saints Childcare Foundation Uganda" },
      { name: "description", content: "Partner with The Saints Childcare Foundation Uganda — for NGOs, corporations, churches, schools, foundations and government bodies." },
    ],
  }),
  component: PartnerPage,
});

function PartnerPage() {
  const [submitted, setSubmitted] = useState(false);
  const partners = [
    { Icon: Globe2, t: "NGOs" }, { Icon: Church, t: "Churches" }, { Icon: School, t: "Schools" },
    { Icon: Briefcase, t: "Corporations" }, { Icon: Building2, t: "Foundations" }, { Icon: Landmark, t: "Government" },
  ];

  return (
    <SiteLayout>
      <PageHeader eyebrow="Partner With Us" title="Together, we go further." description="Strategic partnerships multiply our impact. Let's build something lasting." />

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-brand-blue/10 border border-brand-blue/10 mb-20">
            {partners.map((p) => (
              <div key={p.t} className="bg-white p-8 text-center">
                <p.Icon className="size-8 text-brand-blue mx-auto mb-4" />
                <p className="font-display font-extrabold uppercase text-sm">{p.t}</p>
              </div>
            ))}
          </div>

          <div className="max-w-3xl mx-auto">
            {submitted ? (
              <div className="text-center py-16">
                <CheckCircle2 className="size-16 text-brand-green mx-auto mb-6" />
                <h2 className="font-display font-extrabold text-3xl mb-3">Thank you!</h2>
                <p className="text-ink/60">Our partnerships team will contact you within 3 business days.</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-6">
                <p className="font-mono text-brand-blue text-sm uppercase tracking-widest">/ Partnership Inquiry</p>
                <h2 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight mb-8">Become a partner.</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <Field label="Organization Name" name="org" required />
                  <Field label="Contact Person" name="contact" required />
                  <Field label="Email" name="email" type="email" required />
                  <Field label="Phone" name="phone" type="tel" />
                  <Field label="Country" name="country" required />
                  <Field label="Organization Type" name="type" placeholder="NGO, Corporation, School..." />
                </div>
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-widest text-ink/60 mb-2">How would you like to partner?</label>
                  <textarea rows={5} required className="w-full border border-brand-blue/20 px-4 py-3 focus:border-brand-blue focus:outline-none text-sm" />
                </div>
                <button type="submit" className="w-full bg-brand-orange text-white py-5 font-display font-extrabold uppercase tracking-[0.2em] hover:bg-brand-orange/90">
                  Submit Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({ label, name, type = "text", required, placeholder }: { label: string; name: string; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <div>
      <label htmlFor={name} className="block font-mono text-[11px] uppercase tracking-widest text-ink/60 mb-2">
        {label}{required && " *"}
      </label>
      <input id={name} name={name} type={type} required={required} placeholder={placeholder} className="w-full border border-brand-blue/20 px-4 py-3 focus:border-brand-blue focus:outline-none text-sm" />
    </div>
  );
}
