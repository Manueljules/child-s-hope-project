import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Phone, Mail, MapPin, Clock, MessageCircle, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — The Saint's Childcare Foundation Uganda" },
      { name: "description", content: "Get in touch with The Saint's Childcare Foundation Uganda. Phone, email, office location and contact form." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  return (
    <SiteLayout>
      <PageHeader eyebrow="Contact" title="We'd love to hear from you." description="Whether you're a donor, partner, volunteer or simply curious — we're here." />

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="grid sm:grid-cols-2 gap-px bg-brand-blue/10 border border-brand-blue/10">
              {[
                { Icon: Phone, l: "Phone", v: "+256 700 339 231" },
                { Icon: Phone, l: "Alt. Phone", v: "+256 769 027 058" },
                { Icon: Mail, l: "Email", v: "thesaintschildcare@gmail.com" },
                { Icon: MapPin, l: "Office", v: "Plot 24, Kampala Road" },
                { Icon: Clock, l: "Hours", v: "Mon–Fri, 9am–5pm EAT" },
              ].map((c) => (
                <div key={c.l} className="bg-white p-6">
                  <c.Icon className="size-5 text-brand-blue mb-3" />
                  <p className="font-mono text-[10px] uppercase tracking-widest text-ink/40 mb-1">{c.l}</p>
                  <p className="font-display font-extrabold text-sm break-all">{c.v}</p>
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
                <h2 className="font-display font-extrabold text-2xl mb-3">Message received</h2>
                <p className="text-ink/60">We'll get back to you within 2 business days.</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-6 bg-surface p-8 md:p-10">
                <p className="font-mono text-brand-blue text-xs uppercase tracking-widest">/ Send a Message</p>
                <h2 className="font-display font-extrabold text-3xl tracking-tight">Get in touch.</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Name" name="name" required />
                  <Field label="Email" name="email" type="email" required />
                </div>
                <Field label="Subject" name="subject" required />
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-widest text-ink/60 mb-2">Message *</label>
                  <textarea rows={6} required className="w-full border border-brand-blue/20 px-4 py-3 bg-white focus:border-brand-blue focus:outline-none text-sm" />
                </div>
                <button type="submit" className="w-full bg-brand-orange text-white py-4 font-display font-extrabold uppercase tracking-[0.2em] hover:bg-brand-orange/90">
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({ label, name, type = "text", required }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label htmlFor={name} className="block font-mono text-[11px] uppercase tracking-widest text-ink/60 mb-2">
        {label}{required && " *"}
      </label>
      <input id={name} name={name} type={type} required={required} className="w-full border border-brand-blue/20 px-4 py-3 bg-white focus:border-brand-blue focus:outline-none text-sm" />
    </div>
  );
}
