import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Plus, Minus } from "lucide-react";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQs — The Saints Childcare Foundation Uganda" },
      { name: "description", content: "Frequently asked questions about donations, sponsorships, volunteering, tax receipts, programs, safety and privacy." },
    ],
  }),
  component: FAQPage,
});

const groups = [
  {
    title: "Donations",
    items: [
      ["Is my donation tax deductible?", "Yes — we issue official donation receipts for tax purposes in Uganda. Donors in the US, UK and EU should consult their local tax advisor."],
      ["How is my money used?", "87¢ of every dollar goes directly to programs. The remainder covers governance, audits and operational costs."],
      ["Can I cancel a recurring donation?", "Anytime, with no questions asked. Email us or use the link in any monthly receipt."],
    ],
  },
  {
    title: "Child Sponsorship",
    items: [
      ["How will I know how my sponsored child is doing?", "You'll receive personal updates, photos, and school reports two to three times per year."],
      ["Can I meet my sponsored child?", "Yes. Coordinated visits to Uganda can be arranged after at least six months of sponsorship."],
      ["What if my sponsored child leaves the program?", "We'll match you with another child immediately, or refund unused funds."],
    ],
  },
  {
    title: "Volunteering",
    items: [
      ["Do I need specific skills to volunteer?", "No. We have roles for educators, healthcare professionals, designers, fundraisers and general helpers."],
      ["Is there a minimum time commitment?", "We accept short-term and long-term volunteers, both local and international."],
    ],
  },
  {
    title: "Safety & Privacy",
    items: [
      ["How are children protected?", "All staff and volunteers undergo background checks and child safeguarding training. We follow strict child protection policies."],
      ["How is my personal data handled?", "We comply with GDPR and Uganda data protection law. We never sell or share your information."],
    ],
  },
];

function FAQPage() {
  return (
    <SiteLayout>
      <PageHeader eyebrow="FAQs" title="Your questions, answered." />

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 space-y-16">
          {groups.map((g) => (
            <div key={g.title}>
              <p className="font-mono text-brand-blue text-xs uppercase tracking-widest mb-4">/ {g.title}</p>
              <div className="border-t border-brand-blue/10">
                {g.items.map(([q, a]) => <Item key={q} q={q} a={a} />)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}

function Item({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-brand-blue/10">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between gap-4 py-6 text-left">
        <span className="font-display font-extrabold text-lg md:text-xl">{q}</span>
        {open ? <Minus className="size-5 text-brand-blue shrink-0" /> : <Plus className="size-5 text-brand-blue shrink-0" />}
      </button>
      {open && <p className="pb-6 text-ink/70 leading-relaxed">{a}</p>}
    </div>
  );
}
