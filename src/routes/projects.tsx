import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { X, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — The Saint's Childcare Foundation Uganda" },
      { name: "description", content: "Current, completed and upcoming projects of The Saint's Childcare Foundation Uganda — see budgets, progress and beneficiaries." },
    ],
  }),
  component: ProjectsPage,
});

type Project = {
  id: string;
  title: string;
  short_description: string | null;
  description: string | null;
  district: string | null;
  status: string;
  budget: number;
  raised: number;
  beneficiaries: number;
  cover_image: string | null;
};
type Media = { id: string; url: string; media_type: string; sort_order: number };
type Child = { id: string; name: string; age: number | null; photo_url: string | null };

const statusColor: Record<string, string> = {
  current: "text-brand-orange border-brand-orange",
  completed: "text-brand-green border-brand-green",
  upcoming: "text-brand-blue border-brand-blue",
};

function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [open, setOpen] = useState<Project | null>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    supabase.from("projects").select("*").eq("is_published", true).order("sort_order").then(({ data }) => {
      setProjects((data ?? []) as Project[]);
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    setSlide(0);
    supabase.from("project_media").select("*").eq("project_id", open.id).order("sort_order").then(({ data }) => {
      setMedia((data ?? []) as Media[]);
    });
    supabase.from("sponsored_children").select("id,name,age,photo_url").eq("project_id", open.id).eq("is_published", true).then(({ data }) => {
      setChildren((data ?? []) as Child[]);
    });
  }, [open]);

  return (
    <SiteLayout>
      <PageHeader eyebrow="Our Projects" title="Where your support takes shape." description="Track every project — its budget, its beneficiaries, and how much funding is still needed." />

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          {projects.length === 0 && (
            <p className="text-ink/50 text-center py-16">No projects yet. Check back soon.</p>
          )}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((p) => {
              const pct = p.budget > 0 ? Math.min(100, Math.round((Number(p.raised) / Number(p.budget)) * 100)) : 0;
              const needed = Math.max(0, Number(p.budget) - Number(p.raised));
              return (
                <button key={p.id} onClick={() => setOpen(p)} className="text-left border border-brand-blue/10 bg-white flex flex-col hover:border-brand-blue transition-colors">
                  <div className="aspect-video overflow-hidden bg-surface">
                    {p.cover_image ? <img src={p.cover_image} alt={p.title} loading="lazy" className="size-full object-cover" /> : <div className="size-full bg-brand-blue/10" />}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <span className={`self-start font-mono text-[10px] uppercase tracking-widest border px-2 py-1 mb-4 ${statusColor[p.status] ?? "border-brand-blue/30 text-brand-blue"}`}>
                      {p.status}
                    </span>
                    <h3 className="font-display font-extrabold text-xl mb-2">{p.title}</h3>
                    {p.district && <p className="font-mono text-[11px] uppercase tracking-widest text-ink/50 mb-4 inline-flex items-center gap-1"><MapPin className="size-3" />{p.district}</p>}
                    {p.short_description && <p className="text-ink/60 text-sm leading-relaxed mb-4">{p.short_description}</p>}
                    <div className="mb-4 mt-auto">
                      <div className="flex justify-between text-xs font-mono mb-2">
                        <span className="text-ink/50">Progress</span>
                        <span className="text-brand-blue font-bold">{pct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-brand-blue/10">
                        <div className="h-full bg-brand-blue transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs pt-4 border-t border-brand-blue/10">
                      <div>
                        <div className="font-mono text-[9px] uppercase text-ink/40 mb-1">Budget</div>
                        <div className="font-display font-extrabold">UGX {Number(p.budget).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="font-mono text-[9px] uppercase text-ink/40 mb-1">Lives</div>
                        <div className="font-display font-extrabold">{p.beneficiaries}</div>
                      </div>
                      <div>
                        <div className="font-mono text-[9px] uppercase text-ink/40 mb-1">Needed</div>
                        <div className="font-display font-extrabold text-brand-orange">{needed > 0 ? `UGX ${needed.toLocaleString()}` : "—"}</div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Detail modal */}
      {open && (
        <ProjectModal
          project={open}
          media={media}
          children={children}
          slide={slide}
          setSlide={setSlide}
          onClose={() => setOpen(null)}
        />
      )}
    </SiteLayout>
  );
}

function ProjectModal({ project, media, children, slide, setSlide, onClose }: {
  project: Project;
  media: Media[];
  children: Child[];
  slide: number;
  setSlide: (n: number) => void;
  onClose: () => void;
}) {
  const pct = project.budget > 0 ? Math.min(100, Math.round((Number(project.raised) / Number(project.budget)) * 100)) : 0;
  const needed = Math.max(0, Number(project.budget) - Number(project.raised));
  const slides = media.length > 0 ? media : (project.cover_image ? [{ id: "cover", url: project.cover_image, media_type: "image", sort_order: 0 }] : []);
  const cur = slides[slide];

  return (
    <div className="fixed inset-0 z-50 bg-ink/90 overflow-y-auto" onClick={onClose}>
      <div className="min-h-screen py-6 px-4 flex items-start md:items-center justify-center">
        <div onClick={(e) => e.stopPropagation()} className="w-full max-w-5xl bg-white relative">
          <button onClick={onClose} className="absolute top-3 right-3 z-10 size-10 bg-white/90 border border-ink/10 grid place-items-center hover:bg-ink hover:text-white transition-colors">
            <X className="size-5" />
          </button>

          {/* Slider */}
          <div className="relative aspect-video bg-ink overflow-hidden">
            {cur ? (
              cur.media_type === "video" ? (
                <video src={cur.url} controls className="size-full object-contain bg-black" />
              ) : (
                <img src={cur.url} alt={project.title} className="size-full object-cover" />
              )
            ) : (
              <div className="size-full grid place-items-center text-white/40 text-sm">No media yet</div>
            )}
            {slides.length > 1 && (
              <>
                <button onClick={() => setSlide((slide - 1 + slides.length) % slides.length)} className="absolute left-3 top-1/2 -translate-y-1/2 size-10 bg-white/90 grid place-items-center hover:bg-white">
                  <ChevronLeft className="size-5" />
                </button>
                <button onClick={() => setSlide((slide + 1) % slides.length)} className="absolute right-3 top-1/2 -translate-y-1/2 size-10 bg-white/90 grid place-items-center hover:bg-white">
                  <ChevronRight className="size-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                  {slides.map((_, i) => (
                    <button key={i} onClick={() => setSlide(i)} className={`size-2 rounded-full ${i === slide ? "bg-white" : "bg-white/40"}`} />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="p-6 md:p-10 space-y-6">
            <div>
              <span className={`inline-block font-mono text-[10px] uppercase tracking-widest border px-2 py-1 mb-3 ${statusColor[project.status] ?? "border-brand-blue/30 text-brand-blue"}`}>{project.status}</span>
              <h2 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight">{project.title}</h2>
              {project.district && <p className="mt-2 font-mono text-xs uppercase tracking-widest text-ink/50 inline-flex items-center gap-1"><MapPin className="size-3" />{project.district}</p>}
            </div>

            {project.description && <p className="text-ink/70 leading-relaxed whitespace-pre-line">{project.description}</p>}

            <div>
              <div className="flex justify-between text-sm font-mono mb-2">
                <span className="text-ink/60">Raised UGX {Number(project.raised).toLocaleString()}</span>
                <span className="text-brand-blue font-bold">{pct}%</span>
              </div>
              <div className="w-full h-2 bg-brand-blue/10">
                <div className="h-full bg-brand-blue transition-all" style={{ width: `${pct}%` }} />
              </div>
              <div className="flex justify-between text-xs font-mono mt-2 text-ink/50">
                <span>Goal: UGX {Number(project.budget).toLocaleString()}</span>
                <span>Still needed: <span className="text-brand-orange font-bold">UGX {needed.toLocaleString()}</span></span>
              </div>
            </div>

            {children.length > 0 && (
              <div>
                <p className="font-mono text-brand-blue text-xs uppercase tracking-widest mb-3">/ Sponsored children in this project</p>
                <div className="flex flex-wrap gap-3">
                  {children.map((c) => (
                    <div key={c.id} className="flex items-center gap-3 border border-brand-blue/10 pr-4">
                      <div className="size-12 bg-brand-blue/10 overflow-hidden shrink-0">
                        {c.photo_url && <img src={c.photo_url} alt={c.name} className="size-full object-cover" />}
                      </div>
                      <div>
                        <p className="font-display font-extrabold text-sm">{c.name}</p>
                        {c.age && <p className="text-xs text-ink/50">Age {c.age}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <a href={`/donate?project=${project.id}`} className="inline-block bg-brand-orange text-white px-8 py-4 font-display font-extrabold uppercase tracking-widest text-sm hover:bg-brand-orange/90">
              Donate to this project
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
