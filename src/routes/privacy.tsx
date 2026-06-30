import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — The Saints Childcare Foundation Uganda" },
      { name: "description", content: "How The Saints Childcare Foundation Uganda collects, uses and protects your personal data." },
    ],
  }),
  component: () => (
    <SiteLayout>
      <PageHeader eyebrow="Legal" title="Privacy Policy" />
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6 prose prose-slate space-y-6 text-ink/70 leading-relaxed">
          <p><strong>Last updated:</strong> 2026</p>
          <p>The Saints Childcare Foundation Uganda ("we", "us") respects your privacy. This page describes how we collect, use, and protect your personal data.</p>
          <h2 className="font-display font-extrabold text-2xl text-ink">Information we collect</h2>
          <p>Name, email, phone, country, donation amount, payment information (processed by certified payment gateways), and any information you voluntarily provide.</p>
          <h2 className="font-display font-extrabold text-2xl text-ink">How we use it</h2>
          <p>To process donations, issue tax receipts, share impact updates and run our programs. We never sell or rent your data.</p>
          <h2 className="font-display font-extrabold text-2xl text-ink">Your rights</h2>
          <p>You may request access, correction or deletion of your data at any time by emailing hello@saintsfoundation.ug.</p>
          <p className="pt-6"><Link to="/contact" className="text-brand-blue underline">Contact us</Link> with any questions.</p>
        </div>
      </section>
    </SiteLayout>
  ),
});
