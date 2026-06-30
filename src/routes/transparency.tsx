import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Shield, FileCheck2, BarChart3, Eye } from "lucide-react";

export const Route = createFileRoute("/transparency")({
  head: () => ({
    meta: [
      { title: "Transparency — The Saints Childcare Foundation Uganda" },
      { name: "description", content: "Our financial transparency, governance, audits and impact reporting. Every shilling tracked." },
    ],
  }),
  component: TransparencyPage,
});

function TransparencyPage() {
  return (
    <SiteLayout>
      <PageHeader eyebrow="Transparency" title="Every shilling tracked." description="We hold ourselves to the highest standards of accountability — to the children we serve and the donors who trust us." />

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-brand-blue/10 border border-brand-blue/10">
          {[
            { Icon: BarChart3, n: "87¢", l: "Of every dollar to programs" },
            { Icon: FileCheck2, n: "100%", l: "Audited annually" },
            { Icon: Shield, n: "0", l: "Material findings (2024)" },
            { Icon: Eye, n: "Live", l: "Donation tracking" },
          ].map((s) => (
            <div key={s.l} className="bg-white p-8">
              <s.Icon className="size-8 text-brand-blue mb-4" />
              <div className="font-display font-extrabold text-4xl mb-2">{s.n}</div>
              <div className="text-ink/60 text-sm">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12">
          <div>
            <p className="font-mono text-brand-blue text-sm uppercase tracking-widest mb-4">/ Annual Reports</p>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight mb-8">Audited financials.</h2>
            <ul className="space-y-3">
              {["2024", "2023", "2022", "2021"].map((y) => (
                <li key={y}>
                  <a href="#" className="flex items-center justify-between border border-brand-blue/10 bg-white p-5 hover:border-brand-blue transition-colors">
                    <span className="font-display font-extrabold text-lg">Annual Report {y}</span>
                    <span className="font-mono text-xs uppercase tracking-widest text-brand-blue">Download PDF →</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-mono text-brand-orange text-sm uppercase tracking-widest mb-4">/ Governance</p>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight mb-8">Our board and policies.</h2>
            <div className="space-y-4 text-ink/70 text-sm leading-relaxed">
              <p>The Foundation is governed by an independent Board of Trustees that meets quarterly and oversees strategy, finances and child protection.</p>
              <p>All staff and partners undergo child safeguarding training and a clean background check.</p>
              <p>Our annual financials are audited by an independent CPA firm and posted publicly within 90 days of year-end.</p>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
