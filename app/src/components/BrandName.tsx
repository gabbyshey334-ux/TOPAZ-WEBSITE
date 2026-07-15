/**
 * Always renders "TOPAZ 2.0" with a visible gap — even when letter-spacing is tight
 * or a CMS value arrives as "TOPAZ2.0".
 */
export default function BrandName({
  accentClassName = 'text-[#2E75B6]',
  className = '',
}: {
  accentClassName?: string;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-baseline ${className}`.trim()}>
      <span>TOPAZ</span>
      <span className="inline-block w-[0.3em]" aria-hidden="true" />
      <span className={accentClassName}>2.0</span>
    </span>
  );
}
