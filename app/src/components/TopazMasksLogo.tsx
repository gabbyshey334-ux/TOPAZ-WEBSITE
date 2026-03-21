/**
 * Theater masks in a diamond frame — inline fallback when PNG logos are missing.
 * Prefer: public/images/logos/topaz-masks-only.png (see images/logos/README.md)
 */
export function TopazMasksLogo({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M60 4 L116 60 L60 116 L4 60 Z"
        stroke="currentColor"
        strokeWidth="2.5"
        className="text-[#2E75B6]"
        fill="none"
      />
      <path
        d="M38 52c0-12 8-22 22-22s22 10 22 22v8c0 10-8 18-18 18h-8c-10 0-18-8-18-18v-8z"
        fill="currentColor"
        className="text-[#1F4E78]"
        opacity={0.92}
      />
      <path
        d="M60 52c14 0 22 10 22 22v8c0 10-8 18-18 18h-8c-10 0-18-8-18-18v-8c0-12 8-22 22-22z"
        fill="currentColor"
        className="text-[#2E75B6]"
        opacity={0.85}
      />
      <ellipse cx="48" cy="58" rx="4" ry="5" fill="white" opacity={0.9} />
      <ellipse cx="72" cy="58" rx="4" ry="5" fill="white" opacity={0.9} />
      <path
        d="M52 72c4 6 12 6 16 0"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        opacity={0.85}
      />
    </svg>
  );
}
