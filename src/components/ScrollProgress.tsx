import { useEffect, useRef } from 'react';

/**
 * A hairline across the top of the viewport that fills as the page scrolls.
 *
 * The value is written straight to a custom property on the element rather
 * than held in React state: this updates on every scroll frame, and a
 * setState per frame would re-render the tree for something no component
 * other than this one cares about. The property feeds a `scaleX`, so the
 * browser can keep the whole thing on the compositor.
 */
export const ScrollProgress = () => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        let frame = 0;

        const update = () => {
            frame = 0;
            const doc = document.documentElement;
            // How far there is left to scroll. On a page shorter than the
            // viewport this is 0, and dividing by it would give NaN.
            const scrollable = doc.scrollHeight - window.innerHeight;
            const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
            el.style.setProperty('--progress', String(Math.min(progress, 1)));
        };

        // Coalesce bursts of scroll events into one write per frame.
        const onScroll = () => {
            if (frame) return;
            frame = requestAnimationFrame(update);
        };

        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });

        return () => {
            if (frame) cancelAnimationFrame(frame);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, []);

    return <div ref={ref} className="scroll-progress" aria-hidden="true" />;
};
