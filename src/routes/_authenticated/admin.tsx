import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { uploadToBucket } from "@/lib/upload";
import { Save, Plus, Trash2, LogOut, Edit3, Landmark, Image as ImageIcon, MessageSquare, Wallet, Users, FolderKanban, Newspaper, CalendarDays, Baby, Mail, Lock, Upload } from "lucide-react";
import { M, V } from "@/lib/media";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard — Masembe Childcare Foundation" }] }),
  component: AdminPage,
});

type Tab =
  | "messages" | "hero" | "stats" | "stories" | "accounts" | "donations"
  | "projects" | "children" | "news" | "events" | "inbox" | "newsletter";

function AdminPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("projects");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id;
      if (!uid) { setIsAdmin(false); return; }
      await supabase.rpc("claim_admin_if_first");
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid).eq("role", "admin").maybeSingle();
      setIsAdmin(!!data);
    })();
  }, []);

  async function signOut() { await supabase.auth.signOut(); navigate({ to: "/auth" }); }

  if (isAdmin === false) {
    return (
      <SiteLayout>
        <section className="py-32 text-center px-6">
          <h1 className="font-display font-extrabold text-3xl mb-4">Not authorised</h1>
          <button onClick={signOut} className="bg-brand-blue text-white px-6 py-3 font-display font-extrabold uppercase tracking-widest text-xs">Sign out</button>
        </section>
      </SiteLayout>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "projects", label: "Projects", icon: FolderKanban },
    { id: "children", label: "Sponsored Children", icon: Baby },
    { id: "news", label: "News", icon: Newspaper },
    { id: "events", label: "Events", icon: CalendarDays },
    { id: "stories", label: "Stories", icon: ImageIcon },
    { id: "inbox", label: "Inbox", icon: Mail },
    { id: "newsletter", label: "Newsletter", icon: Users },
    { id: "messages", label: "Leader Messages", icon: MessageSquare },
    { id: "hero", label: "Hero & About", icon: Edit3 },
    { id: "stats", label: "Impact Stats", icon: Users },
    { id: "accounts", label: "Payment Accounts", icon: Landmark },
    { id: "donations", label: "Donations Log", icon: Wallet },
  ];

  return (
    <SiteLayout>
      <PageHeader eyebrow="Admin" title="Content management" description="Edit any part of the site, manage donation destinations and review donations." />
      <section className="py-12 bg-surface min-h-[70vh]">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[240px_1fr] gap-8">
          <aside className="space-y-1">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`w-full flex items-center gap-3 text-left px-4 py-3 font-display font-bold uppercase text-xs tracking-widest transition-all ${tab === t.id ? "bg-ink text-white" : "text-ink/60 hover:bg-white"}`}>
                <t.icon className="size-4" /> {t.label}
              </button>
            ))}
            <button onClick={signOut} className="w-full flex items-center gap-3 text-left px-4 py-3 font-display font-bold uppercase text-xs tracking-widest text-red-600 hover:bg-white mt-6">
              <LogOut className="size-4" /> Sign out
            </button>
          </aside>

          <div className="bg-white border border-brand-blue/10 p-6 md:p-8 min-w-0">
            {tab === "projects" && <ProjectsEditor />}
            {tab === "children" && <ChildrenEditor />}
            {tab === "news" && <NewsEditor />}
            {tab === "events" && <EventsEditor />}
            {tab === "stories" && <StoriesEditor />}
            {tab === "inbox" && <InboxEditor />}
            {tab === "newsletter" && <NewsletterEditor />}
            {tab === "messages" && <LeaderMessagesEditor />}
            {tab === "hero" && <ContentJsonEditor keyName="hero" title="Hero section" fields={[["eyebrow", "Eyebrow"], ["title", "Title"], ["subtitle", "Subtitle"]]} />}
            {tab === "stats" && <ContentJsonEditor keyName="impact_stats" title="Impact statistics" fields={[["children_served", "Children served"], ["meals_provided", "Meals provided"], ["schools_assisted", "Schools assisted"], ["districts_reached", "Districts reached"]]} numeric />}
            {tab === "accounts" && <AccountsPinGate />}
            {tab === "donations" && <DonationsLog />}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

/* ============================================================
   PROJECTS
   ============================================================ */
type Project = {
  id?: string; title: string; slug?: string | null; short_description: string; description: string;
  district: string; status: string; budget: number; raised: number; cash_raised: number; beneficiaries: number;
  cover_image: string; is_published: boolean; sort_order: number;
};
function emptyProject(order: number): Project {
  return { title: "", short_description: "", description: "", district: "", status: "current", budget: 0, raised: 0, cash_raised: 0, beneficiaries: 0, cover_image: "", is_published: true, sort_order: order };
}

