import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Facebook, Instagram, Twitter, Linkedin, Youtube, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setState("sending");
    const { error } = await supabase.from("newsletter_subscribers").insert({ email });
    // Duplicate email is fine — treat as success
    if (error && !error.message.toLowerCase().includes("duplicate")) {
      setState("error");
      return;
    }
    setState("done");
    setEmail("");
  }

  return (
    <footer className="bg-white pt-20 pb-10 border-t border-brand-blue/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-12 gap-12 mb-16">
          <div className="md:col-span-5">
            <div className="flex items-center gap-2 mb-6">
              <div className="size-10 bg-brand-blue grid place-items-center font-display font-extrabold text-white text-xl">
                S
              </div>
              <div className="leading-none">
                <span className="block font-display font-extrabold text-base tracking-tight uppercase">
                  Masembe
                </span>
                <span className="block text-[10px] font-mono uppercase tracking-widest text-brand-blue">
                  Childcare Foundation Uganda
                </span>
              </div>
            </div>
            <p className="text-ink/60 max-w-sm mb-6 leading-relaxed text-sm">
              Transforming the lives of orphaned and vulnerable children in Uganda through
              holistic care, quality education, healthcare, and sustainable community
              empowerment programs.
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Twitter, Linkedin, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social media link"
                  className="size-10 border border-ink/10 grid place-items-center text-ink/60 hover:text-brand-blue hover:border-brand-blue transition-colors"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-display font-bold uppercase text-[11px] tracking-widest mb-6 text-ink">
              Foundation
            </h4>
            <ul className="space-y-3 text-sm text-ink/60 font-medium">
              <li><Link to="/" className="hover:text-brand-blue">Home</Link></li>
              <li><Link to="/about" className="hover:text-brand-blue">About Us</Link></li>
              <li><Link to="/founder" className="hover:text-brand-blue">Founder</Link></li>
              <li><Link to="/leadership" className="hover:text-brand-blue">Leadership</Link></li>
              <li><Link to="/news" className="hover:text-brand-blue">News & Events</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-display font-bold uppercase text-[11px] tracking-widest mb-6 text-ink">
              Get Involved
            </h4>
            <ul className="space-y-3 text-sm text-ink/60 font-medium">
              <li><Link to="/donate" className="hover:text-brand-blue">Donate</Link></li>
              <li><Link to="/volunteer" className="hover:text-brand-blue">Volunteer</Link></li>
              <li><Link to="/projects" className="hover:text-brand-blue">Our Projects</Link></li>
              <li><Link to="/stories" className="hover:text-brand-blue">Stories</Link></li>
              <li><Link to="/gallery" className="hover:text-brand-blue">Gallery</Link></li>
            </ul>
          </div>


          <div className="md:col-span-3">
            <h4 className="font-display font-bold uppercase text-[11px] tracking-widest mb-6 text-ink">
              Newsletter
            </h4>
            <p className="text-sm text-ink/60 mb-4">
              Receive quarterly impact reports and stories from the field.
            </p>
            <form onSubmit={subscribe} className="flex items-center border-b border-ink/15 pb-2">
              <Mail className="size-4 text-ink/40 mr-2 shrink-0" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-transparent text-sm w-full focus:outline-none placeholder:text-ink/40"
              />
              <button
                type="submit"
                disabled={state === "sending"}
                className="text-brand-blue font-bold uppercase text-xs tracking-wider hover:text-brand-orange transition-colors disabled:opacity-60"
              >
                {state === "sending" ? "…" : state === "done" ? "✓" : "Join"}
              </button>
            </form>
            {state === "done" && <p className="text-xs text-brand-green mt-2">Subscribed. Thank you!</p>}
            {state === "error" && <p className="text-xs text-red-600 mt-2">Could not subscribe. Try again.</p>}

            <p className="mt-6 text-xs text-ink/50 leading-relaxed">
              Plot 24, Kampala Road
              <br />
              Kampala, Uganda
              <br />
              +256 700 339 231
              <br />
              +256 769 027 758
              <br />
              <span className="text-brand-blue font-semibold">thesaintschildcare@gmail.com</span>
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-brand-blue/10 flex flex-col md:flex-row justify-between gap-4 text-[10px] font-mono uppercase tracking-widest text-ink/40">
          <span>© {new Date().getFullYear()} Masembe Childcare Foundation Uganda. All Rights Reserved.</span>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-brand-blue">Privacy</Link>
            <Link to="/terms" className="hover:text-brand-blue">Terms</Link>
            <Link to="/contact" className="hover:text-brand-blue">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
