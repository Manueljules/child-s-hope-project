import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import heroStories from "@/assets/hero-stories.jpg.asset.json";
import { M } from "@/lib/media";

type Story = { id: string; title: string; tag: string | null; excerpt: string | null; body: string | null; image_url: string | null };

export const Route = createFileRoute("/stories")({
  head: () => ({
    meta: [
      { title: "Success Stories — Masembe Childcare Foundation Uganda" },
      { name: "description", content: "Real stories of children whose lives have been transformed through education, healthcare and community support." },
    ],
  }),
  component: StoriesPage,
});

function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  useEffect(() => {
    supabase.from("stories").select("*").eq("is_published", true).order("sort_order").then(({ data }) => {
      setStories((data ?? []) as Story[]);
    });
  }, []);

  return (
    <SiteLayout>
      <PageHeader eyebrow="Success Stories" title="Lives, transformed." description="Behind every statistic is a child, a family, and a future rewritten." image={heroStories.url} />

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 space-y-24">
          {stories.length === 0 && <p className="text-ink/50 text-center py-16">No stories yet.</p>}
          {stories.map((s, i) => (
            <article key={s.id} className={`grid md:grid-cols-2 gap-10 items-center ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
              <div className="aspect-[4/5] overflow-hidden bg-surface">
                {s.image_url && <M src={s.image_url} alt={s.title} loading="lazy" className="size-full object-cover" />}
              </div>
              <div>
                {s.tag && <p className="font-mono text-brand-orange text-xs uppercase tracking-widest mb-4">/ {s.tag}</p>}
                <h2 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight mb-8 leading-tight">{s.title}</h2>
                {s.excerpt && <p className="text-ink/70 leading-relaxed mb-6">{s.excerpt}</p>}
                {s.body && <p className="text-ink/70 leading-relaxed whitespace-pre-line">{s.body}</p>}
              </div>
            </article>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