function ProjectsEditor() {
  const qc = useQueryClient();
  const { data: projects } = useQuery({
    queryKey: ["admin_projects"],
    queryFn: async () => (await supabase.from("projects").select("*").order("sort_order")).data as Project[] | null,
  });
  const [editing, setEditing] = useState<Project | null>(null);
  const [managingMedia, setManagingMedia] = useState<Project | null>(null);

  async function save(p: Project) {
    const { raised, ...payload } = p;
    if (p.id) await supabase.from("projects").update(payload).eq("id", p.id);
    else await supabase.from("projects").insert(payload);
    qc.invalidateQueries({ queryKey: ["admin_projects"] });
    setEditing(null);
  }
  async function remove(id: string) {
    if (!confirm("Delete this project? All media and donations linked to it will be affected.")) return;
    await supabase.from("projects").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin_projects"] });
  }

  if (managingMedia) return <MediaManager project={managingMedia} onClose={() => setManagingMedia(null)} />;

  if (editing) {
    return (
      <div className="space-y-4">
        <h2 className="font-display font-extrabold text-xl">{editing.id ? "Edit project" : "New project"}</h2>
        <AdminField label="Title" value={editing.title} onChange={(v) => setEditing({ ...editing, title: v })} />
        <AdminField label="Short description (shown on the card)" value={editing.short_description} onChange={(v) => setEditing({ ...editing, short_description: v })} />
        <AdminTextArea label="Full description (shown when opened)" value={editing.description} onChange={(v) => setEditing({ ...editing, description: v })} rows={6} />
        <div className="grid md:grid-cols-2 gap-4">
          <AdminField label="District" value={editing.district} onChange={(v) => setEditing({ ...editing, district: v })} />
          <label className="block">
            <span className="block font-mono text-[11px] uppercase tracking-widest text-ink/60 mb-2">Status</span>
            <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })} className="w-full border border-brand-blue/20 px-4 py-3 text-sm">
              <option value="current">Current</option><option value="upcoming">Upcoming</option><option value="completed">Completed</option>
            </select>
          </label>
          <AdminField label="Budget (UGX)" type="number" value={String(editing.budget)} onChange={(v) => setEditing({ ...editing, budget: Number(v) })} />
          <div className="block">
            <span className="block font-mono text-[11px] uppercase tracking-widest text-ink/60 mb-2">Raised online (UGX) — auto from donations</span>
            <div className="w-full border border-brand-blue/10 bg-ink/5 px-4 py-3 text-sm text-ink/70">{Number(editing.raised).toLocaleString()}</div>
          </div>
          <AdminField label="Cash raised (UGX) — offline / in-kind" type="number" value={String(editing.cash_raised ?? 0)} onChange={(v) => setEditing({ ...editing, cash_raised: Number(v) })} />

          <AdminField label="Beneficiaries" type="number" value={String(editing.beneficiaries)} onChange={(v) => setEditing({ ...editing, beneficiaries: Number(v) })} />
          <ImageUploadField label="Cover image" bucket="project-media" value={editing.cover_image} onChange={(url) => setEditing({ ...editing, cover_image: url })} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={editing.is_published} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} /> Published
        </label>
        <div className="flex gap-2">
          <button onClick={() => save(editing)} className="bg-brand-blue text-white px-6 py-3 font-display font-extrabold uppercase tracking-widest text-xs inline-flex items-center gap-2"><Save className="size-4" />Save</button>
          <button onClick={() => setEditing(null)} className="border border-ink/20 px-6 py-3 font-display font-extrabold uppercase tracking-widest text-xs">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-display font-extrabold text-xl">Projects</h2>
        <button onClick={() => setEditing(emptyProject((projects?.length ?? 0) + 1))} className="bg-brand-orange text-white px-4 py-2 font-display font-extrabold uppercase tracking-widest text-xs inline-flex items-center gap-2"><Plus className="size-4" />New</button>
      </div>
      <div className="divide-y divide-ink/10">
        {(projects ?? []).map((p) => {
          const total = Number(p.raised) + Number(p.cash_raised ?? 0);
          const pct = p.budget > 0 ? Math.round((total / Number(p.budget)) * 100) : 0;

          return (
            <div key={p.id} className="py-4 flex items-center gap-4">
              {p.cover_image ? <M src={p.cover_image} alt="" className="size-14 object-cover" /> : <div className="size-14 bg-ink/5" />}
              <div className="flex-1 min-w-0">
                <p className="font-display font-extrabold truncate">{p.title}</p>
                <p className="text-xs text-ink/50">{p.status} · {p.district} · {pct}% funded</p>
              </div>
              <button onClick={() => setManagingMedia(p)} className="text-brand-blue text-xs font-mono uppercase tracking-widest">Media</button>
              <button onClick={() => setEditing(p)} className="text-brand-blue text-xs font-mono uppercase tracking-widest">Edit</button>
              <button onClick={() => remove(p.id!)} className="text-red-600"><Trash2 className="size-4" /></button>
            </div>
          );
        })}
        {(projects ?? []).length === 0 && <p className="text-ink/50 text-sm py-6">No projects yet.</p>}
      </div>
    </div>
  );
}

