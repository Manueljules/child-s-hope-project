import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import founderImg from "@/assets/founder.jpg";

export const Route = createFileRoute("/founder")({
  head: () => ({
    meta: [
      { title: "Founder — The Saints Childcare Foundation Uganda" },
      { name: "description", content: "Meet the founder of The Saints Childcare Foundation Uganda and read their message of hope and commitment to vulnerable children." },
      { property: "og:title", content: "Founder — The Saints Childcare Foundation Uganda" },
    ],
  }),
  component: FounderPage,
});

function FounderPage() {
  return (
    <SiteLayout>
      <PageHeader eyebrow="Our Founder" title="A vision born from compassion." />

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5">
            <div className="aspect-[4/5] overflow-hidden bg-surface">
              <img src={founderImg} alt="Founder portrait" loading="lazy" className="size-full object-cover" />
            </div>
            <div className="mt-4 font-mono text-xs uppercase tracking-widest text-brand-blue">
              / Founder &amp; Executive Director
            </div>
          </div>
          <div className="lg:col-span-7 space-y-8">
            <h2 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight">
              [ Founder Name ]
            </h2>
            <p className="text-lg text-ink/70 leading-relaxed">
              A passionate child rights advocate and community leader, [Founder Name]
              established The Saints Childcare Foundation Uganda to give voice and
              opportunity to children whose circumstances have left them invisible to
              the world.
            </p>

            <div className="grid sm:grid-cols-2 gap-6 pt-4">
              <div>
                <h3 className="font-display font-bold uppercase text-sm mb-2 text-brand-blue">Vision</h3>
                <p className="text-ink/60 text-sm leading-relaxed">
                  A Uganda where no child is left behind — every orphan and vulnerable
                  child has access to education, healthcare, protection and a future
                  filled with possibility.
                </p>
              </div>
              <div>
                <h3 className="font-display font-bold uppercase text-sm mb-2 text-brand-orange">Journey</h3>
                <p className="text-ink/60 text-sm leading-relaxed">
                  From volunteering in rural communities as a young teacher to building
                  a registered NGO serving thousands — a 20-year commitment to children
                  in crisis.
                </p>
              </div>
              <div>
                <h3 className="font-display font-bold uppercase text-sm mb-2 text-brand-green">Achievements</h3>
                <p className="text-ink/60 text-sm leading-relaxed">
                  Recognized by the Uganda NGO Forum, awarded by community partners and
                  named in regional child welfare honors lists.
                </p>
              </div>
              <div>
                <h3 className="font-display font-bold uppercase text-sm mb-2 text-brand-gold">Passion</h3>
                <p className="text-ink/60 text-sm leading-relaxed">
                  A life-long belief that every child — no matter where they were born —
                  carries the seed of greatness.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Message */}
      <section className="py-24 bg-ink text-white">
        <div className="max-w-4xl mx-auto px-6">
          <p className="font-mono text-brand-gold text-xs uppercase tracking-widest mb-6">/ A Message from Our Founder</p>
          <p className="font-display font-extrabold text-3xl md:text-4xl leading-snug mb-8">
            "Every child deserves an opportunity to dream, learn, and live a meaningful
            life. Through your generosity, we can transform lives and build brighter
            futures. Together, we can truly make a child just better."
          </p>
          <div className="border-t border-white/10 pt-6">
            <p className="font-display italic text-2xl text-brand-gold">— [ Founder Signature ]</p>
            <p className="font-mono text-xs uppercase tracking-widest text-white/40 mt-2">
              Founder · The Saints Childcare Foundation Uganda
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white text-center">
        <Link to="/leadership" className="font-display font-extrabold text-brand-blue uppercase tracking-widest border-b-2 border-brand-blue pb-1">
          Meet our Leadership Team →
        </Link>
      </section>
    </SiteLayout>
  );
}
