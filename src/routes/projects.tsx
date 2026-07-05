import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import programEducation from "@/assets/program-education.jpg";
import programHealth from "@/assets/program-health.jpg";
import programNutrition from "@/assets/program-nutrition.jpg";
import storyWater from "@/assets/story-water.jpg";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — The Saint's Childcare Foundation Uganda" },
      { name: "description", content: "Current, completed and upcoming projects of The Saint's Childcare Foundation Uganda — see budgets, progress and beneficiaries." },
    ],
  }),
  component: ProjectsPage,
});

const projects = [
  { img: programEducation, status: "current", title: "Hope Primary School Expansion", location: "Kiboga District", budget: "UGX 180M", progress: 64, beneficiaries: 420, needed: "UGX 65M" },
  { img: storyWater, status: "current", title: "Solar Water Borehole Program", location: "Mubende District", budget: "UGX 95M", progress: 82, beneficiaries: 1200, needed: "UGX 17M" },
  { img: programHealth, status: "current", title: "Mobile Health Clinic", location: "Northern Region", budget: "UGX 240M", progress: 35, beneficiaries: 3500, needed: "UGX 156M" },
  { img: programNutrition, status: "completed", title: "School Feeding Initiative 2024", location: "Central Region", budget: "UGX 140M", progress: 100, beneficiaries: 2800, needed: "—" },
  { img: programEducation, status: "completed", title: "Girls Scholarship Cohort '23", location: "Eastern Region", budget: "UGX 88M", progress: 100, beneficiaries: 120, needed: "—" },
  { img: programHealth, status: "upcoming", title: "Pediatric Surgery Camp", location: "Kampala", budget: "UGX 320M", progress: 0, beneficiaries: 200, needed: "UGX 320M" },
];

const statusColor: Record<string, string> = {
  current: "text-brand-orange border-brand-orange",
  completed: "text-brand-green border-brand-green",
  upcoming: "text-brand-blue border-brand-blue",
};

function ProjectsPage() {
  return (
    <SiteLayout>
      <PageHeader eyebrow="Our Projects" title="Where your support takes shape." description="Track every project — its budget, its beneficiaries, and how much funding is still needed." />

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((p) => (
              <article key={p.title} className="border border-brand-blue/10 bg-white flex flex-col">
                <div className="aspect-video overflow-hidden bg-surface">
                  <img src={p.img} alt={p.title} loading="lazy" className="size-full object-cover" />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <span className={`self-start font-mono text-[10px] uppercase tracking-widest border px-2 py-1 mb-4 ${statusColor[p.status]}`}>
                    {p.status}
                  </span>
                  <h3 className="font-display font-extrabold text-xl mb-2">{p.title}</h3>
                  <p className="font-mono text-[11px] uppercase tracking-widest text-ink/50 mb-4">{p.location}</p>
                  <div className="mb-4">
                    <div className="flex justify-between text-xs font-mono mb-2">
                      <span className="text-ink/50">Progress</span>
                      <span className="text-brand-blue font-bold">{p.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-brand-blue/10">
                      <div className="h-full bg-brand-blue" style={{ width: `${p.progress}%` }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs mt-auto pt-4 border-t border-brand-blue/10">
                    <div>
                      <div className="font-mono text-[9px] uppercase text-ink/40 mb-1">Budget</div>
                      <div className="font-display font-extrabold">{p.budget}</div>
                    </div>
                    <div>
                      <div className="font-mono text-[9px] uppercase text-ink/40 mb-1">Lives</div>
                      <div className="font-display font-extrabold">{p.beneficiaries}</div>
                    </div>
                    <div>
                      <div className="font-mono text-[9px] uppercase text-ink/40 mb-1">Needed</div>
                      <div className="font-display font-extrabold text-brand-orange">{p.needed}</div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