function MediaManager({ project, onClose }: { project: Project; onClose: () => void }) {
  const qc = useQueryClient();
  const pid = project.id!;
  const { data: media } = useQuery({
    queryKey: ["project_media", pid],
    queryFn: async () => (await supabase.from("project_media").select("*").eq("project_id", pid).order("sort_order")).data ?? [],
  });
  const list = (media ?? []) as Array<{ id: string; url: string; media_type: string; sort_order: number }>;
  const [busy, setBusy] = useState(false);

  async function upload(file: File) {
    if (list.length >= 50) { alert("Maximum 50 media items per project."); return; }
    setBusy(true);
    try {
      const url = await uploadToBucket("project-media", file);
      const media_type = file.type.startsWith("video") ? "video" : "image";
      await supabase.from("project_media").insert({ project_id: pid, url, media_type, sort_order: list.length });
      qc.invalidateQueries({ queryKey: ["project_media", pid] });
    } catch (err) {
      alert("Upload failed: " + (err as Error).message);
    } finally { setBusy(false); }

  }
  async function remove(id: string) {
    if (!confirm("Delete this media?")) return;
    await supabase.from("project_media").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["project_media", pid] });
  }

  return (
    <div className="space-y-4">
      <button onClick={onClose} className="text-brand-blue text-xs font-mono uppercase tracking-widest">← Back to projects</button>
      <h2 className="font-display font-extrabold text-xl">Media · {project.title} <span className="text-sm text-ink/50">({list.length}/50)</span></h2>
      <label className={`flex items-center gap-2 bg-brand-blue text-white px-4 py-3 font-display font-extrabold uppercase tracking-widest text-xs cursor-pointer w-fit ${busy ? "opacity-60" : ""}`}>
        <Upload className="size-4" /> {busy ? "Uploading…" : "Upload image or video"}
        <input hidden type="file" accept="image/*,video/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.currentTarget.value = ""; }} />
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {list.map((m) => (
          <div key={m.id} className="relative aspect-square bg-surface overflow-hidden group">
            {m.media_type === "video" ? <V src={m.url} className="size-full object-cover" /> : <M src={m.url} alt="" className="size-full object-cover" />}
            <button onClick={() => remove(m.id)} className="absolute top-1 right-1 size-7 bg-white/90 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="size-3 text-red-600" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   SPONSORED CHILDREN
   ============================================================ */
type Child = { id?: string; project_id: string | null; name: string; age: number | null; location: string; photo_url: string; story: string; monthly_amount: number; is_sponsored: boolean; is_published: boolean; sort_order: number };
function ChildrenEditor() {
  const qc = useQueryClient();
  const { data: kids } = useQuery({ queryKey: ["admin_children"], queryFn: async () => (await supabase.from("sponsored_children").select("*").order("sort_order")).data as Child[] | null });
  const { data: projects } = useQuery({ queryKey: ["admin_projects_list"], queryFn: async () => (await supabase.from("projects").select("id,title")).data ?? [] });
  const [editing, setEditing] = useState<Child | null>(null);

  async function save(c: Child) {
    if (c.id) await supabase.from("sponsored_children").update(c).eq("id", c.id);
    else await supabase.from("sponsored_children").insert(c);
    qc.invalidateQueries({ queryKey: ["admin_children"] });
    setEditing(null);
  }
  async function remove(id: string) {
    if (!confirm("Delete this child?")) return;
    await supabase.from("sponsored_children").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin_children"] });
  }

  if (editing) {
    return (
      <div className="space-y-4">
        <h2 className="font-display font-extrabold text-xl">{editing.id ? "Edit child" : "New child"}</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <AdminField label="Name" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
          <AdminField label="Age" type="number" value={String(editing.age ?? "")} onChange={(v) => setEditing({ ...editing, age: v ? Number(v) : null })} />
          <AdminField label="Location" value={editing.location} onChange={(v) => setEditing({ ...editing, location: v })} />
          <AdminField label="Monthly sponsorship (UGX)" type="number" value={String(editing.monthly_amount)} onChange={(v) => setEditing({ ...editing, monthly_amount: Number(v) })} />
          <label className="block md:col-span-2">
            <span className="block font-mono text-[11px] uppercase tracking-widest text-ink/60 mb-2">Assign to project</span>
            <select value={editing.project_id ?? ""} onChange={(e) => setEditing({ ...editing, project_id: e.target.value || null })} className="w-full border border-brand-blue/20 px-4 py-3 text-sm">
              <option value="">— None —</option>
              {((projects ?? []) as Array<{ id: string; title: string }>).map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </label>
          <ImageUploadField label="Photo" bucket="child-photos" value={editing.photo_url} onChange={(url) => setEditing({ ...editing, photo_url: url })} />
        </div>
        <AdminTextArea label="Story" value={editing.story} onChange={(v) => setEditing({ ...editing, story: v })} rows={5} />
        <div className="flex gap-6 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={editing.is_sponsored} onChange={(e) => setEditing({ ...editing, is_sponsored: e.target.checked })} /> Sponsored</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={editing.is_published} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} /> Published</label>
        </div>
        <div className="flex gap-2">
          <button onClick={() => save(editing)} className="bg-brand-blue text-white px-6 py-3 font-display font-extrabold uppercase tracking-widest text-xs inline-flex items-center gap-2"><Save className="size-4" />Save</button>
          <button onClick={() => setEditing(null)} className="border border-ink/20 px-6 py-3 font-display font-extrabold uppercase tracking-widest text-xs">Cancel</button>
        </div>
      </div>
    );
  }

  const empty: Child = { project_id: null, name: "", age: null, location: "", photo_url: "", story: "", monthly_amount: 100000, is_sponsored: false, is_published: true, sort_order: (kids?.length ?? 0) + 1 };
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-display font-extrabold text-xl">Sponsored children</h2>
        <button onClick={() => setEditing(empty)} className="bg-brand-orange text-white px-4 py-2 font-display font-extrabold uppercase tracking-widest text-xs inline-flex items-center gap-2"><Plus className="size-4" />New</button>
      </div>
      <div className="divide-y divide-ink/10">
        {(kids ?? []).map((c) => (
          <div key={c.id} className="py-4 flex items-center gap-4">
            {c.photo_url ? <M src={c.photo_url} alt="" className="size-14 object-cover rounded-full" /> : <div className="size-14 bg-ink/5 rounded-full" />}
            <div className="flex-1 min-w-0">
              <p className="font-display font-extrabold truncate">{c.name}{c.age ? `, ${c.age}` : ""}</p>
              <p className="text-xs text-ink/50">{c.location} · {c.is_sponsored ? "Sponsored" : "Awaiting sponsor"}</p>
            </div>
            <button onClick={() => setEditing(c)} className="text-brand-blue text-xs font-mono uppercase tracking-widest">Edit</button>
            <button onClick={() => remove(c.id!)} className="text-red-600"><Trash2 className="size-4" /></button>
          </div>
        ))}
        {(kids ?? []).length === 0 && <p className="text-ink/50 text-sm py-6">No children yet.</p>}
      </div>
    </div>
  );
}

/* ============================================================
   NEWS
   ============================================================ */
type NewsPost = { id?: string; title: string; tag: string; excerpt: string; body: string; video_url: string; is_published: boolean; published_at: string };
function NewsEditor() {
  const qc = useQueryClient();
  const { data: posts } = useQuery({ queryKey: ["admin_news"], queryFn: async () => (await supabase.from("news_posts").select("*").order("published_at", { ascending: false })).data as NewsPost[] | null });
  const [editing, setEditing] = useState<NewsPost | null>(null);
  const [managingMedia, setManagingMedia] = useState<NewsPost | null>(null);

  async function save(p: NewsPost) {
    if (p.id) await supabase.from("news_posts").update(p).eq("id", p.id);
    else await supabase.from("news_posts").insert(p);
    qc.invalidateQueries({ queryKey: ["admin_news"] });
    setEditing(null);
  }
  async function remove(id: string) {
    if (!confirm("Delete this news post?")) return;
    await supabase.from("news_posts").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin_news"] });
  }

  if (managingMedia) return <NewsMediaManager post={managingMedia} onClose={() => setManagingMedia(null)} />;

  if (editing) {
    return (
      <div className="space-y-4">
        <h2 className="font-display font-extrabold text-xl">{editing.id ? "Edit post" : "New post"}</h2>
        <AdminField label="Title" value={editing.title} onChange={(v) => setEditing({ ...editing, title: v })} />
        <AdminField label="Tag" value={editing.tag} onChange={(v) => setEditing({ ...editing, tag: v })} placeholder="Announcement, Impact, Event..." />
        <AdminField label="Video URL (autoplays)" value={editing.video_url} onChange={(v) => setEditing({ ...editing, video_url: v })} placeholder="https://... (mp4 or YouTube embed)" />
        <AdminTextArea label="Excerpt" value={editing.excerpt} onChange={(v) => setEditing({ ...editing, excerpt: v })} rows={2} />
        <AdminTextArea label="Body" value={editing.body} onChange={(v) => setEditing({ ...editing, body: v })} rows={10} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={editing.is_published} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} /> Published
        </label>
        <div className="flex gap-2">
          <button onClick={() => save(editing)} className="bg-brand-blue text-white px-6 py-3 font-display font-extrabold uppercase tracking-widest text-xs inline-flex items-center gap-2"><Save className="size-4" />Save</button>
          <button onClick={() => setEditing(null)} className="border border-ink/20 px-6 py-3 font-display font-extrabold uppercase tracking-widest text-xs">Cancel</button>
        </div>
      </div>
    );
  }

  const empty: NewsPost = { title: "", tag: "", excerpt: "", body: "", video_url: "", is_published: true, published_at: new Date().toISOString() };
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-display font-extrabold text-xl">News</h2>
        <button onClick={() => setEditing(empty)} className="bg-brand-orange text-white px-4 py-2 font-display font-extrabold uppercase tracking-widest text-xs inline-flex items-center gap-2"><Plus className="size-4" />New</button>
      </div>
      <div className="divide-y divide-ink/10">
        {(posts ?? []).map((p) => (
          <div key={p.id} className="py-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-display font-extrabold truncate">{p.title}</p>
              <p className="text-xs text-ink/50">{p.tag} · {new Date(p.published_at).toLocaleDateString()}</p>
            </div>
            <button onClick={() => setManagingMedia(p)} className="text-brand-blue text-xs font-mono uppercase tracking-widest">Photos</button>
            <button onClick={() => setEditing(p)} className="text-brand-blue text-xs font-mono uppercase tracking-widest">Edit</button>
            <button onClick={() => remove(p.id!)} className="text-red-600"><Trash2 className="size-4" /></button>
          </div>
        ))}
        {(posts ?? []).length === 0 && <p className="text-ink/50 text-sm py-6">No news yet.</p>}
      </div>
    </div>
  );
}
function NewsMediaManager({ post, onClose }: { post: NewsPost; onClose: () => void }) {
  const qc = useQueryClient();
  const nid = post.id!;
  const { data: media } = useQuery({
    queryKey: ["news_media", nid],
    queryFn: async () => (await supabase.from("news_media").select("*").eq("news_id", nid).order("sort_order")).data ?? [],
  });
  const list = (media ?? []) as Array<{ id: string; url: string; sort_order: number }>;
  const [busy, setBusy] = useState(false);
  async function upload(file: File) {
    if (list.length >= 5) { alert("Maximum 5 photos per news post."); return; }
    setBusy(true);
    try {
      const url = await uploadToBucket("news-media", file);
      await supabase.from("news_media").insert({ news_id: nid, url, sort_order: list.length });
      qc.invalidateQueries({ queryKey: ["news_media", nid] });
    } finally { setBusy(false); }
  }

  async function remove(id: string) {
    if (!confirm("Delete this photo?")) return;
    await supabase.from("news_media").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["news_media", nid] });
  }
  return (
    <div className="space-y-4">
      <button onClick={onClose} className="text-brand-blue text-xs font-mono uppercase tracking-widest">← Back to news</button>
      <h2 className="font-display font-extrabold text-xl">Photos · {post.title} <span className="text-sm text-ink/50">({list.length}/5)</span></h2>
      <label className={`flex items-center gap-2 bg-brand-blue text-white px-4 py-3 font-display font-extrabold uppercase tracking-widest text-xs cursor-pointer w-fit ${busy ? "opacity-60" : ""}`}>
        <Upload className="size-4" /> {busy ? "Uploading…" : "Upload photo"}
        <input hidden type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.currentTarget.value = ""; }} />
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {list.map((m) => (
          <div key={m.id} className="relative aspect-square bg-surface overflow-hidden group">
            <M src={m.url} alt="" className="size-full object-cover" />
            <button onClick={() => remove(m.id)} className="absolute top-1 right-1 size-7 bg-white/90 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="size-3 text-red-600" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   EVENTS
   ============================================================ */
type EventItem = { id?: string; title: string; event_date: string; location: string; description: string };
function EventsEditor() {
  const qc = useQueryClient();
  const { data: events } = useQuery({ queryKey: ["admin_events"], queryFn: async () => (await supabase.from("events").select("*").order("event_date")).data as EventItem[] | null });
  const [editing, setEditing] = useState<EventItem | null>(null);

  async function save(e: EventItem) {
    if (e.id) await supabase.from("events").update(e).eq("id", e.id);
    else await supabase.from("events").insert(e);
    qc.invalidateQueries({ queryKey: ["admin_events"] });
    setEditing(null);
  }
  async function remove(id: string) {
    if (!confirm("Delete this event?")) return;
    await supabase.from("events").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin_events"] });
  }

  if (editing) {
    return (
      <div className="space-y-4">
        <h2 className="font-display font-extrabold text-xl">{editing.id ? "Edit event" : "New event"}</h2>
        <AdminField label="Title" value={editing.title} onChange={(v) => setEditing({ ...editing, title: v })} />
        <label className="block">
          <span className="block font-mono text-[11px] uppercase tracking-widest text-ink/60 mb-2">Date</span>
          <input type="date" value={editing.event_date?.slice(0, 10)} onChange={(e) => setEditing({ ...editing, event_date: e.target.value })} className="w-full border border-brand-blue/20 px-4 py-3 text-sm" />
        </label>
        <AdminField label="Location" value={editing.location} onChange={(v) => setEditing({ ...editing, location: v })} />
        <AdminTextArea label="Description" value={editing.description} onChange={(v) => setEditing({ ...editing, description: v })} rows={4} />
        <div className="flex gap-2">
          <button onClick={() => save(editing)} className="bg-brand-blue text-white px-6 py-3 font-display font-extrabold uppercase tracking-widest text-xs inline-flex items-center gap-2"><Save className="size-4" />Save</button>
          <button onClick={() => setEditing(null)} className="border border-ink/20 px-6 py-3 font-display font-extrabold uppercase tracking-widest text-xs">Cancel</button>
        </div>
      </div>
    );
  }
  const empty: EventItem = { title: "", event_date: new Date().toISOString().slice(0, 10), location: "", description: "" };
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-display font-extrabold text-xl">Events</h2>
        <button onClick={() => setEditing(empty)} className="bg-brand-orange text-white px-4 py-2 font-display font-extrabold uppercase tracking-widest text-xs inline-flex items-center gap-2"><Plus className="size-4" />New</button>
      </div>
      <div className="divide-y divide-ink/10">
        {(events ?? []).map((e) => (
          <div key={e.id} className="py-4 flex items-center gap-4">
            <div className="size-14 bg-brand-blue text-white grid place-items-center font-display font-extrabold text-xs text-center leading-tight">
              {new Date(e.event_date).toLocaleDateString("en", { month: "short", day: "numeric" })}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-extrabold truncate">{e.title}</p>
              <p className="text-xs text-ink/50">{e.location}</p>
            </div>
            <button onClick={() => setEditing(e)} className="text-brand-blue text-xs font-mono uppercase tracking-widest">Edit</button>
            <button onClick={() => remove(e.id!)} className="text-red-600"><Trash2 className="size-4" /></button>
          </div>
        ))}
        {(events ?? []).length === 0 && <p className="text-ink/50 text-sm py-6">No events yet.</p>}
      </div>
    </div>
  );
}

/* ============================================================
   INBOX (contact + volunteer)
   ============================================================ */
function InboxEditor() {
  const [which, setWhich] = useState<"contact" | "volunteer">("contact");
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setWhich("contact")} className={`px-4 py-2 font-mono text-xs uppercase tracking-widest ${which === "contact" ? "bg-ink text-white" : "border border-ink/20"}`}>Contact messages</button>
        <button onClick={() => setWhich("volunteer")} className={`px-4 py-2 font-mono text-xs uppercase tracking-widest ${which === "volunteer" ? "bg-ink text-white" : "border border-ink/20"}`}>Volunteer applications</button>
      </div>
      {which === "contact" ? <ContactList /> : <VolunteerList />}
    </div>
  );
}
function ContactList() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin_contacts"], queryFn: async () => (await supabase.from("contact_messages").select("*").order("created_at", { ascending: false })).data ?? [] });
  const list = data as Array<{ id: string; name: string; email: string; phone: string | null; subject: string | null; message: string; is_read: boolean; created_at: string }>;
  async function toggleRead(id: string, read: boolean) {
    await supabase.from("contact_messages").update({ is_read: !read }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin_contacts"] });
  }
  async function remove(id: string) {
    if (!confirm("Delete this message?")) return;
    await supabase.from("contact_messages").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin_contacts"] });
  }
  return (
    <div className="divide-y divide-ink/10">
      {(list ?? []).map((m) => (
        <div key={m.id} className={`py-4 ${m.is_read ? "opacity-60" : ""}`}>
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <p className="font-display font-extrabold">{m.name} <span className="font-mono text-xs text-brand-blue">{m.email}</span></p>
              <p className="text-xs text-ink/50">{m.phone ?? ""} · {new Date(m.created_at).toLocaleString()}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => toggleRead(m.id, m.is_read)} className="text-xs font-mono uppercase text-brand-blue">{m.is_read ? "Mark unread" : "Mark read"}</button>
              <button onClick={() => remove(m.id)} className="text-red-600"><Trash2 className="size-4" /></button>
            </div>
          </div>
          {m.subject && <p className="font-medium text-sm mb-1">{m.subject}</p>}
          <p className="text-sm text-ink/70 whitespace-pre-wrap">{m.message}</p>
        </div>
      ))}
      {(list ?? []).length === 0 && <p className="text-ink/50 text-sm py-6">No contact messages yet.</p>}
    </div>
  );
}
function VolunteerList() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin_volunteers"], queryFn: async () => (await supabase.from("volunteer_applications").select("*").order("created_at", { ascending: false })).data ?? [] });
  const list = data as Array<{ id: string; name: string; email: string; phone: string | null; country: string | null; skills: string | null; availability: string | null; interest: string | null; is_read: boolean; created_at: string }>;
  async function toggleRead(id: string, read: boolean) {
    await supabase.from("volunteer_applications").update({ is_read: !read }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin_volunteers"] });
  }
  async function remove(id: string) {
    if (!confirm("Delete this application?")) return;
    await supabase.from("volunteer_applications").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin_volunteers"] });
  }
  return (
    <div className="divide-y divide-ink/10">
      {(list ?? []).map((v) => (
        <div key={v.id} className={`py-4 ${v.is_read ? "opacity-60" : ""}`}>
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <p className="font-display font-extrabold">{v.name} <span className="font-mono text-xs text-brand-blue">{v.email}</span></p>
              <p className="text-xs text-ink/50">{v.phone ?? ""} · {v.country ?? ""} · {new Date(v.created_at).toLocaleString()}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => toggleRead(v.id, v.is_read)} className="text-xs font-mono uppercase text-brand-blue">{v.is_read ? "Mark unread" : "Mark read"}</button>
              <button onClick={() => remove(v.id)} className="text-red-600"><Trash2 className="size-4" /></button>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-2 text-xs text-ink/70">
            {v.skills && <div><span className="font-mono uppercase text-ink/40">Skills:</span> {v.skills}</div>}
            {v.availability && <div><span className="font-mono uppercase text-ink/40">Availability:</span> {v.availability}</div>}
            {v.interest && <div><span className="font-mono uppercase text-ink/40">Interest:</span> {v.interest}</div>}
          </div>
        </div>
      ))}
      {(list ?? []).length === 0 && <p className="text-ink/50 text-sm py-6">No volunteer applications yet.</p>}
    </div>
  );
}

