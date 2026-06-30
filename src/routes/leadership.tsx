import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Linkedin, Mail } from "lucide-react";

export const Route = createFileRoute("/leadership")({
  head: () => ({
    meta: [
      { title: "Leadership Team — The Saints Childcare Foundation Uganda" },
      { name: "description", content: "Meet the leadership team driving The Saints Childcare Foundation Uganda's mission to support vulnerable children." },
    ],
  }),
  component: LeadershipPage,
});

const team = [
  { name: "[ Name ]", role: "Executive Director", bio: "Provides strategic leadership and oversees all programs." },
  { name: "[ Name ]", role: "Co-Founder", bio: "Partner in vision and operations since inception." },
  { name: "[ Name ]", role: "Programs Director", bio: "Leads implementation of education and healthcare programs." },
  { name: "[ Name ]", role: "Finance & Operations", bio: "Ensures transparency and accountability in all financials." },
  { name: "[ Name ]", role: "Child Protection Lead", bio: "Safeguards child welfare across all field operations." },
  { name: "[ Name ]", role: "Community Engagement", bio: "Builds and sustains partnerships with local communities." },
  { name: "[ Name ]", role: "Communications Lead", bio: "Tells the foundation's story to the world." },
  { name: "[ Name ]", role: "M&E Officer", bio: "Tracks and measures impact across every program." },
];

function LeadershipPage() {
  return (
    <SiteLayout>
      <PageHeader eyebrow="Leadership Team" title="The people behind the mission." description="A team of dedicated professionals committed to transforming children's lives across Uganda." />

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-brand-blue/10 border border-brand-blue/10">
            {team.map((m) => (
              <article key={m.role} className="bg-white p-8 group">
                <div className="aspect-square bg-surface mb-6 grid place-items-center text-ink/20 font-display font-extrabold text-5xl">
                  {m.name.replace(/\[|\]| /g, "").charAt(0) || "·"}
                </div>
                <h3 className="font-display font-extrabold text-xl mb-1">{m.name}</h3>
                <p className="font-mono text-[11px] uppercase tracking-widest text-brand-blue mb-3">{m.role}</p>
                <p className="text-ink/60 text-sm leading-relaxed mb-4">{m.bio}</p>
                <div className="flex gap-3 text-ink/40">
                  <a href="#" aria-label="LinkedIn" className="hover:text-brand-blue"><Linkedin className="size-4" /></a>
                  <a href="#" aria-label="Email" className="hover:text-brand-blue"><Mail className="size-4" /></a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
