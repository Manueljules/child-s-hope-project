import { useEffect, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";

const PHONE = "256700339231"; // +256 700 339 231
const DISPLAY_PHONE = "+256 700 339 231";

export function WhatsAppWidget() {
  const [open, setOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [message, setMessage] = useState(
    "Hello Masembe Childcare Foundation, I'd like to know more about how I can help."
  );

  useEffect(() => {
    // Auto-nudge the user with a small notification bubble after 4s (once per session)
    if (typeof window === "undefined") return;
    const dismissed = sessionStorage.getItem("wa.nudge") === "1";
    if (dismissed) return;
    const t = setTimeout(() => setShowBubble(true), 4000);
    return () => clearTimeout(t);
  }, []);

  const openChat = () => {
    setOpen(true);
    setShowBubble(false);
    sessionStorage.setItem("wa.nudge", "1");
  };

  const waUrl = `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;


  return (
    <div data-no-translate className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3">
      {/* Notification nudge */}
      {showBubble && !open && (
        <div className="relative bg-white border border-brand-green/20 shadow-2xl rounded-lg p-4 pr-9 max-w-[260px] animate-in fade-in slide-in-from-bottom-2">
          <button
            aria-label="Dismiss"
            onClick={() => {
              setShowBubble(false);
              sessionStorage.setItem("wa.nudge", "1");
            }}
            className="absolute top-1.5 right-1.5 text-ink/40 hover:text-ink"
          >
            <X className="size-3.5" />
          </button>
          <p className="text-xs font-semibold text-ink mb-1">Chat with us on WhatsApp</p>
          <p className="text-[11px] text-ink/60 leading-relaxed">
            Have a question about donating, volunteering, or our programs? We reply within minutes.
          </p>
          <button
            onClick={openChat}
            className="mt-2 text-[11px] font-bold text-brand-green uppercase tracking-widest"
          >
            Start chat →
          </button>
        </div>
      )}

      {/* Chat panel */}
      {open && (
        <div className="w-[320px] bg-white shadow-2xl rounded-lg overflow-hidden border border-brand-green/20 animate-in fade-in slide-in-from-bottom-2">
          <div className="bg-brand-green text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-9 rounded-full bg-white/20 grid place-items-center">
                <MessageCircle className="size-4" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-bold">Masembe Childcare</p>
                <p className="text-[10px] opacity-80">Typically replies in minutes</p>
              </div>
            </div>
            <button aria-label="Close" onClick={() => setOpen(false)} className="hover:opacity-80">
              <X className="size-4" />
            </button>
          </div>
          <div className="p-3 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22><rect width=%2260%22 height=%2260%22 fill=%22%23e5ddd5%22/></svg>')] min-h-[110px]">
            <div className="bg-white rounded-lg rounded-tl-none px-3 py-2 shadow-sm max-w-[85%]">
              <p className="text-[11px] font-semibold text-brand-green mb-0.5">Masembe Team</p>
              <p className="text-xs text-ink">
                Hi there! 👋 How can we help you today? Send us a message and we'll reply on WhatsApp.
              </p>
            </div>
          </div>
          <div className="p-3 bg-white border-t border-ink/5">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              className="w-full text-xs border border-ink/10 rounded-md px-2 py-1.5 focus:outline-none focus:border-brand-green resize-none"
              placeholder="Type your message…"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-ink/50">{DISPLAY_PHONE}</span>
              <button
                onClick={sendToWhatsApp}
                className="inline-flex items-center gap-1.5 bg-brand-green text-white text-xs font-bold px-3 py-1.5 rounded-md hover:bg-brand-green/90"
              >
                <Send className="size-3" /> Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating action button */}
      <button
        onClick={() => (open ? setOpen(false) : openChat())}
        aria-label="Chat on WhatsApp"
        className="relative size-14 rounded-full bg-brand-green text-white shadow-2xl hover:scale-105 transition-transform grid place-items-center"
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
        {!open && !showBubble && (
          <span className="absolute -top-0.5 -right-0.5 size-4 rounded-full bg-brand-orange text-[10px] font-bold grid place-items-center animate-pulse">
            1
          </span>
        )}
        {!open && (
          <span className="absolute inset-0 rounded-full bg-brand-green/40 animate-ping -z-10" />
        )}
      </button>
    </div>
  );
}