/* ============================================================
   NEWSLETTER
   ============================================================ */
function NewsletterEditor() {
  const qc = useQueryClient();
  const { data: subs } = useQuery({ queryKey: ["admin_subs"], queryFn: async () => (await supabase.from("newsletter_subscribers").select("*").order("created_at", { ascending: false })).data ?? [] });
  const { data: tpl } = useQuery({ queryKey: ["admin_tpl"], queryFn: async () => (await supabase.from("newsletter_template").select("*").eq("id", 1).maybeSingle()).data });
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [saved, setSaved] = useState(false);
  useEffect(() => { if (tpl) { setSubject((tpl as { subject: string }).subject); setBody((tpl as { html_body: string }).html_body); } }, [tpl]);

  async function save() {
    await supabase.from("newsletter_template").update({ subject, html_body: body, updated_at: new Date().toISOString() }).eq("id", 1);
    qc.invalidateQueries({ queryKey: ["admin_tpl"] });
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  }
  async function remove(id: string) {
    if (!confirm("Remove this subscriber?")) return;
    await supabase.from("newsletter_subscribers").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin_subs"] });
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="font-display font-extrabold text-xl">Email template</h2>
        <p className="text-xs text-ink/50">Use <code className="bg-surface px-1">{"{{title}}"}</code>, <code className="bg-surface px-1">{"{{excerpt}}"}</code>, <code className="bg-surface px-1">{"{{url}}"}</code> as merge tags.</p>
        <AdminField label="Subject" value={subject} onChange={setSubject} />
        <AdminTextArea label="HTML body" value={body} onChange={setBody} rows={8} />
        <SaveButton onClick={save} saved={saved} />
        <p className="text-xs text-ink/50">Note: automatic sending on news publish requires an email domain — connect that later from Settings → Email.</p>
      </div>
      <div className="space-y-4">
        <h2 className="font-display font-extrabold text-xl">Subscribers ({(subs ?? []).length})</h2>
        <div className="divide-y divide-ink/10">
          {((subs ?? []) as Array<{ id: string; email: string; created_at: string }>).map((s) => (
            <div key={s.id} className="py-3 flex items-center gap-4">
              <Mail className="size-4 text-brand-blue" />
              <span className="flex-1 text-sm">{s.email}</span>
              <span className="text-xs text-ink/40">{new Date(s.created_at).toLocaleDateString()}</span>
              <button onClick={() => remove(s.id)} className="text-red-600"><Trash2 className="size-4" /></button>
            </div>
          ))}
          {(subs ?? []).length === 0 && <p className="text-ink/50 text-sm py-6">No subscribers yet.</p>}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   LEADER MESSAGES / STORIES / CONTENT (kept from before)
   ============================================================ */
function LeaderMessagesEditor() {
  return (
    <div className="space-y-10">
      <LeaderForm keyName="founder_message" heading="Founder's message" />
      <div className="border-t border-ink/10" />
      <LeaderForm keyName="cofounder_message" heading="Cofounder's message" />
    </div>
  );
}
function LeaderForm({ keyName, heading }: { keyName: string; heading: string }) {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["site_content", keyName],
    queryFn: async () => {
      const { data } = await supabase.from("site_content").select("value").eq("key", keyName).maybeSingle();
      return (data?.value as { name: string; title: string; body: string; image_url?: string } | undefined) ?? { name: "", title: "", body: "", image_url: "" };
    },
  });
  const [form, setForm] = useState(data ?? { name: "", title: "", body: "", image_url: "" });
  useEffect(() => { if (data) setForm(data); }, [data]);
  const [saved, setSaved] = useState(false);

  async function save() {
    await supabase.from("site_content").upsert({ key: keyName, value: form, updated_at: new Date().toISOString() });
    qc.invalidateQueries({ queryKey: ["site_content", keyName] });
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-4">
      <h2 className="font-display font-extrabold text-xl">{heading}</h2>
      <AdminField label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
      <AdminField label="Title / Role" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
      <AdminField label="Photo URL (optional)" value={form.image_url ?? ""} onChange={(v) => setForm({ ...form, image_url: v })} placeholder="https://..." />
      <AdminTextArea label="Message" value={form.body} onChange={(v) => setForm({ ...form, body: v })} rows={7} />
      <SaveButton onClick={save} saved={saved} />
    </div>
  );
}

