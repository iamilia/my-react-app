import {
    animate,
    motion,
    useInView,
    useReducedMotion,
    type Variants,
} from 'motion/react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * In-view margin for every reveal. The huge top margin counts anything the
 * visitor has already scrolled past as seen, so a fast fling or a nav jump
 * never leaves content hidden above the viewport.
 */
export const SEEN_MARGIN = '100000px 0px -10% 0px';

/** The site's one easing curve, as motion wants it. Mirrors --ease-out. */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

const revealVariants: Variants = {
    hidden: { opacity: 0, y: 28 },
    shown: { opacity: 1, y: 0 },
};

interface RevealProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    as?: 'div' | 'section' | 'li' | 'p' | 'header';
}

/** Rises into place the first time it scrolls into view. */
export const Reveal = ({
    children,
    className,
    delay = 0,
    as = 'div',
}: RevealProps) => {
    const reduce = useReducedMotion();
    const Tag = motion[as];
    return (
        <Tag
            className={className}
            variants={revealVariants}
            initial={reduce ? false : 'hidden'}
            whileInView="shown"
            viewport={{ once: true, margin: SEEN_MARGIN }}
            transition={{ duration: 0.9, ease: EASE_OUT, delay }}
        >
            {children}
        </Tag>
    );
};

interface SplitTextProps {
    text: string;
    className?: string;
    /** Seconds before the first word moves. */
    delay?: number;
    /** Seconds between words. */
    stagger?: number;
    /** Play on mount instead of when scrolled into view. */
    immediate?: boolean;
}

/**
 * Words slide up out of a mask, one after another. Splits on words, never on
 * letters: Persian letters join, and cutting them apart breaks the script.
 * Screen readers get the sentence once, from the hidden copy.
 */
export const SplitText = ({
    text,
    className,
    delay = 0,
    stagger = 0.06,
    immediate = false,
}: SplitTextProps) => {
    const reduce = useReducedMotion();
    const words = text.split(/\s+/).filter(Boolean);
    const ref = useRef<HTMLSpanElement>(null);
    const seen = useInView(ref, { once: true, margin: SEEN_MARGIN });

    return (
        <motion.span
            ref={ref}
            className={className}
            initial={reduce ? false : 'hidden'}
            animate={immediate || seen ? 'shown' : 'hidden'}
            transition={{ staggerChildren: stagger, delayChildren: delay }}
        >
            <span className="sr-only">{text}</span>
            {words.map((word, i) => (
                <span
                    // biome-ignore lint/suspicious/noArrayIndexKey: words repeat; order is the identity
                    key={i}
                    aria-hidden="true"
                    className="-mx-[0.08em] inline-block overflow-hidden px-[0.08em] pb-[0.08em] align-bottom"
                >
                    <motion.span
                        className="inline-block"
                        variants={{
                            hidden: { y: '105%' },
                            shown: { y: '0%' },
                        }}
                        transition={{ duration: 0.9, ease: EASE_OUT }}
                    >
                        {word}
                    </motion.span>
                    {i < words.length - 1 && ' '}
                </span>
            ))}
        </motion.span>
    );
};

/**
 * A number that counts up from zero the first time it is seen. `format`
 * localises each frame, so Persian digits count in Persian.
 */
export const CountUp = ({
    value,
    format,
}: {
    value: number | null | undefined;
    format: (n: number) => string;
}) => {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, margin: SEEN_MARGIN });
    const reduce = useReducedMotion();
    const [shown, setShown] = useState(0);
    const { i18n } = useTranslation();

    useEffect(() => {
        if (value == null || !inView) return;
        if (reduce) {
            setShown(value);
            return;
        }
        const controls = animate(0, value, {
            duration: 1.6,
            ease: EASE_OUT,
            onUpdate: (v) => setShown(Math.round(v)),
        });
        return () => controls.stop();
    }, [value, inView, reduce]);

    return (
        <span ref={ref} className="nums" key={i18n.language}>
            {value == null ? '—' : format(shown)}
        </span>
    );
};
