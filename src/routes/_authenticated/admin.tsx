import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Save, Plus, Trash2, LogOut, Edit3, Landmark, Image as ImageIcon, MessageSquare, Wallet, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard — The Saints Childcare Foundation" }] }),
  component: AdminPage,
});

type Tab = "messages" | "hero" | "stats" | "stories" | "accounts" | "donations";

function AdminPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("messages");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.from("user_roles").select("role").eq("role", "admin").maybeSingle().then(({ data }) => {
      setIsAdmin(!!data);
    });
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  if (isAdmin === false) {
    return (
      <SiteLayout>
        <section className="py-32 text-center px-6">
          <h1 className="font-display font-extrabold text-3xl mb-4">Not authorised</h1>
          <p className="text-ink/60 mb-6">Your account doesn't have admin permissions.</p>
          <button onClick={signOut} className="bg-brand-blue text-white px-6 py-3 font-display font-extrabold uppercase tracking-widest text-xs">Sign out</button>
        </section>
      </SiteLayout>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "messages", label: "Leader Messages", icon: MessageSquare },
    { id: "hero", label: "Hero & About", icon: Edit3 },
    { id: "stats", label: "Impact Stats", icon: Users },
    { id: "stories", label: "Stories", icon: ImageIcon },
    { id: "accounts", label: "Donation Accounts", icon: Landmark },
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
            {tab === "messages" && <LeaderMessagesEditor />}
            {tab === "hero" && <ContentJsonEditor keyName="hero" title="Hero section" fields={[["eyebrow", "Eyebrow"], ["title", "Title"], ["subtitle", "Subtitle"]]} />}
            {tab === "stats" && <ContentJsonEditor keyName="impact_stats" title="Impact statistics" fields={[["children_served", "Children served"], ["meals_provided", "Meals provided"], ["schools_assisted", "Schools assisted"], ["districts_reached", "Districts reached"]]} numeric />}
            {tab === "stories" && <StoriesEditor />}
            {tab === "accounts" && <AccountsEditor />}
            {tab === "donations" && <DonationsLog />}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

/* ---------- Leader messages ---------- */
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

/* ---------- Generic JSON content editor ---------- */
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

/* ---------- Stories ---------- */
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
        <AdminField label="Title" value={editing.title} onChange={(v) => setEditing({ ...editing, title: v })} />
        <AdminField label="Tag" value={editing.tag ?? ""} onChange={(v) => setEditing({ ...editing, tag: v })} />
        <AdminField label="Image URL" value={editing.image_url ?? ""} onChange={(v) => setEditing({ ...editing, image_url: v })} />
        <AdminTextArea label="Excerpt" value={editing.excerpt ?? ""} onChange={(v) => setEditing({ ...editing, excerpt: v })} rows={3} />
        <AdminTextArea label="Body" value={editing.body ?? ""} onChange={(v) => setEditing({ ...editing, body: v })} rows={8} />
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
            {s.image_url ? <img src={s.image_url} alt="" className="size-14 object-cover" /> : <div className="size-14 bg-ink/5" />}
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

/* ---------- Donation accounts ---------- */
type Account = { id?: string; label: string; bank_name: string; account_name: string; account_number: string; swift_code: string; currency: string; mobile_money_provider: string; mobile_money_number: string; is_primary: boolean; is_active: boolean; notes: string };
function AccountsEditor() {
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
        <button onClick={() => setEditing(empty)} className="bg-brand-orange text-white px-4 py-2 font-display font-extrabold uppercase tracking-widest text-xs inline-flex items-center gap-2"><Plus className="size-4" />New account</button>
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
        {(data ?? []).length === 0 && <p className="text-ink/50 text-sm py-6">No donation accounts yet. Add the bank or mobile-money account where donations should be directed.</p>}
      </div>
    </div>
  );
}

/* ---------- Donations log (read-only) ---------- */
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
                <td><span className="text-[10px] font-mono uppercase tracking-widest text-brand-green">{String(d.status)}</span></td>
                <td className="text-xs text-ink/50">{new Date(String(d.created_at)).toLocaleDateString()}</td>
              </tr>
            ))}
            {(data ?? []).length === 0 && <tr><td colSpan={6} className="py-6 text-ink/50 text-center">No donations yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */
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
