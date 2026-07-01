import type { ComponentProps } from "react";

type Props = ComponentProps<"svg">;

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

export function PaypalLogo(props: Props) {
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

export const PAYMENT_METHODS = [
  { id: "visa", label: "Visa", Logo: VisaLogo, kind: "card" as const },
  { id: "mastercard", label: "Mastercard", Logo: MastercardLogo, kind: "card" as const },
  { id: "amex", label: "American Express", Logo: AmexLogo, kind: "card" as const },
  { id: "applepay", label: "Apple Pay", Logo: ApplePayLogo, kind: "wallet" as const },
  { id: "googlepay", label: "Google Pay", Logo: GooglePayLogo, kind: "wallet" as const },
  { id: "paypal", label: "PayPal", Logo: PaypalLogo, kind: "paypal" as const },
];
