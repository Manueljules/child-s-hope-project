import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/projects", label: "Projects" },
  { to: "/gallery", label: "Gallery" },
  { to: "/stories", label: "Stories" },
  { to: "/news", label: "News" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md border-b border-brand-blue/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 min-w-0">
          <div className="size-10 bg-brand-blue grid place-items-center font-display font-extrabold text-white text-xl shrink-0">
            S
          </div>
          <div className="leading-none min-w-0">
            <span className="block font-display font-extrabold text-base sm:text-lg tracking-tight uppercase truncate">
              The Saints
            </span>
            <span className="block text-[10px] font-mono uppercase tracking-widest text-brand-blue truncate">
              Childcare Foundation
            </span>
          </div>
        </Link>

        <div className="hidden xl:flex items-center gap-6 font-sans text-[12px] font-semibold uppercase tracking-wider text-ink/70">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="hover:text-brand-blue transition-colors"
              activeProps={{ className: "text-brand-blue" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/donate"
            className="bg-brand-orange text-white px-5 sm:px-8 py-3 font-display font-extrabold text-xs sm:text-sm uppercase tracking-widest hover:bg-brand-orange/90 transition-all shadow-lg shadow-brand-orange/20"
          >
            Donate Now
          </Link>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="xl:hidden size-11 grid place-items-center text-ink hover:text-brand-blue"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="xl:hidden border-t border-brand-blue/10 bg-background">
          <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="font-display font-bold text-sm uppercase tracking-wider text-ink/80 hover:text-brand-blue py-2"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/volunteer"
              onClick={() => setOpen(false)}
              className="font-display font-bold text-sm uppercase tracking-wider text-ink/80 hover:text-brand-blue py-2"
            >
              Volunteer
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
