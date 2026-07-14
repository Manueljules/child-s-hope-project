import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";

const PHONE = "256700339231"; // +256 700 339 231
const DEFAULT_MSG = "Hello Masembe Childcare Foundation, I'd like to know more about how I can help.";

// Direct wa.me link — opens the WhatsApp app (or web) and lands the user
// straight in the chat with the foundation's number. No in-page panel.
const waUrl = `https://wa.me/${PHONE}?text=${encodeURIComponent(DEFAULT_MSG)}`;

export function WhatsAppWidget() {
  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("wa.nudge") === "1") return;
    const t = setTimeout(() => setShowBubble(true), 4000);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    setShowBubble(false);
    sessionStorage.setItem("wa.nudge", "1");
  };

  return (
    <div data-no-translate className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3">
      {showBubble && (
        <div className="relative bg-white border border-brand-green/20 shadow-2xl rounded-lg p-4 pr-9 max-w-[260px] animate-in fade-in slide-in-from-bottom-2">
          <button
            aria-label="Dismiss"
            onClick={dismiss}
            className="absolute top-1.5 right-1.5 text-ink/40 hover:text-ink"
          >
            <X className="size-3.5" />
          </button>
          <p className="text-xs font-semibold text-ink mb-1">Chat with us on WhatsApp</p>
          <p className="text-[11px] text-ink/60 leading-relaxed">
            Have a question about donating, volunteering, or our programs? Tap below to open WhatsApp.
          </p>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={dismiss}
            className="mt-2 inline-block text-[11px] font-bold text-brand-green uppercase tracking-widest"
          >
            Open WhatsApp →
          </a>
        </div>
      )}

      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={dismiss}
        aria-label="Chat on WhatsApp"
        className="relative size-14 rounded-full bg-brand-green text-white shadow-2xl hover:scale-105 transition-transform grid place-items-center"
      >
        <MessageCircle className="size-6" />
        {!showBubble && (
          <span className="absolute -top-0.5 -right-0.5 size-4 rounded-full bg-brand-orange text-[10px] font-bold grid place-items-center animate-pulse">
            1
          </span>
        )}
        <span className="absolute inset-0 rounded-full bg-brand-green/40 animate-ping -z-10" />
      </a>
    </div>
  );
}
