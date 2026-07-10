import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { ChevronDown } from "lucide-react";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Masembe Childcare Foundation Uganda" },
      { name: "description", content: "Answers to common questions about donating, volunteering, sponsorship, and partnering with Masembe Childcare Foundation Uganda." },
    ],
  }),
  component: FaqPage,
});

const groups = [
  {
    heading: "Volunteering",
    items: [
      { q: "How do I apply to volunteer?", a: "Fill in the form on our Volunteer page. We review every application and reply within 5 business days." },
      { q: "Can I volunteer from outside Uganda?", a: "Yes. We host both in-country and remote volunteers. Remote roles include grant writing, translation, design, mentoring, social media and web development." },
      { q: "Is there a minimum time commitment?", a: "For in-country placements we ask for at least two weeks. Remote roles are more flexible — even a few hours a month makes a difference." },
      { q: "Do you cover accommodation or travel?", a: "Volunteers cover their own flights, visas and insurance. We help arrange safe, affordable local accommodation and pick-up from the airport." },
      { q: "Do I need a specific skill or background?", a: "No. Teachers, nurses, tradespeople, students and retirees all volunteer with us. Tell us what you love doing and we'll match you to real need." },
    ],
  },
  {
    heading: "Donations & sponsorship",
    items: [
      { q: "How do I know my donation reaches the children?", a: "Every donation is receipted. You can choose the specific project your gift funds, and the project's progress bar updates as donations arrive." },
      { q: "Can I sponsor one child?", a: "Yes. Child sponsorship is UGX 100,000 (or equivalent) per month and covers school fees, uniform, meals and healthcare for one child." },
      { q: "Can I give in USD, EUR or GBP?", a: "Yes. The donate page supports UGX, USD, EUR and GBP." },
      { q: "Do you issue tax receipts?", a: "You'll get an instant PDF receipt after every donation. For country-specific tax deductibility, contact us — we can partner with local foundations." },
      { q: "Can I give one-time, weekly or monthly?", a: "All three. You choose your frequency on the donate page." },
    ],
  },
  {
    heading: "Partnerships & other",
    items: [
      { q: "How can my company or church partner with you?", a: "Email thesaintschildcare@gmail.com or use the contact form. We work with corporate teams, faith groups, schools and universities." },
      { q: "Can I donate items instead of money?", a: "Yes — books, uniforms, medical supplies, laptops and food. Get in touch first so we can plan delivery and receipt the gift." },
      { q: "Where does the foundation work?", a: "We operate across 22 districts of Uganda, with primary offices in Kampala." },
    ],
  },
];

function FaqPage() {
  const [open, setOpen] = useState<string | null>("Volunteering-0");
  return (
    <SiteLayout>
      <PageHeader eyebrow="FAQ" title="Questions, answered." description="Everything you need to know about donating, volunteering and partnering with us." />
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 space-y-16">
          {groups.map((g) => (
            <div key={g.heading}>
              <p className="font-mono text-brand-blue text-xs uppercase tracking-widest mb-6">/ {g.heading}</p>
              <div className="divide-y divide-brand-blue/10 border-t border-b border-brand-blue/10">
                {g.items.map((it, i) => {
                  const key = `${g.heading}-${i}`;
                  const isOpen = open === key;
                  return (
                    <div key={key}>
                      <button
                        onClick={() => setOpen(isOpen ? null : key)}
                        className="w-full text-left py-5 flex items-center justify-between gap-4"
                      >
                        <span className="font-display font-extrabold text-base md:text-lg">{it.q}</span>
                        <ChevronDown className={`size-5 text-brand-blue shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                      {isOpen && <p className="pb-5 text-ink/70 leading-relaxed">{it.a}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
