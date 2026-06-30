import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use — The Saints Childcare Foundation Uganda" },
      { name: "description", content: "Terms and conditions for using the website of The Saints Childcare Foundation Uganda." },
    ],
  }),
  component: () => (
    <SiteLayout>
      <PageHeader eyebrow="Legal" title="Terms of Use" />
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6 space-y-6 text-ink/70 leading-relaxed">
          <p><strong>Last updated:</strong> 2026</p>
          <p>By accessing this site you agree to these terms. Content is provided for informational and fundraising purposes only.</p>
          <h2 className="font-display font-extrabold text-2xl text-ink">Donations</h2>
          <p>All donations are non-refundable except as required by law. Receipts are issued by email.</p>
          <h2 className="font-display font-extrabold text-2xl text-ink">Intellectual property</h2>
          <p>All content remains the property of The Saints Childcare Foundation Uganda and may not be reused without permission.</p>
          <p className="pt-6"><Link to="/contact" className="text-brand-blue underline">Contact us</Link> with any questions.</p>
        </div>
      </section>
    </SiteLayout>
  ),
});
