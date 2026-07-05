import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import edu from "@/assets/program-education.jpg";
import health from "@/assets/program-health.jpg";
import water from "@/assets/story-water.jpg";
import nutrition from "@/assets/program-nutrition.jpg";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "News & Events — The Saint's Childcare Foundation Uganda" },
      { name: "description", content: "Latest news, events, fundraising campaigns and community updates from The Saint's Childcare Foundation Uganda." },
    ],
  }),
  component: NewsPage,
});

const posts = [
  { img: edu, tag: "Announcement", date: "Mar 12, 2026", title: "Hope Primary expansion reaches 64% completion", excerpt: "The new four-classroom block will open in time for Term 2, welcoming 420 additional pupils." },
  { img: water, tag: "Impact", date: "Feb 28, 2026", title: "Kiboga borehole now serves 1,200 community members", excerpt: "A milestone for our clean water initiative — and a model we plan to replicate in three more villages." },
  { img: health, tag: "Event", date: "Feb 14, 2026", title: "Mobile health clinic launches in Northern Uganda", excerpt: "Our partnership with a regional hospital brings essential pediatric care to remote villages." },
  { img: nutrition, tag: "Campaign", date: "Jan 30, 2026", title: "School feeding campaign closes 92% of target", excerpt: "Thanks to 1,240 donors, no child in our partner schools will go hungry this term." },
];

const events = [
  { date: "Apr 18", title: "Annual Hope Gala — Kampala", loc: "Serena Hotel, Kampala" },
  { date: "May 04", title: "Run for the Children 10K", loc: "Lugogo Bypass, Kampala" },
  { date: "Jun 12", title: "Community Outreach — Mubende", loc: "Mubende District" },
];

function NewsPage() {
  return (
    <SiteLayout>
      <PageHeader eyebrow="News & Events" title="Updates from the field." description="Follow our campaigns, milestones and upcoming community events." />

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <div>
              <p className="font-mono text-brand-blue text-sm uppercase tracking-widest mb-4">/ Latest News</p>
              <h2 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight mb-8">From our blog</h2>
              <div className="grid sm:grid-cols-2 gap-8">
                {posts.map((p) => (
                  <article key={p.title} className="group">
                    <div className="aspect-[4/3] overflow-hidden bg-surface mb-4">
                      <img src={p.img} alt={p.title} loading="lazy" className="size-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-ink/40 mb-2">
                      <span className="text-brand-orange">{p.tag}</span>
                      <span>·</span>
                      <span>{p.date}</span>
                    </div>
                    <h3 className="font-display font-extrabold text-xl mb-2 leading-tight">{p.title}</h3>
                    <p className="text-ink/60 text-sm leading-relaxed">{p.excerpt}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-12">
            <div>
              <p className="font-mono text-brand-orange text-sm uppercase tracking-widest mb-4">/ Upcoming Events</p>
              <ul className="space-y-px bg-brand-blue/10 border border-brand-blue/10">
                {events.map((e) => (
                  <li key={e.title} className="bg-white p-6 flex gap-4">
                    <div className="shrink-0 size-14 bg-brand-blue text-white grid place-items-center font-display font-extrabold text-sm leading-tight text-center">
                      {e.date}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display font-extrabold text-base leading-tight">{e.title}</h3>
                      <p className="text-ink/50 text-xs mt-1 truncate">{e.loc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-ink text-white p-8">
              <p className="font-mono text-brand-gold text-xs uppercase tracking-widest mb-4">/ Subscribe</p>
              <h3 className="font-display font-extrabold text-2xl mb-4">Newsletter</h3>
              <p className="text-white/60 text-sm mb-6">Get quarterly impact reports.</p>
              <form onSubmit={(e) => e.preventDefault()} className="flex border-b border-white/20 pb-2">
                <input type="email" placeholder="you@example.com" required className="bg-transparent text-sm w-full focus:outline-none placeholder:text-white/40" />
                <button className="font-display font-extrabold text-sm uppercase tracking-widest text-brand-gold">Join</button>
              </form>
            </div>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
