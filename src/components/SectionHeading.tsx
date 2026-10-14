interface SectionHeadingProps {
    title: string;
    subtitle?: string;
    /** `h1` on a page whose only heading this is; `h2` inside the one-pager. */
    as?: 'h1' | 'h2';
}

/** A section's headline and one line saying what is in it. */
export const SectionHeading = ({
    title,
    subtitle,
    as: Heading = 'h2',
}: SectionHeadingProps) => (
    <header className="mb-8 sm:mb-10">
        <Heading className="display display-lg">{title}</Heading>
        {subtitle && <p className="lede mt-2">{subtitle}</p>}
    </header>
);
