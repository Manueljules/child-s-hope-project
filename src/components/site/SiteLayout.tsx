import type { ReactNode } from "react";
import { SiteNav } from "./SiteNav";
import { SiteFooter } from "./SiteFooter";
import { WhatsAppWidget } from "./WhatsAppWidget";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-ink">
      <SiteNav />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <WhatsAppWidget />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="bg-brand-blue text-white">
      <div className="max-w-7xl mx-auto px-6 py-20 md:py-28">
        <p className="font-mono text-brand-gold text-xs uppercase tracking-widest mb-4">
          / {eyebrow}
        </p>
        <h1 className="font-display font-extrabold text-5xl md:text-7xl leading-[0.95] tracking-tighter max-w-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-6 text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
