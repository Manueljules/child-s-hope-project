import type { ReactNode } from "react";
import { SiteNav } from "./SiteNav";
import { SiteFooter } from "./SiteFooter";
import { WhatsAppWidget } from "./WhatsAppWidget";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-ink overflow-x-hidden">
      <SiteNav />
      <main className="flex-1 min-w-0">{children}</main>
      <SiteFooter />
      <WhatsAppWidget />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  image,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  image?: string;
}) {
  return (
    <section className="relative bg-brand-blue text-white overflow-hidden">
      {image && (
        <>
          <img
            src={image}
            alt=""
            aria-hidden
            className="absolute inset-0 size-full object-contain sm:object-cover bg-brand-blue"
            style={{ objectPosition: "center 28%" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/80 via-brand-blue/45 to-brand-blue/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/70 via-transparent to-transparent" />
        </>
      )}
      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 py-12 sm:py-20 md:py-28">
        <p className="font-mono text-brand-gold text-[11px] sm:text-xs uppercase tracking-widest mb-4">
          / {eyebrow}
        </p>
        <h1 className="font-display font-extrabold text-[2.25rem] sm:text-5xl md:text-7xl leading-[1.02] md:leading-[0.95] tracking-tight md:tracking-tighter max-w-4xl break-words">
          {title}
        </h1>
        {description && (
          <p className="mt-5 sm:mt-6 text-base sm:text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
