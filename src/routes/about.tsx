import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — The Saints Childcare Foundation Uganda" },
      {
        name: "description",
        content:
          "Learn about The Saints Childcare Foundation Uganda — our mission, vision, values, priority focus groups and where we operate across Uganda.",
      },
      { property: "og:title", content: "About — The Saints Childcare Foundation Uganda" },
      { property: "og:description", content: "Our mission, vision and values." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="About Us"
        title="Holistic care for Uganda's most vulnerable children."
        description="A non-profit organization dedicated to transforming the lives of orphaned and vulnerable children through education, healthcare, shelter, nutrition, counseling, empowerment, and community development."
      />

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12">
          <div className="border-l-4 border-brand-blue pl-8">
            <p className="font-mono text-brand-blue text-xs uppercase tracking-widest mb-4">/ Mission</p>
            <p className="font-display font-extrabold text-2xl md:text-3xl leading-tight">
              To transform the lives of orphaned and vulnerable children in Uganda by
              providing holistic care, quality education, healthcare and sustainable
              community empowerment programs.
            </p>
          </div>
          <div className="border-l-4 border-brand-orange pl-8">
            <p className="font-mono text-brand-orange text-xs uppercase tracking-widest mb-4">/ Vision</p>
            <p className="font-display font-extrabold text-2xl md:text-3xl leading-tight">
              A society where every vulnerable child is nurtured, protected and empowered
              to reach their full potential.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <p className="font-mono text-brand-blue text-sm uppercase tracking-widest mb-4">/ Core Values</p>
          <h2 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight mb-12 max-w-3xl">
            What we stand for, every day.
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-px bg-brand-blue/10 border border-brand-blue/10">
            {[
              { t: "Compassion", d: "Actively demonstrating love, empathy and care for every child ensuring they feel safe and valued." },
              { t: "Integrity", d: "Maintaining the highest standards of transparency, accountability and honesty in all matters." },
              { t: "Dignity", d: "Treating every child, family and community member with absolute respect, honouring their inherent worth." },
              { t: "Empowerment", d: "Equipping children and families with the tools, skills and education to build self-reliant futures." },
              { t: "Collaboration", d: "Working hand-in-hand with communities, donors and stakeholders to maximize sustainable impact." },
            ].map((v, i) => (
              <div key={v.t} className="bg-white p-8">
                <span className="block text-brand-orange font-display font-extrabold text-3xl mb-3">
                  0{i + 1}
                </span>
                <h3 className="font-display font-extrabold text-lg mb-2 uppercase">{v.t}</h3>
                <p className="text-ink/60 text-sm leading-relaxed">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Objectives */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <p className="font-mono text-brand-blue text-sm uppercase tracking-widest mb-4">/ Objectives</p>
          <h2 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight mb-12 max-w-3xl">
            Our strategic priorities.
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              ["Holistic Child Protection & Care", "Provide safe shelter, nutrition, and psychosocial support to orphaned and vulnerable children annually."],
              ["Educational Advancement", "Facilitate access to quality formal education and vocational training with high retention and completion rates."],
              ["Healthcare & Wellness", "Improve physical and mental well-being through regular medical check-ups, healthcare access, and hygiene education."],
              ["Socio-Economic Empowerment", "Implement sustainable livelihood and micro-enterprise programs for guardians and child-headed households."],
              ["Institutional Capability", "Strengthen operational capacity, governance, and financial sustainability through strategic partnerships."],
              ["Community Outreach", "Build resilient local networks that sustain child wellbeing long after our direct involvement ends."],
            ].map(([t, d]) => (
              <div key={t} className="flex gap-4 p-6 bg-surface">
                <CheckCircle2 className="size-6 text-brand-green shrink-0 mt-1" />
                <div>
                  <h3 className="font-display font-extrabold text-lg mb-2">{t}</h3>
                  <p className="text-ink/60 text-sm leading-relaxed">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who we serve / Where / Future goals */}
      <section className="py-20 bg-ink text-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-10">
          <div>
            <p className="font-mono text-brand-gold text-xs uppercase tracking-widest mb-4">/ Who We Serve</p>
            <h3 className="font-display font-extrabold text-2xl mb-4">Priority focus groups</h3>
            <ul className="space-y-2 text-white/70 text-sm">
              <li>· Girls and young women</li>
              <li>· Children with disabilities</li>
              <li>· Children affected by HIV/AIDS</li>
              <li>· Refugees and internally displaced children</li>
              <li>· Children in remote or hard-to-reach areas</li>
            </ul>
          </div>
          <div>
            <p className="font-mono text-brand-gold text-xs uppercase tracking-widest mb-4">/ Where We Operate</p>
            <h3 className="font-display font-extrabold text-2xl mb-4">Across all regions of Uganda</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              We operate in local communities across the Central, Eastern, Northern and
              Western regions of Uganda — with active programs in 22 districts and growing.
            </p>
          </div>
          <div>
            <p className="font-mono text-brand-gold text-xs uppercase tracking-widest mb-4">/ Future Goals</p>
            <h3 className="font-display font-extrabold text-2xl mb-4">2030 &amp; 2035 targets</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Reach 5,000+ children annually by 2030 and 10,000+ by 2035. Ensure 100% of
              supported children receive annual health screenings, mental health support
              and nutrition programs.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight mb-6">
            Help us write the next chapter.
          </h2>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/donate" className="bg-brand-orange text-white px-7 py-4 font-display font-extrabold text-sm uppercase tracking-widest hover:bg-brand-orange/90">Donate</Link>
            <Link to="/volunteer" className="border-2 border-ink text-ink px-7 py-4 font-display font-extrabold text-sm uppercase tracking-widest hover:bg-ink hover:text-white">Volunteer</Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
