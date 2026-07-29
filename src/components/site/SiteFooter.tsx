import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Facebook, Instagram, Twitter, Linkedin, Youtube, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "./Logo";

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
              <Logo className="size-10 shrink-0" />
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
              {[
                { Icon: Facebook, label: "Facebook", href: "https://facebook.com", color: "hover:bg-[#1877F2] hover:border-[#1877F2]" },
                { Icon: Instagram, label: "Instagram", href: "https://instagram.com", color: "hover:bg-gradient-to-br hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] hover:border-transparent" },
                { Icon: Twitter, label: "Twitter / X", href: "https://twitter.com", color: "hover:bg-black hover:border-black" },
                { Icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com", color: "hover:bg-[#0A66C2] hover:border-[#0A66C2]" },
                { Icon: Youtube, label: "YouTube", href: "https://youtube.com", color: "hover:bg-[#FF0000] hover:border-[#FF0000]" },
              ].map(({ Icon, label, href, color }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`size-10 border border-ink/10 grid place-items-center text-ink/60 hover:text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${color}`}
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
              <li><Link to="/news" className="hover:text-brand-blue">News & Events</Link></li>
              <li><Link to="/faq" className="hover:text-brand-blue">FAQ</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-display font-bold uppercase text-[11px] tracking-widest mb-6 text-ink">
              Get Involved
            </h4>
            <ul className="space-y-3 text-sm text-ink/60 font-medium">
              <li><Link to="/donate" className="hover:text-brand-blue">Donate</Link></li>
              <li><Link to="/manage-subscription" className="hover:text-brand-blue">Manage recurring donation</Link></li>
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
            <Link to="/contact" className="hover:text-brand-blue">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
