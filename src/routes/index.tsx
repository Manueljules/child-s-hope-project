import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Heart, GraduationCap, Stethoscope, Utensils, Home as HomeIcon, Shield, Sparkles } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { M } from "@/lib/media";
import heroHomeAsset from "@/assets/hero-home.jpg.asset.json";
const heroChildren = heroHomeAsset.url;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Masembe Childcare Foundation Uganda — Make a Child Just Better" },
      {
        name: "description",
        content:
          "Transforming the lives of orphaned and vulnerable children in Uganda through education, healthcare, nutrition, shelter, and community empowerment. Donate, sponsor or volunteer today.",
      },
      { property: "og:title", content: "Make a Child Just Better — Masembe Childcare Foundation Uganda" },
      {
        property: "og:description",
        content: "Join us in transforming vulnerable children's lives across Uganda.",
      },
      { property: "og:image", content: heroChildren },
    ],
  }),
  component: HomePage,
});

function Counter({ end, suffix = "", duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setN(Math.floor(end * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [end, duration]);
  return <>{n.toLocaleString()}{suffix}</>;
}

function HomePage() {
  const [stats, setStats] = useState<{ children_served: number; meals_provided: number; schools_assisted: number; districts_reached: number }>({ children_served: 0, meals_provided: 0, schools_assisted: 0, districts_reached: 0 });
  useEffect(() => {
    supabase.from("site_content").select("value").eq("key", "impact_stats").maybeSingle().then(({ data }) => {
      if (data?.value) setStats(data.value as typeof stats);
    });
  }, []);
  const statCards = [
    { label: "Children Served", value: Number(stats.children_served) || 0, suffix: "+" },
    { label: "Meals Provided", value: Number(stats.meals_provided) || 0, suffix: "+" },
    { label: "Schools Assisted", value: Number(stats.schools_assisted) || 0, suffix: "" },
    { label: "Districts Reached", value: Number(stats.districts_reached) || 0, suffix: "" },
  ];
  return (
    <SiteLayout>
      {/* HERO */}
      <header className="relative min-h-[85vh] md:min-h-[92vh] flex flex-col justify-center bg-brand-blue text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroChildren}
            alt="Ugandan school children smiling in a classroom"
            width={1920}
            height={1280}
            className="size-full object-cover"
            style={{ objectPosition: "center 35%" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/85 via-brand-blue/55 to-brand-blue/20 md:from-brand-blue/80 md:via-brand-blue/45 md:to-brand-blue/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/80 via-brand-blue/20 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-20 md:py-28 z-10 w-full">
          <div className="max-w-3xl animate-slide-up">
            <p className="font-mono text-brand-gold text-[10px] sm:text-xs uppercase tracking-[0.25em] sm:tracking-[0.3em] mb-4 sm:mb-6">
              / Masembe Childcare Foundation Uganda
            </p>
            <h1 className="font-display font-extrabold text-[clamp(2.25rem,9vw,6rem)] leading-[0.95] md:leading-[0.9] tracking-tight md:tracking-tighter mb-6 sm:mb-8">
              MAKE A CHILD <span className="text-brand-gold italic">JUST</span> BETTER.
            </h1>
            <p className="text-base sm:text-lg md:text-2xl text-white/90 mb-8 sm:mb-10 max-w-2xl leading-relaxed">
              Every child deserves love, education, protection, and a real opportunity to
              achieve their dreams. Together, we can transform vulnerable children's lives
              across Uganda.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/donate"
                className="bg-white text-brand-blue px-7 py-4 font-display font-extrabold text-sm uppercase tracking-widest hover:bg-brand-gold hover:text-ink transition-all"
              >
                Donate Now
              </Link>
              <Link
                to="/about"
                className="border-2 border-white text-white px-7 py-4 font-display font-extrabold text-sm uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                Our Mission
              </Link>
              <Link
                to="/volunteer"
                className="border-2 border-white/30 text-white px-7 py-4 font-display font-extrabold text-sm uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                Volunteer
              </Link>
              <Link
                to="/about"
                className="text-white px-7 py-4 font-display font-extrabold text-sm uppercase tracking-widest hover:text-brand-gold transition-all inline-flex items-center gap-2"
              >
                Learn More <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Impact bar */}
        <div className="relative md:absolute md:bottom-0 left-0 w-full grid grid-cols-2 md:grid-cols-4 border-t border-white/20 z-10">
          {statCards.map((s) => (
            <div
              key={s.label}
              className="p-6 md:p-8 bg-ink/30 backdrop-blur-sm border-r last:border-r-0 border-white/20"
            >
              <span className="block font-mono text-[10px] text-brand-gold mb-2 uppercase tracking-widest">
                [ {s.label} ]
              </span>
              <span className="block font-display font-extrabold text-3xl md:text-4xl">
                <Counter end={s.value} suffix={s.suffix} />
              </span>
            </div>
          ))}
        </div>
      </header>

      {/* MISSION / VALUES */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-10">
              <div>
                <p className="font-mono text-brand-blue text-sm uppercase tracking-widest mb-4">
                  / Our Purpose
                </p>
                <h2 className="font-display font-extrabold text-3xl md:text-4xl leading-tight text-ink">
                  To transform the lives of orphaned and vulnerable children in Uganda
                  through holistic care and community empowerment.
                </h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-display font-bold text-lg mb-2 uppercase">Mission</h3>
                  <p className="text-ink/60 text-sm leading-relaxed">
                    Providing safe shelter, nutrition, quality education, healthcare and
                    sustainable community empowerment programs to those who need them most.
                  </p>
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg mb-2 uppercase">Vision</h3>
                  <p className="text-ink/60 text-sm leading-relaxed">
                    A society where every vulnerable child is nurtured, protected and
                    empowered to reach their full potential.
                  </p>
                </div>
              </div>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 font-display font-extrabold uppercase tracking-widest text-sm text-brand-blue border-b-2 border-brand-blue pb-1 hover:text-brand-orange hover:border-brand-orange"
              >
                Read Our Full Story <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-px bg-brand-blue/10 border border-brand-blue/10">
              {[
                { n: "01", title: "Compassion", text: "Actively demonstrating love and care for every child." },
                { n: "02", title: "Integrity", text: "Highest standards of transparency and accountability." },
                { n: "03", title: "Dignity", text: "Treating every child and family with absolute respect." },
                { n: "04", title: "Empowerment", text: "Equipping families with tools for self-reliance." },
                { n: "05", title: "Collaboration", text: "Working hand-in-hand with communities and partners." },
                { n: "06", title: "Hope", text: "Believing in every child's potential to flourish." },
              ].map((v) => (
                <div key={v.n} className="bg-white p-6 md:p-8">
                  <span className="block text-brand-orange font-display font-extrabold text-2xl mb-2">
                    {v.n}
                  </span>
                  <h4 className="font-display font-bold uppercase tracking-tight mb-2">{v.title}</h4>
                  <p className="text-xs text-ink/55 leading-relaxed">{v.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROGRAMS — pillars + images unified block */}
      <section className="bg-surface pt-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div>
              <p className="font-mono text-brand-blue text-sm uppercase tracking-widest mb-4">
                / Our Programs
              </p>
              <h2 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight">
                Pillars of Impact
              </h2>
            </div>
            <Link
              to="/projects"
              className="text-brand-blue font-display font-extrabold uppercase tracking-widest text-sm border-b-2 border-brand-blue pb-1 self-start md:self-auto"
            >
              View All Projects
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-brand-blue/10 border border-brand-blue/10 border-b-0">
            {[
              { Icon: GraduationCap, title: "Education Support", desc: "School fees, supplies, and vocational training for orphaned youth.", color: "brand-blue" },
              { Icon: Stethoscope, title: "Healthcare", desc: "Medical check-ups, emergency surgeries, and health education.", color: "brand-green" },
              { Icon: Utensils, title: "Nutrition", desc: "Feeding programs ensuring two balanced meals daily.", color: "brand-gold" },
              { Icon: HomeIcon, title: "Shelter", desc: "Safe homes and family-strengthening support for orphans.", color: "brand-orange" },
              { Icon: Shield, title: "Child Protection", desc: "Safeguarding, counseling, and psychosocial support.", color: "brand-blue" },
              { Icon: Sparkles, title: "Empowerment", desc: "Skills development, girls' programs, and youth livelihoods.", color: "brand-green" },
            ].map((p) => (
              <div key={p.title} className="group bg-white p-8 md:p-10 hover:bg-surface transition-all">
                <div className={`size-12 bg-${p.color}/10 text-${p.color} flex items-center justify-center font-display font-extrabold text-sm mb-6 group-hover:bg-${p.color} group-hover:text-white transition-colors`}>
                  <p.Icon className="size-6" />
                </div>
                <h3 className="font-display font-extrabold text-xl mb-3">{p.title}</h3>
                <p className="text-ink/60 mb-6 text-sm leading-relaxed">{p.desc}</p>
                <Link
                  to="/projects"
                  className={`font-mono text-[11px] uppercase tracking-widest text-${p.color} inline-flex items-center gap-1`}
                >
                  Learn More <ArrowRight className="size-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>

      </section>


      {/* DONATION + SPONSORSHIP */}
      <section className="py-24 bg-ink text-white">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-5 gap-12 lg:gap-16">
          <div className="lg:col-span-3">
            <p className="font-mono text-brand-gold text-xs uppercase tracking-widest mb-4">
              / Donate Today
            </p>
            <h2 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight mb-6">
              Transform a life today.
            </h2>
            <p className="text-white/60 text-lg mb-10 max-w-xl">
              Your donation goes directly toward shelter, school fees, nutrition, and
              medical care for children across rural Uganda.
            </p>
            <DonationWidget />
          </div>

          <div className="lg:col-span-2 space-y-8">
            <FeaturedChild />
          </div>

        </div>
      </section>

      {/* STORIES */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="font-mono text-brand-blue text-sm uppercase tracking-widest mb-4">
                / Stories of Hope
              </p>
              <h2 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight">
                Lives Transformed
              </h2>
            </div>
            <Link
              to="/stories"
              className="text-brand-blue font-display font-extrabold uppercase tracking-widest text-sm border-b-2 border-brand-blue pb-1 self-start"
            >
              All Stories
            </Link>
          </div>

          <HomeStories />
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="bg-brand-orange text-white py-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-[1fr_auto] items-center gap-8">
          <div>
            <h2 className="font-display font-extrabold text-3xl md:text-5xl tracking-tight max-w-2xl">
              Stand with us. Make a child just better.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/donate"
              className="bg-white text-brand-orange px-7 py-4 font-display font-extrabold text-sm uppercase tracking-widest hover:bg-ink hover:text-white transition-all inline-flex items-center gap-2"
            >
              <Heart className="size-4" /> Donate
            </Link>
            <Link
              to="/volunteer"
              className="border-2 border-white text-white px-7 py-4 font-display font-extrabold text-sm uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              Volunteer With Us
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function DonationWidget() {
  const [freq, setFreq] = useState<"one" | "monthly">("one");
  const [amount, setAmount] = useState(100000);
  const [currency, setCurrency] = useState("UGX");
  const amounts = [20000, 50000, 100000, 250000, 500000, 1000000];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-white/10 pb-4 flex-wrap">
        <button
          onClick={() => setFreq("one")}
          className={`${freq === "one" ? "text-brand-gold border-brand-gold" : "text-white/40 border-transparent"} border px-4 py-1 text-xs font-mono uppercase`}
        >
          One-time
        </button>
        <button
          onClick={() => setFreq("monthly")}
          className={`${freq === "monthly" ? "text-brand-gold border-brand-gold" : "text-white/40 border-transparent"} border px-4 py-1 text-xs font-mono uppercase`}
        >
          Monthly
        </button>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs font-mono text-white/40 uppercase">Currency</span>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="bg-transparent text-xs font-mono uppercase focus:outline-none cursor-pointer border border-white/20 px-2 py-1"
          >
            <option className="text-ink">UGX</option>
            <option className="text-ink">USD</option>
            <option className="text-ink">EUR</option>
            <option className="text-ink">GBP</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {amounts.map((a) => (
          <button
            key={a}
            onClick={() => setAmount(a)}
            className={`py-4 border font-mono text-base transition-all ${amount === a ? "border-brand-blue bg-brand-blue/10 text-brand-blue" : "border-white/20 hover:border-brand-blue hover:text-brand-blue"}`}
          >
            {a.toLocaleString()}
          </button>
        ))}
      </div>

      <Link
        to="/donate"
        className="block w-full text-center bg-brand-orange py-5 font-display font-extrabold uppercase tracking-[0.2em] text-base hover:bg-brand-orange/90 transition-all"
      >
        Proceed to Payment · {currency} {amount.toLocaleString()}{freq === "monthly" ? "/mo" : ""}
      </Link>

      <p className="text-[11px] font-mono uppercase tracking-widest text-white/40 text-center">
        Secured payments · Visa · Mastercard · PayPal · Apple &amp; Google Pay
      </p>
    </div>
  );
}

function FeaturedChild() {
  const [child, setChild] = useState<{ id: string; name: string; age: number | null; photo_url: string | null; story: string | null; monthly_amount: number | null } | null>(null);
  useEffect(() => {
    supabase.from("sponsored_children").select("id,name,age,photo_url,story,monthly_amount").eq("is_published", true).eq("is_sponsored", false).order("sort_order").limit(1).maybeSingle().then(({ data }) => setChild(data));
  }, []);
  if (!child) {
    return (
      <div className="bg-white/5 border border-white/10 p-8">
        <p className="font-mono text-brand-gold text-[11px] uppercase tracking-widest mb-6">/ Sponsorship</p>
        <div className="aspect-square bg-white/5 mb-6 grid place-items-center text-white/30 text-xs font-mono uppercase tracking-widest">No child yet</div>
        <h3 className="font-display font-extrabold text-2xl mb-2">Sponsor a child</h3>
        <p className="text-white/60 text-sm mb-6 leading-relaxed">Add children in the admin dashboard and they'll appear here for sponsorship.</p>
        <Link to="/donate" className="block w-full text-center border border-white/30 py-4 font-display font-bold uppercase tracking-widest text-xs hover:bg-white/10">Donate</Link>
      </div>
    );
  }
  return (
    <div className="bg-white/5 border border-white/10 p-8">
      <p className="font-mono text-brand-gold text-[11px] uppercase tracking-widest mb-6">/ Featured Sponsorship</p>
      <div className="aspect-square bg-ink mb-6 overflow-hidden">
        {child.photo_url ? <M src={child.photo_url} alt={child.name} className="size-full object-cover" /> : <div className="size-full bg-white/5" />}
      </div>
      <h3 className="font-display font-extrabold text-2xl mb-2">Meet {child.name}{child.age ? `, ${child.age}` : ""}</h3>
      {child.story && <p className="text-white/60 text-sm mb-6 leading-relaxed">{child.story}</p>}
      <Link to="/donate" className="block w-full text-center border border-white/30 py-4 font-display font-bold uppercase tracking-widest text-xs hover:bg-white/10">
        Sponsor {child.name}{child.monthly_amount ? ` · UGX ${Number(child.monthly_amount).toLocaleString()}/mo` : ""}
      </Link>
    </div>
  );
}

function HomeStories() {
  const [items, setItems] = useState<Array<{ id: string; title: string; tag: string; excerpt: string; image_url: string | null }>>([]);
  useEffect(() => {
    supabase.from("stories").select("id,title,tag,excerpt,image_url").eq("is_published", true).order("sort_order").limit(2).then(({ data }) => setItems((data ?? []) as typeof items));
  }, []);
  if (items.length === 0) {
    return <p className="text-ink/50 font-mono text-sm">No stories yet. Add them from the admin dashboard.</p>;
  }
  return (
    <div className="grid md:grid-cols-2 gap-8">
      {items.map((s) => (
        <article key={s.id} className="group">
          <div className="aspect-[4/3] overflow-hidden mb-6 bg-surface">
            {s.image_url && <M src={s.image_url} alt={s.title} loading="lazy" className="size-full object-cover group-hover:scale-105 transition-transform duration-700" />}
          </div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-brand-orange mb-3">/ {s.tag}</p>
          <h3 className="font-display font-extrabold text-2xl md:text-3xl mb-3 leading-tight">{s.title}</h3>
          <p className="text-ink/60 leading-relaxed">{s.excerpt}</p>
        </article>
      ))}
    </div>
  );
}
