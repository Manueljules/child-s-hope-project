import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/volunteer")({
  head: () => ({
    meta: [
      { title: "Volunteer — Masembe Childcare Foundation Uganda" },
      { name: "description", content: "Apply to volunteer with Masembe Childcare Foundation Uganda. Lend your skills to help vulnerable children." },
    ],
  }),
  component: VolunteerPage,
});

const volunteerSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  country: z.string().trim().min(2, "Please enter your country").max(80),
  skills: z.string().trim().max(500).optional().or(z.literal("")),
  availability: z.string().trim().max(200).optional().or(z.literal("")),
  interest: z.string().trim().max(500).optional().or(z.literal("")),
});

function VolunteerPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: "", email: "", phone: "", country: "", skills: "", availability: "", interest: "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    const parsed = volunteerSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) errs[String(issue.path[0])] = issue.message;
      setFieldErrors(errs);
      return;
    }
    setSubmitting(true);
    const { error: err } = await supabase.from("volunteer_applications").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      country: parsed.data.country,
      skills: parsed.data.skills || null,
      availability: parsed.data.availability || null,
      interest: parsed.data.interest || null,
    });
    setSubmitting(false);
    if (err) {
      setError("Could not submit application. Please try again.");
      return;
    }
    setSubmitted(true);
  }

  return (
    <SiteLayout>
      <PageHeader eyebrow="Volunteer" title="Give what you have. Change a life." description="Join a community of volunteers transforming the lives of vulnerable children across Uganda." />

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          {submitted ? (
            <div className="text-center py-16">
              <CheckCircle2 className="size-16 text-brand-green mx-auto mb-6" />
              <h2 className="font-display font-extrabold text-3xl mb-3">Successfully submitted</h2>
              <p className="text-ink/60">Thank you {form.name || "friend"} — we'll reach out within 5 business days.</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-6">
              <p className="font-mono text-brand-blue text-sm uppercase tracking-widest">/ Volunteer Application</p>
              <h2 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight mb-8">Tell us about yourself.</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Field label="Full Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required error={fieldErrors.name} />
                <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required error={fieldErrors.email} />
                <Field label="Phone" type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} error={fieldErrors.phone} />
                <Field label="Country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} required error={fieldErrors.country} />
                <Field label="Skills" value={form.skills} onChange={(v) => setForm({ ...form, skills: v })} placeholder="Teaching, medical, marketing..." error={fieldErrors.skills} />
                <Field label="Availability" value={form.availability} onChange={(v) => setForm({ ...form, availability: v })} placeholder="Weekends, 2 months, full-time..." error={fieldErrors.availability} />
              </div>
              <Field label="Areas of Interest" value={form.interest} onChange={(v) => setForm({ ...form, interest: v })} placeholder="Education, healthcare, child protection, fundraising..." error={fieldErrors.interest} />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-brand-orange text-white py-5 font-display font-extrabold uppercase tracking-[0.2em] hover:bg-brand-orange/90 disabled:opacity-60"
              >
                {submitting ? "Submitting…" : "Submit Application"}
              </button>
              <p className="text-xs text-ink/50 text-center">Have questions first? See our <a href="/faq" className="text-brand-blue underline">FAQ</a>.</p>
            </form>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({ label, value, onChange, type = "text", required, placeholder, error }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; placeholder?: string; error?: string }) {
  return (
    <div>
      <label className="block font-mono text-[11px] uppercase tracking-widest text-ink/60 mb-2">
        {label}{required && " *"}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        required={required}
        placeholder={placeholder}
        className={`w-full border px-4 py-3 focus:outline-none text-sm ${error ? "border-red-500 focus:border-red-500" : "border-brand-blue/20 focus:border-brand-blue"}`}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
