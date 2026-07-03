import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Menu, X, Globe, ChevronDown } from "lucide-react";
import { applyLanguage, getStoredLang, setStoredLang } from "@/lib/translator";

const languages = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
  { code: "pt", label: "Português" },
  { code: "nl", label: "Nederlands" },
  { code: "sv", label: "Svenska" },
  { code: "ru", label: "Русский" },
  { code: "zh-CN", label: "中文" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "ar", label: "العربية" },
  { code: "hi", label: "हिन्दी" },
  { code: "sw", label: "Kiswahili" },
  { code: "tr", label: "Türkçe" },
] as const;

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
  const [langOpen, setLangOpen] = useState(false);
  const [lang, setLang] = useState<string>("en");
  const langRef = useRef<HTMLDivElement>(null);
  const location = useRouterState({ select: (s) => s.location.pathname });

  // Read stored language on mount and apply
  useEffect(() => {
    const stored = getStoredLang();
    setLang(stored);
    if (stored !== "en") {
      // Delay so route content is mounted first
      const t = setTimeout(() => applyLanguage(stored), 100);
      return () => clearTimeout(t);
    }
  }, []);

  // Re-apply on route change
  useEffect(() => {
    if (lang !== "en") {
      const t = setTimeout(() => applyLanguage(lang), 150);
      return () => clearTimeout(t);
    }
  }, [location, lang]);



  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const currentLang = languages.find((l) => l.code === lang) ?? languages[0];



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
          <div ref={langRef} className="relative" data-no-translate>
            <button
              type="button"
              onClick={() => setLangOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={langOpen}
              aria-label="Select language"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-3 border border-brand-blue/20 text-ink hover:text-brand-blue hover:border-brand-blue/50 font-display font-bold text-xs uppercase tracking-wider transition-colors"
            >
              <Globe className="size-4" />
              <span className="hidden sm:inline">{currentLang.code.toUpperCase()}</span>
              <ChevronDown className={`size-3.5 transition-transform ${langOpen ? "rotate-180" : ""}`} />
            </button>
            {langOpen && (
              <ul
                role="listbox"
                className="absolute right-0 mt-2 w-56 max-h-80 overflow-y-auto bg-background border border-brand-blue/15 shadow-xl z-50 py-1"
              >
                {languages.map((l) => (
                  <li key={l.code}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={l.code === lang}
                      onClick={() => {
                        setLangOpen(false);
                        setStoredLang(l.code);
                        setLang(l.code);
                        void applyLanguage(l.code);
                      }}


                      className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-brand-blue/5 ${
                        l.code === lang ? "text-brand-blue font-semibold" : "text-ink/80"
                      }`}
                    >
                      <span>{l.label}</span>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-ink/40">
                        {l.code}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
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

