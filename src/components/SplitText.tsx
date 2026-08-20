import { Fragment, useMemo } from 'react';

interface SplitTextProps {
    text: string;
    /** ms added per word, so the line rises in sequence rather than at once */
    stagger?: number;
    /** ms before the first word moves — use to queue this behind other reveals */
    delay?: number;
    className?: string;
}

/**
 * Renders a line of text one word at a time: each word sits in its own
 * clipping box and rises into it from below.
 *
 * Split on words, never on characters. A per-character split would break
 * Persian outright — Arabic script joins, and slicing a word into separate
 * elements severs every one of those joins — and it mangles Latin text for
 * screen readers besides. Words survive both.
 *
 * The animation is driven entirely by CSS: the parent carries `.reveal-words`
 * and `useReveal` adds `.is-visible` to it when it scrolls into view, which
 * is what releases the words. Nothing here runs on a timer.
 */
export const SplitText = ({
    text,
    stagger = 70,
    delay = 0,
    className = '',
}: SplitTextProps) => {
    // Collapse runs of whitespace so a stray double space doesn't become an
    // empty word with its own slot in the stagger.
    const words = useMemo(() => text.trim().split(/\s+/), [text]);

    return (
        <span className={`reveal-words ${className}`}>
            {words.map((word, i) => (
                <Fragment key={`${word}-${i}`}>
                    {i > 0 && ' '}
                    <span className="split">
                        <span
                            className="split-word"
                            style={{
                                // A custom property rather than transitionDelay
                                // so the stylesheet keeps ownership of the
                                // easing and duration; this only says "when".
                                ['--split-delay' as string]: `${
                                    delay + i * stagger
                                }ms`,
                            }}
                        >
                            {word}
                        </span>
                    </span>
                </Fragment>
            ))}
        </span>
    );
};
