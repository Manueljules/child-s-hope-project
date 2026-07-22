export function Logo({ className = "" }: { className?: string }) {
  return (
    <img
      src="/logo.svg"
      alt="Masembe Childcare Foundation Uganda"
      className={`object-contain ${className}`}
      loading="eager"
      decoding="async"
    />
  );
}
