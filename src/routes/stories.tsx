import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import sarah from "@/assets/story-sarah.jpg";
import brian from "@/assets/sponsor-brian.jpg";
import water from "@/assets/story-water.jpg";
import nutrition from "@/assets/program-nutrition.jpg";

export const Route = createFileRoute("/stories")({
  head: () => ({
    meta: [
      { title: "Success Stories — The Saint's Childcare Foundation Uganda" },
      { name: "description", content: "Real stories of children whose lives have been transformed through education, healthcare and community support." },
    ],
  }),
  component: StoriesPage,
});

const stories = [
  {
    img: sarah, name: "Sarah", title: "From the village to medical school",
    before: "Sarah had dropped out of school after her parents passed away. By age 11 she was caring for two younger siblings with no income.",
    after: "Today, Sarah is in her second year of pre-medical studies and dreams of returning to her village as a community doctor.",
    quote: "The Foundation didn't just give me school fees. They gave me back my future.",
  },
  {
    img: brian, name: "Brian", title: "Back to class, with hope",
    before: "Brian was out of school for over a year. His grandmother could not afford fees or uniforms.",
    after: "Through monthly sponsorship, Brian returned to Primary 3 and is among the top five students in his class.",
    quote: "I want to become a doctor and help children like me.",
  },
  {
    img: water, name: "Kiboga Village", title: "Clean water for 200 families",
    before: "Children walked four kilometers each morning to collect contaminated water, missing school every day.",
    after: "A solar-powered borehole now supplies clean water to 200 families and the local primary school.",
    quote: "Our children are now in class, not at the river.",
  },
  {
    img: nutrition, name: "Mubende Feeding Program", title: "No more empty stomachs at school",
    before: "Severe malnutrition affected 1 in 3 children in the region's poorest schools.",
    after: "After 18 months of feeding programs, malnutrition rates have dropped to under 7%.",
    quote: "A fed child learns. A learning child changes everything.",
  },
];

function StoriesPage() {
  return (
    <SiteLayout>
      <PageHeader eyebrow="Success Stories" title="Lives, transformed." description="Behind every statistic is a child, a family, and a future rewritten." />

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 space-y-24">
          {stories.map((s, i) => (
            <article key={s.title} className={`grid md:grid-cols-2 gap-10 items-center ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
              <div className="aspect-[4/5] overflow-hidden bg-surface">
                <img src={s.img} alt={s.name} loading="lazy" className="size-full object-cover" />
              </div>
              <div>
                <p className="font-mono text-brand-orange text-xs uppercase tracking-widest mb-4">/ {s.name}</p>
                <h2 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight mb-8 leading-tight">{s.title}</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="border-l-2 border-brand-blue/30 pl-4">
                    <div className="font-mono text-[10px] uppercase tracking-widest text-ink/40 mb-2">Before</div>
                    <p className="text-ink/70 text-sm leading-relaxed">{s.before}</p>
                  </div>
                  <div className="border-l-2 border-brand-green pl-4">
                    <div className="font-mono text-[10px] uppercase tracking-widest text-brand-green mb-2">After</div>
                    <p className="text-ink/70 text-sm leading-relaxed">{s.after}</p>
                  </div>
                </div>
                <blockquote className="font-display italic text-xl text-ink border-t border-brand-blue/10 pt-4">
                  "{s.quote}"
                </blockquote>
              </div>
            </article>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