function ContentJsonEditor({ keyName, title, fields, numeric }: { keyName: string; title: string; fields: [string, string][]; numeric?: boolean }) {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["site_content", keyName],
    queryFn: async () => {
      const { data } = await supabase.from("site_content").select("value").eq("key", keyName).maybeSingle();
      return (data?.value as Record<string, unknown> | undefined) ?? {};
    },
  });
  const [form, setForm] = useState<Record<string, string>>({});
  useEffect(() => {
    if (data) setForm(Object.fromEntries(fields.map(([k]) => [k, String((data as Record<string, unknown>)[k] ?? "")])));
  }, [data, fields]);
  const [saved, setSaved] = useState(false);

  async function save() {
    const value = Object.fromEntries(fields.map(([k]) => [k, numeric ? Number(form[k] ?? 0) : form[k] ?? ""]));
    await supabase.from("site_content").upsert({ key: keyName, value, updated_at: new Date().toISOString() });
    qc.invalidateQueries({ queryKey: ["site_content", keyName] });
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  }
  return (
    <div className="space-y-4">
      <h2 className="font-display font-extrabold text-xl">{title}</h2>
      {fields.map(([k, label]) => (
        <AdminField key={k} label={label} value={form[k] ?? ""} onChange={(v) => setForm({ ...form, [k]: v })} type={numeric ? "number" : "text"} />
      ))}
      <SaveButton onClick={save} saved={saved} />
    </div>
  );
}

