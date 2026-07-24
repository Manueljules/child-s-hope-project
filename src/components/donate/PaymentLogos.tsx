import type { ComponentProps } from "react";

type Props = ComponentProps<"svg">;

/* ---------- Card / wallet sub-icons ---------- */

export function VisaLogo(props: Props) {
  return (
    <svg viewBox="0 0 48 16" xmlns="http://www.w3.org/2000/svg" aria-label="Visa" {...props}>
      <text x="0" y="13" fontFamily="Inter, Arial, sans-serif" fontWeight="900" fontSize="14" fill="#1A1F71" letterSpacing="1">VISA</text>
    </svg>
  );
}

export function MastercardLogo(props: Props) {
  return (
    <svg viewBox="0 0 48 30" xmlns="http://www.w3.org/2000/svg" aria-label="Mastercard" {...props}>
      <circle cx="18" cy="15" r="11" fill="#EB001B" />
      <circle cx="30" cy="15" r="11" fill="#F79E1B" />
      <path d="M24 6.5a11 11 0 0 1 0 17 11 11 0 0 1 0-17z" fill="#FF5F00" />
    </svg>
  );
}

export function AmexLogo(props: Props) {
  return (
    <svg viewBox="0 0 60 20" xmlns="http://www.w3.org/2000/svg" aria-label="American Express" {...props}>
      <rect width="60" height="20" fill="#006FCF" />
      <text x="30" y="14" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontWeight="800" fontSize="10" fill="#fff" letterSpacing="0.5">AMEX</text>
    </svg>
  );
}

export function PaypalMiniLogo(props: Props) {
  return (
    <svg viewBox="0 0 60 16" xmlns="http://www.w3.org/2000/svg" aria-label="PayPal" {...props}>
      <text x="0" y="13" fontFamily="Inter, Arial, sans-serif" fontWeight="800" fontSize="13" fill="#003087" fontStyle="italic">Pay</text>
      <text x="22" y="13" fontFamily="Inter, Arial, sans-serif" fontWeight="800" fontSize="13" fill="#009CDE" fontStyle="italic">Pal</text>
    </svg>
  );
}

export function ApplePayLogo(props: Props) {
  return (
    <svg viewBox="0 0 60 20" xmlns="http://www.w3.org/2000/svg" aria-label="Apple Pay" {...props}>
      <path d="M7 5.5c.5-.6 1.3-1 2-1 .1.8-.2 1.5-.7 2-.5.6-1.3 1-2 1-.1-.7.2-1.5.7-2z" fill="#000" />
      <path d="M9 8c-1 0-1.8.6-2.2.6-.5 0-1.2-.5-2-.5-1 0-2 .6-2.5 1.5-1 1.9-.3 4.6.7 6.1.5.7 1.1 1.5 1.9 1.5.8 0 1.1-.5 2-.5.9 0 1.2.5 2 .5.8 0 1.3-.7 1.8-1.5.6-.8.8-1.6.8-1.6-1.5-.6-2.1-2.7-.7-3.8-.4-.5-1-1.7-1.8-1.7z" fill="#000" />
      <text x="15" y="14" fontFamily="Inter, Arial, sans-serif" fontWeight="700" fontSize="11" fill="#000">Pay</text>
    </svg>
  );
}

export function GooglePayLogo(props: Props) {
  return (
    <svg viewBox="0 0 60 20" xmlns="http://www.w3.org/2000/svg" aria-label="Google Pay" {...props}>
      <text x="0" y="14" fontFamily="Inter, Arial, sans-serif" fontWeight="700" fontSize="11" fill="#4285F4">G</text>
      <text x="8" y="14" fontFamily="Inter, Arial, sans-serif" fontWeight="700" fontSize="11" fill="#EA4335">o</text>
      <text x="16" y="14" fontFamily="Inter, Arial, sans-serif" fontWeight="700" fontSize="11" fill="#FBBC05">o</text>
      <text x="24" y="14" fontFamily="Inter, Arial, sans-serif" fontWeight="700" fontSize="11" fill="#4285F4">g</text>
      <text x="32" y="14" fontFamily="Inter, Arial, sans-serif" fontWeight="700" fontSize="11" fill="#34A853">l</text>
      <text x="36" y="14" fontFamily="Inter, Arial, sans-serif" fontWeight="700" fontSize="11" fill="#EA4335">e</text>
      <text x="46" y="14" fontFamily="Inter, Arial, sans-serif" fontWeight="700" fontSize="11" fill="#5F6368">Pay</text>
    </svg>
  );
}

