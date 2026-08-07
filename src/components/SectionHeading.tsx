interface SectionHeadingProps {
    index: string;
    label: string;
    title: string;
    subtitle?: string;
    align?: 'start' | 'center';
}

export const SectionHeading = ({
    index,
    label,
    title,
    subtitle,
    align = 'start',
}: SectionHeadingProps) => (
    <div
        className={`mb-12 sm:mb-16 ${
            align === 'center' ? 'text-center' : 'text-center md:text-start'
        }`}
    >
        <p
            className={`eyebrow reveal ${
                align === 'center'
                    ? 'justify-center'
                    : 'justify-center md:justify-start'
            }`}
        >
            {index} — {label}
        </p>
        <h2
            className="display reveal mt-4 text-[clamp(1.9rem,5vw,3.25rem)]"
            data-delay="60"
        >
            {title}
        </h2>
        {subtitle && (
            <p
                className="text-muted reveal mt-3 max-w-2xl text-sm sm:text-base"
                data-delay="110"
            >
                {subtitle}
            </p>
        )}
        <hr className="hairline reveal mt-8" data-delay="140" />
    </div>
);
