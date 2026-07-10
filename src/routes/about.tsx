import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { CheckCircle2, Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import augustineImg from "@/assets/augustine-sempagala.png.asset.json";
import agnessImg from "@/assets/agness-namisango.png.asset.json";
import heroAbout from "@/assets/hero-about.jpg.asset.json";

type Message = { name: string; title: string; body: string; image_url?: string };

function useLeaderMessage(key: "founder_message" | "cofounder_message", fallback: Message) {
  return useQuery({
    queryKey: ["site_content", key],
    queryFn: async () => {
      const { data } = await supabase.from("site_content").select("value").eq("key", key).maybeSingle();
      return (data?.value as Message | undefined) ?? fallback;
    },
    initialData: fallback,
  });
}

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Masembe Childcare Foundation Uganda" },
      {
        name: "description",
        content:
          "Learn about Masembe Childcare Foundation Uganda — our mission, vision, values, priority focus groups and where we operate across Uganda.",
      },
      { property: "og:title", content: "About — Masembe Childcare Foundation Uganda" },
      { property: "og:description", content: "Our mission, vision and values." },
    ],
  }),
  component: AboutPage,
});

function LeaderCard({ msgKey, accent, fallback }: { msgKey: "founder_message" | "cofounder_message"; accent: "blue" | "orange"; fallback: Message }) {
  const { data } = useLeaderMessage(msgKey, fallback);
  const border = accent === "blue" ? "border-brand-blue" : "border-brand-orange";
  const text = accent === "blue" ? "text-brand-blue" : "text-brand-orange";
  return (
    <article className={`bg-white border-t-4 ${border} p-8 md:p-10 shadow-sm`}>
      <Quote className={`size-8 ${text} mb-4`} />
      <p className="font-display text-lg md:text-xl leading-relaxed text-ink/80 mb-6 whitespace-pre-line">
        {data.body}
      </p>
      <div className="flex items-center gap-4 pt-6 border-t border-ink/10">
        {data.image_url ? (
          <img src={data.image_url} alt={data.name} className="size-14 rounded-full object-cover" />
        ) : (
          <div className={`size-14 rounded-full ${accent === "blue" ? "bg-brand-blue" : "bg-brand-orange"} text-white grid place-items-center font-display font-extrabold text-lg`}>
            {data.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
          </div>
        )}
        <div>
          <p className="font-display font-extrabold text-lg">{data.name}</p>
          <p className={`font-mono text-[11px] uppercase tracking-widest ${text}`}>{data.title}</p>
        </div>
      </div>
    </article>
  );
}

function AboutPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="About Us"
        title="Holistic care for Uganda's most vulnerable children."
        description="A non-profit organization dedicated to transforming the lives of orphaned and vulnerable children through education, healthcare, shelter, nutrition, counseling, empowerment, and community development."
        image={heroAbout.url}
      />


      {/* Leadership messages */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <p className="font-mono text-brand-blue text-sm uppercase tracking-widest mb-4">/ Leadership Messages</p>
          <h2 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight mb-12 max-w-3xl">
            A word from our founders.
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <LeaderCard
              msgKey="founder_message"
              accent="blue"
              fallback={{
                name: "Augustine Sempagala",
                title: "Founder & Executive Director",
                body: "When I founded Masembe Childcare Foundation Uganda, I made a promise to every orphaned and vulnerable child we would meet: you will not be forgotten.",
                image_url: augustineImg.url,
              }}
            />
            <LeaderCard
              msgKey="cofounder_message"
              accent="orange"
              fallback={{
                name: "Agnes Claire Namisango",
                title: "Cofounder & Programs Director",
                body: "Change is stubborn work. It happens one child, one family, one village at a time.",
                image_url: agnessImg.url,
              }}
            />
          </div>
        </div>
      </section>



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
