import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import brian from "@/assets/sponsor-brian.jpg";
import storySarah from "@/assets/story-sarah.jpg";
import { Download } from "lucide-react";

export const Route = createFileRoute("/sponsorship")({
  head: () => ({
    meta: [
      { title: "Sponsor a Child — The Saints Childcare Foundation Uganda" },
      { name: "description", content: "Sponsor a vulnerable child in Uganda. Choose monthly, annual, corporate, education, medical or nutrition sponsorship packages." },
    ],
  }),
  component: SponsorshipPage,
});

const packages = [
  { title: "Monthly Sponsorship", price: "UGX 100,000", per: "/ month", desc: "Cover meals, school supplies and basic medical care for one child each month." },
  { title: "Annual Sponsorship", price: "UGX 1,200,000", per: "/ year", desc: "A full year of education, healthcare and nutrition for one child." },
  { title: "Education Sponsorship", price: "UGX 750,000", per: "/ term", desc: "School fees, uniforms, books and learning materials per academic term." },
  { title: "Medical Sponsorship", price: "UGX 250,000", per: "/ month", desc: "Healthcare access, medications and emergency care for one child." },
  { title: "Nutrition Sponsorship", price: "UGX 60,000", per: "/ month", desc: "Two balanced meals a day for one child throughout the month." },
  { title: "Corporate Sponsorship", price: "Custom", per: "", desc: "Sponsor a class, a school or an entire community program with your team." },
];

const children = [
  { img: brian, name: "Brian", age: 8, dream: "Become a doctor" },
  { img: storySarah, name: "Sarah", age: 12, dream: "Become a teacher" },
];

function SponsorshipPage() {
  return (
    <SiteLayout>
      <PageHeader eyebrow="Child Sponsorship" title="Be the reason a child believes again." description="Your monthly gift transforms a child's daily life — and creates a relationship that lasts a lifetime." />

      {/* Packages */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <p className="font-mono text-brand-blue text-sm uppercase tracking-widest mb-4">/ Sponsorship Packages</p>
          <h2 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight mb-12">Choose how you give.</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-brand-blue/10 border border-brand-blue/10">
            {packages.map((p) => (
              <div key={p.title} className="bg-white p-8 flex flex-col">
                <h3 className="font-display font-extrabold text-2xl mb-2">{p.title}</h3>
                <p className="text-ink/60 text-sm leading-relaxed mb-6 flex-1">{p.desc}</p>
                <div className="mb-6">
                  <span className="font-display font-extrabold text-3xl text-brand-blue">{p.price}</span>
                  <span className="font-mono text-xs text-ink/50 ml-1">{p.per}</span>
                </div>
                <Link to="/donate" className="bg-brand-orange text-white text-center py-3 font-display font-extrabold uppercase text-xs tracking-widest hover:bg-brand-orange/90">
                  Sponsor Now
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Children awaiting sponsorship */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <p className="font-mono text-brand-orange text-sm uppercase tracking-widest mb-4">/ Awaiting Sponsorship</p>
          <h2 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight mb-12">Meet a child today.</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {children.concat(children).map((c, i) => (
              <article key={i} className="bg-white border border-brand-blue/10 overflow-hidden">
                <div className="aspect-[4/5] overflow-hidden">
                  <img src={c.img} alt={c.name} loading="lazy" className="size-full object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="font-display font-extrabold text-xl mb-1">{c.name}, {c.age}</h3>
                  <p className="text-ink/60 text-sm mb-4">Dreams of: {c.dream}</p>
                  <Link to="/donate" className="block text-center border border-brand-blue text-brand-blue py-2 text-xs font-display font-extrabold uppercase tracking-widest hover:bg-brand-blue hover:text-white">
                    Sponsor
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="font-mono text-brand-blue text-sm uppercase tracking-widest mb-4">/ How It Works</p>
            <h2 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight mb-8">A relationship, not a transaction.</h2>
            <ol className="space-y-6">
              {[
                ["01", "Choose a child or a package", "Browse profiles of children awaiting sponsorship — or let us match you."],
                ["02", "Start your monthly giving", "Pay securely via card, MTN, Airtel, PayPal or bank transfer."],
                ["03", "Receive personal updates", "Photos, letters and school reports from your sponsored child."],
                ["04", "Visit Uganda (optional)", "Meet your sponsored child in person on a coordinated visit."],
              ].map(([n, t, d]) => (
                <li key={n} className="flex gap-6">
                  <span className="font-display font-extrabold text-3xl text-brand-orange shrink-0">{n}</span>
                  <div>
                    <h3 className="font-display font-extrabold text-lg mb-1">{t}</h3>
                    <p className="text-ink/60 text-sm">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="bg-ink text-white p-10">
            <p className="font-mono text-brand-gold text-xs uppercase tracking-widest mb-4">/ Resources</p>
            <h3 className="font-display font-extrabold text-3xl mb-6">Sponsorship Agreement</h3>
            <p className="text-white/70 mb-8 leading-relaxed">
              Download the full sponsorship agreement to review terms, expectations, and
              the rights of both sponsor and child.
            </p>
            <a href="#" className="inline-flex items-center gap-2 bg-brand-orange text-white px-6 py-3 font-display font-extrabold text-sm uppercase tracking-widest">
              <Download className="size-4" /> Download Agreement
            </a>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
