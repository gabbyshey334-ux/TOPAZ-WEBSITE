import type { SVGProps } from 'react';

/** TikTok mark — stroke style to match Lucide social icons (Lucide has no TikTok). */
export function TikTokIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      {...props}
    >
      <path d="M9 12a4 4 0 1 0 4 4V6a5 5 0 0 0 5 5" />
    </svg>
  );
}