export function MtnMomoLogo(props: Props) {
  return (
    <svg viewBox="0 0 60 24" xmlns="http://www.w3.org/2000/svg" aria-label="MTN Mobile Money" {...props}>
      <rect width="60" height="24" rx="4" fill="#FFCC00" />
      <text x="30" y="10" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontWeight="900" fontSize="8" fill="#00447C">MTN</text>
      <text x="30" y="20" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontWeight="700" fontSize="7" fill="#00447C">MoMo</text>
    </svg>
  );
}

export function AirtelMoneyLogo(props: Props) {
  return (
    <svg viewBox="0 0 60 24" xmlns="http://www.w3.org/2000/svg" aria-label="Airtel Money" {...props}>
      <rect width="60" height="24" rx="4" fill="#E60000" />
      <text x="30" y="10" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontWeight="900" fontSize="8" fill="#fff">airtel</text>
      <text x="30" y="20" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontWeight="700" fontSize="7" fill="#fff">MONEY</text>
    </svg>
  );
}

/* ---------- Big provider wordmarks ---------- */

export function PaypalBrandLogo(props: Props) {
  return (
    <svg viewBox="0 0 200 52" xmlns="http://www.w3.org/2000/svg" aria-label="PayPal" {...props}>
      <text x="0" y="38" fontFamily="Inter, Arial, sans-serif" fontStyle="italic" fontWeight="900" fontSize="42" fill="#003087">Pay</text>
      <text x="80" y="38" fontFamily="Inter, Arial, sans-serif" fontStyle="italic" fontWeight="900" fontSize="42" fill="#009CDE">Pal</text>
    </svg>
  );
}

export function PesapalLogo(props: Props) {
  return (
    <svg viewBox="0 0 220 52" xmlns="http://www.w3.org/2000/svg" aria-label="Pesapal" {...props}>
      <circle cx="24" cy="26" r="20" fill="#F58220" />
      <path d="M18 16h10a8 8 0 0 1 0 16h-6v6h-4V16zm4 4v8h6a4 4 0 0 0 0-8h-6z" fill="#fff" />
      <text x="56" y="36" fontFamily="Inter, Arial, sans-serif" fontWeight="900" fontSize="34" fill="#1A1A1A">Pesapal</text>
    </svg>
  );
}

/* ---------- Provider definitions used by the donate page ---------- */

export type ProviderId = "paypal" | "pesapal";

export const PROVIDERS: Array<{
  id: ProviderId;
  name: string;
  tagline: string;
  Brand: (p: Props) => JSX.Element;
  accents: string;
  ring: string;
  methods: Array<{ label: string; Logo: (p: Props) => JSX.Element }>;
}> = [
  {
    id: "pesapal",
    name: "Pesapal",
    tagline: "Cards & Mobile Money — best for Uganda",
    Brand: PesapalLogo,
    accents: "bg-white",
    ring: "ring-brand-orange/40 border-brand-orange",
    methods: [
      { label: "Visa", Logo: VisaLogo },
      { label: "Mastercard", Logo: MastercardLogo },
      { label: "American Express", Logo: AmexLogo },
      { label: "MTN MoMo", Logo: MtnMomoLogo },
      { label: "Airtel Money", Logo: AirtelMoneyLogo },
      { label: "Apple Pay", Logo: ApplePayLogo },
      { label: "Google Pay", Logo: GooglePayLogo },
    ],
  },
  {
    id: "paypal",
    name: "PayPal",
    tagline: "PayPal balance & international cards",
    Brand: PaypalBrandLogo,
    accents: "bg-white",
    ring: "ring-[#009CDE]/40 border-[#003087]",
    methods: [
      { label: "PayPal", Logo: PaypalMiniLogo },
      { label: "Visa", Logo: VisaLogo },
      { label: "Mastercard", Logo: MastercardLogo },
      { label: "American Express", Logo: AmexLogo },
      { label: "Apple Pay", Logo: ApplePayLogo },
      { label: "Google Pay", Logo: GooglePayLogo },
    ],
  },
];

/* Legacy export kept so any other importers still compile. */
export const PAYMENT_METHODS = [
  { id: "visa", label: "Visa", Logo: VisaLogo, kind: "card" as const },
  { id: "mastercard", label: "Mastercard", Logo: MastercardLogo, kind: "card" as const },
  { id: "amex", label: "American Express", Logo: AmexLogo, kind: "card" as const },
  { id: "applepay", label: "Apple Pay", Logo: ApplePayLogo, kind: "wallet" as const },
  { id: "googlepay", label: "Google Pay", Logo: GooglePayLogo, kind: "wallet" as const },
  { id: "paypal", label: "PayPal", Logo: PaypalMiniLogo, kind: "paypal" as const },
];
