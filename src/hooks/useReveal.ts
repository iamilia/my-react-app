import { useEffect, useRef } from 'react';

/**
 * The three classes this hook drives. All of them behave identically here —
 * they differ only in what the stylesheet animates once `.is-visible` lands:
 *
 *   .reveal        fade, rise and unblur (the default)
 *   .reveal-pop    the same, plus a slight scale — for blocks with an edge
 *   .reveal-words  no motion of its own; releases the `.split-word` children
 *                  inside it (see SplitText)
 */
const SELECTOR = '.reveal, .reveal-pop, .reveal-words';

/**
 * Adds `.is-visible` to any descendant carrying one of the reveal classes
 * once it scrolls into view. Elements can opt into a stagger with
 * `data-delay="120"` (ms).
 */
export const useReveal = <T extends HTMLElement = HTMLElement>() => {
    const ref = useRef<T | null>(null);

    useEffect(() => {
        const root = ref.current;
        if (!root) return;

        const targets = Array.from(
            root.querySelectorAll<HTMLElement>(SELECTOR)
        );
        if (targets.length === 0) return;

        if (!('IntersectionObserver' in window)) {
            for (const el of targets) el.classList.add('is-visible');
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const el = entry.target as HTMLElement;
                    const delay = Number(el.dataset.delay ?? 0);
                    window.setTimeout(
                        () => el.classList.add('is-visible'),
                        delay
                    );
                    observer.unobserve(el);
                });
            },
            { rootMargin: '0px 0px -12% 0px', threshold: 0.12 }
        );

        for (const el of targets) observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return ref;
};
