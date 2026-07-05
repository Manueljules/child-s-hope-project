import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Phone, Mail, MapPin, Clock, MessageCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — The Saint's Childcare Foundation Uganda" },
      { name: "description", content: "Get in touch with The Saint's Childcare Foundation Uganda. Phone, email, office location and contact form." },
    ],
  }),
  component: ContactPage,
});

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  subject: z.string().trim().min(2, "Please add a subject").max(150),
  message: z.string().trim().min(10, "Message is a bit short").max(2000),
});

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) errs[String(issue.path[0])] = issue.message;
      setFieldErrors(errs);
      return;
    }
    setSubmitting(true);
    const { error: err } = await supabase.from("contact_messages").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      subject: parsed.data.subject,
      message: parsed.data.message,
    });
    setSubmitting(false);
    if (err) {
      setError("Could not send message. Please try again or email us directly.");
      return;
    }
    setSubmitted(true);
  }

  return (
    <SiteLayout>
      <PageHeader eyebrow="Contact" title="We'd love to hear from you." description="Whether you're a donor, partner, volunteer or simply curious — we're here." />

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="grid sm:grid-cols-2 gap-px bg-brand-blue/10 border border-brand-blue/10">
              {[
                { Icon: Phone, l: "Phone", v: "+256 700 339 231" },
                { Icon: Phone, l: "Alt. Phone", v: "+256 769 027 758" },
                { Icon: Mail, l: "Email", v: "thesaintschildcare@gmail.com", highlight: true },
                { Icon: MapPin, l: "Office", v: "Plot 24, Kampala Road" },
                { Icon: Clock, l: "Hours", v: "Mon–Fri, 9am–5pm EAT" },
              ].map((c) => (
                <div key={c.l} className="bg-white p-6">
                  <c.Icon className="size-5 text-brand-blue mb-3" />
                  <p className="font-mono text-[10px] uppercase tracking-widest text-ink/40 mb-1">{c.l}</p>
                  <p className={`font-display font-extrabold text-sm break-all ${"highlight" in c && c.highlight ? "text-brand-blue" : ""}`}>{c.v}</p>
                </div>
              ))}
            </div>

            <a
              href="https://wa.me/256700339231"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-brand-green text-white px-6 py-4 font-display font-extrabold uppercase text-sm tracking-widest hover:bg-brand-green/90"
            >
              <MessageCircle className="size-5" /> Chat on WhatsApp
            </a>

            <div className="aspect-video w-full overflow-hidden border border-brand-blue/10">
              <iframe
                title="Office location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63799.428!2d32.55!3d0.347!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x177dbb1b58e2cabf%3A0xff63d72f48e1c54!2sKampala%2C%20Uganda!5e0!3m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <div>
            {submitted ? (
              <div className="bg-surface p-12 text-center">
                <CheckCircle2 className="size-16 text-brand-green mx-auto mb-6" />
                <h2 className="font-display font-extrabold text-2xl mb-3">Successfully submitted</h2>
                <p className="text-ink/60">Thank you {form.name || "friend"} — we'll get back to you within 2 business days.</p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-6 bg-surface p-8 md:p-10">
                <p className="font-mono text-brand-blue text-xs uppercase tracking-widest">/ Send a Message</p>
                <h2 className="font-display font-extrabold text-3xl tracking-tight">Get in touch.</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
                  <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
                </div>
                <Field label="Phone" type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
                <Field label="Subject" value={form.subject} onChange={(v) => setForm({ ...form, subject: v })} required />
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-widest text-ink/60 mb-2">Message *</label>
                  <textarea rows={6} required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full border border-brand-blue/20 px-4 py-3 bg-white focus:border-brand-blue focus:outline-none text-sm" />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button type="submit" disabled={submitting} className="w-full bg-brand-orange text-white py-4 font-display font-extrabold uppercase tracking-[0.2em] hover:bg-brand-orange/90 disabled:opacity-60">
                  {submitting ? "Sending…" : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block font-mono text-[11px] uppercase tracking-widest text-ink/60 mb-2">
        {label}{required && " *"}
      </label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} className="w-full border border-brand-blue/20 px-4 py-3 bg-white focus:border-brand-blue focus:outline-none text-sm" />
    </div>
  );
}
