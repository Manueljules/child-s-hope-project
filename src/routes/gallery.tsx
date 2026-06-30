import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import hero from "@/assets/hero-children.jpg";
import brian from "@/assets/sponsor-brian.jpg";
import edu from "@/assets/program-education.jpg";
import health from "@/assets/program-health.jpg";
import nutrition from "@/assets/program-nutrition.jpg";
import water from "@/assets/story-water.jpg";
import sarah from "@/assets/story-sarah.jpg";
import founder from "@/assets/founder.jpg";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — The Saints Childcare Foundation Uganda" },
      { name: "description", content: "Photos and videos from our programs, events, community outreach, education, and health activities." },
    ],
  }),
  component: GalleryPage,
});

const items = [
  { src: hero, cat: "Education" },
  { src: edu, cat: "Education" },
  { src: health, cat: "Health" },
  { src: nutrition, cat: "Health" },
  { src: water, cat: "Community" },
  { src: brian, cat: "Children" },
  { src: sarah, cat: "Children" },
  { src: founder, cat: "Events" },
  { src: hero, cat: "Events" },
  { src: edu, cat: "Community" },
  { src: water, cat: "Community" },
  { src: nutrition, cat: "Children" },
];

const cats = ["All", "Education", "Health", "Community", "Children", "Events"];

function GalleryPage() {
  const [filter, setFilter] = useState("All");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const visible = items.filter((i) => filter === "All" || i.cat === filter);

  return (
    <SiteLayout>
      <PageHeader eyebrow="Gallery" title="Moments of hope." description="A visual record of lives changed, communities uplifted, and futures rewritten." />

      <section className="py-12 bg-white sticky top-20 z-30 border-b border-brand-blue/10">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap gap-2">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-4 py-2 font-mono text-[11px] uppercase tracking-widest border transition-colors ${filter === c ? "bg-ink text-white border-ink" : "border-brand-blue/20 text-ink/60 hover:border-brand-blue hover:text-brand-blue"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {visible.map((it, i) => (
              <button
                key={i}
                onClick={() => setLightbox(it.src)}
                className="relative aspect-square overflow-hidden bg-surface group"
              >
                <img src={it.src} alt={it.cat} loading="lazy" className="size-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/40 transition-colors grid place-items-center opacity-0 group-hover:opacity-100">
                  <span className="font-mono text-xs uppercase tracking-widest text-white">{it.cat}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-ink/95 grid place-items-center p-6"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="" className="max-h-[90vh] max-w-full object-contain" />
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-6 right-6 text-white font-mono text-xs uppercase tracking-widest border border-white/30 px-4 py-2"
          >
            Close
          </button>
        </div>
      )}
    </SiteLayout>
  );
}
