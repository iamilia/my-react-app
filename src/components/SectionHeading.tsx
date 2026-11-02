import { useNumbers } from '../hooks/useNumbers';
import { Reveal, SplitText } from './Motion';

interface SectionHeadingProps {
    /** Station number on the line, 1-based. Omitted off the home page. */
    no?: number;
    /** `h1` on a page whose only heading this is; `h2` inside the one-pager. */
    as?: 'h1' | 'h2';
    title: string;
    subtitle?: string;
    /** `md` for tool pages, where the title must not push the tool down. */
    size?: 'lg' | 'md';
}

/**
 * A stop on the line: the station number, the title at headline scale, and
 * one sentence. `[data-station]` is the anchor <RouteLine /> draws the
 * station dot on — it sits on the rail, half a rail before the content.
 */
export const SectionHeading = ({
    no,
    title,
    subtitle,
    as: Heading = 'h2',
    size = 'lg',
}: SectionHeadingProps) => {
    const n = useNumbers();
    return (
        <header
            className={`relative ${size === 'lg' ? 'mb-12 md:mb-16 xl:mb-20' : 'mb-8 md:mb-10'}`}
        >
            {no != null && (
                <span
                    data-station
                    aria-hidden="true"
                    className="absolute top-[0.6rem] size-0"
                    style={{ insetInlineStart: 'calc(var(--rail) / -2)' }}
                />
            )}
            {no != null && (
                <p className="station-no mb-3">
                    {n(no, 'plain').padStart(2, n(0, 'plain'))}
                </p>
            )}
            <Heading
                className={size === 'lg' ? 'headline' : 'display display-lg'}
            >
                <SplitText text={title} />
            </Heading>
            {subtitle && (
                <Reveal delay={0.15}>
                    <p className="lede mt-5 md:mt-6">{subtitle}</p>
                </Reveal>
            )}
        </header>
    );
};
