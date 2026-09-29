interface SectionHeadingProps {
    title: string;
    subtitle?: string;
    /** `h1` on a page whose window this is the only heading of; `h2` inside the one-pager. */
    as?: 'h1' | 'h2';
}

/**
 * The heading every window opens with. The section's name already sits in
 * the title bar above it, so this is just the headline and its standfirst,
 * set flush to the reading edge.
 */
export const SectionHeading = ({
    title,
    subtitle,
    as: Heading = 'h2',
}: SectionHeadingProps) => (
    <header className="mb-8 sm:mb-10 lg:mb-14">
        <Heading className="display display-lg">{title}</Heading>
        {subtitle && <p className="lede mt-3 sm:mt-4">{subtitle}</p>}
    </header>
);
