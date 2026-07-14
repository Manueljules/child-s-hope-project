import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { MediaCarousel } from "@/components/site/MediaCarousel";

type Post = { id: string; title: string; tag: string | null; excerpt: string | null; body: string | null; video_url: string | null; published_at: string };
type NewsMedia = { id: string; news_id: string; url: string };
type EventItem = { id: string; title: string; event_date: string; location: string | null };

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "News & Events — Masembe Childcare Foundation Uganda" },
      { name: "description", content: "Latest news, events, fundraising campaigns and community updates from Masembe Childcare Foundation Uganda." },
    ],
  }),
  component: NewsPage,
});

function NewsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [media, setMedia] = useState<NewsMedia[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    supabase.from("news_posts").select("*").eq("is_published", true).order("published_at", { ascending: false }).then(({ data }) => {
      const list = (data ?? []) as Post[];
      setPosts(list);
      if (list.length > 0) {
        supabase.from("news_media").select("*").in("news_id", list.map((p) => p.id)).order("sort_order").then(({ data: m }) => {
          setMedia((m ?? []) as NewsMedia[]);
        });
      }
    });
    supabase.from("events").select("*").gte("event_date", new Date().toISOString().slice(0, 10)).order("event_date").then(({ data }) => {
      setEvents((data ?? []) as EventItem[]);
    });
  }, []);

  return (
    <SiteLayout>
      <PageHeader eyebrow="News & Events" title="Updates from the field." description="Follow our campaigns, milestones and upcoming community events." />

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-16">
            {posts.length === 0 && <p className="text-ink/50">No news yet. Check back soon.</p>}
            {posts.map((p) => (
              <NewsCard key={p.id} post={p} media={media.filter((m) => m.news_id === p.id)} />
            ))}
          </div>

          <aside className="space-y-12">
            <div>
              <p className="font-mono text-brand-orange text-sm uppercase tracking-widest mb-4">/ Upcoming Events</p>
              {events.length === 0 && <p className="text-ink/50 text-sm">No upcoming events.</p>}
              <ul className="space-y-px bg-brand-blue/10 border border-brand-blue/10">
                {events.map((e) => {
                  const d = new Date(e.event_date);
                  return (
                    <li key={e.id} className="bg-white p-6 flex gap-4">
                      <div className="shrink-0 size-14 bg-brand-blue text-white grid place-items-center font-display font-extrabold text-sm leading-tight text-center">
                        {d.toLocaleDateString("en", { month: "short", day: "numeric" })}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-display font-extrabold text-base leading-tight">{e.title}</h3>
                        {e.location && <p className="text-ink/50 text-xs mt-1 truncate">{e.location}</p>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}

function NewsCard({ post, media }: { post: Post; media: NewsMedia[] }) {
  const [slide, setSlide] = useState(0);
  const [muted, setMuted] = useState(true); // browsers block autoplay-with-sound; start muted, let user unmute
  const slides = media;

  return (
    <article>
      {post.video_url && (
        <div className="relative aspect-video bg-black mb-4">
          <V
            src={post.video_url}
            autoPlay
            loop
            muted={muted}
            playsInline
            controls={false}
            className="size-full object-cover"
          />
          <button onClick={() => setMuted((m) => !m)} className="absolute bottom-3 right-3 size-10 bg-white/90 grid place-items-center hover:bg-white">
            {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </button>
        </div>
      )}
      {slides.length > 0 && !post.video_url && (
        <div className="relative aspect-video bg-surface mb-4 overflow-hidden">
          <M src={slides[slide].url} alt="" className="size-full object-cover" />
          {slides.length > 1 && (
            <>
              <button onClick={() => setSlide((slide - 1 + slides.length) % slides.length)} className="absolute left-2 top-1/2 -translate-y-1/2 size-9 bg-white/90 grid place-items-center"><ChevronLeft className="size-4" /></button>
              <button onClick={() => setSlide((slide + 1) % slides.length)} className="absolute right-2 top-1/2 -translate-y-1/2 size-9 bg-white/90 grid place-items-center"><ChevronRight className="size-4" /></button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {slides.map((_, i) => <button key={i} onClick={() => setSlide(i)} className={`size-2 rounded-full ${i === slide ? "bg-white" : "bg-white/40"}`} />)}
              </div>
            </>
          )}
        </div>
      )}
      <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-ink/40 mb-2">
        {post.tag && <><span className="text-brand-orange">{post.tag}</span><span>·</span></>}
        <span>{new Date(post.published_at).toLocaleDateString()}</span>
      </div>
      <h3 className="font-display font-extrabold text-2xl md:text-3xl mb-3 leading-tight">{post.title}</h3>
      {post.excerpt && <p className="text-ink/60 leading-relaxed mb-3">{post.excerpt}</p>}
      {post.body && <p className="text-ink/70 leading-relaxed whitespace-pre-line">{post.body}</p>}
    </article>
  );
}
