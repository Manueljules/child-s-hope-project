import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import heroGallery from "@/assets/hero-gallery.jpg.asset.json";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Masembe Childcare Foundation Uganda" },
      { name: "description", content: "Photos from our programs, events, community outreach, education, and health activities." },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const [images, setImages] = useState<Array<{ id: string; url: string }>>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("project_media")
      .select("id,url,media_type")
      .eq("media_type", "image")
      .order("created_at", { ascending: false })
      .then(({ data }) => setImages((data ?? []) as Array<{ id: string; url: string }>));
  }, []);

  return (
    <SiteLayout>
      <PageHeader eyebrow="Gallery" title="Moments of hope." description="A visual record of lives changed, communities uplifted, and futures rewritten." image={heroGallery.url} />

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          {images.length === 0 ? (
            <p className="text-ink/50 text-center py-16">No photos yet. Photos added to projects appear here automatically.</p>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {images.map((it) => (
                <button key={it.id} onClick={() => setLightbox(it.url)} className="relative aspect-square overflow-hidden bg-surface group">
                  <img src={it.url} alt="" loading="lazy" className="size-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-ink/95 grid place-items-center p-6" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className="max-h-[90vh] max-w-full object-contain" />
          <button onClick={() => setLightbox(null)} className="absolute top-6 right-6 text-white font-mono text-xs uppercase tracking-widest border border-white/30 px-4 py-2">Close</button>
        </div>
      )}
    </SiteLayout>
  );
}
