import { useNumbers } from '../hooks/useNumbers';

interface SectionHeadingProps {
    /** Section number, printed as a folio in the margin. */
    index: number;
    label: string;
    title: string;
    subtitle?: string;
}

/**
 * The masthead every section shares. On a phone the folio and the kicker sit
 * on one baseline above the title; from `lg` up they move out into the margin
 * column and the title starts at column five. Nothing is centred — that
 * offset is what gives the page a spine.
 */
export const SectionHeading = ({
    index,
    label,
    title,
    subtitle,
}: SectionHeadingProps) => {
    const n = useNumbers();

    return (
        <header className="mb-10 sm:mb-12 lg:mb-16">
            <hr className="rule-heavy reveal" />

            <div className="field mt-5 lg:mt-8">
                <div className="field-aside reveal" data-delay="60">
                    <div className="flex items-baseline gap-4 lg:flex-col lg:items-start lg:gap-2">
                        <span className="folio nums">{n(index, 'padded')}</span>
                        <span className="kicker">{label}</span>
                    </div>
                </div>

                <div className="field-body">
                    <h2 className="display display-lg reveal" data-delay="90">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="lede reveal mt-5" data-delay="130">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
        </header>
    );
};
