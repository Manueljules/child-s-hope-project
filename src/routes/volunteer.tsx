import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/volunteer")({
  head: () => ({
    meta: [
      { title: "Volunteer — The Saint's Childcare Foundation Uganda" },
      { name: "description", content: "Apply to volunteer with The Saint's Childcare Foundation Uganda. Lend your skills to help vulnerable children." },
    ],
  }),
  component: VolunteerPage,
});

function VolunteerPage() {
  const [submitted, setSubmitted] = useState(false);
  return (
    <SiteLayout>
      <PageHeader eyebrow="Volunteer" title="Give what you have. Change a life." description="Join a community of volunteers transforming the lives of vulnerable children across Uganda." />

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          {submitted ? (
            <div className="text-center py-16">
              <CheckCircle2 className="size-16 text-brand-green mx-auto mb-6" />
              <h2 className="font-display font-extrabold text-3xl mb-3">Application received!</h2>
              <p className="text-ink/60">We'll reach out within 5 business days.</p>
            </div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
              className="space-y-6"
            >
              <p className="font-mono text-brand-blue text-sm uppercase tracking-widest">/ Volunteer Application</p>
              <h2 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight mb-8">Tell us about yourself.</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Field label="Full Name" name="name" required />
                <Field label="Email" name="email" type="email" required />
                <Field label="Phone" name="phone" type="tel" />
                <Field label="Country" name="country" required />
                <Field label="Skills" name="skills" placeholder="Teaching, medical, marketing..." />
                <Field label="Availability" name="availability" placeholder="Weekends, 2 months, full-time..." />
              </div>
              <Field label="Areas of Interest" name="interest" placeholder="Education, healthcare, child protection, fundraising..." />
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-widest text-ink/60 mb-2">Upload CV (optional)</label>
                <input type="file" className="block w-full text-sm border border-brand-blue/20 p-3 file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-brand-blue file:text-white file:font-display file:font-bold file:uppercase file:text-xs" />
              </div>
              <button
                type="submit"
                className="w-full bg-brand-orange text-white py-5 font-display font-extrabold uppercase tracking-[0.2em] hover:bg-brand-orange/90"
              >
                Submit Application
              </button>
            </form>
          )}
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
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full border border-brand-blue/20 px-4 py-3 focus:border-brand-blue focus:outline-none text-sm"
      />
    </div>
  );
}
