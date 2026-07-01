import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Lock, Mail } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Admin Sign in — The Saints Childcare Foundation" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin" });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (err) throw err;
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      }
      // try to claim admin if none yet (first user only)
      await supabase.rpc("claim_admin_if_first");
      navigate({ to: "/admin" });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SiteLayout>
      <section className="min-h-[80vh] grid place-items-center bg-surface py-16 px-6">
        <div className="w-full max-w-md bg-white border border-brand-blue/10 p-8 md:p-10 shadow-sm">
          <p className="font-mono text-[11px] uppercase tracking-widest text-brand-blue mb-3">/ Admin Access</p>
          <h1 className="font-display font-extrabold text-3xl mb-2">{mode === "signin" ? "Sign in" : "Create admin account"}</h1>
          <p className="text-ink/60 text-sm mb-8">
            {mode === "signin" ? "Access the content management dashboard." : "The first account created becomes the site admin."}
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block">
              <span className="block font-mono text-[11px] uppercase tracking-widest text-ink/60 mb-2">Email</span>
              <div className="relative">
                <Mail className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-brand-blue/20 pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-brand-blue" />
              </div>
            </label>
            <label className="block">
              <span className="block font-mono text-[11px] uppercase tracking-widest text-ink/60 mb-2">Password</span>
              <div className="relative">
                <Lock className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
                <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-brand-blue/20 pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-brand-blue" />
              </div>
            </label>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button disabled={loading} className="w-full bg-brand-blue text-white py-4 font-display font-extrabold uppercase tracking-widest text-sm disabled:opacity-60 hover:bg-brand-blue/90">
              {loading ? "…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-6 text-brand-blue font-mono text-[11px] uppercase tracking-widest hover:underline"
          >
            {mode === "signin" ? "Create the first admin account →" : "← Back to sign in"}
          </button>

          <div className="mt-8 pt-6 border-t border-ink/10">
            <Link to="/" className="text-ink/50 text-xs font-mono uppercase tracking-widest hover:text-brand-blue">← Back to site</Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