type Story = { id?: string; title: string; tag: string; excerpt: string; body: string; image_url: string; is_published: boolean; sort_order: number };
function StoriesEditor() {
  const qc = useQueryClient();
  const { data: stories } = useQuery({
    queryKey: ["admin_stories"],
    queryFn: async () => {
      const { data } = await supabase.from("stories").select("*").order("sort_order");
      return (data as Story[]) ?? [];
    },
  });
  const [editing, setEditing] = useState<Story | null>(null);

  async function save(s: Story) {
    if (s.id) await supabase.from("stories").update({ ...s, updated_at: new Date().toISOString() }).eq("id", s.id);
    else await supabase.from("stories").insert(s);
    qc.invalidateQueries({ queryKey: ["admin_stories"] });
    setEditing(null);
  }
  async function remove(id: string) {
    if (!confirm("Delete this story?")) return;
    await supabase.from("stories").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin_stories"] });
  }

  if (editing) {
    return (
      <div className="space-y-4">
        <h2 className="font-display font-extrabold text-xl">{editing.id ? "Edit story" : "New story"}</h2>
        <AdminField label="Child name / title" value={editing.title} onChange={(v) => setEditing({ ...editing, title: v })} />
        <AdminField label="Tag" value={editing.tag ?? ""} onChange={(v) => setEditing({ ...editing, tag: v })} />
        <ImageUploadField label="Photo" bucket="story-photos" value={editing.image_url ?? ""} onChange={(url) => setEditing({ ...editing, image_url: url })} />
        <AdminTextArea label="Excerpt" value={editing.excerpt ?? ""} onChange={(v) => setEditing({ ...editing, excerpt: v })} rows={3} />
        <AdminTextArea label="Story" value={editing.body ?? ""} onChange={(v) => setEditing({ ...editing, body: v })} rows={8} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={editing.is_published} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} /> Published
        </label>
        <div className="flex gap-2">
          <button onClick={() => save(editing)} className="bg-brand-blue text-white px-6 py-3 font-display font-extrabold uppercase tracking-widest text-xs inline-flex items-center gap-2"><Save className="size-4" />Save</button>
          <button onClick={() => setEditing(null)} className="border border-ink/20 px-6 py-3 font-display font-extrabold uppercase tracking-widest text-xs">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-display font-extrabold text-xl">Stories</h2>
        <button onClick={() => setEditing({ title: "", tag: "", excerpt: "", body: "", image_url: "", is_published: true, sort_order: (stories?.length ?? 0) + 1 })} className="bg-brand-orange text-white px-4 py-2 font-display font-extrabold uppercase tracking-widest text-xs inline-flex items-center gap-2"><Plus className="size-4" />New</button>
      </div>
      <div className="divide-y divide-ink/10">
        {(stories ?? []).map((s) => (
          <div key={s.id} className="py-4 flex items-center gap-4">
            {s.image_url ? <M src={s.image_url} alt="" className="size-14 object-cover" /> : <div className="size-14 bg-ink/5" />}
            <div className="flex-1 min-w-0">
              <p className="font-display font-extrabold truncate">{s.title}</p>
              <p className="text-xs text-ink/50">{s.tag} · {s.is_published ? "Published" : "Draft"}</p>
            </div>
            <button onClick={() => setEditing(s)} className="text-brand-blue text-xs font-mono uppercase tracking-widest">Edit</button>
            <button onClick={() => remove(s.id!)} className="text-red-600"><Trash2 className="size-4" /></button>
          </div>
        ))}
        {(stories ?? []).length === 0 && <p className="text-ink/50 text-sm py-6">No stories yet.</p>}
      </div>
    </div>
  );
}

