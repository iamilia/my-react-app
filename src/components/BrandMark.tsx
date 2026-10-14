/** The site's mark: a small orb in the gradient. Turns over when the wordmark is hovered. */
export const BrandMark = ({ className = '' }: { className?: string }) => (
    <span className={`brand-mark ${className}`} aria-hidden="true" />
);