/* ============================================================
   ACCOUNTS (PIN-gated)
   ============================================================ */
function AccountsPinGate() {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const [newPin, setNewPin] = useState("");

  useEffect(() => {
    supabase.from("admin_settings").select("value").eq("key", "accounts_pin").maybeSingle().then(({ data }) => {
      setHasPin(!!data);
    });
  }, []);

  async function unlock() {
    const { data } = await supabase.from("admin_settings").select("value").eq("key", "accounts_pin").maybeSingle();
    if (data?.value === pin) { setUnlocked(true); setError(null); }
    else setError("Incorrect PIN.");
  }
  async function setInitialPin() {
    if (newPin.length < 4) { setError("PIN must be at least 4 digits."); return; }
    await supabase.from("admin_settings").upsert({ key: "accounts_pin", value: newPin, updated_at: new Date().toISOString() });
    setHasPin(true);
    setUnlocked(true);
  }

  if (hasPin === null) return <p className="text-ink/50">Loading…</p>;
  if (unlocked) return <AccountsEditor onLock={() => setUnlocked(false)} />;

  if (!hasPin) {
    return (
      <div className="max-w-md space-y-4">
        <h2 className="font-display font-extrabold text-xl inline-flex items-center gap-2"><Lock className="size-5" /> Set a PIN</h2>
        <p className="text-sm text-ink/60">Payment-account details are locked behind a PIN. Set one now — anyone who wants to edit them will need it.</p>
        <AdminField label="Create PIN (4+ digits)" value={newPin} onChange={setNewPin} type="password" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button onClick={setInitialPin} className="bg-brand-blue text-white px-6 py-3 font-display font-extrabold uppercase tracking-widest text-xs">Set PIN & unlock</button>
      </div>
    );
  }

  return (
    <div className="max-w-md space-y-4">
      <h2 className="font-display font-extrabold text-xl inline-flex items-center gap-2"><Lock className="size-5" /> Payment Accounts</h2>
      <p className="text-sm text-ink/60">Enter the PIN to view or edit the accounts where donations are directed.</p>
      <AdminField label="PIN" value={pin} onChange={setPin} type="password" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button onClick={unlock} className="bg-brand-blue text-white px-6 py-3 font-display font-extrabold uppercase tracking-widest text-xs">Unlock</button>
    </div>
  );
}

type Account = { id?: string; label: string; bank_name: string; account_name: string; account_number: string; swift_code: string; currency: string; mobile_money_provider: string; mobile_money_number: string; is_primary: boolean; is_active: boolean; notes: string };
function AccountsEditor({ onLock }: { onLock: () => void }) {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin_accounts"],
    queryFn: async () => (await supabase.from("donation_accounts").select("*").order("created_at")).data as Account[] | null,
  });
  const [editing, setEditing] = useState<Account | null>(null);
  const empty: Account = { label: "", bank_name: "", account_name: "", account_number: "", swift_code: "", currency: "UGX", mobile_money_provider: "", mobile_money_number: "", is_primary: false, is_active: true, notes: "" };

  async function save(a: Account) {
    if (a.id) await supabase.from("donation_accounts").update({ ...a, updated_at: new Date().toISOString() }).eq("id", a.id);
    else await supabase.from("donation_accounts").insert(a);
    qc.invalidateQueries({ queryKey: ["admin_accounts"] });
    setEditing(null);
  }
  async function remove(id: string) {
    if (!confirm("Delete this account?")) return;
    await supabase.from("donation_accounts").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin_accounts"] });
  }

  if (editing) {
    return (
      <div className="space-y-4">
        <h2 className="font-display font-extrabold text-xl">{editing.id ? "Edit account" : "New account"}</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <AdminField label="Label" value={editing.label} onChange={(v) => setEditing({ ...editing, label: v })} />
          <AdminField label="Currency" value={editing.currency} onChange={(v) => setEditing({ ...editing, currency: v })} />
          <AdminField label="Bank name" value={editing.bank_name} onChange={(v) => setEditing({ ...editing, bank_name: v })} />
          <AdminField label="Account name" value={editing.account_name} onChange={(v) => setEditing({ ...editing, account_name: v })} />
          <AdminField label="Account number" value={editing.account_number} onChange={(v) => setEditing({ ...editing, account_number: v })} />
          <AdminField label="SWIFT / IBAN" value={editing.swift_code} onChange={(v) => setEditing({ ...editing, swift_code: v })} />
          <AdminField label="Mobile money provider" value={editing.mobile_money_provider} onChange={(v) => setEditing({ ...editing, mobile_money_provider: v })} placeholder="MTN, Airtel..." />
          <AdminField label="Mobile money number" value={editing.mobile_money_number} onChange={(v) => setEditing({ ...editing, mobile_money_number: v })} />
        </div>
        <AdminTextArea label="Notes" value={editing.notes} onChange={(v) => setEditing({ ...editing, notes: v })} rows={3} />
        <div className="flex gap-6 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={editing.is_primary} onChange={(e) => setEditing({ ...editing, is_primary: e.target.checked })} /> Primary</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} /> Active</label>
        </div>
        <div className="flex gap-2">
          <button onClick={() => save(editing)} className="bg-brand-blue text-white px-6 py-3 font-display font-extrabold uppercase tracking-widest text-xs inline-flex items-center gap-2"><Save className="size-4" />Save</button>
          <button onClick={() => setEditing(null)} className="border border-ink/20 px-6 py-3 font-display font-extrabold uppercase tracking-widest text-xs">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-display font-extrabold text-xl">Where donation money goes</h2>
        <div className="flex gap-2">
          <button onClick={() => setEditing(empty)} className="bg-brand-orange text-white px-4 py-2 font-display font-extrabold uppercase tracking-widest text-xs inline-flex items-center gap-2"><Plus className="size-4" />New</button>
          <button onClick={onLock} className="border border-ink/20 px-4 py-2 font-display font-extrabold uppercase tracking-widest text-xs inline-flex items-center gap-2"><Lock className="size-4" />Lock</button>
        </div>
      </div>
      <div className="divide-y divide-ink/10">
        {(data ?? []).map((a) => (
          <div key={a.id} className="py-4 flex items-center gap-4">
            <div className="size-10 bg-brand-blue/10 text-brand-blue grid place-items-center"><Landmark className="size-4" /></div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-extrabold truncate">{a.label} <span className="text-xs text-ink/50 font-mono">· {a.currency}</span></p>
              <p className="text-xs text-ink/50 truncate">{a.bank_name} {a.account_number && `· ${a.account_number}`} {a.mobile_money_provider && `· ${a.mobile_money_provider} ${a.mobile_money_number}`}</p>
            </div>
            {a.is_primary && <span className="text-[10px] font-mono uppercase tracking-widest text-brand-gold border border-brand-gold px-2 py-1">Primary</span>}
            <button onClick={() => setEditing(a)} className="text-brand-blue text-xs font-mono uppercase tracking-widest">Edit</button>
            <button onClick={() => remove(a.id!)} className="text-red-600"><Trash2 className="size-4" /></button>
          </div>
        ))}
        {(data ?? []).length === 0 && <p className="text-ink/50 text-sm py-6">No donation accounts yet.</p>}
      </div>
    </div>
  );
}

/* ============================================================
   DONATIONS LOG
   ============================================================ */
function DonationsLog() {
  const { data } = useQuery({
    queryKey: ["admin_donations"],
    queryFn: async () => (await supabase.from("donations").select("*").order("created_at", { ascending: false }).limit(200)).data ?? [],
  });
  return (
    <div className="space-y-4">
      <h2 className="font-display font-extrabold text-xl">Recent donations</h2>
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead className="text-[10px] font-mono uppercase tracking-widest text-ink/50 border-b border-ink/10">
            <tr>
              <th className="text-left py-3">Ref</th>
              <th className="text-left">Donor</th>
              <th className="text-left">Amount</th>
              <th className="text-left">Method</th>
              <th className="text-left">Freq</th>
              <th className="text-left">Status</th>
              <th className="text-left">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {(data ?? []).map((d: Record<string, unknown>) => (
              <tr key={String(d.id)}>
                <td className="py-2 font-mono text-xs">{String(d.reference)}</td>
                <td>{d.anonymous ? "Anonymous" : String(d.donor_name ?? "—")}</td>
                <td className="font-mono">{String(d.currency)} {Number(d.amount).toLocaleString()}</td>
                <td>{String(d.payment_method ?? "—")}</td>
                <td className="text-xs">{String(d.frequency ?? "")}</td>
                <td><span className="text-[10px] font-mono uppercase tracking-widest text-brand-green">{String(d.status)}</span></td>
                <td className="text-xs text-ink/50">{new Date(String(d.created_at)).toLocaleDateString()}</td>
              </tr>
            ))}
            {(data ?? []).length === 0 && <tr><td colSpan={7} className="py-6 text-ink/50 text-center">No donations yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================================
   HELPERS
   ============================================================ */
function AdminField({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="block font-mono text-[11px] uppercase tracking-widest text-ink/60 mb-2">{label}</span>
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="w-full border border-brand-blue/20 px-4 py-3 text-sm focus:outline-none focus:border-brand-blue" />
    </label>
  );
}
function AdminTextArea({ label, value, onChange, rows = 4 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <label className="block">
      <span className="block font-mono text-[11px] uppercase tracking-widest text-ink/60 mb-2">{label}</span>
      <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-brand-blue/20 px-4 py-3 text-sm focus:outline-none focus:border-brand-blue resize-y" />
    </label>
  );
}
function SaveButton({ onClick, saved }: { onClick: () => void; saved: boolean }) {
  return (
    <button onClick={onClick} className="bg-brand-blue text-white px-6 py-3 font-display font-extrabold uppercase tracking-widest text-xs inline-flex items-center gap-2">
      <Save className="size-4" /> {saved ? "Saved ✓" : "Save"}
    </button>
  );
}
function ImageUploadField({ label, bucket, value, onChange }: { label: string; bucket: string; value: string; onChange: (url: string) => void }) {
  const [busy, setBusy] = useState(false);
  async function onFile(f: File) {
    setBusy(true);
    try { const url = await uploadToBucket(bucket, f); onChange(url); }
    catch (err) { alert("Upload failed: " + (err as Error).message); }
    finally { setBusy(false); }
  }
  return (
    <div className="block">
      <span className="block font-mono text-[11px] uppercase tracking-widest text-ink/60 mb-2">{label}</span>
      <div className="flex items-start gap-3">
        <label className={`flex items-center gap-2 border border-brand-blue/20 px-4 py-3 font-display font-bold uppercase tracking-widest text-xs cursor-pointer bg-white hover:border-brand-blue ${busy ? "opacity-60" : ""}`}>
          <Upload className="size-4" /> {busy ? "Uploading…" : value ? "Replace" : "Upload"}
          <input hidden type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.currentTarget.value = ""; }} />
        </label>
        {value && <M src={value} alt="" className="size-14 object-cover" />}
      </div>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="…or paste an image URL" className="mt-2 w-full border border-brand-blue/10 px-3 py-2 text-xs focus:outline-none" />
    </div>
  );
}
